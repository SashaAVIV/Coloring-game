import { ScoreManager } from '../scoring/ScoreManager';
import { GameConfig } from '../game/GameConfig';

export class HUD {
  private warningAlpha = 0;
  private warningDir = 1;

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    score: ScoreManager,
    coverage: number,
    status: 'ok' | 'warning' | 'fail',
    isTouching: boolean,
  ): void {
    const padding = 20;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fontSize = Math.round(18 * dpr);
    const smallFontSize = Math.round(13 * dpr);

    // Score (top left)
    ctx.font = `bold ${fontSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = '#2d2d2d';
    ctx.textAlign = 'left';
    ctx.fillText(`${score.score.toLocaleString()}`, padding, padding + fontSize);

    // Multiplier
    if (score.multiplier > 1) {
      ctx.font = `bold ${smallFontSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
      ctx.fillStyle = score.getCurrentColor();
      ctx.fillText(`x${score.multiplier.toFixed(1)}`, padding, padding + fontSize + smallFontSize + 4);
    }

    // Coverage bar (top right)
    const barWidth = width * 0.25;
    const barHeight = 8 * dpr;
    const barX = width - padding - barWidth;
    const barY = padding + fontSize * 0.5 - barHeight * 0.5;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, barHeight / 2);
    ctx.fill();

    // Fill
    const fillWidth = Math.max(0, Math.min(1, coverage)) * barWidth;
    const barColor = status === 'warning' ? '#FFB347' :
      status === 'fail' ? '#FF4D4D' : '#6BCB77';
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, barHeight / 2);
    ctx.fill();

    // Coverage percentage
    ctx.font = `${smallFontSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(coverage * 100)}%`, barX - 8, barY + barHeight);

    // Warning overlay
    if (status === 'warning') {
      this.warningAlpha += this.warningDir * 0.04;
      if (this.warningAlpha >= 0.15) this.warningDir = -1;
      if (this.warningAlpha <= 0) this.warningDir = 1;
      ctx.fillStyle = `rgba(255, 179, 71, ${this.warningAlpha})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      this.warningAlpha = 0;
      this.warningDir = 1;
    }

    // Touch prompt (if not touching)
    if (!isTouching) {
      ctx.font = `${fontSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('Touch & hold to color!', width * 0.5, height * 0.6);

      // Finger indicator
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, 24 * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2 * dpr;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}
