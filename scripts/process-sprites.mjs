/**
 * Sprite Sheet Processor v5
 * 
 * 1. Extract each frame individually from 3x4 grid
 * 2. Remove background per-frame with conservative tolerance
 * 3. Resize frames to target size
 * 4. Composite with spacing to prevent bleeding
 * 
 * Usage: node scripts/process-sprites.mjs
 */

import { Jimp } from 'jimp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SPRITES_DIR = join(__dirname, '../assets/sprites');

// Frame dimensions
const FRAME_WIDTH = 170;
const FRAME_HEIGHT = 128;
const SPACING = 2; // Add 2px spacing between frames

// Target size with spacing: (170*3 + 2*2) x (128*4 + 2*3) = 514 x 518
const TARGET_WIDTH = FRAME_WIDTH * 3 + SPACING * 2;
const TARGET_HEIGHT = FRAME_HEIGHT * 4 + SPACING * 3;

// Original sprite sheet is 1024x1024, 3x4 grid
const COLS = 3;
const ROWS = 4;

function intToRGBA(i) {
  return {
    r: (i >>> 24) & 0xFF,
    g: (i >>> 16) & 0xFF,
    b: (i >>> 8) & 0xFF,
    a: i & 0xFF
  };
}

function removeBackground(frame, tolerance = 15) {
  // Sample background from frame corners (not edges to avoid artifacts)
  const w = frame.width;
  const h = frame.height;
  const samples = [
    { x: 5, y: 5 },
    { x: w - 6, y: 5 },
    { x: 5, y: h - 6 },
    { x: w - 6, y: h - 6 },
  ];
  
  const bgCounts = {};
  for(const s of samples) {
    const c = frame.getPixelColor(s.x, s.y);
    bgCounts[c] = (bgCounts[c] || 0) + 1;
  }
  
  const mostCommonBgInt = parseInt(Object.keys(bgCounts).reduce((a, b) => bgCounts[a] > bgCounts[b] ? a : b));
  const targetBg = intToRGBA(mostCommonBgInt);
  
  let removedCount = 0;
  const bitmap = frame.bitmap;
  
  for (let i = 0; i < bitmap.data.length; i += 4) {
    const r = bitmap.data[i];
    const g = bitmap.data[i + 1];
    const b = bitmap.data[i + 2];
    
    if (Math.abs(r - targetBg.r) <= tolerance &&
        Math.abs(g - targetBg.g) <= tolerance &&
        Math.abs(b - targetBg.b) <= tolerance) {
       bitmap.data[i + 3] = 0; // Set Alpha to 0
       removedCount++;
    }
  }
  
  return removedCount;
}

async function processSprite(filename) {
  const inputPath = join(SPRITES_DIR, filename);
  const outputFilename = filename.replace('.png', '_clean.png');
  const outputPath = join(SPRITES_DIR, outputFilename);
  
  console.log(`Processing: ${filename}`);
  
  const image = await Jimp.read(inputPath);
  const width = image.width;
  const height = image.height;
  
  console.log(`  Dimensions: ${width}x${height}`);
  console.log(`  Processing ${COLS}x${ROWS} grid: frame size ${FRAME_WIDTH}x${FRAME_HEIGHT}, spacing ${SPACING}px`);
  
  // Create final target image with transparent background
  const targetImage = new Jimp({ width: TARGET_WIDTH, height: TARGET_HEIGHT, color: 0x00000000 });
  
  let totalRemoved = 0;
  
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // Calculate source frame bounds - use exact division to avoid gaps
      // For 1024 width / 3 cols = 341.333... per column
      const srcX = Math.round((col * width) / COLS);
      const srcY = Math.round((row * height) / ROWS);
      const srcW = Math.round(((col + 1) * width) / COLS) - srcX;
      const srcH = Math.round(((row + 1) * height) / ROWS) - srcY;
      
      // Extract frame
      const frame = image.clone().crop({ x: srcX, y: srcY, w: srcW, h: srcH });
      
      // Remove background from this frame
      const removed = removeBackground(frame, 15);
      totalRemoved += removed;
      
      // Resize frame
      frame.resize({ w: FRAME_WIDTH, h: FRAME_HEIGHT, mode: 'nearestNeighbor' });
      
      // Calculate destination position with spacing
      const destX = col * (FRAME_WIDTH + SPACING);
      const destY = row * (FRAME_HEIGHT + SPACING);
      
      // Composite frame onto target
      targetImage.composite(frame, destX, destY);
    }
  }
  
  console.log(`  Removed ${totalRemoved} background pixels`);
  
  await targetImage.write(outputPath);
  console.log(`  Saved: ${outputPath}`);
  console.log(`  Final dimensions: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
}

async function main() {
  console.log('=== Sprite Sheet Processor v5 ===\n');
  try {
    // Process P2 (Red) - source
    await processSprite('fighter_p2.png');
    // Process P1 (White) - source
    await processSprite('fighter_p1.png');
    console.log('\n=== Done! ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
