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

// Puzzle initialization helper: ensure the puzzle is created when needed.
function initPuzzleIfNeeded() {
  if ((window as any).setupPuzzle) return; // already initialized

  const puzzleGate = document.getElementById("puzzle-gate");
  const puzzleBoardElLocal = document.getElementById("puzzle-board");
  const resetPuzzleBtnElLocal = document.getElementById("reset-puzzle");

  if (!(puzzleBoardElLocal && puzzleGate && resetPuzzleBtnElLocal)) return;

  const puzzleBoard = puzzleBoardElLocal as HTMLElement;
  const resetPuzzleBtn = resetPuzzleBtnElLocal as HTMLButtonElement;
  const SIZE = 3; // 3x3
  const PIECE_SIZE = 106;
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
      piece.style.backgroundImage = "url('/img/nuestra-historia.png')";
      piece.style.backgroundSize = `${SIZE * PIECE_SIZE}px ${SIZE * PIECE_SIZE}px`;
      piece.style.backgroundPosition = `-${(idx % SIZE) * PIECE_SIZE}px -${Math.floor(idx / SIZE) * PIECE_SIZE}px`;
      piece.dataset.index = i.toString();
      piece.dataset.piece = idx.toString();

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
          if (isSolved()) setTimeout(puzzleSolved, 300);
        }
      });

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
        if (isSolved()) setTimeout(puzzleSolved, 300);
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
  (window as any).setupPuzzle = setupPuzzle;
  (window as any).puzzleInitialized = true;
}

// Try to initialize puzzle on load in case DOM had the elements ready
initPuzzleIfNeeded();
// Global arrays used to decide which sections to show after invitation/puzzle
const FALLBACK_IDS = [
  'nos-casamos',
  // 'carousel-section',
  'nuestra-historia',
  'wedding-info',
  'salon-celebraciones',
  'celebracion',
  'fiesta',
  'foto-final',
  'confirmacion-asistencia',
  'itinerario',
  'spotify'
];
const invitationCard = document.querySelector("#invitation-card") as HTMLElement;
const envelopeAnim = document.getElementById("envelope-anim");
const sobreAnimadoEl = document.getElementById("sobreAnimado") as HTMLElement | null;
// Element reference for the puzzle gate (used when revealing the invitation)
const puzzleGateEl = document.getElementById("puzzle-gate");

// Mostrar sólo la invitación al cargar; ocultar el resto
const sections = document.querySelectorAll('section');
sections.forEach(sec => {
  sec.style.display = 'none';
});
// Mostrar invitation-card solo si existe
if (invitationCard) {
  invitationCard.style.display = 'flex';
  // lock page scroll while invitation overlay is visible
  document.body.classList.add('no-scroll');
} else {
  // si no hay invitation-card, mostrar las principales secciones por seguridad
  const fallbackIds = ['nos-casamos' , 'nuestra-historia', 'wedding-info', 'salon-celebraciones', 'celebracion', 'fiesta', 'form', 'foto-final', 'confirmacion-asistencia'];
  fallbackIds.push('itinerario','spotify'); // Include 'itinerario' in fallbackIds
  fallbackIds.forEach(id => {
    const s = document.getElementById(id);
    if (s) { s.removeAttribute('hidden'); s.style.display = 'flex'; }
  });
}


