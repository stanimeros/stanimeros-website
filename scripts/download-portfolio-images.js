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

const PEXELS_QUERIES = {
  'fire-message': 'fire alarm notification mobile app',
  'tattoo-healer': 'tattoo care aftercare',
  'trans-hellas': 'logistics truck delivery transport',
  'ridefast': 'taxi car ride',
  'mp-transfer': 'hotel airport transfer',
  'tapfast': 'QR code smartphone scan',
  'meal-ai': 'healthy food nutrition meal',
  'near': 'map location GPS',
  'reserwave': 'beach waves booking resort',
  'hedeos': 'education books learning',
  'ekarotsi': 'supermarket grocery shopping',
};

// Curated Picsum IDs (from Lorem Picsum / Unsplash) - best thematic matches available
const PICSUM_FALLBACK = {
  'fire-message': 40,    // red/orange tones
  'tattoo-healer': 77,   // artistic
  'trans-hellas': 197,   // truck/logistics
  'ridefast': 370,       // car
  'mp-transfer': 324,    // travel
  'tapfast': 443,        // tech/digital
  'meal-ai': 373,        // food (Jay Wennington)
  'near': 434,           // map/landscape
  'reserwave': 16,       // beach
  'hedeos': 349,         // learning/books
  'ekarotsi': 96,        // food/grocery (Pawel Kadysz)
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
    await downloadFromPexels(apiKey);
  } else {
    await downloadFromPicsum();
  }

  console.log('\nDone. Images saved to public/assets/portfolio/');
}

main();
