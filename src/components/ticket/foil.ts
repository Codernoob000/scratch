import { Project } from '../../content/types';

function createRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  let a = h >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function drawFoil(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: Project,
  dpr: number
): void {
  const rng = createRng(project.id);
  const isGolden = Boolean(project.golden);

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Base fill: --foil (#CFC8BA) or golden --accent (#B4573A)
  ctx.fillStyle = isGolden ? '#B4573A' : '#CFC8BA';
  ctx.fillRect(0, 0, width, height);

  // 2. 1,200 speckles, 1px, random positions, alternating darker and lighter tones at 6-14% alpha
  const dotCount = 1200;
  for (let i = 0; i < dotCount; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const alpha = 0.06 + rng() * 0.08;
    const isDarker = i % 2 === 0;

    if (isGolden) {
      ctx.fillStyle = isDarker
        ? `rgba(70, 20, 10, ${alpha.toFixed(3)})`
        : `rgba(240, 180, 150, ${alpha.toFixed(3)})`;
    } else {
      ctx.fillStyle = isDarker
        ? `rgba(40, 35, 30, ${alpha.toFixed(3)})`
        : `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
    }

    ctx.fillRect(x, y, 1 * dpr, 1 * dpr);
  }

  // 3. 6 to 10 horizontal hairlines at 4-8% alpha
  const lineCount = Math.floor(6 + rng() * 5);
  for (let i = 0; i < lineCount; i++) {
    const y = rng() * height;
    const alpha = 0.04 + rng() * 0.04;
    ctx.strokeStyle = isGolden
      ? `rgba(255, 255, 255, ${alpha.toFixed(3)})`
      : `rgba(40, 35, 30, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 4. Panel code bottom-left in mono font, --foil-dark (#B9B2A3) or lighter for golden
  ctx.font = `500 ${Math.round(13 * dpr)}px "IBM Plex Mono", monospace`;
  ctx.fillStyle = isGolden ? '#EBE4D6' : '#B9B2A3';
  ctx.textBaseline = 'bottom';
  ctx.fillText(project.code, 8 * dpr, height - 8 * dpr);

  ctx.restore();
}

