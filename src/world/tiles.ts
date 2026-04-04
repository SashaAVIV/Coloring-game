import { TilePattern } from './DoodleTile';

// Helper to draw a smooth curve through points
function smoothCurve(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i++) {
    const cx = (points[i][0] + points[i + 1][0]) / 2;
    const cy = (points[i][1] + points[i + 1][1]) / 2;
    ctx.quadraticCurveTo(points[i][0], points[i][1], cx, cy);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last[0], last[1]);
  ctx.stroke();
}

export const tilePatterns: TilePattern[] = [
  // 1. Vertical pipe with bubbles
  {
    id: 'pipe-bubbles',
    draw: (ctx, w, h) => {
      // Main vertical pipe
      const pipeX = w * 0.35;
      ctx.beginPath();
      ctx.moveTo(pipeX, 0);
      ctx.lineTo(pipeX, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pipeX + w * 0.12, 0);
      ctx.lineTo(pipeX + w * 0.12, h);
      ctx.stroke();

      // Horizontal connections
      ctx.beginPath();
      ctx.moveTo(pipeX + w * 0.12, h * 0.3);
      ctx.lineTo(w * 0.75, h * 0.3);
      ctx.stroke();

      // Bubbles / circles
      for (const [cx, cy, r] of [
        [w * 0.75, h * 0.3, w * 0.1],
        [w * 0.7, h * 0.65, w * 0.14],
        [w * 0.25, h * 0.8, w * 0.08],
        [w * 0.6, h * 0.1, w * 0.06],
      ] as [number, number, number][]) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },

  // 2. Zigzag with circles
  {
    id: 'zigzag-circles',
    draw: (ctx, w, h) => {
      // Zigzag line across
      const points: [number, number][] = [];
      const segments = 8;
      for (let i = 0; i <= segments; i++) {
        const y = (i / segments) * h;
        const x = i % 2 === 0 ? w * 0.2 : w * 0.8;
        points.push([x, y]);
      }
      smoothCurve(ctx, points);

      // Circles at corners
      for (let i = 0; i <= segments; i++) {
        const y = (i / segments) * h;
        const x = i % 2 === 0 ? w * 0.2 : w * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, w * 0.08, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },

  // 3. Spiral
  {
    id: 'spiral',
    draw: (ctx, w, h) => {
      const cx = w * 0.5;
      const cy = h * 0.45;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 8; a += 0.05) {
        const r = a * w * 0.018;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Entry/exit pipes
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cy - w * 0.02);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + w * 0.4, cy);
      ctx.lineTo(cx + w * 0.4, h);
      ctx.stroke();
    },
  },

  // 4. Double helix
  {
    id: 'helix',
    draw: (ctx, w, h) => {
      const steps = 60;
      const amp = w * 0.25;
      const cx = w * 0.5;

      // Strand 1
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = t * h;
        const x = cx + Math.sin(t * Math.PI * 4) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Strand 2
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = t * h;
        const x = cx - Math.sin(t * Math.PI * 4) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Cross bars
      for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8;
        const y = t * h;
        const x1 = cx + Math.sin(t * Math.PI * 4) * amp;
        const x2 = cx - Math.sin(t * Math.PI * 4) * amp;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }
    },
  },

  // 5. Concentric circles with connecting pipe
  {
    id: 'concentric',
    draw: (ctx, w, h) => {
      const cx = w * 0.5;
      const cy = h * 0.5;
      for (let r = w * 0.06; r < w * 0.4; r += w * 0.08) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Pipe from top
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cy - w * 0.38);
      ctx.stroke();

      // Pipe to bottom
      ctx.beginPath();
      ctx.moveTo(cx, cy + w * 0.38);
      ctx.lineTo(cx, h);
      ctx.stroke();
    },
  },

  // 6. Wavy pipes
  {
    id: 'wavy-pipes',
    draw: (ctx, w, h) => {
      for (const offsetX of [0.25, 0.5, 0.75]) {
        const points: [number, number][] = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const y = t * h;
          const x = w * offsetX + Math.sin(t * Math.PI * 3 + offsetX * 5) * w * 0.1;
          points.push([x, y]);
        }
        smoothCurve(ctx, points);
      }

      // Horizontal connectors
      for (const frac of [0.25, 0.5, 0.75]) {
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * frac);
        ctx.lineTo(w * 0.85, h * frac);
        ctx.stroke();
      }
    },
  },

  // 7. Gear / cog shape
  {
    id: 'gear',
    draw: (ctx, w, h) => {
      const cx = w * 0.5;
      const cy = h * 0.45;
      const outerR = w * 0.3;
      const innerR = w * 0.22;
      const teeth = 12;

      ctx.beginPath();
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Center hole
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.08, 0, Math.PI * 2);
      ctx.stroke();

      // Pipe in from top
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cy - outerR);
      ctx.stroke();

      // Pipe out bottom
      ctx.beginPath();
      ctx.moveTo(cx, cy + outerR);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // Small circle bottom right
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.82, w * 0.09, 0, Math.PI * 2);
      ctx.stroke();
    },
  },

  // 8. Maze-like pattern
  {
    id: 'maze',
    draw: (ctx, w, h) => {
      const m = w * 0.1; // margin
      // Outer border segments
      ctx.beginPath();
      ctx.moveTo(m, 0);
      ctx.lineTo(m, h * 0.7);
      ctx.lineTo(w * 0.4, h * 0.7);
      ctx.lineTo(w * 0.4, h * 0.3);
      ctx.lineTo(w * 0.7, h * 0.3);
      ctx.lineTo(w * 0.7, h * 0.7);
      ctx.lineTo(w - m, h * 0.7);
      ctx.lineTo(w - m, 0);
      ctx.stroke();

      // Inner path
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h);
      ctx.lineTo(w * 0.25, h * 0.5);
      ctx.lineTo(w * 0.55, h * 0.5);
      ctx.lineTo(w * 0.55, h * 0.15);
      ctx.lineTo(w * 0.85, h * 0.15);
      ctx.lineTo(w * 0.85, h);
      ctx.stroke();

      // Circles at dead ends
      ctx.beginPath();
      ctx.arc(w * 0.55, h * 0.15, w * 0.05, 0, Math.PI * 2);
      ctx.stroke();
    },
  },

  // 9. Tree / branching
  {
    id: 'tree',
    draw: (ctx, w, h) => {
      // Main trunk
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h);
      ctx.lineTo(w * 0.5, h * 0.4);
      ctx.stroke();

      // Branch left
      smoothCurve(ctx, [
        [w * 0.5, h * 0.6],
        [w * 0.3, h * 0.45],
        [w * 0.15, h * 0.25],
      ]);

      // Branch right
      smoothCurve(ctx, [
        [w * 0.5, h * 0.55],
        [w * 0.7, h * 0.4],
        [w * 0.85, h * 0.2],
      ]);

      // Top branch
      smoothCurve(ctx, [
        [w * 0.5, h * 0.4],
        [w * 0.45, h * 0.2],
        [w * 0.5, h * 0.05],
      ]);

      // Circles (fruits/leaves)
      for (const [cx, cy] of [
        [0.15, 0.25], [0.85, 0.2], [0.5, 0.05],
        [0.3, 0.45], [0.7, 0.4], [0.5, 0.4],
      ]) {
        ctx.beginPath();
        ctx.arc(w * cx, h * cy, w * 0.07, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },

  // 10. Wave pattern
  {
    id: 'waves',
    draw: (ctx, w, h) => {
      for (let row = 0; row < 5; row++) {
        const y = h * (0.1 + row * 0.2);
        const points: [number, number][] = [];
        for (let i = 0; i <= 30; i++) {
          const t = i / 30;
          points.push([
            t * w,
            y + Math.sin(t * Math.PI * 3) * h * 0.06,
          ]);
        }
        smoothCurve(ctx, points);
      }

      // Vertical connectors
      for (const x of [0.2, 0.5, 0.8]) {
        ctx.beginPath();
        ctx.moveTo(w * x, 0);
        ctx.lineTo(w * x, h);
        ctx.stroke();
      }
    },
  },

  // 11. Snake / S-curve
  {
    id: 'snake',
    draw: (ctx, w, h) => {
      const points: [number, number][] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const y = t * h;
        const x = w * 0.5 + Math.sin(t * Math.PI * 3) * w * 0.3;
        points.push([x, y]);
      }
      smoothCurve(ctx, points);

      // Dots along the snake
      for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8;
        const y = t * h;
        const x = w * 0.5 + Math.sin(t * Math.PI * 3) * w * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, w * 0.04, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },

  // 12. Grid with diagonal
  {
    id: 'grid-diagonal',
    draw: (ctx, w, h) => {
      const cols = 4;
      const rows = 5;
      // Vertical lines
      for (let c = 0; c <= cols; c++) {
        const x = (c / cols) * w * 0.8 + w * 0.1;
        ctx.beginPath();
        ctx.moveTo(x, h * 0.05);
        ctx.lineTo(x, h * 0.95);
        ctx.stroke();
      }
      // Horizontal lines
      for (let r = 0; r <= rows; r++) {
        const y = (r / rows) * h * 0.9 + h * 0.05;
        ctx.beginPath();
        ctx.moveTo(w * 0.1, y);
        ctx.lineTo(w * 0.9, y);
        ctx.stroke();
      }
      // Diagonals in alternating cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 2 === 0) {
            const x1 = (c / cols) * w * 0.8 + w * 0.1;
            const y1 = (r / rows) * h * 0.9 + h * 0.05;
            const x2 = ((c + 1) / cols) * w * 0.8 + w * 0.1;
            const y2 = ((r + 1) / rows) * h * 0.9 + h * 0.05;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
    },
  },
];
