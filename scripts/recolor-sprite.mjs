/**
 * Sprite Recolor Script
 * 
 * Takes the clean P2 (red) sprite and creates a P1 (white/tan) version
 * 
 * Usage: node scripts/recolor-sprite.mjs
 */

import { Jimp } from 'jimp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SPRITES_DIR = join(__dirname, '../assets/sprites');

async function recolorSprite() {
  const inputPath = join(SPRITES_DIR, 'fighter_p2_clean.png');
  const outputPath = join(SPRITES_DIR, 'fighter_p1_clean.png');
  
  console.log('Loading P2 (red) sprite...');
  
  const image = await Jimp.read(inputPath);
  const bitmap = image.bitmap;
  
  console.log(`Dimensions: ${image.width}x${image.height}`);
  console.log('Recoloring red -> white/cream...');
  
  let recoloredCount = 0;
  
  for (let i = 0; i < bitmap.data.length; i += 4) {
    const r = bitmap.data[i];
    const g = bitmap.data[i + 1];
    const b = bitmap.data[i + 2];
    const a = bitmap.data[i + 3];
    
    // Skip transparent pixels
    if (a === 0) continue;
    
    // Detect red/dark red pixels (the gi color)
    // Red gi has high R, lower G and B
    if (r > 100 && r > g * 1.5 && r > b * 1.5) {
      // Convert red to white/cream
      // Keep the luminance relationship
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
      const factor = luminance / 255;
      
      // White gi with slight cream tint
      bitmap.data[i] = Math.min(255, 220 + factor * 35);     // R
      bitmap.data[i + 1] = Math.min(255, 215 + factor * 35); // G  
      bitmap.data[i + 2] = Math.min(255, 200 + factor * 30); // B
      recoloredCount++;
    }
    // Detect maroon/dark red (shadows on the gi)
    else if (r > 60 && r > g * 1.3 && r > b * 1.3 && r < 150) {
      // Convert to light tan/shadow
      const factor = r / 150;
      bitmap.data[i] = Math.min(255, 180 + factor * 40);     // R
      bitmap.data[i + 1] = Math.min(255, 170 + factor * 40); // G
      bitmap.data[i + 2] = Math.min(255, 150 + factor * 30); // B
      recoloredCount++;
    }
    // Detect very dark red (deep shadows)
    else if (r > 30 && r > g * 1.2 && r > b * 1.2 && r < 80) {
      // Convert to darker tan
      const factor = r / 80;
      bitmap.data[i] = Math.min(255, 140 + factor * 40);     // R
      bitmap.data[i + 1] = Math.min(255, 130 + factor * 40); // G
      bitmap.data[i + 2] = Math.min(255, 110 + factor * 30); // B
      recoloredCount++;
    }
  }
  
  console.log(`Recolored ${recoloredCount} pixels`);
  
  await image.write(outputPath);
  console.log(`Saved: ${outputPath}`);
  console.log('\nDone! P1 (white) sprite created from P2 (red).');
}

recolorSprite().catch(console.error);
