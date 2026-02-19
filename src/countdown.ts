// Countdown TypeScript module
const daysEl = document.getElementById('days') as HTMLElement | null;
const hoursEl = document.getElementById('hours') as HTMLElement | null;
const minutesEl = document.getElementById('minutes') as HTMLElement | null;
const secondsEl = document.getElementById('seconds') as HTMLElement | null;

// Fecha objetivo: 31/10/2026 12:00:00 (mes 9 = octubre)
const TARGET = new Date(2026, 9, 31, 12, 0, 0, 0);

function pad(n: number) { return String(n).padStart(2, '0'); }

let prevSeconds = '';

function updateCountdown() {
  const now = new Date();
  let diff = Math.max(0, TARGET.getTime() - now.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);

  if (daysEl) daysEl.querySelector('span')!.textContent = String(days);
  if (hoursEl) hoursEl.querySelector('span')!.textContent = pad(hours);
  if (minutesEl) minutesEl.querySelector('span')!.textContent = pad(minutes);

  // Seconds with flip
  if (secondsEl) {
    const cur = secondsEl.querySelector('.current') as HTMLElement | null;
    const nxt = secondsEl.querySelector('.next') as HTMLElement | null;
    const newVal = pad(seconds);
    if (prevSeconds === '') {
      // first render
      if (cur) cur.textContent = newVal;
      if (nxt) nxt.textContent = newVal;
      prevSeconds = newVal;
    } else if (prevSeconds !== newVal) {
      // animate flip
      if (nxt) nxt.textContent = newVal;
      secondsEl.classList.remove('flipping');
      // force reflow
      void secondsEl.offsetWidth;
      secondsEl.classList.add('flipping');
      // after animation, set current to new value and cleanup
      setTimeout(() => {
        if (cur) cur.textContent = newVal;
        secondsEl.classList.remove('flipping');
        if (nxt) nxt.textContent = newVal;
      }, 520);
      prevSeconds = newVal;
    }
  }
}

// Init
updateCountdown();
setInterval(updateCountdown, 1000);

export {};