function puzzleSolved() {
  console.log('puzzleSolved() ejecutado: puzzle-gate se ocultará y se mostrarán las secciones.');
  // Efecto de éxito: resplandor y vibración breve
    const gate = document.getElementById('puzzle-gate');
    if (!gate) return;
    gate.classList.add('puzzle-success');
  setTimeout(() => {
    gate.classList.remove('puzzle-success');
    // Forzar reflow y aplicar nueva clase de desvanecimiento
    void gate.offsetWidth;
    gate.classList.add('desvanecer');

    let finished = false;
    const showSections = () => {
      if (finished) return;
      finished = true;
      gate.style.display = 'none';
      if (envelopeAnim) envelopeAnim.style.display = "none";
      if (sobreAnimadoEl && (sobreAnimadoEl instanceof HTMLMediaElement)) {
        sobreAnimadoEl.pause();
      }
      // ensure scrolling unlocked when revealing sections
      document.body.classList.remove('no-scroll');
      // Mostrar secciones definidas en las listas (FALLBACK_IDS + IDS_TO_SHOW)
      // ensure IDS_TO_SHOW exists in this scope
      const idsToShowLocal = [
        'nos-casamos','nuestra-historia','wedding-info','itinerario','salon-celebraciones','countdown-section','celebracion','confirmacion-asistencia','fiesta','spotify','foto-final'
      ];
      // Ensure sections are shown in the desired order. Prefer idsToShowLocal order
      const ordered = Array.from(new Set([...(idsToShowLocal || []), ...(FALLBACK_IDS || [])]));
      ordered.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) {
          sec.classList.remove('hidden');
          sec.removeAttribute('hidden');
          sec.style.removeProperty('display');
          sec.style.display = 'flex';
          // If the section was hidden by the puzzle, restore visibility attribute
          // @ts-ignore
          if (sec.dataset && sec.dataset.hiddenByPuzzle) {
            try { sec.style.removeProperty('visibility'); } catch(e) { /* noop */ }
            // @ts-ignore
            delete sec.dataset.hiddenByPuzzle;
          }
        }
      });
      // After making sections visible, trigger reveal for any itinerario frames
      // that are already within the viewport so they animate immediately.
      try {
        const frames = Array.from(document.querySelectorAll('.itinerario-frame, .itinerario-frame-big, .itinerario-frame-big2')) as HTMLElement[];
        frames.forEach(f => {
          const r = f.getBoundingClientRect();
          if (r.top >= 0 && r.top < (window.innerHeight * 0.9)) {
            f.classList.add('in-place');
          }
        });
      } catch (e) { /* noop */ }
      // Ensure carousel is positioned right after wedding-info in the DOM
      try {
        const wedding = document.getElementById('wedding-info');
        const carousel = document.getElementById('carousel-section');
        if (wedding && carousel && wedding.parentNode) {
          // Insert carousel immediately before wedding-info
          wedding.parentNode.insertBefore(carousel, wedding);
        }
      } catch (e) { /* noop */ }
      // Ensure music control exists and start playback
      try {
        ensureMusicControl();
        const audio = document.getElementById('page-music') as HTMLAudioElement | null;
        if (audio) {
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch((err) => {
              console.debug('Autoplay blocked or failed:', err);
            });
          }
        }
      } catch (e) { /* noop */ }
      // Hide the form-related back button if present
      const backBtn = document.getElementById('back-from-form');
      if (backBtn) backBtn.style.display = 'none';
      // Hide invitation-card and puzzle-gate specifically
      const inv = document.getElementById('invitation-card'); if (inv) { inv.classList.add('hidden'); inv.style.display='none'; }
      const pg = document.getElementById('puzzle-gate'); if (pg) { pg.classList.add('hidden'); pg.style.display='none'; pg.classList.remove('active'); }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    // Fallback por si transitionend no se dispara
    const fallback = setTimeout(showSections, 450);
    gate.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'opacity') {
        clearTimeout(fallback);
        gate.removeEventListener('transitionend', handler);
        showSections();
      }
    });
  }, 300); // Duración del efecto de éxito (reducida)
}



