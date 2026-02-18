import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import "./style.css";

// Smooth scrolling effect for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href");
    if (href) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  });
});

// Add fade-in animation on scroll
const fadeInElements = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

fadeInElements.forEach((el) => observer.observe(el));

// Puzzle and Invitation logic
const puzzleGateEl = document.getElementById("puzzle-gate");
const puzzleBoardEl = document.getElementById("puzzle-board");
const resetPuzzleBtnEl = document.getElementById("reset-puzzle");

if (puzzleBoardEl && puzzleGateEl && resetPuzzleBtnEl) {
  const puzzleBoard = puzzleBoardEl as HTMLElement;
  const resetPuzzleBtn = resetPuzzleBtnEl as HTMLButtonElement;
  const SIZE = 3; // 3x3
  const PIECE_SIZE = 106; // 320/3 ≈ 106.6, para que encaje bien en el canvas de 320px
  let pieces: number[] = [];
  let draggingIndex: number | null = null;

  function shufflePieces() {
    pieces = Array.from({ length: SIZE * SIZE }, (_, i) => i);
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
  }

  function isSolved(): boolean {
    return pieces.every((v, i) => v === i);
  }

  function renderPuzzle() {
    puzzleBoard.innerHTML = '';
    for (let i = 0; i < SIZE * SIZE; i++) {
      const idx = pieces[i];
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.draggable = true;
      piece.style.width = `${PIECE_SIZE}px`;
      piece.style.height = `${PIECE_SIZE}px`;
      piece.style.position = 'absolute';
      piece.style.left = `${(i % SIZE) * PIECE_SIZE}px`;
      piece.style.top = `${Math.floor(i / SIZE) * PIECE_SIZE}px`;
      piece.style.backgroundImage = "url('/img/IMG-20260101-WA0000.jpg')";
      piece.style.backgroundSize = `${SIZE * PIECE_SIZE}px ${SIZE * PIECE_SIZE}px`;
      piece.style.backgroundPosition = `-${(idx % SIZE) * PIECE_SIZE}px -${Math.floor(idx / SIZE) * PIECE_SIZE}px`;
      piece.dataset.index = i.toString();
      piece.dataset.piece = idx.toString();
      // Drag & drop para escritorio
      piece.addEventListener('dragstart', () => {
        draggingIndex = i;
        piece.classList.add('dragging');
      });
      piece.addEventListener('dragend', () => {
        draggingIndex = null;
        piece.classList.remove('dragging');
      });
      piece.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      piece.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggingIndex !== null && draggingIndex !== i) {
          [pieces[draggingIndex], pieces[i]] = [pieces[i], pieces[draggingIndex]];
          renderPuzzle();
          if (isSolved()) {
            setTimeout(() => {
              puzzleSolved();
            }, 300);
          }
        }
      });
      // Touch events para móvil (fluido, sin retardo)
      let touchDragging = false;
      piece.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        touchDragging = true;
        draggingIndex = i;
        piece.classList.add('dragging');
        e.preventDefault();
      }, {passive: false});
      piece.addEventListener('touchmove', (e) => {
        if (!touchDragging || draggingIndex === null) return;
        if (e.touches.length !== 1) return;
        const target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (target && target instanceof HTMLElement && target.classList.contains('puzzle-piece') && target !== piece) {
          const otherIndexStr = target.dataset.index;
          if (otherIndexStr !== undefined) {
            const otherIndex = parseInt(otherIndexStr);
            [pieces[draggingIndex], pieces[otherIndex]] = [pieces[otherIndex], pieces[draggingIndex]];
            draggingIndex = otherIndex;
            renderPuzzle();
          }
        }
        e.preventDefault();
      }, {passive: false});
      piece.addEventListener('touchend', (e) => {
        touchDragging = false;
        piece.classList.remove('dragging');
        draggingIndex = null;
        if (isSolved()) {
          setTimeout(() => {
            puzzleSolved();
          }, 300);
        }
        e.preventDefault();
      }, {passive: false});
      puzzleBoard.appendChild(piece);
    }
  }

  function setupPuzzle() {
    puzzleBoard.style.position = 'relative';
    puzzleBoard.style.width = `${SIZE * PIECE_SIZE}px`;
    puzzleBoard.style.height = `${SIZE * PIECE_SIZE}px`;
    shufflePieces();
    renderPuzzle();
    resetPuzzleBtn.onclick = () => {
      shufflePieces();
      renderPuzzle();
    };
  }

  setupPuzzle();
}
const invitationCard = document.querySelector("#invitation-card") as HTMLElement;
const envelopeAnim = document.getElementById("envelope-anim");
const sobreAnimado = document.getElementById("sobreAnimado") as HTMLVideoElement | null;

// Ocultar todas las secciones menos puzzle-gate al inicio
const sections = document.querySelectorAll('section');
sections.forEach(sec => {
  if (sec.id !== 'puzzle-gate') {
    sec.style.display = 'none';
  } else {
    sec.style.display = 'flex';
  }
});


