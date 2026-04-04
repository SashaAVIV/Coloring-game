import { createOffscreenCanvas } from '../utils/canvas';
import { GameConfig } from '../game/GameConfig';

export interface TilePattern {
  id: string;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export class DoodleTile {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  worldY: number; // bottom edge position in world coords
  pattern: TilePattern;

  // Coverage grid
  grid: Uint8Array;    // 1 = has doodle pixels, 0 = empty
  colored: Uint8Array; // 1 = colored by player
  gridCols: number;
  gridRows: number;
  totalDoodleCells = 0;
  coloredDoodleCells = 0;

  constructor(width: number, height: number, worldY: number, pattern: TilePattern) {
    this.width = width;
    this.height = height;
    this.worldY = worldY;
    this.pattern = pattern;

    const { canvas, ctx } = createOffscreenCanvas(width, height);
    this.canvas = canvas;
    this.ctx = ctx;

    // Render the doodle
    this.renderDoodle();

    // Build coverage grid
    this.gridCols = Math.ceil(width / GameConfig.CELL_SIZE);
    this.gridRows = Math.ceil(height / GameConfig.CELL_SIZE);
    this.grid = new Uint8Array(this.gridCols * this.gridRows);
    this.colored = new Uint8Array(this.gridCols * this.gridRows);
    this.buildGrid();
  }

  private renderDoodle(): void {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = GameConfig.STROKE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.pattern.draw(ctx, width, height);
  }

  private buildGrid(): void {
    const { ctx, width, height, gridCols, gridRows, grid } = this;
    const cellSize = GameConfig.CELL_SIZE;
    let total = 0;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;
        const w = Math.min(cellSize, width - x);
        const h = Math.min(cellSize, height - y);
        const data = ctx.getImageData(x, y, w, h).data;

        let hasPixels = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 30) { // alpha threshold
            hasPixels = true;
            break;
          }
        }
        if (hasPixels) {
          grid[row * gridCols + col] = 1;
          total++;
        }
      }
    }
    this.totalDoodleCells = total;
  }

  markColored(localX: number, localY: number, radius: number): number {
    const cellSize = GameConfig.CELL_SIZE;
    const startCol = Math.max(0, Math.floor((localX - radius) / cellSize));
    const endCol = Math.min(this.gridCols - 1, Math.floor((localX + radius) / cellSize));
    const startRow = Math.max(0, Math.floor((localY - radius) / cellSize));
    const endRow = Math.min(this.gridRows - 1, Math.floor((localY + radius) / cellSize));

    let newlyColored = 0;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const idx = row * this.gridCols + col;
        if (this.grid[idx] === 1 && this.colored[idx] === 0) {
          // Check if center of cell is within brush radius
          const cx = (col + 0.5) * cellSize;
          const cy = (row + 0.5) * cellSize;
          const dx = cx - localX;
          const dy = cy - localY;
          if (dx * dx + dy * dy <= radius * radius) {
            this.colored[idx] = 1;
            this.coloredDoodleCells++;
            newlyColored++;
          }
        }
      }
    }
    return newlyColored;
  }

  getCoverage(): number {
    if (this.totalDoodleCells === 0) return 1;
    return this.coloredDoodleCells / this.totalDoodleCells;
  }

  reset(worldY: number, pattern: TilePattern): void {
    this.worldY = worldY;
    this.pattern = pattern;
    this.coloredDoodleCells = 0;
    this.colored.fill(0);
    this.grid.fill(0);
    this.renderDoodle();
    this.buildGrid();
  }
}
