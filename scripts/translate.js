import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { translate } from "i18n-ai-translate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LOCALES_PATH = path.join(__dirname, '../src/i18n/locales');
const SOURCE_PATH = path.join(__dirname, '../src');
const TARGET_LANGUAGES = ['el', 'de'];
const BATCH_SIZE = 50;

// Custom translation prompts with domain context
const TRANSLATION_PROMPTS = {
  generationPrompt: `You are a professional translator specializing in business software and service management platforms.

IMPORTANT DOMAIN CONTEXT:
This is a ticketing system platform used by agencies, accountants, consultants, and professional service providers.

KEY TERMINOLOGY:
- "Tickets" refers to SUPPORT TICKETS or SERVICE REQUESTS (help desk tickets, client service requests, work orders), NOT event tickets or concert tickets
- "Assignee" refers to the staff member assigned to handle a support ticket
- "Client" refers to the customer or business requesting service
- "Agent" refers to a support staff member
- "Admin" refers to an administrator managing the system
- "Categories" and "statuses" refer to ticket categorization and workflow states
- "Packages" refer to service packages or subscription plans offered to clients
- "Payments" refer to invoices and payment tracking for services rendered
- "Tutorials" refer to training materials or guides for users
- "Brands" refer to the companies using the platform

When translating, maintain the professional/business context and ensure technical terms are appropriate for a service management platform.

Translate from \${inputLanguage} to \${outputLanguage}.

- Translate each object in the array.
- 'original' is the text to be translated.
- 'translated' must not be empty.
- 'context' is additional info if needed.
- 'failure' explains why the previous translation failed.
- Preserve text formatting, case sensitivity, and whitespace.

Special Instructions:
- Treat anything in the format {{variableName}} as a placeholder. Never translate or modify its content.
- Do not add your own variables
- The number of variables like {{timeLeft}} must be the same in the translated text.
- Do not convert {{NEWLINE}} to \\n.

Return the translation as JSON.
\`\`\`json
\${input}
\`\`\``
};

// ============================================================================
// STEP 1: Extract all keys from codebase (static + dynamic)
// ============================================================================

function getAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        getAllSourceFiles(filePath, fileList);
      }
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function extractAllKeysFromCodebase(sourceFiles) {
  const allKeys = new Set(); // All keys found in codebase
  const keyLocations = new Map(); // Map of key -> [{file, line}, ...]
  const dynamicPrefixes = new Set(); // Prefixes for dynamic keys like `t(\`key.${var}\`)`
  
  // Patterns to match t('key') or t("key")
  const patterns = [
    /t\(['"]([^'"]+)['"]/g,
    /t\(`([^`]+)`/g,
  ];
  
  for (const filePath of sourceFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const key = match[1];
          
          // Calculate line number
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;
          // Show path relative to project root (one level up from scripts)
          const projectRoot = path.join(__dirname, '..');
          const relativePath = path.relative(projectRoot, filePath);
          
          // Check if it's a dynamic key (contains ${})
          if (key.includes('${')) {
            const prefixMatch = key.match(/^([^${]+)/);
            if (prefixMatch) {
              const prefix = prefixMatch[1].replace(/\.$/, '');
              if (prefix && key.length > 1 && /[a-zA-Z]/.test(prefix)) {
                dynamicPrefixes.add(prefix);
              }
            }
          } else {
            // Static key
            if (key.length > 1 && /[a-zA-Z]/.test(key) && !/^[.\/\\?_\-\s]+$/.test(key)) {
              allKeys.add(key);
              
              // Track location
              if (!keyLocations.has(key)) {
                keyLocations.set(key, []);
              }
              keyLocations.get(key).push({
                file: relativePath,
                line: lineNumber
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read ${filePath}:`, error.message);
    }
  }
  
  return { allKeys, dynamicPrefixes, keyLocations };
}

