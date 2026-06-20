import { getRandomColor, BLOCK_SHAPES, SHAPE_GROUPS } from "./blocks";

export const GRID_SIZE = 8;
export const CELL_SIZE = 72; 

export function getGridOffset(canvas) {
  const isLandscape = canvas.width > canvas.height;
  const gridWidth = GRID_SIZE * CELL_SIZE; 
  const centerX = (canvas.width - gridWidth) / 2;
  
  if (isLandscape) {
    return { x: centerX, y: (canvas.height - gridWidth) / 2 };
  } else {
    return { x: centerX, y: 80 };
  }
}

function drawTexturedCell(ctx, px, py, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(px, py + size - 6, size, 6); 
  ctx.fillRect(px + size - 6, py, 6, size); 
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(px, py, size, 6); 
  ctx.fillRect(px, py, 6, size); 
  const gradient = ctx.createLinearGradient(px, py, px, py + size);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.25)"); 
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.15)"); 
  ctx.fillStyle = gradient;
  ctx.fillRect(px + 6, py + 6, size - 12, size - 12);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, size, size);
  ctx.restore();
}

export function drawGrid(ctx, canvas, grid) {
  const offset = getGridOffset(canvas);
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const px = offset.x + x * CELL_SIZE;
      const py = offset.y + y * CELL_SIZE;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
      if (grid[y][x]) {
        drawTexturedCell(ctx, px, py, CELL_SIZE, grid[y][x]);
      }
    }
  }
}

export function drawBlock(ctx, block, startX, startY, cellSize, alpha = 1, color = "#4CAF50") {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let y = 0; y < block.length; y++) {
    for (let x = 0; x < block[y].length; x++) {
      if (block[y][x]) {
        const px = startX + x * cellSize;
        const py = startY + y * cellSize;
        drawTexturedCell(ctx, px, py, cellSize, color, alpha); 
      }
    }
  }
  ctx.restore();
}

export function drawGhostBlock(ctx, block, gridX, gridY, canvas, alpha = 0.5, color = "#4CAF50") {
  const offset = getGridOffset(canvas);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; 
  ctx.lineWidth = 2;
  for (let y = 0; y < block.length; y++) {
    for (let x = 0; x < block[y].length; x++) {
      if (block[y][x]) {
        const px = offset.x + (gridX + x) * CELL_SIZE;
        const py = offset.y + (gridY + y) * CELL_SIZE;
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
      }
    }
  }
  ctx.restore();
}

