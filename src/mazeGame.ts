// --- VARIABLES GLOBALES ---
const CELL_SIZE = 48;
const MAZE_ROWS = 9;
const MAZE_COLS = 13;
const MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,1,0,0,1],
  [1,0,1,0,1,0,1,1,0,1,0,1,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const START = { row: 1, col: 1 };
const GOAL = { row: 7, col: 11 };
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let playerImg: HTMLImageElement;
let goalImg: HTMLImageElement;
let player = { ...START };
let moving = false;
 

function setupMazeGame() {
  // --- Unified Pointer Events with pointer capture ---
  let activePointerId: number | null = null;
  let pointerDragging = false;
  let pointerStartCell = { row: 0, col: 0 };
  let pointerCurrent = { x: 0, y: 0 };

  function clientToCanvas(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  }

  function handlePointerDown(e: PointerEvent) {
    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    const pRect = getPlayerRect();
    if (x >= pRect.x && x <= pRect.x + pRect.w && y >= pRect.y && y <= pRect.y + pRect.h) {
      pointerDragging = true;
      activePointerId = e.pointerId;
      pointerStartCell = { row: player.row, col: player.col };
      pointerCurrent = { x, y };
      drawMaze(true, x, y);
      try { (e.target as Element).setPointerCapture(activePointerId); } catch (err) {}
      e.preventDefault();
    }
  }

  function handlePointerMove(e: PointerEvent) {
    if (!pointerDragging || e.pointerId !== activePointerId) return;
    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    pointerCurrent.x = x;
    pointerCurrent.y = y;
    drawMaze(true, x, y);
    e.preventDefault();
  }

  function handlePointerUp(e: PointerEvent) {
    if (!pointerDragging || e.pointerId !== activePointerId) return;
    pointerDragging = false;
    try { (e.target as Element).releasePointerCapture(activePointerId!); } catch (err) {}
    activePointerId = null;
    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    let col = Math.floor(x / CELL_SIZE);
    let row = Math.floor(y / CELL_SIZE);
    if (Math.abs(row - pointerStartCell.row) + Math.abs(col - pointerStartCell.col) === 1 && canMove(row, col)) {
      animateMove(row, col, () => {});
    } else {
      drawMaze();
    }
    e.preventDefault();
  }

  // Evitar duplicados
  let mazeSection = document.getElementById('maze-section');
  if (!mazeSection) {
    mazeSection = document.createElement('section');
    mazeSection.id = 'maze-section';
    document.body.appendChild(mazeSection);
  }
  // Limpiar mazeSection (deja solo el h2)
  Array.from(mazeSection.children).forEach(child => {
    if (!(child.tagName === 'H2')) mazeSection.removeChild(child);
  });
  // Si ya existe un canvas, no crear otro
  let existingCanvas = document.getElementById('maze-canvas') as HTMLCanvasElement | null;
  if (existingCanvas) {
    canvas = existingCanvas;
  } else {
    canvas = document.createElement('canvas');
    canvas.width = MAZE_COLS * CELL_SIZE;
    canvas.height = MAZE_ROWS * CELL_SIZE;
    canvas.id = 'maze-canvas';
    canvas.style.display = 'block';
    canvas.style.margin = '2em auto';
    mazeSection.appendChild(canvas);
  }
  ctx = canvas.getContext('2d')!;
  playerImg = new window.Image();
  playerImg.src = '/img/puzzle.jpg';
  goalImg = new window.Image();
  goalImg.src = '/img/sobre.jpg';
  playerImg.onload = goalImg.onload = () => drawMaze();
  // Usar Pointer Events y deshabilitar acciones táctiles por defecto
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
}


if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', setupMazeGame);
} else {
  setupMazeGame();
}


function canMove(row: number, col: number) {
  return MAZE[row] && MAZE[row][col] === 0;
}

