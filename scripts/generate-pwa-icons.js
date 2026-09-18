import fs from 'fs';
import { Resvg } from '@resvg/resvg-js';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF9" />
      <stop offset="100%" stop-color="#EDE8DC" />
    </linearGradient>
    <filter id="shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#46584D" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- Background Squircle Canvas -->
  <rect width="512" height="512" rx="115" fill="url(#iconBg)" />

  <!-- Centered Scaled FoodBud Raccoon Face -->
  <g transform="translate(256, 266) scale(2.6) translate(-100, -78)" filter="url(#shadow)">
    <!-- Left Ear -->
    <path d="M 64 76 C 50 76 41 62 43 45 C 45 29 54 20 64 20 C 74 20 81 31 80 48 C 79 64 74 76 64 76 Z" fill="#80563E" />
    <path d="M 64 67 C 55 67 49 57 50 45 C 52 35 57 28 64 28 C 71 28 75 35 74 46 C 73 57 70 67 64 67 Z" fill="#E7CB9C" />

    <!-- Right Ear -->
    <path d="M 136 76 C 150 76 159 62 157 45 C 155 29 146 20 136 20 C 126 20 119 31 120 48 C 121 64 126 76 136 76 Z" fill="#80563E" />
    <path d="M 136 67 C 145 67 151 57 150 45 C 148 35 143 28 136 28 C 129 28 125 35 126 46 C 127 57 130 67 136 67 Z" fill="#E7CB9C" />

    <!-- Head Base -->
    <ellipse cx="100" cy="84" rx="54" ry="34" fill="#AB7A5A" />

    <!-- Dark Raccoon Eye Mask -->
    <path d="M 63 78 C 52 82 48 90 48 98 C 48 104 51 108 55 110 C 62 112 72 111 78 106 C 81 103 82 98 84 94 C 88 94 92 90 91 85 C 90 80 84 76 74 76 C 69 76 66 77 63 78 Z" fill="#80563E" />
    <path d="M 137 78 C 148 82 152 90 152 98 C 152 104 149 108 145 110 C 138 112 128 111 122 106 C 119 103 118 98 116 94 C 112 94 108 90 109 85 C 110 80 116 76 126 76 C 131 76 134 77 137 78 Z" fill="#80563E" />

    <!-- Cream Eyebrows -->
    <ellipse cx="68" cy="73" rx="7" ry="3.5" fill="#E7CB9C" transform="rotate(-12 68 73)" />
    <ellipse cx="132" cy="73" rx="7" ry="3.5" fill="#E7CB9C" transform="rotate(12 132 73)" />

    <!-- Cream Snout & Button Nose -->
    <ellipse cx="100" cy="108" rx="20.5" ry="8.5" fill="#E7CB9C" />
    <ellipse cx="100" cy="104" rx="6" ry="4.2" fill="#3A2D32" />

    <!-- Eyes with Highlights -->
    <ellipse cx="68" cy="95" rx="7.8" ry="9.5" fill="#3A2D32" />
    <circle cx="66" cy="91" r="3.1" fill="#FFFFFF" />
    <circle cx="70" cy="97" r="1.5" fill="#FFFFFF" />

    <ellipse cx="132" cy="95" rx="7.8" ry="9.5" fill="#3A2D32" />
    <circle cx="130" cy="91" r="3.1" fill="#FFFFFF" />
    <circle cx="134" cy="97" r="1.5" fill="#FFFFFF" />

    <!-- Rosy Cheeks -->
    <ellipse cx="50" cy="105" rx="7" ry="4.5" fill="#EAA4A4" opacity="0.75" />
    <ellipse cx="150" cy="105" rx="7" ry="4.5" fill="#EAA4A4" opacity="0.75" />

    <!-- Lilac Cap -->
    <path d="M 58 56 C 70 48 130 48 142 56 C 145 61 138 67 100 68 C 62 67 55 61 58 56 Z" fill="#B88EC0" />
    <path d="M 66 54 C 68 33 80 20 100 20 C 120 20 132 33 134 54 Z" fill="#DAB5DE" />
    <path d="M 100 21 L 100 54" stroke="#C49BC8" stroke-width="1.5" />
    <circle cx="100" cy="20" r="3.5" fill="#B88EC0" />
  </g>
</svg>`;

fs.writeFileSync('public/icon.svg', svg, 'utf8');

// 512x512 PNG
const resvg512 = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } });
const png512 = resvg512.render().asPng();
fs.writeFileSync('public/pwa-512x512.png', png512);

// 192x192 PNG
const resvg192 = new Resvg(svg, { fitTo: { mode: 'width', value: 192 } });
const png192 = resvg192.render().asPng();
fs.writeFileSync('public/pwa-192x192.png', png192);

// 180x180 Apple Touch Icon PNG
const resvg180 = new Resvg(svg, { fitTo: { mode: 'width', value: 180 } });
const png180 = resvg180.render().asPng();
fs.writeFileSync('public/apple-touch-icon.png', png180);

console.log('Successfully generated all PWA raccoon icons!');