'use strict';

// All professional content stays visible without JavaScript; these controls add exploration.
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = 'Menu <span aria-hidden="true">＋</span>';
}
menuButton.addEventListener('click', () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.innerHTML = opening ? 'Close <span aria-hidden="true">−</span>' : 'Menu <span aria-hidden="true">＋</span>';
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
});
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const paletteButtons = document.querySelectorAll('[data-palette]');
function applyPalette(palette) {
  if (!['indigo', 'sunset', 'forest'].includes(palette)) return;
  document.body.dataset.palette = palette;
  paletteButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.palette === palette)));
  document.querySelector('meta[name="theme-color"]').content = { indigo: '#30226c', sunset: '#662a44', forest: '#163f39' }[palette];
}
try { applyPalette(localStorage.getItem('yulin-palette') || 'indigo'); } catch { /* Storage is optional. */ }
paletteButtons.forEach(button => button.addEventListener('click', () => {
  applyPalette(button.dataset.palette);
  try { localStorage.setItem('yulin-palette', button.dataset.palette); } catch { /* Keep working in private contexts. */ }
}));

const clock = document.querySelector('#hk-clock');
function updateClock() {
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
}
updateClock();
setInterval(updateClock, 30000);

const cities = {
  beijing: { code: 'BJS', kicker: '01 / China', title: 'Beijing', description: 'Born here.' },
  toronto: { code: 'YYZ', kicker: '02 / Canada', title: 'Toronto', description: 'Attended elementary school through part of high school here. Played at the highest level of baseball for my age since middle school. City champion and provincial finalist. Proud alum of the Etobicoke Rangers and Ontario Royals.' },
  connecticut: { code: 'CT', kicker: '03 / 2017', title: 'Connecticut', description: 'Graduated from The Hotchkiss School with my high school diploma and played varsity baseball there.' },
  baltimore: { code: 'BWI', kicker: '04 / 2017–2021', title: 'Baltimore', description: 'Johns Hopkins · Applied Math & Statistics' },
  newyork: { code: 'NYC', kicker: '05 / 2022–2023', title: 'New York', description: 'Columbia · Financial Engineering' },
  hongkong: { code: 'HKG', kicker: '06 / Now', title: 'Hong Kong', description: 'CUHK Statistics PhD. Jain Global, Pulsar Trading & Kronos Research.' }
};
const cityButtons = document.querySelectorAll('[data-city]');
cityButtons.forEach(button => button.addEventListener('click', () => {
  const city = cities[button.dataset.city];
  cityButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  ['code', 'kicker', 'title', 'description'].forEach(key => { document.getElementById(`city-${key}`).textContent = city[key]; });
}));

const filterButtons = document.querySelectorAll('[data-filter]');
const experienceRows = document.querySelectorAll('.experience-row');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  let count = 0;
  experienceRows.forEach(row => {
    row.hidden = filter !== 'all' && row.dataset.location !== filter;
    if (!row.hidden) count++;
  });
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#experience-count').textContent = `${count} experience${count === 1 ? '' : 's'}`;
}));

const photos = [
  { src: 'hkiss_bsbl2.jpg', alt: 'Yulin pitching in a Hotchkiss uniform with his throwing arm and blue glove extended' },
  { src: 'pitching.jpg', alt: 'Yulin following through on a pitch on a floodlit baseball field at dusk' }
];
let photoIndex = 0;
function showPhoto(step) {
  photoIndex = (photoIndex + step + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const image = document.querySelector('#baseball-photo');
  image.src = photo.src;
  image.alt = photo.alt;
  document.querySelector('#photo-count').textContent = `${String(photoIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
}
document.querySelector('#previous-photo').addEventListener('click', () => showPhoto(-1));
document.querySelector('#next-photo').addEventListener('click', () => showPhoto(1));
document.querySelector('.gallery').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showPhoto(event.key === 'ArrowLeft' ? -1 : 1); }
});

// Keep the address obfuscated until someone chooses an email action.
function getEmailAddress() {
  return document.querySelector('#email-address').textContent.trim().replace(/\s*\[AT\]\s*/i, String.fromCharCode(64));
}
document.querySelectorAll('[data-email-link]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  window.location.href = `mailto:${getEmailAddress()}`;
}));

let copyTimer;
document.querySelector('#copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText(getEmailAddress());
    status.textContent = 'Copied.';
  } catch {
    status.textContent = 'Select the address to copy it, then replace [AT] with the at sign.';
  }
  copyTimer = setTimeout(() => { status.textContent = ''; }, 6000);
});

// Keyboard and touch keep the visual controls usable without a mouse.
function stepCity(step) {
  const buttons = [...cityButtons];
  const active = buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true');
  const next = buttons[(active + step + buttons.length) % buttons.length];
  next.click();
  return next;
}
document.querySelector('.next-city').addEventListener('click', () => stepCity(1));
document.querySelector('.route-track').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    stepCity(event.key === 'ArrowLeft' ? -1 : 1).focus();
  }
});
let swipeStart;
const photoSurface = document.querySelector('.photo-wrap');
photoSurface.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse') return;
  swipeStart = { x: event.clientX, y: event.clientY };
  photoSurface.setPointerCapture(event.pointerId);
});
photoSurface.addEventListener('pointerup', event => {
  if (!swipeStart) return;
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(dx < 0 ? 1 : -1);
  swipeStart = null;
});
photoSurface.addEventListener('pointercancel', () => { swipeStart = null; });

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
document.querySelectorAll('[data-tilt]').forEach(card => {
  let frame;
  card.addEventListener('pointermove', event => {
    if (motionQuery.matches || !finePointer.matches) return;
    cancelAnimationFrame(frame);
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
    frame = requestAnimationFrame(() => {
      card.style.setProperty('--tilt-x', `${y}deg`);
      card.style.setProperty('--tilt-y', `${x}deg`);
    });
  });
  const reset = () => {
    cancelAnimationFrame(frame);
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  };
  card.addEventListener('pointerleave', reset);
  card.addEventListener('pointercancel', reset);
  motionQuery.addEventListener('change', reset);
});