// Search for a key or value anywhere in the codebase (not just in t() calls)
function findKeyOrValueInCodebase(keyOrValue, sourceFiles) {
  const locations = [];
  const projectRoot = path.join(__dirname, '..');
  
  // Escape special regex characters
  const escaped = keyOrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Patterns to search:
  // 1. As entire key/value in quotes: "key" or 'key'
  // 2. In template literals: `...key...`
  // 3. As part of a string assignment
  const patterns = [
    new RegExp(`['"]${escaped}['"]`, 'g'),  // Single or double quoted
    new RegExp(`\`[^\`]*${escaped}[^\`]*\``, 'g'),  // Template literal
  ];
  
  for (const filePath of sourceFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;
          const relativePath = path.relative(projectRoot, filePath);
          
          locations.push({
            file: relativePath,
            line: lineNumber
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return locations;
}

// Check if a key or its value exists anywhere in codebase
function keyExistsInCodebase(key, value, sourceFiles) {
  // Check if key exists
  const keyLocations = findKeyOrValueInCodebase(key, sourceFiles);
  if (keyLocations.length > 0) {
    return true;
  }
  
  // Check if value exists (for leaf values)
  if (value && typeof value === 'string' && value.length > 0) {
    const valueLocations = findKeyOrValueInCodebase(value, sourceFiles);
    if (valueLocations.length > 0) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// STEP 2: Remove duplicate keys across JSON files
// ============================================================================

function findKeysInObject(obj, prefix = '') {
  const keys = new Map(); // Map of key -> value
  for (const key in obj) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const nestedKeys = findKeysInObject(obj[key], currentPath);
      nestedKeys.forEach((value, nestedKey) => keys.set(nestedKey, value));
    } else {
      keys.set(currentPath, obj[key]);
    }
  }
  return keys;
}

function removeDuplicateKeys() {
  console.log('=== STEP 2: Removing duplicate keys across JSON files ===');
  
  const enPath = path.join(LOCALES_PATH, 'en');
  const enFiles = fs.readdirSync(enPath).filter(f => f.endsWith('.json')).sort();
  
  // File priority order: public.json, admin.json, client.json (keep first occurrence)
  const filePriority = ['public.json', 'admin.json', 'client.json'];
  const sortedFiles = [...new Set([...filePriority, ...enFiles])].filter(f => enFiles.includes(f));
  
  const keyToFile = new Map(); // Track which file each key belongs to
  const duplicates = new Map(); // Map of key -> [files that have it]
  
  // First pass: find all keys and track which files they're in
  for (const filename of sortedFiles) {
    const enFilePath = path.join(enPath, filename);
    const enJSON = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    const keys = findKeysInObject(enJSON);
    
    for (const [key, value] of keys) {
      if (!keyToFile.has(key)) {
        keyToFile.set(key, filename);
      } else {
        // Duplicate found
        if (!duplicates.has(key)) {
          duplicates.set(key, [keyToFile.get(key)]);
        }
        duplicates.get(key).push(filename);
      }
    }
  }
  
  if (duplicates.size === 0) {
    console.log('  No duplicate keys found\n');
    return;
  }
  
  console.log(`  Found ${duplicates.size} duplicate key(s) across files:`);
  
  // Second pass: remove duplicates, keeping the first occurrence (based on file priority)
  const allLanguages = ['en', ...TARGET_LANGUAGES];
  let totalRemoved = 0;
  
  for (const [key, files] of duplicates) {
    // Keep the key in the first file (highest priority)
    const keepInFile = files[0];
    const removeFromFiles = files.slice(1);
    
    console.log(`    - ${key}`);
    console.log(`      Keeping in: ${keepInFile}`);
    console.log(`      Removing from: ${removeFromFiles.join(', ')}`);
    
    // Remove from all language files
    for (const langCode of allLanguages) {
      for (const filename of removeFromFiles) {
        const langFilePath = path.join(LOCALES_PATH, langCode, filename);
        if (fs.existsSync(langFilePath)) {
          const langJSON = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
          removeKeyFromObject(langJSON, key);
          fs.writeFileSync(langFilePath, JSON.stringify(langJSON, null, 2) + '\n');
        }
      }
    }
    
    totalRemoved += removeFromFiles.length;
  }
  
  console.log(`\nRemoved ${totalRemoved} duplicate key occurrence(s) total\n`);
}

// ============================================================================
// STEP 3: Remove unused keys from all language files
// ============================================================================

function getAllKeysFromJSON(obj, prefix = '') {
  const keys = new Set();
  for (const key in obj) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const nestedKeys = getAllKeysFromJSON(obj[key], currentPath);
      nestedKeys.forEach(k => keys.add(k));
    } else {
      keys.add(currentPath);
    }
  }
  return keys;
}

function isKeyUsed(key, allKeys, dynamicPrefixes) {
  // Check if key is directly used
  if (allKeys.has(key)) return true;
  
  // Check if key matches a dynamic prefix (e.g., if we have `roles.roleTypes.${role}`, keep all `roles.roleTypes.*`)
  const parts = key.split('.');
  for (let i = 1; i <= parts.length; i++) {
    const prefix = parts.slice(0, i).join('.');
    if (dynamicPrefixes.has(prefix)) return true;
}

  // Check if any parent path is used
    for (let i = 1; i < parts.length; i++) {
      const parentPath = parts.slice(0, i).join('.');
    if (allKeys.has(parentPath)) return true;
  }
  
  return false;
}

function removeKeyFromObject(obj, keyPath) {
    const keys = keyPath.split('.');
  let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) return;
      current = current[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    if (current && lastKey in current) {
      delete current[lastKey];
      
      // Clean up empty parent objects
      for (let i = keys.length - 2; i >= 0; i--) {
      let parent = obj;
        for (let j = 0; j < i; j++) {
          if (!parent[keys[j]]) break;
          parent = parent[keys[j]];
        }
        const currentKey = keys[i];
        if (parent[currentKey] && typeof parent[currentKey] === 'object' && Object.keys(parent[currentKey]).length === 0) {
          delete parent[currentKey];
        } else {
          break;
        }
      }
    }
  }
  
function removeUnusedKeys(allKeys, dynamicPrefixes) {
  console.log('\n=== STEP 3: Removing unused keys ===');
  
  // Get all source files for codebase search
  const sourceFiles = getAllSourceFiles(SOURCE_PATH);
  
  const enPath = path.join(LOCALES_PATH, 'en');
  const enFiles = fs.readdirSync(enPath).filter(f => f.endsWith('.json'));
  const allLanguages = ['en', ...TARGET_LANGUAGES];
  let totalRemoved = 0;
  
  // Get all keys and values from JSON files for checking
  function getAllKeysAndValues(obj, prefix = '') {
    const result = new Map(); // Map of key -> value
    for (const key in obj) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        const nested = getAllKeysAndValues(obj[key], currentPath);
        nested.forEach((value, nestedKey) => result.set(nestedKey, value));
      } else {
        result.set(currentPath, obj[key]);
      }
    }
    return result;
  }
  
  for (const filename of enFiles) {
    const enFilePath = path.join(enPath, filename);
    const enJSON = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    const keysAndValues = getAllKeysAndValues(enJSON);
    const jsonKeys = Array.from(keysAndValues.keys());
    
    // Find unused keys - check both t() usage and codebase existence
    const unusedKeys = jsonKeys.filter(key => {
      // First check if used in t() calls
      if (isKeyUsed(key, allKeys, dynamicPrefixes)) {
        return false;
      }
      
      // Then check if key or value exists anywhere in codebase
      const value = keysAndValues.get(key);
      if (keyExistsInCodebase(key, value, sourceFiles)) {
        return false;
      }
      
      return true;
    });
    
    if (unusedKeys.length === 0) {
      console.log(`  ${filename} - no unused keys`);
      continue;
    }
    
    console.log(`  ${filename} - removing ${unusedKeys.length} unused key(s): ${unusedKeys.slice(0, 5).join(', ')}${unusedKeys.length > 5 ? ` ... and ${unusedKeys.length - 5} more` : ''}`);
    
    // Remove from all language files
    for (const langCode of allLanguages) {
      const langFilePath = path.join(LOCALES_PATH, langCode, filename);
      if (fs.existsSync(langFilePath)) {
        const langJSON = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
        for (const unusedKey of unusedKeys) {
          removeKeyFromObject(langJSON, unusedKey);
        }
        fs.writeFileSync(langFilePath, JSON.stringify(langJSON, null, 2) + '\n');
      }
    }
    
    totalRemoved += unusedKeys.length;
  }
  
  console.log(`Removed ${totalRemoved} unused key(s) total\n`);
}

