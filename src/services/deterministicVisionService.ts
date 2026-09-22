export interface VisionRegion {
  id: number;
  areaRatio: number;
  centerX: number;
  centerY: number;
  colorFamily: 'green' | 'red_orange' | 'yellow' | 'brown' | 'light' | 'dark' | 'neutral';
  averageRgb: [number, number, number];
}

export interface DeterministicVisionResult {
  version: 'vision-local-v1';
  width: number;
  height: number;
  foregroundRatio: number;
  regionCount: number;
  regions: VisionRegion[];
  brightness: number;
  edgeDensity: number;
  quality: 'low' | 'usable' | 'good';
  warnings: string[];
  optimizedImage: string;
  promptContext: string;
}

const loadImage = (source: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Não foi possível decodificar a imagem.'));
  image.src = source;
});

const colorDistance = (a: [number, number, number], b: [number, number, number]): number =>
  Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

const classifyColor = (rgb: [number, number, number]): VisionRegion['colorFamily'] => {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 65) return 'dark';
  if (min > 190 && max - min < 38) return 'light';
  if (g > r * 1.12 && g > b * 1.08) return 'green';
  if (r > 125 && g > 85 && b < 105 && r - b > 45) return g > r * 0.72 ? 'yellow' : 'red_orange';
  if (r > g * 1.08 && r > b * 1.3) return 'red_orange';
  if (r > 75 && g > 45 && g < r * 0.9 && b < g * 0.85) return 'brown';
  return 'neutral';
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] || 0;
};

export async function analyzeImageDeterministically(imageDataUrl: string): Promise<DeterministicVisionResult> {
  const image = await loadImage(imageDataUrl);
  const analysisSize = 128;
  const canvas = document.createElement('canvas');
  canvas.width = analysisSize;
  canvas.height = analysisSize;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas indisponível para análise local.');
  context.drawImage(image, 0, 0, analysisSize, analysisSize);
  const pixels = context.getImageData(0, 0, analysisSize, analysisSize).data;
  const index = (x: number, y: number) => (y * analysisSize + x) * 4;

  const cornerSamples: [number, number, number][] = [];
  const cornerSize = 14;
  for (let y = 0; y < analysisSize; y += 1) {
    for (let x = 0; x < analysisSize; x += 1) {
      const isCorner = (x < cornerSize || x >= analysisSize - cornerSize)
        && (y < cornerSize || y >= analysisSize - cornerSize);
      if (!isCorner) continue;
      const offset = index(x, y);
      cornerSamples.push([pixels[offset], pixels[offset + 1], pixels[offset + 2]]);
    }
  }
  const background: [number, number, number] = [
    median(cornerSamples.map((sample) => sample[0])),
    median(cornerSamples.map((sample) => sample[1])),
    median(cornerSamples.map((sample) => sample[2]))
  ];

  const mask = new Uint8Array(analysisSize * analysisSize);
  let brightnessTotal = 0;
  let edgePixels = 0;
  for (let y = 0; y < analysisSize; y += 1) {
    for (let x = 0; x < analysisSize; x += 1) {
      const offset = index(x, y);
      const rgb: [number, number, number] = [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
      brightnessTotal += (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) / 255;
      const radialDistance = Math.hypot(x - analysisSize / 2, y - analysisSize / 2) / (analysisSize * 0.71);
      if (colorDistance(rgb, background) > 42 && radialDistance < 0.94) mask[y * analysisSize + x] = 1;
      if (x > 0 && y > 0) {
        const left = index(x - 1, y);
        const above = index(x, y - 1);
        const gradient = Math.abs(pixels[offset] - pixels[left]) + Math.abs(pixels[offset + 1] - pixels[left + 1])
          + Math.abs(pixels[offset] - pixels[above]) + Math.abs(pixels[offset + 1] - pixels[above + 1]);
        if (gradient > 75) edgePixels += 1;
      }
    }
  }

  const visited = new Uint8Array(mask.length);
  const components: { pixels: number[]; sumR: number; sumG: number; sumB: number; sumX: number; sumY: number }[] = [];
  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || visited[start]) continue;
    const queue = [start];
    visited[start] = 1;
    const component = { pixels: [] as number[], sumR: 0, sumG: 0, sumB: 0, sumX: 0, sumY: 0 };
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      const x = current % analysisSize;
      const y = Math.floor(current / analysisSize);
      component.pixels.push(current);
      const offset = current * 4;
      component.sumR += pixels[offset]; component.sumG += pixels[offset + 1]; component.sumB += pixels[offset + 2];
      component.sumX += x; component.sumY += y;
      const neighbors = [current - 1, current + 1, current - analysisSize, current + analysisSize];
      for (const neighbor of neighbors) {
        if (neighbor < 0 || neighbor >= mask.length || visited[neighbor] || !mask[neighbor]) continue;
        const nx = neighbor % analysisSize;
        if (Math.abs(nx - x) > 1) continue;
        visited[neighbor] = 1;
        queue.push(neighbor);
      }
    }
    if (component.pixels.length >= 90) components.push(component);
  }

  const totalPixels = analysisSize * analysisSize;
  const foregroundPixels = components.reduce((sum, component) => sum + component.pixels.length, 0);
  const regions = components
    .sort((a, b) => b.pixels.length - a.pixels.length)
    .slice(0, 6)
    .map((component, regionIndex): VisionRegion => {
      const count = component.pixels.length;
      const averageRgb: [number, number, number] = [
        Math.round(component.sumR / count), Math.round(component.sumG / count), Math.round(component.sumB / count)
      ];
      return {
        id: regionIndex + 1,
        areaRatio: Number((count / Math.max(1, foregroundPixels)).toFixed(3)),
        centerX: Number((component.sumX / count / analysisSize).toFixed(3)),
        centerY: Number((component.sumY / count / analysisSize).toFixed(3)),
        colorFamily: classifyColor(averageRgb),
        averageRgb
      };
    });

  const brightness = Number((brightnessTotal / totalPixels).toFixed(3));
  const edgeDensity = Number((edgePixels / totalPixels).toFixed(3));
  const foregroundRatio = Number((foregroundPixels / totalPixels).toFixed(3));
  const warnings: string[] = [];
  if (brightness < 0.22) warnings.push('imagem escura');
  if (brightness > 0.9) warnings.push('imagem superexposta');
  if (edgeDensity < 0.045) warnings.push('imagem possivelmente desfocada');
  if (foregroundRatio < 0.12) warnings.push('alimento ocupa pouca área da foto');
  const quality = warnings.length >= 2 ? 'low' : warnings.length === 1 ? 'usable' : 'good';

  const optimizedCanvas = document.createElement('canvas');
  const maxSide = 768;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  optimizedCanvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  optimizedCanvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  optimizedCanvas.getContext('2d')?.drawImage(image, 0, 0, optimizedCanvas.width, optimizedCanvas.height);
  const optimizedImage = optimizedCanvas.toDataURL('image/jpeg', 0.76);
  const promptContext = JSON.stringify({
    method: 'deterministic-local-segmentation-v1',
    foregroundRatio,
    regionCount: regions.length,
    regions: regions.map(({ id, areaRatio, centerX, centerY, colorFamily }) => ({ id, areaRatio, centerX, centerY, colorFamily })),
    brightness,
    edgeDensity,
    warnings
  });

  return {
    version: 'vision-local-v1', width: image.naturalWidth, height: image.naturalHeight,
    foregroundRatio, regionCount: regions.length, regions, brightness, edgeDensity,
    quality, warnings, optimizedImage, promptContext
  };
}
