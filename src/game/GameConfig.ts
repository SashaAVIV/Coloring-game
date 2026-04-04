export const GameConfig = {
  // Scroll
  BASE_SCROLL_SPEED: 80,       // pixels per second
  MAX_SCROLL_SPEED: 200,
  SPEED_RAMP_RATE: 0.5,        // px/s increase per second of play

  // Brush
  BRUSH_RADIUS: 28,
  BRUSH_COLOR: '#FF6B9D',      // starting color

  // Tiles
  TILE_HEIGHT_FACTOR: 1.2,     // tile height = screen height * factor
  TILE_BUFFER_COUNT: 3,        // tiles in ring buffer
  STROKE_WIDTH: 22,

  // Coverage
  CELL_SIZE: 16,               // coverage grid cell size in px
  COVERAGE_THRESHOLD: 0.45,    // minimum coverage to stay alive
  COVERAGE_WARNING: 0.55,      // show warning below this
  COVERAGE_WINDOW_TILES: 1,    // how many tiles back to check

  // Scoring
  POINTS_PER_CELL: 10,
  STREAK_MULTIPLIER_STEP: 0.5, // multiplier increase per high-coverage tile

  // Colors palette for progressive levels
  COLOR_PALETTE: [
    '#FF6B9D', '#C44DFF', '#4DCCFF', '#FFD93D',
    '#6BCB77', '#FF8B4D', '#4D79FF', '#FF4D6A',
    '#9D4DFF', '#4DFFB8', '#FF4DA6', '#4DFFF0',
  ],
} as const;
