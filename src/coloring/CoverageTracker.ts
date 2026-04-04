import { TileManager } from '../world/TileManager';
import { GameConfig } from '../game/GameConfig';

export class CoverageTracker {
  /** Get coverage of the tile currently at/near the finger position */
  getCurrentCoverage(tileManager: TileManager, cameraY: number, screenHeight: number): number {
    const fingerWorldY = cameraY + screenHeight * 0.5;
    const tile = tileManager.getTileAt(fingerWorldY);
    if (!tile) return 1;
    return tile.getCoverage();
  }

  /** Get coverage of the most recently completed tile (scrolled past finger) */
  getLastCompletedCoverage(
    tileManager: TileManager,
    cameraY: number,
    screenHeight: number,
  ): { coverage: number; exists: boolean } {
    const fingerWorldY = cameraY + screenHeight * 0.5;

    // Find tile that is below the finger (already passed)
    let bestTile = null;
    let bestDist = Infinity;

    for (const tile of tileManager.tiles) {
      const tileTop = tile.worldY + tile.height;
      if (tileTop < fingerWorldY) {
        const dist = fingerWorldY - tileTop;
        if (dist < bestDist) {
          bestDist = dist;
          bestTile = tile;
        }
      }
    }

    if (!bestTile) return { coverage: 1, exists: false };
    return { coverage: bestTile.getCoverage(), exists: true };
  }

  /** Check if player should be warned or has failed */
  checkStatus(
    tileManager: TileManager,
    cameraY: number,
    screenHeight: number,
  ): 'ok' | 'warning' | 'fail' {
    const current = this.getCurrentCoverage(tileManager, cameraY, screenHeight);

    if (current < GameConfig.COVERAGE_THRESHOLD) {
      return 'fail';
    }
    if (current < GameConfig.COVERAGE_WARNING) {
      return 'warning';
    }
    return 'ok';
  }
}
