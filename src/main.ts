import { Game } from './game/Game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas element #game not found');

new Game(canvas);