// ============================================================================
// STEP 4: Check if keys in codebase exist in English files
// ============================================================================

function checkMissingKeysInEnglish(allKeys, dynamicPrefixes, keyLocations) {
  console.log('=== STEP 4: Checking for missing keys in English files ===');
  
  // Get all source files for codebase search
  const sourceFiles = getAllSourceFiles(SOURCE_PATH);
  
  const enPath = path.join(LOCALES_PATH, 'en');
  const enFiles = fs.readdirSync(enPath).filter(f => f.endsWith('.json'));
  const allEnglishKeys = new Set();
  
  // Collect all keys from all English files
  for (const filename of enFiles) {
    const enFilePath = path.join(enPath, filename);
    const enJSON = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    const jsonKeys = getAllKeysFromJSON(enJSON);
    jsonKeys.forEach(k => allEnglishKeys.add(k));
  }
  
  // Find keys used in code but missing from English files
  // Check both t() calls and any occurrence in codebase
  const missingInEnglish = Array.from(allKeys).filter(key => {
    // Skip if it's a dynamic prefix (these are handled dynamically)
    if (dynamicPrefixes.has(key)) return false;
    
    // Check if key exists in English files
    if (allEnglishKeys.has(key)) return false;
    
    // Check if any parent path matches a dynamic prefix
    const parts = key.split('.');
    for (let i = 1; i <= parts.length; i++) {
      const prefix = parts.slice(0, i).join('.');
      if (dynamicPrefixes.has(prefix)) return false;
    }
    
    // Check if key exists anywhere in codebase (not just in t() calls)
    const codebaseLocations = findKeyOrValueInCodebase(key, sourceFiles);
    if (codebaseLocations.length === 0) {
      // Key not found in codebase at all, skip it
      return false;
    }
    
    return true;
  });
  
  if (missingInEnglish.length > 0) {
    console.log(`  Found ${missingInEnglish.length} missing key(s) in English files:`);
    missingInEnglish.forEach(key => {
      // Get locations from both t() calls and general codebase search
      const tLocations = keyLocations.get(key) || [];
      const codebaseLocations = findKeyOrValueInCodebase(key, sourceFiles);
      
      // Combine and deduplicate locations
      const allLocations = [...tLocations, ...codebaseLocations];
      const uniqueLocations = Array.from(
        new Map(allLocations.map(loc => [`${loc.file}:${loc.line}`, loc])).values()
      );
      
      if (uniqueLocations.length > 0) {
        const locationStr = uniqueLocations.map(loc => `${loc.file}:${loc.line}`).join(', ');
        console.log(`    - ${key}`);
        console.log(`      at ${locationStr}`);
      } else {
        console.log(`    - ${key}`);
      }
    });
    console.log('\n  Please add these keys to the appropriate English JSON files before continuing.\n');
  } else {
    console.log('  All keys from codebase exist in English files\n');
  }
  
  return missingInEnglish;
}

