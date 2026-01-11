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
      // Extract frame with a 10px margin to safely clear all original grid lines
      const margin = 10;
      const srcX = col * srcFrameW + margin;
      const srcY = row * srcFrameH + margin;
      const cropW = srcFrameW - (margin * 2);
      const cropH = srcFrameH - (margin * 2);
      
      const frame = image.clone().crop({ x: srcX, y: srcY, w: cropW, h: cropH });
      
      // Sample background away from corners
      const samples = [
        { x: 5, y: 5 },
        { x: cropW - 6, y: 5 },
        { x: cropW / 2, y: 5 },
      ];
      
      const bgCounts = {};
      for (const s of samples) {
        const c = frame.getPixelColor(s.x, s.y);
        bgCounts[c] = (bgCounts[c] || 0) + 1;
      }
      const bgColor = parseInt(Object.keys(bgCounts).reduce((a, b) => 
        bgCounts[a] > bgCounts[b] ? a : b
      ));
      
      const bgR = (bgColor >>> 24) & 0xFF;
      const bgG = (bgColor >>> 16) & 0xFF;
      const bgB = (bgColor >>> 8) & 0xFF;
      
      // Balanced tolerance for the red character
      const tolerance = 30; 
      const bitmap = frame.bitmap;
      
      for (let i = 0; i < bitmap.data.length; i += 4) {
        const r = bitmap.data[i];
        const g = bitmap.data[i + 1];
        const b = bitmap.data[i + 2];
        
        if (Math.abs(r - bgR) <= tolerance &&
            Math.abs(g - bgG) <= tolerance &&
            Math.abs(b - bgB) <= tolerance) {
          bitmap.data[i + 3] = 0;
          totalRemoved++;
        }
      }

      // Deeper perimeter cleaning to catch remnants
      const edge = 5;
      for (let fy = 0; fy < cropH; fy++) {
        for (let fx = 0; fx < cropW; fx++) {
          if (fx < edge || fx >= cropW - edge || fy < edge || fy >= cropH - edge) {
            const idx = (fy * cropW + fx) * 4;
            // Force clear anything even slightly dark on the extreme edges
            if (bitmap.data[idx] < 60 && bitmap.data[idx+1] < 60 && bitmap.data[idx+2] < 60) {
              bitmap.data[idx + 3] = 0;
            }
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
  
  await output.write(outputPath);
  console.log(`  Processed: ${filename}`);
}

async function main() {
  console.log('=== Sprite Sheet Processor v6.3 ===\n');
  try {
    // Process P2
    await processSprite('fighter_p2.png');
    
    // Copy to P1
    const p1Path = join(SPRITES_DIR, 'fighter_p1_clean.png');
    const p2Path = join(SPRITES_DIR, 'fighter_p2_clean.png');
    const p2Image = await Jimp.read(p2Path);
    await p2Image.write(p1Path);
    
    console.log('\n=== Done! ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
