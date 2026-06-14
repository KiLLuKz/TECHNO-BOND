export const BLOCK_SHAPES = [
  [[1]], // Single
  [[1, 1]], [[1, 1, 1]], [[1, 1, 1, 1]], // Horizontal
  [[1], [1]], [[1], [1], [1]], [[1], [1], [1], [1]], // Vertical
  [[1, 1], [1, 1]], [[1, 1, 1], [1, 1, 1]], [[1, 1], [1, 1], [1, 1]], // Squares/Rectangles
  [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]], // Corners
  [[1, 0], [1, 0], [1, 1]], [[0, 1], [0, 1], [1, 1]], // Tall corners
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // Big block
];

export const BLOCK_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#118AB2",
  "#7209B7", "#F15BB5", "#2EC4B6", "#FF9F1C", "#8338EC", 
];

export function getRandomColor() {
  return BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
}