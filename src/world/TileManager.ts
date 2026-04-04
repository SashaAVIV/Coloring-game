import { DoodleTile, TilePattern } from './DoodleTile';
import { tilePatterns } from './tiles';
import { GameConfig } from '../game/GameConfig';

export class TileManager {
  tiles: DoodleTile[] = [];
  private tileWidth: number;
  private tileHeight: number;
  private patternIndex = 0;
  private shuffled: TilePattern[] = [];
  private nextWorldY = 0;

  constructor(screenWidth: number, screenHeight: number) {
    this.tileWidth = screenWidth;
    this.tileHeight = Math.floor(screenHeight * GameConfig.TILE_HEIGHT_FACTOR);
    this.shufflePatterns();
  }

  private shufflePatterns(): void {
    this.shuffled = [...tilePatterns].sort(() => Math.random() - 0.5);
    this.patternIndex = 0;
  }

  private nextPattern(): TilePattern {
    if (this.patternIndex >= this.shuffled.length) {
      this.shufflePatterns();
    }
    return this.shuffled[this.patternIndex++];
  }

  init(): void {
    this.tiles = [];
    this.nextWorldY = 0;
    this.shufflePatterns();

    for (let i = 0; i < GameConfig.TILE_BUFFER_COUNT; i++) {
      const pattern = this.nextPattern();
      const tile = new DoodleTile(
        this.tileWidth,
        this.tileHeight,
        this.nextWorldY,
        pattern,
      );
      this.tiles.push(tile);
      this.nextWorldY += this.tileHeight;
    }
  }

  /** Recycle tiles that have scrolled off the bottom of the viewport */
  update(cameraY: number, screenHeight: number): void {
    for (const tile of this.tiles) {
      const tileTopScreenY = screenHeight - ((tile.worldY + tile.height) - cameraY);
      // If tile top is below the screen bottom (fully scrolled past)
      if (tileTopScreenY > screenHeight + 100) {
        const pattern = this.nextPattern();
        tile.reset(this.nextWorldY, pattern);
        this.nextWorldY += this.tileHeight;
      }
    }
  }

  /** Get tile that contains the given world Y coordinate */
  getTileAt(worldY: number): DoodleTile | null {
    for (const tile of this.tiles) {
      if (worldY >= tile.worldY && worldY < tile.worldY + tile.height) {
        return tile;
      }
    }
    return null;
  }

  reset(): void {
    this.nextWorldY = 0;
    this.shufflePatterns();
    this.init();
  }
}
