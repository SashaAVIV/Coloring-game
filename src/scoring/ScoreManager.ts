import { GameConfig } from '../game/GameConfig';

export class ScoreManager {
  score = 0;
  multiplier = 1;
  highScore = 0;
  tilesCompleted = 0;
  private colorIndex = 0;

  addPoints(newCells: number): void {
    this.score += Math.round(newCells * GameConfig.POINTS_PER_CELL * this.multiplier);
  }

  onTileCompleted(coverage: number): void {
    this.tilesCompleted++;
    if (coverage > 0.8) {
      this.multiplier += GameConfig.STREAK_MULTIPLIER_STEP;
    } else if (coverage < GameConfig.COVERAGE_WARNING) {
      this.multiplier = Math.max(1, this.multiplier - 0.5);
    }
  }

  getCurrentColor(): string {
    return GameConfig.COLOR_PALETTE[this.colorIndex % GameConfig.COLOR_PALETTE.length];
  }

  advanceColor(): void {
    this.colorIndex++;
  }

  reset(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('colorflow_highscore', String(this.highScore));
      } catch {
        // localStorage unavailable
      }
    }
    this.score = 0;
    this.multiplier = 1;
    this.tilesCompleted = 0;
    this.colorIndex = 0;
  }

  loadHighScore(): void {
    try {
      const saved = localStorage.getItem('colorflow_highscore');
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch {
      // localStorage unavailable
    }
  }
}