// ============================================================================
// STEP 5: Sync English changes to other languages (remove obsolete keys)
// ============================================================================

function findObsoleteKeys(sourceObj, targetObj, prefix = '') {
  const obsolete = [];
  for (const key in targetObj) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (!(key in sourceObj)) {
      obsolete.push(currentPath);
    } else if (typeof targetObj[key] === 'object' && targetObj[key] !== null && !Array.isArray(targetObj[key])) {
      if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null && !Array.isArray(sourceObj[key])) {
        const nestedObsolete = findObsoleteKeys(sourceObj[key], targetObj[key], currentPath);
        obsolete.push(...nestedObsolete);
      } else {
        obsolete.push(currentPath);
      }
    }
  }
  return obsolete;
}

// Use git diff to find changed keys in English files
function findChangedKeysUsingGitDiff(enFilePath) {
  try {
    const projectRoot = path.join(__dirname, '..');
    const relativePath = path.relative(projectRoot, enFilePath);
    
    // Get the committed version from git
    let committedJSON = null;
    try {
      const committedContent = execSync(`git show HEAD:${relativePath}`, {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      committedJSON = JSON.parse(committedContent);
    } catch (e) {
      // File might not exist in HEAD, that's okay
      return [];
    }
    
    // Get current version
    const currentJSON = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    
    // Compare and find changed leaf values
    const changedKeys = [];
    
    function compareObjects(source, target, prefix = '') {
      for (const key in source) {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          // Nested object - recurse
          if (target && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
            compareObjects(source[key], target[key], currentPath);
          }
        } else {
          // Leaf value - check if changed
          if (target && key in target) {
            if (String(source[key]) !== String(target[key])) {
              changedKeys.push(currentPath);
            }
          }
        }
      }
    }
    
    compareObjects(committedJSON, currentJSON);
    return changedKeys;
  } catch (error) {
    // If git command fails (e.g., not a git repo, file not in git), return empty array
    return [];
  }
}

function removeObsoleteKeysFromTarget(targetObj, obsoletePaths) {
  for (const keyPath of obsoletePaths) {
    removeKeyFromObject(targetObj, keyPath);
  }
  return targetObj;
}

function syncEnglishChangesToOtherLanguages() {
  console.log('=== STEP 5: Syncing English changes to other languages ===');
  
  const enPath = path.join(LOCALES_PATH, 'en');
  const enFiles = fs.readdirSync(enPath).filter(f => f.endsWith('.json'));
  let totalObsoleteRemoved = 0;
  let totalChangedRemoved = 0;
  
  for (const langCode of TARGET_LANGUAGES) {
    console.log(`  Processing ${langCode}...`);
    
    for (const filename of enFiles) {
      const enFilePath = path.join(enPath, filename);
      const targetFilePath = path.join(LOCALES_PATH, langCode, filename);
      
      if (!fs.existsSync(targetFilePath)) {
        continue;
      }
      
      const sourceJSON = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
      const targetJSON = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
      
      // Find obsolete keys (exist in target but not in source)
      const obsoleteKeys = findObsoleteKeys(sourceJSON, targetJSON);
      
      // Find changed keys using git diff (only keys that actually changed)
      const changedKeys = findChangedKeysUsingGitDiff(enFilePath);
      
      let needsUpdate = false;
      
      if (obsoleteKeys.length > 0) {
        console.log(`    ${filename} - removing ${obsoleteKeys.length} obsolete key(s): ${obsoleteKeys.slice(0, 5).join(', ')}${obsoleteKeys.length > 5 ? ` ... and ${obsoleteKeys.length - 5} more` : ''}`);
        removeObsoleteKeysFromTarget(targetJSON, obsoleteKeys);
        totalObsoleteRemoved += obsoleteKeys.length;
        needsUpdate = true;
      }
      
      if (changedKeys.length > 0) {
        console.log(`    ${filename} - removing ${changedKeys.length} changed key(s) for re-translation: ${changedKeys.slice(0, 5).join(', ')}${changedKeys.length > 5 ? ` ... and ${changedKeys.length - 5} more` : ''}`);
        removeObsoleteKeysFromTarget(targetJSON, changedKeys);
        totalChangedRemoved += changedKeys.length;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        fs.writeFileSync(targetFilePath, JSON.stringify(targetJSON, null, 2) + '\n');
      }
    }
  }
  
  if (totalObsoleteRemoved > 0 || totalChangedRemoved > 0) {
    console.log(`Removed ${totalObsoleteRemoved} obsolete key(s) and ${totalChangedRemoved} changed key(s) total\n`);
  } else {
    console.log(`No changes detected\n`);
  }
}

// ============================================================================
// STEP 6: Translate missing keys
// ============================================================================

function findMissingKeys(sourceObj, targetObj, prefix = '') {
  const missing = {};
  for (const key in sourceObj) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null && !Array.isArray(sourceObj[key])) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        missing[key] = sourceObj[key];
      } else {
        const nestedMissing = findMissingKeys(sourceObj[key], targetObj[key], currentPath);
        if (Object.keys(nestedMissing).length > 0) {
          missing[key] = nestedMissing;
        }
      }
    } else {
      if (!(key in targetObj)) {
        missing[key] = sourceObj[key];
      }
    }
  }
  return missing;
}