function handleMove(dir: 'up'|'down'|'left'|'right') {
  if (moving) return;
  let { row, col } = player;
  if (dir === 'up' && canMove(row - 1, col)) row--;
  if (dir === 'down' && canMove(row + 1, col)) row++;
  if (dir === 'left' && canMove(row, col - 1)) col--;
  if (dir === 'right' && canMove(row, col + 1)) col++;
  if (row !== player.row || col !== player.col) {
    moving = true;
    animateMove(row, col, () => {
      player.row = row;
      player.col = col;
      moving = false;
      drawMaze();
      if (row === GOAL.row && col === GOAL.col) {
        setTimeout(() => showWin(), 400);
      }
    });
  }
}

function animateMove(targetRow: number, targetCol: number, cb: () => void) {
  const steps = 8;
  let step = 0;
  const startX = player.col * CELL_SIZE;
  const startY = player.row * CELL_SIZE;
  const dx = (targetCol - player.col) * CELL_SIZE / steps;
  const dy = (targetRow - player.row) * CELL_SIZE / steps;
  function anim() {
    step++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fondo y laberinto
    drawMaze();
    // Jugador animado
    ctx.save();
    ctx.shadowColor = '#b48a78';
    ctx.shadowBlur = 12;
    ctx.drawImage(
      playerImg,
      startX + dx * step + 4,
      startY + dy * step + 4,
      CELL_SIZE - 8,
      CELL_SIZE - 8
    );
    ctx.restore();
    if (step < steps) {
      requestAnimationFrame(anim);
    } else {
      cb();
    }
  }
  anim();
}


function showWin() {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#fff8f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.font = 'bold 2.2em "Great Vibes", cursive';
  ctx.fillStyle = '#b48a78';
  ctx.textAlign = 'center';
  ctx.fillText('¡Llegaste al altar!', canvas.width / 2, canvas.height / 2);
  ctx.restore();

  // Desvanecer el laberinto y mostrar el resto de secciones
  const mazeSection = document.getElementById('maze-section');
  if (mazeSection) {
    mazeSection.style.transition = 'opacity 0.8s';
    mazeSection.style.opacity = '0';
    setTimeout(() => {
      mazeSection.style.display = 'none';
      document.querySelectorAll('section').forEach(sec => {
        if (sec.id !== 'maze-section' && sec.id !== 'invitation-card') {
          sec.classList.remove('hidden');
          sec.style.removeProperty('display');
          sec.style.display = 'flex';
        } else if (sec.id === 'maze-section') {
          sec.classList.add('hidden');
          sec.style.display = 'none';
        }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 850);
  }
}

window.addEventListener('keydown', (e) => {
  if (moving) return;
  if (e.key === 'ArrowUp' || e.key === 'w') handleMove('up');
  if (e.key === 'ArrowDown' || e.key === 's') handleMove('down');
  if (e.key === 'ArrowLeft' || e.key === 'a') handleMove('left');
  if (e.key === 'ArrowRight' || e.key === 'd') handleMove('right');
});





 
function getPlayerRect() {
  return {
    x: player.col * CELL_SIZE + 4,
    y: player.row * CELL_SIZE + 4,
    w: CELL_SIZE - 8,
    h: CELL_SIZE - 8
  };
}



// Modificar drawMaze para soportar arrastre
function drawMaze(draggingPlayer = false, dragX = 0, dragY = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Fondo
  ctx.fillStyle = '#f8f4ee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Laberinto
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (MAZE[r][c] === 1) {
        ctx.fillStyle = '#b48a78';
        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
  // Meta (altar)
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.drawImage(goalImg, GOAL.col * CELL_SIZE + 4, GOAL.row * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
  ctx.restore();
  // Jugador (pareja)
  ctx.save();
  ctx.shadowColor = '#b48a78';
  ctx.shadowBlur = 12;
  if (draggingPlayer) {
    ctx.globalAlpha = 0.7;
    ctx.drawImage(playerImg, dragX - (CELL_SIZE - 8) / 2, dragY - (CELL_SIZE - 8) / 2, CELL_SIZE - 8, CELL_SIZE - 8);
  } else {
    ctx.drawImage(playerImg, player.col * CELL_SIZE + 4, player.row * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
  }
  ctx.restore();
}


