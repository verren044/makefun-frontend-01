// A make.fun frontend: board, bounty page, leaderboard and profile, on hash routes.
//
//   #/                          the board (search, category filter, sort)
//   #/bounty/<slug>            one bounty, with rewards
//   #/leaderboard/<slug>[?view=]  a bounty's leaderboard
//   #/profile/<handle>         an account's public profile
//
// window.__shotReady is false while a page loads and true once its data is on screen, so a
// screenshot script knows when to capture. Keyboard: "/" focuses search, "j"/"k" move between
// board rows, "t" toggles the theme.

import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, leaderboard, profile } from './views.js';

const app = document.getElementById('app');
const search = document.getElementById('q');
const themeBtn = document.getElementById('theme');

function setTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  try { localStorage.setItem('mf-theme', mode); } catch { /* private mode */ }
  themeBtn.textContent = mode === 'dark' ? 'Light' : 'Dark';
  themeBtn.setAttribute('aria-pressed', String(mode === 'dark'));
}

function initTheme() {
  const saved = (() => { try { return localStorage.getItem('mf-theme'); } catch { return null; } })();
  const mode = saved ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(mode);
}
initTheme();
themeBtn.addEventListener('click', () => {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Board state, kept across renders and visits (session only).
const boardState = { q: '', cat: '', sort: 'deadline', filtered: [], data: null };

function applyBoardFilters() {
  const { data } = boardState;
  if (!data) return;
  const q = boardState.q.trim().toLowerCase();
  let items = data.items.filter(
    (b) =>
      (!boardState.cat || b.category === boardState.cat) &&
      (!q || `${b.title} ${b.slug} ${b.category ?? ''}`.toLowerCase().includes(q)),
  );
  const by = {
    deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
    pot: (a, b) => Number(b.potUsd ?? b.rewardAmount) - Number(a.potUsd ?? a.rewardAmount),
    entries: (a, b) => b.submissionCount - a.submissionCount,
  };
  items = [...items].sort(by[boardState.sort] ?? by.deadline);
  boardState.filtered = items;
}

function renderBoard() {
  app.innerHTML = board(boardState.data, boardState);
  const updated = document.getElementById('updated');
  if (updated) updated.textContent = `updated ${new Date().toLocaleTimeString()}`;
  document.getElementById('cat').addEventListener('change', (e) => {
    boardState.cat = e.target.value;
    applyBoardFilters();
    renderBoard();
  });
  document.getElementById('sort').addEventListener('change', (e) => {
    boardState.sort = e.target.value;
    applyBoardFilters();
    renderBoard();
  });
  document.getElementById('clear')?.addEventListener('click', () => {
    boardState.q = '';
    boardState.cat = '';
    search.value = '';
    applyBoardFilters();
    renderBoard();
  });
}

search.addEventListener('input', () => {
  boardState.q = search.value;
  if (!boardState.data) return;
  applyBoardFilters();
  if (location.hash === '#/' || location.hash === '') renderBoard();
});

function errorBox(err, retry) {
  return `<p role="alert">Could not load this page: ${err.message}. <button id="retry" type="button">Retry</button></p>`;
}

async function render() {
  window.__shotReady = false;
  app.innerHTML = '<p>Loading…</p>';
  const hash = location.hash || '#/';
  const query = new URLSearchParams(hash.split('?')[1] ?? '');
  const path = hash.split('?')[0];
  try {
    let m;
    if ((m = path.match(/^#\/bounty\/([^/]+)/))) {
      const b = await getBounty(decodeURIComponent(m[1]));
      document.title = `${b.title} | make.fun bounties`;
      app.innerHTML = bounty(b);
    } else if ((m = path.match(/^#\/leaderboard\/([^/]+)/))) {
      const lb = await getLeaderboard(decodeURIComponent(m[1]), query.get('view'));
      document.title = `Leaderboard: ${lb.competition.title} | make.fun bounties`;
      app.innerHTML = leaderboard(lb);
    } else if ((m = path.match(/^#\/profile\/([^/]+)/))) {
      const p = await getProfile(decodeURIComponent(m[1]));
      document.title = `@${p.handle} | make.fun bounties`;
      app.innerHTML = profile(p);
    } else {
      if (!boardState.data) boardState.data = await getBounties();
      applyBoardFilters();
      document.title = 'make.fun bounties';
      renderBoard();
    }
  } catch (err) {
    app.innerHTML = errorBox(err);
    document.getElementById('retry')?.addEventListener('click', render);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== search) {
    e.preventDefault();
    search.focus();
    return;
  }
  if (e.key.toLowerCase() === 't' && document.activeElement !== search && !e.metaKey && !e.ctrlKey) {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    return;
  }
  if ((e.key === 'j' || e.key === 'k') && document.activeElement !== search) {
    const rows = [...document.querySelectorAll('.board tbody a')];
    if (!rows.length) return;
    const i = rows.indexOf(document.activeElement);
    const next = e.key === 'j' ? rows[Math.min(i + 1, rows.length - 1)] : rows[Math.max(i - 1, 0)];
    (next ?? rows[0]).focus();
    e.preventDefault();
  }
});

window.addEventListener('hashchange', render);
render();