function countLeafNodes(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countLeafNodes(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

function splitIntoBatches(obj, batchSize) {
  const batches = [];
  let currentBatch = {};
  let currentCount = 0;
  
  function addToBatch(path, value) {
    const keys = path.split('.');
    let target = currentBatch;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
  }
  
  function processObject(obj, prefix = '') {
    for (const key in obj) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        const nestedCount = countLeafNodes(obj[key]);
        if (currentCount + nestedCount > batchSize && currentCount > 0) {
          batches.push(currentBatch);
          currentBatch = {};
          currentCount = 0;
        }
        addToBatch(currentPath, obj[key]);
        currentCount += nestedCount;
      } else {
        if (currentCount >= batchSize) {
          batches.push(currentBatch);
          currentBatch = {};
          currentCount = 0;
        }
        addToBatch(currentPath, obj[key]);
        currentCount++;
      }
    }
  }
  
  processObject(obj);
  if (Object.keys(currentBatch).length > 0) {
    batches.push(currentBatch);
  }
  
  return batches;
}

function mergeTranslations(target, translations) {
  for (const key in translations) {
    if (typeof translations[key] === 'object' && translations[key] !== null && !Array.isArray(translations[key])) {
      if (!target[key]) {
        target[key] = {};
      }
      mergeTranslations(target[key], translations[key]);
    } else {
      target[key] = translations[key];
    }
  }
  return target;
}