// Event listener for invitation card
if (envelopeAnim && sobreAnimadoEl && invitationCard) {
  const revealFromInvitation = () => {
    invitationCard.classList.add("fade-out");
    // allow page scrolling again
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      invitationCard.style.display = "none";
      if (envelopeAnim) envelopeAnim.style.display = "none";
      if (sobreAnimadoEl && (sobreAnimadoEl instanceof HTMLMediaElement)) {
        try { sobreAnimadoEl.pause(); } catch (e) { /* noop */ }
      }
      // Show the puzzle gate first (if present). If not, fall back to showing main sections.
      if (puzzleGateEl) {
        // Ensure puzzle is initialized before showing the gate
        try { initPuzzleIfNeeded(); } catch (e) { /* noop */ }
        // Remove `hidden` attribute (we added it in the HTML) so it becomes visible
        try { puzzleGateEl.removeAttribute('hidden'); } catch(e) { /* noop */ }
        puzzleGateEl.classList.remove('hidden');
        // Use flex when section is full-screen-like, otherwise block
        puzzleGateEl.style.display = puzzleGateEl.classList.contains('full-screen') ? 'flex' : 'block';
        // Mark overlay active so CSS ensures centering and z-index
        puzzleGateEl.classList.add('active');
        // Ensure other sections remain hidden while the puzzle is active
        document.querySelectorAll('section').forEach(function(s){
          if (s.id === 'puzzle-gate') return;
          try { (s as HTMLElement).style.display = 'none'; } catch(e) { /* noop */ }
          s.classList.add('hidden');
        });
        // Explicitly hide `#itinerario` (extra safety) and mark for restoration
        try {
          const itin = document.getElementById('itinerario');
          if (itin) {
            (itin as HTMLElement).style.display = 'none';
            (itin as HTMLElement).style.visibility = 'hidden';
            // @ts-ignore
            itin.dataset.hiddenByPuzzle = 'true';
          }
        } catch (e) { /* noop */ }
        // keep page scroll locked while solving the puzzle
        document.body.classList.add('no-scroll');
        // Ensure overlay is shown; keep page at top (do not scroll to element)
      } else {
        showMainSections();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  if (sobreAnimadoEl instanceof HTMLMediaElement) {
    sobreAnimadoEl.currentTime = 0;
    sobreAnimadoEl.pause();
    // when the media ends, reveal the site
    sobreAnimadoEl.onended = revealFromInvitation;
  }

  // Play only the first 2 seconds on click, then reveal sections.
  {
    let clicked = false;
    envelopeAnim.addEventListener("click", () => {
      if (clicked) return;
      clicked = true;
      if (sobreAnimadoEl instanceof HTMLMediaElement) {
        try {
          sobreAnimadoEl.currentTime = 0;
        } catch (e) { /* ignore if seek not allowed yet */ }
        sobreAnimadoEl.playbackRate = 1;
        const playPromise = sobreAnimadoEl.play();
        // After ~1.3s of playback, pause and reveal the site
        const revealAfter = 1300;
        const t = setTimeout(() => {
          try { sobreAnimadoEl.pause(); } catch (e) {}
          revealFromInvitation();
        }, revealAfter);
        // In case the media ends earlier, ensure we clear the timeout and reveal
        const onEndOrError = () => {
          clearTimeout(t);
          revealFromInvitation();
          sobreAnimadoEl.removeEventListener('ended', onEndOrError);
          sobreAnimadoEl.removeEventListener('error', onEndOrError);
        };
        sobreAnimadoEl.addEventListener('ended', onEndOrError);
        sobreAnimadoEl.addEventListener('error', onEndOrError);
        // If play() returns a promise, handle rejection (e.g., autoplay policy)
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {
            // If playback failed, just reveal immediately
            clearTimeout(t);
            revealFromInvitation();
          });
        }
      } else {
        // element is not media (e.g. an image) — reveal immediately
        revealFromInvitation();
      }
    });
  }
}

// Seal and envelope animation logic


// RSVP form logic
const form = document.querySelector<HTMLFormElement>("#form form");

// Backend API URL: usar backend local en desarrollo (localhost/file), ruta relativa en producción
const isLocal = window.location.hostname.includes('localhost') || window.location.protocol === 'file:';
const API_URL = isLocal ? 'http://localhost:3001/api/guests' : '/api/guests';
console.log('Frontend startup - API_URL =', API_URL);

async function saveGuestBackend(guest: { name: string; email: string; guests: number }) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guest)
    });
    if (!res.ok) {
      try { return await res.json(); } catch (e) { return { error: `Error en respuesta del servidor: ${res.status}` }; }
    }
    return await res.json();
  } catch (err) {
    console.error('Error saving guest:', err);
    return { error: 'No se pudo conectar con el servidor. Inténtalo más tarde.' };
  }
}

// Navigation helpers: show only one section (used for confirm -> form flow)
function showOnlySection(id: string) {
  // Hide all sections and mark them hidden to match inline hash handler behavior
  document.querySelectorAll('section').forEach(sec => {
    try { sec.setAttribute('hidden', ''); } catch(e) { /* noop */ }
    try { (sec as HTMLElement).style.display = 'none'; } catch(e) { /* noop */ }
  });
  const target = document.getElementById(id);
  if (target) {
    console.debug('[showOnlySection] showing', id);
    try { target.removeAttribute('hidden'); } catch(e) { /* noop */ }
    try { (target as HTMLElement).style.visibility = 'visible'; } catch(e) { /* noop */ }
    try { (target as HTMLElement).style.display = (target.classList.contains('full-screen') ? 'flex' : 'block'); } catch(e) { /* noop */ }
    try { target.classList.remove('hidden'); } catch(e) { /* noop */ }
    try { target.removeAttribute('aria-hidden'); } catch(e) { /* noop */ }
    // Ensure page can scroll to show the form
    document.body.classList.remove('no-scroll');
    // Force reflow so the browser repaints the newly-visible section
    try { void (target as HTMLElement).offsetWidth; } catch(e) { /* noop */ }
    // If it's the form, focus the first input for accessibility/visual confirmation
    try {
      const firstInput = target.querySelector('input, textarea, button, select') as HTMLElement | null;
      if (firstInput) firstInput.focus();
    } catch(e) { /* noop */ }
    // Update URL hash to keep history in sync (use replaceState to avoid extra entry)
    try { history.replaceState(null, '', `#${id}`); } catch(e) { try { location.hash = id; } catch(e) { /* noop */ } }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// When user clicks the confirm button in the confirmation screen, show only the form
document.querySelectorAll('.confirm-btn').forEach(el => {
  el.addEventListener('click', (ev) => {
    ev.preventDefault();
    // Update URL without firing hashchange, then show the form immediately
    try { history.pushState(null, '', '#form'); } catch (e) { try { location.hash = 'form'; } catch(e) { /* noop */ } }
    showOnlySection('form');
    const backBtn = document.getElementById('back-from-form') as HTMLElement | null;
    if (backBtn) backBtn.style.display = 'inline-block';
  });
});

// Back button on the form returns to the confirmation screen
const backFromFormBtn = document.getElementById('back-from-form');
if (backFromFormBtn) {
  backFromFormBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Restore the main site sections as they were after closing the invitation
    showMainSections();
    (backFromFormBtn as HTMLElement).style.display = 'none';
  });
}

