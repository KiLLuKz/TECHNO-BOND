import { getRandomColor } from "./blocks";

export const GRID_SIZE = 8;
export const CELL_SIZE = 72; 

// ตรวจสอบว่าเป็นแนวนอน (จอคอม) หรือแนวตั้ง (มือถือ)
export function getGridOffset(canvas) {
  const isLandscape = canvas.width > canvas.height;
  const gridWidth = GRID_SIZE * CELL_SIZE; // ขนาด 720px
  
  if (isLandscape) {
    // จอคอม: ดันกระดานไปขวาเริ่มที่แกน X = 350 เพื่อให้ซ้ายว่างสนิท!
    return {
      x: 350,
      y: (canvas.height - gridWidth) / 2, 
    };
  } else {
    // มือถือ: ดันกระดานลงมาเยอะๆ ที่ระยะ 280px ให้หลบ Score
    return {
      x: (canvas.width - gridWidth) / 2,
      y: 280, 
    };
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

// อัปเดตตำแหน่งของบล็อกในถาด ให้จัดเรียงอัตโนมัติตามแนวจอ
export function updateTrayBlockPositions(canvas, availableBlocks, TRAY_BLOCK_SIZE) {
    const isLandscape = canvas.width > canvas.height;
    const TOTAL_BLOCKS = 3;
    
    const BLOCK_SPACING_X = isLandscape ? 0 : 250; 
    const BLOCK_SPACING_Y = isLandscape ? 220 : 0; 
    
    // --- จุดที่ฉลาดขึ้น: คำนวณจุดกึ่งกลางถาดให้บาลานซ์กับกระดาน ---
    const gridRightEdge = 350 + (10 * 72); // ตำแหน่งขอบขวาของกระดาน (ประมาณ 1070px)
    // จอคอม: เอาไปวางไว้กึ่งกลางของพื้นที่ที่เหลือด้านขวา | มือถือ: ตรงกลางปกติ
    const trayCenterX = isLandscape ? gridRightEdge + (canvas.width - gridRightEdge) / 2 : canvas.width / 2;
    const trayCenterY = isLandscape ? canvas.height / 2 : canvas.height - 120;

    availableBlocks.forEach((block) => {
        const blockWidth = block.shape[0].length * TRAY_BLOCK_SIZE;
        const blockHeight = block.shape.length * TRAY_BLOCK_SIZE;

        if (isLandscape) {
            block.x = trayCenterX - blockWidth / 2;
            block.y = trayCenterY - ((TOTAL_BLOCKS - 1) * BLOCK_SPACING_Y) / 2 + block.slotIndex * BLOCK_SPACING_Y - blockHeight / 2;
        } else {
            block.x = trayCenterX - ((TOTAL_BLOCKS - 1) * BLOCK_SPACING_X) / 2 + block.slotIndex * BLOCK_SPACING_X - blockWidth / 2;
            block.y = trayCenterY - blockHeight / 2;
        }
    });
}

export function createTrayBlocks({ availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS, BLOCK_SHAPES }) {
  availableBlocks.length = 0;
  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    availableBlocks.push({
      id: Math.random().toString(36).substr(2, 9),
      shape,
      x: 0, y: 0, // ค่าชั่วคราว เดี๋ยวโดนอัปเดตข้างล่าง
      color: getRandomColor(),
      active: true,
      slotIndex: i, // จำตำแหน่งช่องของตัวเองไว้
    });
  }
  updateTrayBlockPositions(canvas, availableBlocks, TRAY_BLOCK_SIZE);
}

export function blockCollision(x, y, block, TRAY_BLOCK_SIZE) {
  const w = block.shape[0].length * TRAY_BLOCK_SIZE;
  const h = block.shape.length * TRAY_BLOCK_SIZE;
  return x >= block.x && x <= block.x + w && y >= block.y && y <= block.y + h;
}

export function canPlaceBlockAtPosition(grid, shape, gridX, gridY) {
  if (gridX < 0 || gridY < 0 || gridX + shape[0].length > GRID_SIZE || gridY + shape.length > GRID_SIZE) return false;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] && grid[gridY + y][gridX + x] !== 0) return false;
    }
  }
  return true;
}

export function findBestGridPlacement({ canvas, grid, block, offsetX, offsetY, blockX, blockY }) {
  const offset = getGridOffset(canvas);
  const blockWidth = block.shape[0].length * CELL_SIZE;
  const blockHeight = block.shape.length * CELL_SIZE;
  const blockCenterX = blockX + blockWidth / 2;
  const blockCenterY = blockY + blockHeight / 2;

  const gridLeft = offset.x;
  const gridRight = offset.x + GRID_SIZE * CELL_SIZE;
  const gridTop = offset.y;
  const gridBottom = offset.y + GRID_SIZE * CELL_SIZE;
  const margin = CELL_SIZE * 2; 

  if (
    blockCenterX < gridLeft - margin ||
    blockCenterX > gridRight + margin ||
    blockCenterY < gridTop - margin ||
    blockCenterY > gridBottom + margin
  ) {
    return { gridX: 0, gridY: 0, canPlace: false };
  }

  let bestGridX = 0;
  let bestGridY = 0;
  let bestDistance = Infinity;

  for (let gridY = 0; gridY <= GRID_SIZE - block.shape.length; gridY++) {
    for (let gridX = 0; gridX <= GRID_SIZE - block.shape[0].length; gridX++) {
      if (canPlaceBlockAtPosition(grid, block.shape, gridX, gridY)) {
        const screenX = offset.x + gridX * CELL_SIZE;
        const screenY = offset.y + gridY * CELL_SIZE;
        const screenCenterX = screenX + blockWidth / 2;
        const screenCenterY = screenY + blockHeight / 2;

        const distance = Math.sqrt(Math.pow(blockCenterX - screenCenterX, 2) + Math.pow(blockCenterY - screenCenterY, 2));

        if (distance < bestDistance) {
          bestDistance = distance;
          bestGridX = gridX;
          bestGridY = gridY;
        }
      }
    }
  }
  return { gridX: bestGridX, gridY: bestGridY, canPlace: bestDistance < Infinity };
}

export function checkAndGetClearedLines(grid) {
  const rowsToClear = [];
  const colsToClear = [];
  const clearedCellsData = []; 

  for (let y = 0; y < GRID_SIZE; y++) {
    let rowComplete = true;
    for (let x = 0; x < GRID_SIZE; x++) { if (grid[y][x] === 0) { rowComplete = false; break; } }
    if (rowComplete) rowsToClear.push(y);
  }

  for (let x = 0; x < GRID_SIZE; x++) {
    let colComplete = true;
    for (let y = 0; y < GRID_SIZE; y++) { if (grid[y][x] === 0) { colComplete = false; break; } }
    if (colComplete) colsToClear.push(x);
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
    for (let gridY = 0; gridY <= GRID_SIZE - block.shape.length; gridY++) {
      for (let gridX = 0; gridX <= GRID_SIZE - block.shape[0].length; gridX++) {
        if (canPlaceBlockAtPosition(grid, block.shape, gridX, gridY)) return true;
      }
    }
  }
  return false;
}