async function translateMissingKeys() {
  console.log('=== STEP 6: Translating missing keys ===');
  
  const enPath = path.join(LOCALES_PATH, 'en');
  const enFiles = fs.readdirSync(enPath).filter(f => f.endsWith('.json'));
  
  for (const langCode of TARGET_LANGUAGES) {
    console.log(`  Processing ${langCode}...`);
    
    for (const filename of enFiles) {
      const enFilePath = path.join(enPath, filename);
      const targetFilePath = path.join(LOCALES_PATH, langCode, filename);
      
      const sourceJSON = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
      let targetJSON = {};
      if (fs.existsSync(targetFilePath)) {
        targetJSON = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
      }
      
      const missingKeys = findMissingKeys(sourceJSON, targetJSON);
      
      if (Object.keys(missingKeys).length === 0) {
        console.log(`    ${filename} - up to date`);
        continue;
      }
      
        const totalKeys = countLeafNodes(missingKeys);
      console.log(`    ${filename} - translating ${totalKeys} missing key(s)...`);
        
        try {
          const batches = splitIntoBatches(missingKeys, BATCH_SIZE);
        console.log(`      Processing ${batches.length} batch(es) of up to ${BATCH_SIZE} keys each`);
          
          let allTranslations = {};
          
          for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchKeyCount = countLeafNodes(batch);
          console.log(`      Batch ${i + 1}/${batches.length}: translating ${batchKeyCount} key(s)...`);
            
            const translated = await translate({
              inputJSON: batch,
              inputLanguage: 'en',
              outputLanguage: langCode,
              engine: 'gemini',
              model: 'gemini-2.5-flash',
              apiKey: GEMINI_API_KEY,
              promptMode: 'json',
              rateLimitMs: 1000,
              verbose: false,
              overridePrompt: TRANSLATION_PROMPTS,
              skipTranslationVerification: true
            });
            
            if (!translated) {
              throw new Error(`Translation batch ${i + 1} returned undefined`);
            }
            
            allTranslations = mergeTranslations(allTranslations, translated);
          console.log(`      Batch ${i + 1}/${batches.length} completed`);
          }
          
          targetJSON = mergeTranslations(targetJSON, allTranslations);
        fs.writeFileSync(targetFilePath, JSON.stringify(targetJSON, null, 2) + '\n');
        console.log(`    ${filename} - translation completed`);
      } catch (error) {
        console.error(`    ${filename} - translation failed: ${error.message}`);
  }
    }
  }
  
  console.log('Translation completed!\n');
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('=== Translation Sync Script ===\n');
  
  // Step 1: Get all keys from codebase
  console.log('=== STEP 1: Extracting keys from codebase ===');
  const sourceFiles = getAllSourceFiles(SOURCE_PATH);
  console.log(`  Found ${sourceFiles.length} source file(s)`);
  const { allKeys, dynamicPrefixes, keyLocations } = extractAllKeysFromCodebase(sourceFiles);
  console.log(`  Found ${allKeys.size} static key(s) and ${dynamicPrefixes.size} dynamic prefix(es)\n`);
  
  // Step 2: Remove duplicate keys across JSON files
  removeDuplicateKeys();
  
  // Step 3: Remove unused keys
  removeUnusedKeys(allKeys, dynamicPrefixes);
  
  // Step 4: Check for missing keys in English files
  const missingInEnglish = checkMissingKeysInEnglish(allKeys, dynamicPrefixes, keyLocations);
  if (missingInEnglish.length > 0) {
    console.log('Please add missing keys to English files before continuing.');
    return;
  }
  
  // Step 5: Sync English changes to other languages
  syncEnglishChangesToOtherLanguages();
  
  // Step 6: Translate missing keys
  await translateMissingKeys();
  
  console.log('=== All done! ===');
}

main().catch(error => {
  console.error('Script failed:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});