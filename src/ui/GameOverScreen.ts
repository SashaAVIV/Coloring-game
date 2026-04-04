export class GameOverScreen {
  private animPhase = 0;
  private visible = false;
  private alpha = 0;

  show(): void {
    this.visible = true;
    this.alpha = 0;
    this.animPhase = 0;
  }

  hide(): void {
    this.visible = false;
    this.alpha = 0;
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    score: number,
    highScore: number,
    isNewHighScore: boolean,
  ): void {
    if (!this.visible) return;
    this.animPhase += 0.02;
    this.alpha = Math.min(1, this.alpha + 0.03);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Dark overlay
    ctx.fillStyle = `rgba(26, 26, 46, ${this.alpha * 0.85})`;
    ctx.fillRect(0, 0, width, height);

    if (this.alpha < 0.5) return;

    const contentAlpha = Math.min(1, (this.alpha - 0.5) * 2);

    // Game Over text
    const titleSize = Math.round(38 * dpr);
    ctx.font = `bold ${titleSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = `rgba(255, 77, 77, ${contentAlpha})`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', width * 0.5, height * 0.28);

    // Score
    const scoreSize = Math.round(52 * dpr);
    ctx.font = `bold ${scoreSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${contentAlpha})`;
    ctx.fillText(score.toLocaleString(), width * 0.5, height * 0.42);

    const labelSize = Math.round(14 * dpr);
    ctx.font = `${labelSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${contentAlpha * 0.5})`;
    ctx.fillText('SCORE', width * 0.5, height * 0.42 + scoreSize * 0.6);

    // New high score
    if (isNewHighScore) {
      const nhsSize = Math.round(18 * dpr);
      ctx.font = `bold ${nhsSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
      const hue = (this.animPhase * 60) % 360;
      ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${contentAlpha})`;
      ctx.fillText('NEW HIGH SCORE!', width * 0.5, height * 0.52);
    } else if (highScore > 0) {
      const hsSize = Math.round(14 * dpr);
      ctx.font = `${hsSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${contentAlpha * 0.4})`;
      ctx.fillText(`Best: ${highScore.toLocaleString()}`, width * 0.5, height * 0.52);
    }

    // Retry button
    const btnW = width * 0.55;
    const btnH = 56 * dpr;
    const btnX = (width - btnW) / 2;
    const btnY = height * 0.62;

    const gradient = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
    gradient.addColorStop(0, '#FF6B9D');
    gradient.addColorStop(1, '#C44DFF');
    ctx.globalAlpha = contentAlpha;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const btnTextSize = Math.round(20 * dpr);
    ctx.font = `bold ${btnTextSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${contentAlpha})`;
    ctx.fillText('PLAY AGAIN', width * 0.5, btnY + btnH * 0.62);
  }
}
