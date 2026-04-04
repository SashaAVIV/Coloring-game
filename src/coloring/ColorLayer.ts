import { createOffscreenCanvas } from '../utils/canvas';
import { BrushStroke } from './BrushEngine';
import { GameConfig } from '../game/GameConfig';

/**
 * Manages the offscreen canvas where brush strokes are painted.
 * This layer is composited with the doodle layer using source-atop
 * to clip color to doodle shapes only.
 */
export class ColorLayer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private tileWidth: number;
  private tileHeight: number;

  constructor(tileWidth: number, tileHeight: number) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    const { canvas, ctx } = createOffscreenCanvas(tileWidth, tileHeight);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /** Paint brush strokes onto this layer for a specific tile */
  paintStrokes(
    strokes: BrushStroke[],
    tileWorldY: number,
    color: string,
  ): void {
    const { ctx } = this;
    const radius = GameConfig.BRUSH_RADIUS;

    ctx.fillStyle = color;
    for (const stroke of strokes) {
      const localX = stroke.worldX;
      const localY = stroke.worldY - tileWorldY;

      if (localY >= -radius && localY <= this.tileHeight + radius) {
        ctx.beginPath();
        ctx.arc(localX, localY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.tileWidth, this.tileHeight);
  }

  resize(width: number, height: number): void {
    this.tileWidth = width;
    this.tileHeight = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
