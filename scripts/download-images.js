#!/usr/bin/env node
/**
 * Downloads product-matching portfolio images from Pexels.
 * Add PEXELS_API_KEY to .env (get a free key at https://www.pexels.com/api/documentation/)
 * Run: npm run download-portfolio-images [optional: single project key e.g. mp-transfer]
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
  'tattoo-healer': 'tattoo ink on skin arm',
  'trans-hellas': 'freight truck cargo warehouse logistics',
  'ridefast': 'yellow taxi car',
  'mp-transfer': 'black executive car chauffeur transfer',
  'meal-ai': 'healthy food salad nutrition',
  'near': 'smartphone map GPS location',
  'hedeos': 'books education learning',
  'ekarotsi': 'supermarket grocery store',
  'veridictum': 'law books courthouse legal',
  'process': 'wood workshop carpentry manufacturing timber',
  'ski-greece': 'ski slope snow mountains',
  'niki-margariti': 'student laptop AI chatbot',
};

async function downloadImage(url, filepath) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const buffer = await response.arrayBuffer();
  const { writeFile } = await import('fs/promises');
  await writeFile(filepath, Buffer.from(buffer));
}

async function downloadFromPexels(apiKey, queries = PEXELS_QUERIES) {
  for (const [filename, query] of Object.entries(queries)) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`,
        { headers: { Authorization: apiKey } }
      );
      const data = await res.json();
      if (!data.photos?.length) {
        console.warn(`No results for "${query}"`);
        continue;
      }
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
      const imageUrl = photo.src?.large2x || photo.src?.large || photo.src?.medium;
      const filepath = `${OUTPUT_DIR}/${filename}.jpg`;
      await downloadImage(imageUrl, filepath);
      console.log(`✓ ${filename}.jpg (${query})`);
    } catch (err) {
      console.error(`✗ ${filename}: ${err.message}`);
    }
  }
}

async function main() {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error('Missing PEXELS_API_KEY. Add it to .env');
    console.error('Get a free key: https://www.pexels.com/api/documentation/');
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const only = process.argv[2]; // e.g. mp-transfer
  const queries = only
    ? Object.fromEntries(Object.entries(PEXELS_QUERIES).filter(([k]) => k === only))
    : PEXELS_QUERIES;

  console.log('Using Pexels API for content-matching images\n');
  await downloadFromPexels(apiKey, queries);

  console.log('\nDone. Images saved to public/assets/portfolio/');
}

main();
