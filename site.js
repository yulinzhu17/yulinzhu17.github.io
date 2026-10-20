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
  document.querySelector('meta[name="theme-color"]').content = { indigo: '#202448', sunset: '#512c3a', forest: '#193e38' }[palette];
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
  beijing: { code: 'BJS', kicker: 'The first stop', title: 'Beijing', description: 'The first stop on a journey through Beijing, Toronto, Connecticut, Baltimore, New York, and Hong Kong.' },
  toronto: { code: 'YYZ', kicker: 'The Canadian chapter', title: 'Toronto', description: 'Toronto, Ontario, Canada — part of the journey before school and work took me to the United States and Hong Kong.' },
  connecticut: { code: 'CT', kicker: 'School days & game days', title: 'Connecticut', description: 'The Hotchkiss School, Class of 2017. High school, varsity baseball, and plenty of time on the mound.' },
  baltimore: { code: 'BWI', kicker: 'Finding mathematics', title: 'Baltimore', description: 'Johns Hopkins University, 2017–2021. Applied Math & Statistics, with a minor in Pure Math and a winding path through several disciplines.' },
  newyork: { code: 'NYC', kicker: 'Engineering meets finance', title: 'New York', description: 'Financial Engineering at Columbia University, deep learning research with Prof. Ali Hirsa, and equity derivatives and volatility risk work at Millennium Management.' },
  hongkong: { code: 'HKG', kicker: 'The current chapter', title: 'Hong Kong', description: 'Statistics PhD at CUHK. Researching stochastic control and finance, with trading and quantitative research experience in Hong Kong.' }
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
  { src: 'pitching_hkiss.jpeg', alt: 'Yulin pitching in a Hotchkiss uniform, ball raised beside his head', caption: 'Hotchkiss. Ready to deliver.' },
  { src: 'hkiss_bsbl2.jpg', alt: 'Yulin pitching in a Hotchkiss uniform with his throwing arm and blue glove extended', caption: 'A moment before the release.' },
  { src: 'pitching.jpg', alt: 'Yulin following through on a pitch on a floodlit baseball field at dusk', caption: 'Under the lights.' }
];
let photoIndex = 0;
function showPhoto(step) {
  photoIndex = (photoIndex + step + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const image = document.querySelector('#baseball-photo');
  image.src = photo.src;
  image.alt = photo.alt;
  document.querySelector('#photo-count').textContent = `${String(photoIndex + 1).padStart(2, '0')} / 03`;
  document.querySelector('#photo-caption').textContent = photo.caption;
}
document.querySelector('#previous-photo').addEventListener('click', () => showPhoto(-1));
document.querySelector('#next-photo').addEventListener('click', () => showPhoto(1));
document.querySelector('.gallery').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showPhoto(event.key === 'ArrowLeft' ? -1 : 1); }
});

let copyTimer;
document.querySelector('#copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText('yulin.zhu@link.cuhk.edu.hk');
    status.textContent = 'Email copied!';
  } catch {
    status.textContent = 'Select the email above to copy it, or click it to open your email app.';
  }
  copyTimer = setTimeout(() => { status.textContent = ''; }, 6000);
});
