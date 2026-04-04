export interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export class TouchController {
  isTouching = false;
  queue: TouchPoint[] = [];
  private canvas: HTMLCanvasElement;
  private scaleX = 1;
  private scaleY = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.updateScale();
    this.bindEvents();
  }

  updateScale(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.scaleX = this.canvas.width / rect.width;
    this.scaleY = this.canvas.height / rect.height;
  }

  private toCanvasCoords(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * this.scaleX,
      y: (clientY - rect.top) * this.scaleY,
    };
  }

  private bindEvents(): void {
    const opts: AddEventListenerOptions = { passive: false };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.isTouching = true;
      const pos = this.toCanvasCoords(e.clientX, e.clientY);
      this.queue.push({ ...pos, time: performance.now() });
    }, opts);

    this.canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (!this.isTouching) return;
      const pos = this.toCanvasCoords(e.clientX, e.clientY);
      this.queue.push({ ...pos, time: performance.now() });
    }, opts);

    this.canvas.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.isTouching = false;
    }, opts);

    this.canvas.addEventListener('pointercancel', (e) => {
      e.preventDefault();
      this.isTouching = false;
    }, opts);

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  drainQueue(): TouchPoint[] {
    const points = this.queue;
    this.queue = [];
    return points;
  }
}
