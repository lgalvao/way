/**
 * Sprite Sheet Processor v6
 * 
 * Based on original 1024x1024 images with 4 cols x 3 rows grid
 * Removes dark background and outputs PNG with transparency
 * 
 * Usage: node scripts/process-sprites.mjs
 */

import { Jimp } from 'jimp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SPRITES_DIR = join(__dirname, '../assets/sprites');

// Original grid is 4 columns x 3 rows
const COLS = 4;
const ROWS = 3;

// Output frame dimensions (resized from original)
const OUT_FRAME_WIDTH = 170;
const OUT_FRAME_HEIGHT = 170;
const SPACING = 2;

// Output dimensions
const OUT_WIDTH = OUT_FRAME_WIDTH * COLS + SPACING * (COLS - 1);
const OUT_HEIGHT = OUT_FRAME_HEIGHT * ROWS + SPACING * (ROWS - 1);

async function processSprite(filename) {
  const inputPath = join(SPRITES_DIR, filename);
  const outputFilename = filename.replace('.png', '_clean.png');
  const outputPath = join(SPRITES_DIR, outputFilename);
  
  console.log(`Processing: ${filename}`);
  
  const image = await Jimp.read(inputPath);
  const width = image.width;
  const height = image.height;
  
  console.log(`  Original: ${width}x${height}`);
  console.log(`  Grid: ${COLS}x${ROWS} = ${COLS*ROWS} frames`);
  
  // Calculate source frame size
  const srcFrameW = Math.floor(width / COLS);
  const srcFrameH = Math.floor(height / ROWS);
  console.log(`  Source frame: ${srcFrameW}x${srcFrameH}`);
  
  // Create output with transparent background
  const output = new Jimp({ width: OUT_WIDTH, height: OUT_HEIGHT, color: 0x00000000 });
  
  let totalRemoved = 0;
  
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // Extract frame
      const srcX = col * srcFrameW;
      const srcY = row * srcFrameH;
      
      const frame = image.clone().crop({ x: srcX, y: srcY, w: srcFrameW, h: srcFrameH });
      
      // Sample background from corners of this frame
      const samples = [
        { x: 2, y: 2 },
        { x: srcFrameW - 3, y: 2 },
        { x: 2, y: srcFrameH - 3 },
        { x: srcFrameW - 3, y: srcFrameH - 3 },
      ];
      
      // Get most common corner color as background
      const bgCounts = {};
      for (const s of samples) {
        const c = frame.getPixelColor(s.x, s.y);
        bgCounts[c] = (bgCounts[c] || 0) + 1;
      }
      const bgColor = parseInt(Object.keys(bgCounts).reduce((a, b) => 
        bgCounts[a] > bgCounts[b] ? a : b
      ));
      
      // Extract RGB from background color
      const bgR = (bgColor >>> 24) & 0xFF;
      const bgG = (bgColor >>> 16) & 0xFF;
      const bgB = (bgColor >>> 8) & 0xFF;
      
      // Only remove if background is actually dark (avoid removing white gi)
      const isDarkBg = bgR < 80 && bgG < 80 && bgB < 80;
      
      if (isDarkBg) {
        // Remove background with tolerance
        const tolerance = 25;
        const bitmap = frame.bitmap;
        
        for (let i = 0; i < bitmap.data.length; i += 4) {
          const r = bitmap.data[i];
          const g = bitmap.data[i + 1];
          const b = bitmap.data[i + 2];
          
          // Only remove dark pixels that match the background
          const isMatchingBg = Math.abs(r - bgR) <= tolerance &&
                               Math.abs(g - bgG) <= tolerance &&
                               Math.abs(b - bgB) <= tolerance;
          const isDarkPixel = r < 80 && g < 80 && b < 80;
          
          if (isMatchingBg && isDarkPixel) {
            bitmap.data[i + 3] = 0;
            totalRemoved++;
          }
        }
      }
      
      // Resize frame
      frame.resize({ w: OUT_FRAME_WIDTH, h: OUT_FRAME_HEIGHT, mode: 'nearestNeighbor' });
      
      // Place in output
      const destX = col * (OUT_FRAME_WIDTH + SPACING);
      const destY = row * (OUT_FRAME_HEIGHT + SPACING);
      output.composite(frame, destX, destY);
    }
  }
  
  console.log(`  Removed ${totalRemoved} background pixels`);
  console.log(`  Output: ${OUT_WIDTH}x${OUT_HEIGHT}`);
  
  await output.write(outputPath);
  console.log(`  Saved: ${outputPath}`);
}

async function main() {
  console.log('=== Sprite Sheet Processor v6 ===\n');
  console.log(`Output grid: ${COLS}x${ROWS}, frames: ${OUT_FRAME_WIDTH}x${OUT_FRAME_HEIGHT}\n`);
  
  try {
    await processSprite('fighter_p1.png');
    await processSprite('fighter_p2.png');
    console.log('\n=== Done! ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
