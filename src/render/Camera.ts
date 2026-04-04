export class Camera {
  y = 0;           // current scroll offset (increases as we scroll up)
  speed: number;   // current scroll speed in px/s

  constructor(initialSpeed: number) {
    this.speed = initialSpeed;
  }

  update(dt: number): void {
    this.y += this.speed * dt;
  }

  reset(speed: number): void {
    this.y = 0;
    this.speed = speed;
  }

  /** Convert world Y to screen Y */
  worldToScreen(worldY: number, screenHeight: number): number {
    return screenHeight - (worldY - this.y);
  }

  /** Convert screen Y to world Y */
  screenToWorld(screenY: number, screenHeight: number): number {
    return this.y + screenHeight - screenY;
  }
}
