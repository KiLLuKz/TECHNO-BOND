import { getRandomColor } from "./blocks";

export const GRID_SIZE = 8;
export const CELL_SIZE = 72; 

// ใน gameFunctions.js
export function getGridOffset(canvas) {
  const isLandscape = canvas.width > canvas.height;
  const gridWidth = GRID_SIZE * CELL_SIZE; // ขนาดตาราง 8x8 (576px)
  
  // สมการกึ่งกลางคือ: (ความกว้างหรือสูงของจอ - ขนาดตาราง) / 2
  const centerX = (canvas.width - gridWidth) / 2;
  
  if (isLandscape) {
    // จอแนวนอน (คอม/iPad แนวนอน): ตรงกลางเป๊ะๆ ทั้งแกน X และ Y
    return {
      x: centerX,
      y: (canvas.height - gridWidth) / 2, 
    };
  } else {
    // จอแนวตั้ง (มือถือ): แกน X ตรงกลาง, แกน Y ดันลงมาจากขอบบน 80px
    return {
      x: centerX,
      y: 80, 
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

// ใน gameFunctions.js
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

    // --- เพิ่ม 2 บรรทัดนี้เพื่อให้บล็อกจำจุดกึ่งกลางของกรอบ ---
    block.baseX = slotCenterX; 
    block.baseY = slotCenterY; 
    // ---------------------------------------------

    block.x = slotCenterX - (blockWidth / 2);
    block.y = slotCenterY - (blockHeight / 2);
  });
}

export function createTrayBlocks({ availableBlocks, canvas, TRAY_BLOCK_SIZE, TOTAL_BLOCKS, BLOCK_SHAPES }) {
  availableBlocks.length = 0;
  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    // ดึงรูปร่างมาใช้เพียวๆ ไม่ต้องทำ padShape แล้ว
    const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    
    availableBlocks.push({
      id: Math.random().toString(36).substr(2, 9),
      shape: shape,
      x: 0, y: 0, 
      color: getRandomColor(),
      active: true,
      slotIndex: i, 
    });
  }
  updateTrayBlockPositions(canvas, availableBlocks, TRAY_BLOCK_SIZE);
}


export function blockCollision(x, y, block, TRAY_BLOCK_SIZE) {
  // เช็คขนาดกล่อง (ที่ถูก padShape แล้ว) ของบล็อกตัวนั้นๆ
  const slotSize = block.shape.length * TRAY_BLOCK_SIZE;
  
  // เช็คว่านิ้วแตะโดนกล่องขนาดนั้นหรือไม่
  return x >= block.x && 
         x <= block.x + slotSize && 
         y >= block.y && 
         y <= block.y + slotSize;
}

export function canPlaceBlockAtPosition(grid, shape, gridX, gridY) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 1) { // เช็คเฉพาะช่องที่เป็นตัวบล็อกจริงๆ
        const targetX = gridX + x;
        const targetY = gridY + y;

        // 1. เช็คว่าถ้าเป็นตัวบล็อกแล้วหลุดขอบ ให้คืนค่า false ทันที
        if (targetX < 0 || targetY < 0 || targetX >= GRID_SIZE || targetY >= GRID_SIZE) {
          return false;
        }

        // 2. เช็คว่าช่องนั้นมีบล็อกอื่นวางอยู่หรือไม่
        if (grid[targetY][targetX] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

export function findBestGridPlacement({ canvas, grid, block, offsetX, offsetY, blockX, blockY }) {
  const offset = getGridOffset(canvas);

  // คำนวณพิกัดบนกระดาน โดยเทียบจากตำแหน่งที่ลากไปหักลบกับจุดเริ่มต้นกระดาน
  const relativeX = blockX - offset.x;
  const relativeY = blockY - offset.y;

  // ปัดเศษเพื่อหาช่อง Grid ที่ใกล้กับตำแหน่งนิ้วที่สุด (ล็อกเป้าตรงๆ)
  const gridX = Math.round(relativeX / CELL_SIZE);
  const gridY = Math.round(relativeY / CELL_SIZE);

  // เช็คว่าตำแหน่งเป๊ะๆ ตรงนี้ วางได้หรือไม่?
  if (canPlaceBlockAtPosition(grid, block.shape, gridX, gridY)) {
    return { gridX, gridY, canPlace: true };
  }

  // ถ้าวางตรงนี้ไม่ได้ ให้ตอบ false ทันที (บล็อกจะไม่กระโดดไปหาที่อื่นเองแล้ว)
  return { gridX: 0, gridY: 0, canPlace: false };
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
    
    // สำคัญมาก: เปลี่ยนการวนลูปให้มันเอาส่วนที่ "ยื่นออกนอกบล็อก" ไปทดสอบด้วย
    // ไม่ใช่ทดสอบแค่รูปร่างสี่เหลี่ยมเป๊ะๆ ของ Array
    for (let gridY = -block.shape.length + 1; gridY < GRID_SIZE; gridY++) {
      for (let gridX = -block.shape[0].length + 1; gridX < GRID_SIZE; gridX++) {
        if (canPlaceBlockAtPosition(grid, block.shape, gridX, gridY)) {
          return true;
        }
      }
    }
  }
  return false;
}