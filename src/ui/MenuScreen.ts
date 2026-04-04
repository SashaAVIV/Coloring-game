export class MenuScreen {
  private animPhase = 0;

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    highScore: number,
  ): void {
    this.animPhase += 0.02;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Animated background circles
    for (let i = 0; i < 6; i++) {
      const angle = this.animPhase + (i * Math.PI * 2) / 6;
      const cx = width * 0.5 + Math.cos(angle) * width * 0.2;
      const cy = height * 0.35 + Math.sin(angle) * height * 0.08;
      const r = 20 + Math.sin(this.animPhase * 2 + i) * 10;
      ctx.beginPath();
      ctx.arc(cx, cy, r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${i * 60}, 70%, 60%, 0.15)`;
      ctx.fill();
    }

    // Title
    const titleSize = Math.round(42 * dpr);
    ctx.font = `bold ${titleSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Color Flow', width * 0.5, height * 0.3);

    // Subtitle
    const subSize = Math.round(16 * dpr);
    ctx.font = `${subSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Color the shapes as they scroll by', width * 0.5, height * 0.3 + titleSize * 0.8);

    // Start button
    const btnW = width * 0.55;
    const btnH = 56 * dpr;
    const btnX = (width - btnW) / 2;
    const btnY = height * 0.55;

    const gradient = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
    gradient.addColorStop(0, '#FF6B9D');
    gradient.addColorStop(1, '#C44DFF');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2);
    ctx.fill();

    const btnTextSize = Math.round(20 * dpr);
    ctx.font = `bold ${btnTextSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TAP TO PLAY', width * 0.5, btnY + btnH * 0.62);

    // High score
    if (highScore > 0) {
      const hsSize = Math.round(14 * dpr);
      ctx.font = `${hsSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(`Best: ${highScore.toLocaleString()}`, width * 0.5, height * 0.75);
    }

    // Instructions
    const instrSize = Math.round(13 * dpr);
    ctx.font = `${instrSize}px "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('Hold your finger on the screen', width * 0.5, height * 0.85);
    ctx.fillText('to color shapes as they pass', width * 0.5, height * 0.85 + instrSize * 1.5);
  }
}
