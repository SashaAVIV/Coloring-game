import { TouchPoint } from '../input/TouchController';
import { Camera } from '../render/Camera';
import { TileManager } from '../world/TileManager';
import { GameConfig } from '../game/GameConfig';
import { distance } from '../utils/math';

export interface BrushStroke {
  worldX: number;
  worldY: number;
}

export class BrushEngine {
  private lastPoint: { x: number; y: number } | null = null;
  color: string;

  constructor() {
    this.color = GameConfig.BRUSH_COLOR;
  }

  /** Process touch points and return world-space brush positions */
  process(
    points: TouchPoint[],
    camera: Camera,
    screenHeight: number,
  ): BrushStroke[] {
    const strokes: BrushStroke[] = [];
    const radius = GameConfig.BRUSH_RADIUS;
    const stepSize = radius * 0.5; // interpolation step

    for (const pt of points) {
      const worldX = pt.x;
      const worldY = camera.screenToWorld(pt.y, screenHeight);

      if (this.lastPoint) {
        const dist = distance(this.lastPoint.x, this.lastPoint.y, worldX, worldY);
        if (dist > stepSize) {
          const steps = Math.ceil(dist / stepSize);
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            strokes.push({
              worldX: this.lastPoint.x + (worldX - this.lastPoint.x) * t,
              worldY: this.lastPoint.y + (worldY - this.lastPoint.y) * t,
            });
          }
        } else {
          strokes.push({ worldX, worldY });
        }
      } else {
        strokes.push({ worldX, worldY });
      }

      this.lastPoint = { x: worldX, y: worldY };
    }

    return strokes;
  }

  /** Apply brush strokes to tile coverage and color layer */
  applyToTiles(strokes: BrushStroke[], tileManager: TileManager): number {
    let totalNewCells = 0;
    const radius = GameConfig.BRUSH_RADIUS;

    for (const stroke of strokes) {
      const tile = tileManager.getTileAt(stroke.worldY);
      if (!tile) continue;

      const localX = stroke.worldX;
      const localY = stroke.worldY - tile.worldY;
      totalNewCells += tile.markColored(localX, localY, radius);
    }

    return totalNewCells;
  }

  resetLastPoint(): void {
    this.lastPoint = null;
  }
}
