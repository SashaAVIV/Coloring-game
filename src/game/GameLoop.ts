export type UpdateFn = (dt: number) => void;
export type RenderFn = () => void;

export class GameLoop {
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  private onUpdate: UpdateFn;
  private onRender: RenderFn;

  constructor(onUpdate: UpdateFn, onRender: RenderFn) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = now;

    this.onUpdate(dt);
    this.onRender();

    this.rafId = requestAnimationFrame(this.tick);
  };
}
