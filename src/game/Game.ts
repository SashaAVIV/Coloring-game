import { GameLoop } from './GameLoop';
import { GameConfig } from './GameConfig';
import { Camera } from '../render/Camera';
import { Renderer } from '../render/Renderer';
import { TileManager } from '../world/TileManager';
import { TouchController } from '../input/TouchController';
import { BrushEngine } from '../coloring/BrushEngine';
import { CoverageTracker } from '../coloring/CoverageTracker';
import { ScoreManager } from '../scoring/ScoreManager';
import { HUD } from '../ui/HUD';
import { MenuScreen } from '../ui/MenuScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { getDevicePixelRatio } from '../utils/canvas';

type GameState = 'menu' | 'playing' | 'gameover';

export class Game {
  private canvas: HTMLCanvasElement;
  private state: GameState = 'menu';
  private loop: GameLoop;
  private camera: Camera;
  private renderer: Renderer;
  private tileManager: TileManager;
  private touch: TouchController;
  private brush: BrushEngine;
  private coverage: CoverageTracker;
  private score: ScoreManager;
  private hud: HUD;
  private menuScreen: MenuScreen;
  private gameOverScreen: GameOverScreen;
  private playTime = 0;
  private currentCoverage = 1;
  private coverageStatus: 'ok' | 'warning' | 'fail' = 'ok';
  private graceTime = 0; // grace period at start before checking coverage
  private lastTileWorldY = -1; // track tile transitions for color changes
  private finalScore = 0;
  private finalIsNewHighScore = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupCanvas();

    this.camera = new Camera(GameConfig.BASE_SCROLL_SPEED);
    this.renderer = new Renderer(canvas);
    this.tileManager = new TileManager(canvas.width, canvas.height);
    this.touch = new TouchController(canvas);
    this.brush = new BrushEngine();
    this.coverage = new CoverageTracker();
    this.score = new ScoreManager();
    this.hud = new HUD();
    this.menuScreen = new MenuScreen();
    this.gameOverScreen = new GameOverScreen();

    this.score.loadHighScore();

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
    );

    // Handle tap for menu/gameover
    canvas.addEventListener('pointerdown', () => {
      if (this.state === 'menu') {
        this.startGame();
      } else if (this.state === 'gameover') {
        this.returnToMenu();
      }
    });

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());

    this.loop.start();
  }

  private setupCanvas(): void {
    const dpr = getDevicePixelRatio();
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
  }

  private handleResize(): void {
    this.setupCanvas();
    this.touch.updateScale();
    this.renderer.resize(this.canvas.width, this.canvas.height);

    if (this.state === 'playing') {
      // Recreate tile manager with new dimensions
      this.tileManager = new TileManager(this.canvas.width, this.canvas.height);
      this.tileManager.init();
    }
  }

  private startGame(): void {
    this.state = 'playing';
    this.playTime = 0;
    this.graceTime = 3; // 3 seconds grace at start
    this.currentCoverage = 1;
    this.coverageStatus = 'ok';
    this.lastTileWorldY = -1;

    this.camera.reset(GameConfig.BASE_SCROLL_SPEED);
    this.score.reset();
    this.brush.resetLastPoint();
    this.renderer.clearColorLayers();

    this.tileManager = new TileManager(this.canvas.width, this.canvas.height);
    this.tileManager.init();

    this.gameOverScreen.hide();
  }

  private returnToMenu(): void {
    this.state = 'menu';
    this.gameOverScreen.hide();
  }

  private endGame(): void {
    this.state = 'gameover';
    this.finalScore = this.score.score;
    this.finalIsNewHighScore = this.score.score > this.score.highScore;
    this.score.reset(); // saves high score
    this.gameOverScreen.show();
  }

  private update(dt: number): void {
    if (this.state !== 'playing') return;

    this.playTime += dt;

    // Increase scroll speed over time
    this.camera.speed = Math.min(
      GameConfig.MAX_SCROLL_SPEED,
      GameConfig.BASE_SCROLL_SPEED + this.playTime * GameConfig.SPEED_RAMP_RATE,
    );

    // Update camera position
    this.camera.update(dt);

    // Update tiles (recycle off-screen tiles)
    this.tileManager.update(this.camera.y, this.canvas.height);

    // Process touch input
    const touchPoints = this.touch.drainQueue();
    if (touchPoints.length > 0) {
      const strokes = this.brush.process(touchPoints, this.camera, this.canvas.height);

      if (strokes.length > 0) {
        // Paint on renderer's color layers
        this.renderer.paintBrushStrokes(strokes, this.tileManager, this.score.getCurrentColor());

        // Update coverage grid
        const newCells = this.brush.applyToTiles(strokes, this.tileManager);
        this.score.addPoints(newCells);
      }
    }

    if (!this.touch.isTouching) {
      this.brush.resetLastPoint();
    }

    // Check coverage and color transitions
    const fingerWorldY = this.camera.y + this.canvas.height * 0.5;
    const currentTile = this.tileManager.getTileAt(fingerWorldY);
    if (currentTile && currentTile.worldY !== this.lastTileWorldY) {
      // Entered a new tile
      if (this.lastTileWorldY >= 0) {
        // Score the previous tile
        const prevTile = this.tileManager.getTileAt(this.lastTileWorldY + 1);
        if (prevTile) {
          this.score.onTileCompleted(prevTile.getCoverage());
        }
        this.score.advanceColor();
      }
      this.lastTileWorldY = currentTile.worldY;
    }

    // Update coverage display
    this.currentCoverage = this.coverage.getCurrentCoverage(
      this.tileManager, this.camera.y, this.canvas.height,
    );

    // Grace period - don't check fail conditions early
    if (this.graceTime > 0) {
      this.graceTime -= dt;
      this.coverageStatus = 'ok';
    } else {
      this.coverageStatus = this.coverage.checkStatus(
        this.tileManager, this.camera.y, this.canvas.height,
      );

      if (this.coverageStatus === 'fail') {
        // Give a brief moment of "fail" visual before ending
        this.endGame();
      }
    }

    // Clean up old color layers
    this.renderer.cleanupLayers(this.tileManager);
  }

  private render(): void {
    const { ctx } = this.renderer;
    const { width, height } = this.canvas;

    if (this.state === 'menu') {
      this.menuScreen.render(ctx, width, height, this.score.highScore);
      return;
    }

    // Render game world
    this.renderer.render(this.camera, this.tileManager);

    // HUD overlay
    this.hud.render(
      ctx, width, height,
      this.score,
      this.currentCoverage,
      this.coverageStatus,
      this.touch.isTouching,
    );

    // Game over overlay
    if (this.state === 'gameover') {
      this.gameOverScreen.render(
        ctx, width, height,
        this.finalScore,
        this.score.highScore,
        this.finalIsNewHighScore,
      );
    }
  }
}