export function drawClearingEffects(ctx, canvas, clearingCells) {
  const offset = getGridOffset(canvas);
  clearingCells.forEach(cell => {
    const px = offset.x + cell.x * CELL_SIZE;
    const py = offset.y + cell.y * CELL_SIZE;
    const sizeOffset = (cell.scale - 1) * CELL_SIZE / 2;
    const currentPx = px - sizeOffset;
    const currentPy = py - sizeOffset;
    const currentSize = CELL_SIZE * cell.scale;
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = cell.color;
    drawTexturedCell(ctx, currentPx, currentPy, currentSize, cell.color, cell.opacity);
    ctx.strokeStyle = `rgba(255, 255, 255, ${cell.opacity})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(currentPx - 2, currentPy - 2, currentSize + 4, currentSize + 4);
    ctx.restore();
  });
}

export function drawTray(ctx, availableBlocks, TRAY_BLOCK_SIZE) {
  for (const block of availableBlocks) {
    if (block.active) {
      drawBlock(ctx, block.shape, block.x, block.y, TRAY_BLOCK_SIZE, 1, block.color);
    }
  }
}

export function updateTrayBlockPositions(canvas, availableBlocks, TRAY_BLOCK_SIZE) {
  const isLandscape = canvas.width > canvas.height;
  const offset = getGridOffset(canvas);
  const gridWidth = GRID_SIZE * CELL_SIZE;

  availableBlocks.forEach((block) => {
    const blockWidth = block.shape[0].length * TRAY_BLOCK_SIZE;
    const blockHeight = block.shape.length * TRAY_BLOCK_SIZE;

    let slotCenterX, slotCenterY;

    if (isLandscape) {
      const rightSpaceX = offset.x + gridWidth;
      const trayWidth = canvas.width - rightSpaceX;
      slotCenterX = rightSpaceX + (trayWidth / 2) + 40;
      const slotHeight = canvas.height / 3;
      slotCenterY = (block.slotIndex * slotHeight) + (slotHeight / 2);
    } else {
      const slotWidth = canvas.width / 3;
      slotCenterX = (block.slotIndex * slotWidth) + (slotWidth / 2);
      const bottomSpaceY = offset.y + gridWidth;
      const trayHeight = canvas.height - bottomSpaceY;
      slotCenterY = bottomSpaceY + Math.max(100, trayHeight / 2);
    }

    block.baseX = slotCenterX; 
    block.baseY = slotCenterY; 
    block.x = slotCenterX - (blockWidth / 2);
    block.y = slotCenterY - (blockHeight / 2);
  });
}

export function canPlaceBlockAtPosition(grid, shape, gridX, gridY) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 1) { 
        const targetX = gridX + x;
        const targetY = gridY + y;
        if (targetX < 0 || targetY < 0 || targetX >= GRID_SIZE || targetY >= GRID_SIZE) return false;
        if (grid[targetY][targetX] !== 0) return false;
      }
    }
  }
  return true;
}

export function findBestGridPlacement({ canvas, grid, block, offsetX, offsetY, blockX, blockY }) {
  const offset = getGridOffset(canvas);
  const relativeX = blockX - offset.x;
  const relativeY = blockY - offset.y;
  const gridX = Math.round(relativeX / CELL_SIZE);
  const gridY = Math.round(relativeY / CELL_SIZE);

  if (canPlaceBlockAtPosition(grid, block.shape, gridX, gridY)) {
    return { gridX, gridY, canPlace: true };
  }
  return { gridX: 0, gridY: 0, canPlace: false };
}

export function checkAndGetClearedLines(grid) {
  const rowsToClear = [];
  const colsToClear = [];
  const clearedCellsData = []; 

  for (let y = 0; y < GRID_SIZE; y++) {
    if (grid[y].every(cell => cell !== 0)) rowsToClear.push(y);
  }
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid.every(row => row[x] !== 0)) colsToClear.push(x);
  }

  let linesCleared = 0;

  for (const row of rowsToClear) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] !== 0) {
        clearedCellsData.push({ x, y: row, color: grid[row][x], opacity: 1, scale: 1 });
        grid[row][x] = 0;
      }
    }
    linesCleared++;
  }

  for (const col of colsToClear) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (grid[y][col] !== 0) {
         const exists = clearedCellsData.find(c => c.x === col && c.y === y);
         if (!exists) clearedCellsData.push({ x: col, y, color: grid[y][col], opacity: 1, scale: 1 });
         grid[y][col] = 0;
      }
    }
    linesCleared++;
  }

  return { linesCleared, clearedCellsData };
}

export function canPlaceAnyBlock({ grid, availableBlocks }) {
  for (const block of availableBlocks) {
    if (!block.active) continue;
    for (let gridY = -block.shape.length + 1; gridY < GRID_SIZE; gridY++) {
      for (let gridX = -block.shape[0].length + 1; gridX < GRID_SIZE; gridX++) {
        if (canPlaceBlockAtPosition(grid, block.shape, gridX, gridY)) return true;
      }
    }
  }
  return false;
}

// -------------------------------------------------------------
// 🔥 Look-Ahead Algorithm: ป้องกันการสุ่มบล็อกที่วางไม่ได้ 100%
// -------------------------------------------------------------
function checkSequence(grid, shapes) {
  if (shapes.length === 0) return true; 
  const currentShape = shapes[0];
  const nextShapes = shapes.slice(1);
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (canPlaceBlockAtPosition(grid, currentShape, x, y)) {
        const nextGrid = grid.map(row => [...row]);
        for (let sy = 0; sy < currentShape.length; sy++) {
          for (let sx = 0; sx < currentShape[sy].length; sx++) {
            if (currentShape[sy][sx]) nextGrid[y + sy][x + sx] = 1; 
          }
        }
        if (checkSequence(nextGrid, nextShapes)) return true;
      }
    }
  }
  return false; 
}

function isTripletPlaceable(grid, shapes) {
  const permutations = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
  ];
  for (const p of permutations) {
    const orderedShapes = [shapes[p[0]], shapes[p[1]], shapes[p[2]]];
    if (checkSequence(grid, orderedShapes)) return true; 
  }
  return false;
}

export function createTrayBlocks({ availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS, grid, hadClear = false }) {
  availableBlocks.length = 0;
  
  // Calculate Board Density (0 to 64)
  let filledCells = 0;
  if (grid) {
      for(let y=0; y<GRID_SIZE; y++){
          for(let x=0; x<GRID_SIZE; x++){
              if (grid[y][x] !== 0) filledCells++;
          }
      }
  }
  
  let attempts = 0;
  let finalIndices = [];
  
  while (attempts < 50) {
    let categoriesToSpawn = [];
    
    // 🔥 Smart RNG / Mercy Logic based on board density
    if (filledCells > 45) {
       // Board is extremely full (Over 70%)
       // SECRET TO ADDICTION: Still give LARGE blocks! 
       // The look-ahead algorithm will filter them, meaning if a LARGE block spawns, it is guaranteed to fit perfectly into a hole!
       categoriesToSpawn = [SHAPE_GROUPS.SMALL, Math.random() < 0.6 ? SHAPE_GROUPS.SMALL : SHAPE_GROUPS.MEDIUM, SHAPE_GROUPS.LARGE];
    } else if (filledCells > 30) {
       // Board is half full, balance it out
       categoriesToSpawn = [SHAPE_GROUPS.SMALL, SHAPE_GROUPS.MEDIUM, SHAPE_GROUPS.LARGE];
    } else if (hadClear) {
       // Just cleared, reward with big/medium combinations for chain combos!
       categoriesToSpawn = [SHAPE_GROUPS.MEDIUM, SHAPE_GROUPS.LARGE, Math.random() < 0.5 ? SHAPE_GROUPS.LARGE : SHAPE_GROUPS.WEIRD];
    } else {
       // Empty board or normal play
       const rollCategory = () => {
         const chance = Math.random();
         if (chance < 0.30) return SHAPE_GROUPS.SMALL;       
         if (chance < 0.60) return SHAPE_GROUPS.MEDIUM;
         if (chance < 0.85) return SHAPE_GROUPS.LARGE;     
         return SHAPE_GROUPS.WEIRD;                          
       };
       categoriesToSpawn = [SHAPE_GROUPS.SMALL, rollCategory(), rollCategory()];
    }
    
    categoriesToSpawn.sort(() => Math.random() - 0.5);
    const candidateIndices = categoriesToSpawn.map(group => group[Math.floor(Math.random() * group.length)]);
    const candidateShapes = candidateIndices.map(idx => BLOCK_SHAPES[idx]);
    
    // Look-ahead validation
    if (!grid || isTripletPlaceable(grid, candidateShapes)) {
      finalIndices = candidateIndices;
      break;
    }
    attempts++;
  }
  
  // Ultimate Fallback: if 50 attempts fail, the board is effectively dead. 
  // Give three 1x1 blocks as a last resort mercy.
  if (finalIndices.length === 0) {
    finalIndices = [0, 0, 0]; 
  }

  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    availableBlocks.push({
      id: Math.random().toString(36).substr(2, 9),
      shape: BLOCK_SHAPES[finalIndices[i]],
      x: 0, y: 0, 
      color: getRandomColor(),
      active: true,
      slotIndex: i, 
    });
  }
  
  updateTrayBlockPositions(canvas, availableBlocks, TRAY_BLOCK_SIZE);
}