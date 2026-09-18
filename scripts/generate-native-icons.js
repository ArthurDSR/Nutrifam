import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const svg = fs.readFileSync('public/icon.svg', 'utf-8');

function renderIcon(width, height) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width }
  });
  return resvg.render().asPng();
}

const androidSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 }
];

console.log('Generating Android Icons...');
for (const { folder, size } of androidSizes) {
  const dir = path.join('android', 'app', 'src', 'main', 'res', folder);
  if (fs.existsSync(dir)) {
    const png = renderIcon(size, size);
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), png);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), png);
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), png);
    console.log(`Generated Android ${folder} (${size}x${size})`);
  }
}

console.log('Generating iOS Icons...');
const iosDir = path.join('ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
if (fs.existsSync(iosDir)) {
  const ios1024 = renderIcon(1024, 1024);
  fs.writeFileSync(path.join(iosDir, 'AppIcon-512@2x.png'), ios1024);
  console.log('Generated iOS AppIcon-512@2x.png (1024x1024)');
}

console.log('Done generating native icons!');
