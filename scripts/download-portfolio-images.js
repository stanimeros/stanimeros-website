#!/usr/bin/env node
/**
 * Downloads product-matching portfolio images.
 * Option 1 (recommended): Add PEXELS_API_KEY to .env for semantic search
 * Option 2: Run without key to use Picsum fallback (less accurate matches)
 * Run: npm run download-portfolio-images
 */

import dotenv from 'dotenv';
dotenv.config();

import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = `${__dirname}/../public/assets/portfolio`;

// Semantic search queries - Pexels returns content-matching photos
const PEXELS_QUERIES = {
  'fire-message': 'smartphone app notification message social',
  'tattoo-healer': 'tattoo artist studio',
  'trans-hellas': 'freight truck cargo warehouse logistics',
  'ridefast': 'yellow taxi car',
  'mp-transfer': 'limousine private transfer luxury car chauffeur',
  'meal-ai': 'healthy food salad nutrition',
  'near': 'smartphone map GPS location',
  'hedeos': 'books education learning',
  'ekarotsi': 'supermarket grocery store',
  'veridictum': 'law books courthouse legal',
  'process': 'factory assembly line manufacturing',
  'ski-greece': 'ski slope snow mountains',
  'niki-margariti': 'student laptop AI chatbot',
};

// Picsum fallback - limited thematic matches (Pexels gives much better results)
const PICSUM_FALLBACK = {
  'fire-message': 40,
  'tattoo-healer': 77,
  'trans-hellas': 197,
  'ridefast': 370,
  'mp-transfer': 324,
  'meal-ai': 373,
  'near': 434,
  'hedeos': 349,
  'ekarotsi': 96,
  'veridictum': 26,
  'process': 197,
  'ski-greece': 26,
  'niki-margariti': 349,
};

async function downloadImage(url, filepath) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const buffer = await response.arrayBuffer();
  const { writeFile } = await import('fs/promises');
  await writeFile(filepath, Buffer.from(buffer));
}

async function downloadFromPexels(apiKey) {
  for (const [filename, query] of Object.entries(PEXELS_QUERIES)) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        { headers: { Authorization: apiKey } }
      );
      const data = await res.json();
      if (!data.photos?.length) {
        console.warn(`No results for "${query}"`);
        continue;
      }
      const photo = data.photos[0];
      const imageUrl = photo.src?.large2x || photo.src?.large || photo.src?.medium;
      const filepath = `${OUTPUT_DIR}/${filename}.jpg`;
      await downloadImage(imageUrl, filepath);
      console.log(`✓ ${filename}.jpg (${query})`);
    } catch (err) {
      console.error(`✗ ${filename}: ${err.message}`);
    }
  }
}

async function downloadFromPicsum() {
  console.log('Using Picsum fallback (add PEXELS_API_KEY for better matches)\n');
  for (const [filename, id] of Object.entries(PICSUM_FALLBACK)) {
    try {
      const url = `https://picsum.photos/id/${id}/800/400`;
      const filepath = `${OUTPUT_DIR}/${filename}.jpg`;
      await downloadImage(url, filepath);
      console.log(`✓ ${filename}.jpg (picsum id ${id})`);
    } catch (err) {
      console.error(`✗ ${filename}: ${err.message}`);
    }
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const apiKey = process.env.PEXELS_API_KEY;
  if (apiKey) {
    console.log('Using Pexels API for content-matching images\n');
    await downloadFromPexels(apiKey);
  } else {
    console.log('⚠️  Add PEXELS_API_KEY to .env for photos that match each product.');
    console.log('   Get a free key: https://www.pexels.com/api/documentation/\n');
    await downloadFromPicsum();
  }

  console.log('\nDone. Images saved to public/assets/portfolio/');
}

main();