function puzzleSolved() {
  console.log('puzzleSolved() ejecutado: puzzle-gate se ocultará y se mostrarán las secciones.');
  // Efecto de éxito: resplandor y vibración breve
    const gate = document.getElementById('puzzle-gate');
    if (!gate) return;
    gate.classList.add('puzzle-success');
  setTimeout(() => {
    gate.classList.remove('puzzle-success');
    // Forzar reflow para asegurar que la animación se aplica
    void gate.offsetWidth;
    gate.classList.add('fade-out');

    let finished = false;
    const showSections = () => {
      if (finished) return;
      finished = true;
      gate.style.display = 'none';
      if (envelopeAnim) envelopeAnim.style.display = "none";
      if (sobreAnimado) {
        sobreAnimado.pause();
      }
      // Mostrar todos los sections excepto invitation-card y puzzle-gate
      document.querySelectorAll('section').forEach(sec => {
        if (sec.id !== 'puzzle-gate' && sec.id !== 'invitation-card') {
          sec.classList.remove('hidden');
          sec.style.removeProperty('display');
          sec.style.display = 'flex';
        } else {
          sec.classList.add('hidden');
          sec.style.display = 'none';
        }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    // Fallback por si transitionend no se dispara
    const fallback = setTimeout(showSections, 900);
    gate.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'opacity') {
        clearTimeout(fallback);
        gate.removeEventListener('transitionend', handler);
        showSections();
      }
    });
  }, 700); // Duración del efecto de éxito
}



// Event listener for invitation card
if (envelopeAnim && sobreAnimado && invitationCard) {
  sobreAnimado.currentTime = 0;
  sobreAnimado.pause();
  envelopeAnim.addEventListener("click", () => {
    sobreAnimado.currentTime = 0;
    sobreAnimado.playbackRate = 2;
    sobreAnimado.play();
  });
  sobreAnimado.onended = () => {
    invitationCard.classList.add("fade-out");
    setTimeout(() => {
      invitationCard.style.display = "none";
      // Mostrar todas las secciones (excepto invitation-card y puzzle-gate)
      const idsToShow = [
        'nos-casamos',
        'wedding-info',
        'celebracion',
        'form'
      ];
      idsToShow.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) {
          sec.style.display = 'flex';
          sec.classList.remove('hidden');
        }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
  };
}

// Seal and envelope animation logic


// RSVP form logic
const form = document.querySelector<HTMLFormElement>("#form form");

// Backend API URL
const API_URL = "https://TU-BACKEND.onrender.com/api/guests"; // Cambia TU-BACKEND por el subdominio real de tu backend en Render

async function saveGuestBackend(guest: { name: string; email: string; guests: number }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guest)
  });
  return await res.json();
}

async function getGuestsBackend() {
  const res = await fetch(API_URL);
  return await res.json();
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (form.querySelector("#name") as HTMLInputElement).value;
  const email = (form.querySelector("#email") as HTMLInputElement).value;
  const guests = parseInt((form.querySelector("#guests") as HTMLInputElement).value, 10);

  if (!name.trim()) {
    showModal("Por favor, introduce un nombre válido.");
    return;
  }

  // Check for duplicate name in backend
  const allGuests = await getGuestsBackend();
  const normalized = normalizeName(name);
  if (allGuests.some((g: any) => normalizeName(g.name) === normalized)) {
    showModal("Ya se ha registrado el invitado");
    return;
  }

  const result = await saveGuestBackend({ name, email, guests });
  if (result.error) {
    showModal(result.error);
    return;
  }
  form.reset();
  showModal("¡Gracias por confirmar tu asistencia!");
});

// Show confirmed guests at /invitadosconfirmados
if (window.location.pathname.endsWith("/invitadosconfirmados")) {
  document.body.innerHTML = `<section class="full-screen"><h2>Invitados confirmados</h2><ul id="guest-list"></ul></section>`;
  const guestList = document.getElementById("guest-list");

  getGuestsBackend().then((guests) => {
    if (!guests || guests.length === 0) {
      guestList!.innerHTML = '<li>No hay invitados confirmados aún.</li>';
    } else {
      guestList!.innerHTML = guests.map((g: any) =>
        `<li style="margin-bottom:1em"><b>${g.name}</b> (${g.email}) - ${g.guests} invitado(s)
        <button class="btn btn-sm btn-danger" style="margin-left:1em;border-radius:1em" data-id="${g.id}">Eliminar</button></li>`
      ).join("");
    }
  });

  guestList!.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" && target.dataset.id) {
      await fetch(`${API_URL}/${target.dataset.id}`, { method: "DELETE" });
      getGuestsBackend().then((guests) => {
        if (!guests || guests.length === 0) {
          guestList!.innerHTML = '<li>No hay invitados confirmados aún.</li>';
        } else {
          guestList!.innerHTML = guests.map((g: any) =>
            `<li style="margin-bottom:1em"><b>${g.name}</b> (${g.email}) - ${g.guests} invitado(s)
            <button class="btn btn-sm btn-danger" style="margin-left:1em;border-radius:1em" data-id="${g.id}">Eliminar</button></li>`
          ).join("");
        }
      });
    }
  });
}

function normalizeName(name: string): string {
  return name
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}



function showModal(message: string) {
  const modalBody = document.querySelector('.modal-body');
  if (modalBody) modalBody.textContent = message;
  // @ts-ignore
  const modal = new bootstrap.Modal(document.getElementById('alertModal'));
  modal.show();
}