// Reusable helper to show the primary sections shown after invitation
function showMainSections() {
  const IDS_TO_SHOW = [
    'nos-casamos',
    // 'carousel-section',
    'nuestra-historia',
    'wedding-info',
    'itinerario',
    'salon-celebraciones',
    'countdown-section',
    'celebracion',
    'confirmacion-asistencia',
    'fiesta',
    'spotify',
    'foto-final'
  ];
  IDS_TO_SHOW.forEach(id => {
    const sec = document.getElementById(id);
    if (sec) {
      sec.removeAttribute('hidden');
      sec.style.display = 'flex';
      sec.classList.remove('hidden');
    }
  });
  // Reorder carousel-section to appear immediately before wedding-info
  try {
    const wedding = document.getElementById('wedding-info');
    const carousel = document.getElementById('carousel-section');
    if (wedding && carousel && wedding.parentNode) {
      wedding.parentNode.insertBefore(carousel, wedding);
    }
  } catch (e) { /* noop */ }
  // Asegura que el formulario esté oculto tras la invitación
  const formSection = document.getElementById('form');
  if (formSection) {
    formSection.style.display = 'none';
  }
}

async function getGuestsBackend() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching guests:', err);
    return null;
  }
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
  if (allGuests === null) {
    showModal('No se pudo conectar con el servidor. Inténtalo más tarde.');
    return;
  }
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

// Music control helper: creates audio element and floating toggle button
function ensureMusicControl() {
  if (document.getElementById('music-toggle')) return;
  try {
    // Add minimal styles for the floating button
    const styleId = 'music-control-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        #music-toggle { position: fixed; right: 3%; bottom: 2%; width:2.3rem; height:2.3rem; border-radius:50%; background:#CF521A; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 18px rgba(0,0,0,0.18); z-index:9999; cursor:pointer; border:none; }
        #music-toggle:active { transform: scale(0.96); }
        #music-toggle i { font-size:1.2rem; }
      `;
      document.head.appendChild(style);
    }

    // Create audio element
    const audio = document.createElement('audio');
    audio.id = 'page-music';
    // Use the provided asset path; if spaces exist it's OK in src but encode if needed
    audio.src = '/mp3/Mon Amour.mp3';
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.7;
    document.body.appendChild(audio);

    // Create toggle button
    const btn = document.createElement('button');
    btn.id = 'music-toggle';
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Reproducir / Pausar música';
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-volume-high';
    btn.appendChild(icon);
    btn.addEventListener('click', () => {
      try {
        const a = document.getElementById('page-music') as HTMLAudioElement | null;
        if (!a) return;
        if (a.paused) {
          const p = a.play();
          if (p && typeof p.then === 'function') p.catch(()=>{});
          btn.setAttribute('aria-pressed', 'true');
          icon.className = 'fa-solid fa-volume-high';
        } else {
          a.pause();
          btn.setAttribute('aria-pressed', 'false');
          icon.className = 'fa-solid fa-volume-xmark';
        }
      } catch (err) { /* noop */ }
    });
    // Reflect initial state (paused)
    icon.className = 'fa-solid fa-volume-high';
    // Append to body
    document.body.appendChild(btn);

    // When audio ends/starts update icon (keeps in sync)
    audio.addEventListener('play', () => { try { const ic = document.querySelector('#music-toggle i'); if (ic) ic.className = 'fa-solid fa-volume-high'; } catch { } });
    audio.addEventListener('pause', () => { try { const ic = document.querySelector('#music-toggle i'); if (ic) ic.className = 'fa-solid fa-volume-xmark'; } catch { } });
  } catch (e) { console.error('Error creating music control', e); }
}




