import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import "./style.css";

// Smooth scrolling effect for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
const puzzleGate = document.getElementById("puzzle-gate") as HTMLElement;
const puzzleBoard = document.getElementById("puzzle-board") as HTMLElement;
const resetPuzzleBtn = document.getElementById("reset-puzzle") as HTMLButtonElement;

const SIZE = 4; // 4x4
const PIECE_SIZE = 80;
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
    piece.style.backgroundImage = "url('./src/img/IMG-20260101-WA0000.jpg')";
    piece.style.backgroundSize = `${SIZE * PIECE_SIZE}px ${SIZE * PIECE_SIZE}px`;
    piece.style.backgroundPosition = `-${(idx % SIZE) * PIECE_SIZE}px -${Math.floor(idx / SIZE) * PIECE_SIZE}px`;
    piece.dataset.index = i.toString();
    piece.dataset.piece = idx.toString();
    piece.addEventListener('dragstart', (e) => {
      draggingIndex = i;
      piece.classList.add('dragging');
    });
    piece.addEventListener('dragend', (e) => {
      draggingIndex = null;
      piece.classList.remove('dragging');
    });
    piece.addEventListener('dragover', (e) => {
      e.preventDefault();
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
const invitationCard = document.querySelector("#invitation-card") as HTMLElement;
const envelopeAnim = document.getElementById("envelope-anim");
const sobreAnimado = document.getElementById("sobreAnimado") as HTMLVideoElement | null;
const nosCasamosSection = document.querySelector("#nos-casamos");
const weddingInfoSection = document.querySelector("#wedding-info");
const formSection = document.querySelector("#form");

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
  // Animación fade-out para puzzle-gate
  puzzleGate.classList.add('fade-out');
  // Efecto de éxito: resplandor y vibración breve
  puzzleGate.classList.add('puzzle-success');
  setTimeout(() => {
    puzzleGate.classList.remove('puzzle-success');
    puzzleGate.classList.add('fade-out');
    setTimeout(() => {
      puzzleGate.style.display = 'none';
      if (envelopeAnim) envelopeAnim.style.display = "none";
      if (sobreAnimado) {
        sobreAnimado.pause();
      }
      // Mostrar el resto de secciones (excepto invitation-card y puzzle-gate)
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
  }, 700); // Duración del efecto de éxito
}

resetPuzzleBtn.addEventListener('click', createPuzzle);

createPuzzle();

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
const API_URL = "http://localhost:3001/api/guests";

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

function isNameUsed(name: string): boolean {
  const guests = JSON.parse(localStorage.getItem(GUESTS_KEY) || "[]");
  const normalized = normalizeName(name);
  return guests.some((g: any) => normalizeName(g.name) === normalized);
}

function showModal(message: string) {
  const modalBody = document.querySelector('.modal-body');
  if (modalBody) modalBody.textContent = message;
  // @ts-ignore
  const modal = new bootstrap.Modal(document.getElementById('alertModal'));
  modal.show();
}

function saveGuest(guest: { name: string; email: string; guests: number }) {
  const current = JSON.parse(localStorage.getItem(GUESTS_KEY) || "[]");
  current.push(guest);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(current));
}

const GUESTS_KEY = "wedding_confirmed_guests";
