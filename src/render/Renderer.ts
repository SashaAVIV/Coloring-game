import { Camera } from './Camera';
import { TileManager } from '../world/TileManager';
import { BrushStroke } from '../coloring/BrushEngine';
import { GameConfig } from '../game/GameConfig';
import { createOffscreenCanvas } from '../utils/canvas';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  // Compositing canvas for source-atop clipping
  private compCanvas: HTMLCanvasElement;
  private compCtx: CanvasRenderingContext2D;

  // Per-tile color layers (map tile id+worldY to offscreen canvas)
  private colorLayers = new Map<string, { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;

    const { canvas: comp, ctx: compCtx } = createOffscreenCanvas(canvas.width, canvas.height);
    this.compCanvas = comp;
    this.compCtx = compCtx;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.compCanvas.width = width;
    this.compCanvas.height = height;
  }

  private getColorLayer(tileKey: string, tileW: number, tileH: number) {
    let layer = this.colorLayers.get(tileKey);
    if (!layer) {
      layer = createOffscreenCanvas(tileW, tileH);
      this.colorLayers.set(tileKey, layer);
    }
    return layer;
  }

  /** Paint brush strokes onto the appropriate tile color layer */
  paintBrushStrokes(strokes: BrushStroke[], tileManager: TileManager, color: string): void {
    const radius = GameConfig.BRUSH_RADIUS;

    for (const stroke of strokes) {
      const tile = tileManager.getTileAt(stroke.worldY);
      if (!tile) continue;

      const tileKey = `${tile.pattern.id}_${tile.worldY}`;
      const layer = this.getColorLayer(tileKey, tile.width, tile.height);

      const localX = stroke.worldX;
      const localY = stroke.worldY - tile.worldY;

      layer.ctx.fillStyle = color;
      layer.ctx.beginPath();
      layer.ctx.arc(localX, localY, radius, 0, Math.PI * 2);
      layer.ctx.fill();
    }
  }

  render(camera: Camera, tileManager: TileManager): void {
    const { ctx, width, height } = this;

    // Clear main canvas - light background
    ctx.fillStyle = '#f5f0eb';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid dots for background texture
    ctx.fillStyle = '#e8e0d8';
    const gridSpacing = 30;
    const offsetX = 0;
    const offsetY = -(camera.y % gridSpacing);
    for (let y = offsetY; y < height; y += gridSpacing) {
      for (let x = offsetX; x < width; x += gridSpacing) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Draw each tile
    for (const tile of tileManager.tiles) {
      const screenY = camera.worldToScreen(tile.worldY + tile.height, height);
      const tileKey = `${tile.pattern.id}_${tile.worldY}`;

      // Skip tiles completely off-screen
      if (screenY > height + 50 || screenY + tile.height < -50) continue;

      // 1. Draw doodle outlines
      ctx.drawImage(tile.canvas, 0, screenY);

      // 2. Composite color layer clipped to doodle
      const layer = this.colorLayers.get(tileKey);
      if (layer) {
        const { compCtx, compCanvas } = this;

        // Draw doodle to comp canvas first
        compCtx.clearRect(0, 0, tile.width, tile.height);
        compCtx.globalCompositeOperation = 'source-over';
        compCtx.drawImage(tile.canvas, 0, 0);

        // Draw color layer clipped to doodle pixels
        compCtx.globalCompositeOperation = 'source-in';
        compCtx.drawImage(layer.canvas, 0, 0);

        // Draw result to main canvas
        ctx.drawImage(compCanvas, 0, 0, tile.width, tile.height, 0, screenY, tile.width, tile.height);

        compCtx.globalCompositeOperation = 'source-over';
      }
    }

    // Draw finger guide line (subtle horizontal line at center)
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /** Clean up color layers for tiles that have been recycled */
  cleanupLayers(tileManager: TileManager): void {
    const activeTileKeys = new Set(
      tileManager.tiles.map(t => `${t.pattern.id}_${t.worldY}`)
    );
    for (const key of this.colorLayers.keys()) {
      if (!activeTileKeys.has(key)) {
        this.colorLayers.delete(key);
      }
    }
  }

  clearColorLayers(): void {
    this.colorLayers.clear();
  }
}
