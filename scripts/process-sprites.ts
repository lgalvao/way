/**
 * Sprite Sheet Processor
 * 
 * Processes the generated sprite sheets to:
 * 1. Remove the dark gray background (make transparent)
 * 2. Extract frame information
 * 
 * Usage: npx ts-node scripts/process-sprites.ts
 */

import Jimp from 'jimp';
import * as path from 'path';

const SPRITES_DIR = path.join(__dirname, '../assets/sprites');

// Dark gray background color to remove (approximate)
const BG_COLOR_THRESHOLD = 60; // R, G, B values below this are considered background

async function processSprite(filename: string): Promise<void> {
  const inputPath = path.join(SPRITES_DIR, filename);
  const outputPath = path.join(SPRITES_DIR, filename.replace('.png', '_clean.png'));
  
  console.log(`Processing: ${filename}`);
  
  const image = await Jimp.read(inputPath);
  const width = image.getWidth();
  const height = image.getHeight();
  
  console.log(`  Dimensions: ${width}x${height}`);
  console.log(`  Grid: 3 cols x 4 rows`);
  console.log(`  Frame size: ${Math.floor(width/3)}x${Math.floor(height/4)}`);
  
  // Process each pixel
  image.scan(0, 0, width, height, function(x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    
    // Check if this pixel is the dark gray background
    // The background appears to be around RGB(45, 50, 56) - dark gray/blue
    if (red < BG_COLOR_THRESHOLD && green < BG_COLOR_THRESHOLD && blue < BG_COLOR_THRESHOLD) {
      // Make transparent
      this.bitmap.data[idx + 3] = 0;
    }
  });
  
  await image.writeAsync(outputPath);
  console.log(`  Saved: ${outputPath}`);
  
  // Also create frame info
  const frameWidth = Math.floor(width / 3);
  const frameHeight = Math.floor(height / 4);
  
  console.log(`\n  Phaser config for ${filename}:`);
  console.log(`  frameWidth: ${frameWidth}`);
  console.log(`  frameHeight: ${frameHeight}`);
  console.log(`  Total frames: 12`);
}

async function main() {
  console.log('=== Sprite Sheet Processor ===\n');
  
  try {
    // Process P1 (white gi)
    await processSprite('fighter_p1.png');
    
    // Process P2 (red gi) if it exists
    try {
      await processSprite('fighter_p2.png');
    } catch {
      console.log('\nfighter_p2.png not found, skipping...');
    }
    
    console.log('\n=== Done! ===');
    console.log('\nUpdate PreloadScene.ts with the clean sprites:');
    console.log("  this.load.spritesheet('fighter_p1', 'assets/sprites/fighter_p1_clean.png', {...})");
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
