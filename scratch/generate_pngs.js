const fs = require('fs');
const path = require('path');

// A valid 1x1 transparent PNG file hex representation (with correct CRC)
const pngHex = '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082';
const pngBuffer = Buffer.from(pngHex, 'hex');

// Let's copy a valid tiny ICO file from node_modules or write a simple valid one
const icoPath = path.join(__dirname, '..', 'node_modules', '@supabase', 'phoenix', 'priv', 'static', 'favicon.ico');
let icoBuffer;

if (fs.existsSync(icoPath)) {
  icoBuffer = fs.readFileSync(icoPath);
} else {
  // Fallback to a tiny valid ico file
  const icoHex = '00000100010001010000010018003a0000001600000089504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082';
  icoBuffer = Buffer.from(icoHex, 'hex');
}

const brandDir = path.join(__dirname, '..', 'public', 'brand');
const appDir = path.join(__dirname, '..', 'src', 'app');

if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
}

fs.writeFileSync(path.join(brandDir, 'apple-touch-icon.png'), pngBuffer);
fs.writeFileSync(path.join(brandDir, 'icon-192.png'), pngBuffer);
fs.writeFileSync(path.join(brandDir, 'icon-512.png'), pngBuffer);
fs.writeFileSync(path.join(brandDir, 'favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);

console.log('Successfully generated correct binary placeholders!');
