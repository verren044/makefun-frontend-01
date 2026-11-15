// The four pages, each a function from API data to HTML.

import { date, esc, money, timeLeft } from './format.js';

/** The reward as it stands now: the prize plus any entry fees paid into it. */
const pot = (b) => money(b.potUsd ?? b.rewardAmount);

/** The entry fee, when the bounty charges one. */
const fee = (b) => (b.entryFeeUsd ? `${money(b.entryFeeUsd)} entry fee` : 'free entry');

/** One leaderboard cell: judge win rates are micro units, sizes are bytes. */
function cell(key, entry) {
  const v = entry.values?.[key];
  if (v == null) return '—';
  if (key === 'valid') return v ? '✓' : '✗';
  if (key === 'bytes') return v >= 1048576 ? `${(v / 1048576).toFixed(2)} MB` : `${(v / 1024).toFixed(1)} KB`;
  if (key.startsWith('judge')) return `${(v / 10000).toFixed(2)}%`;
  return entry.display?.[key] ?? String(v);
}

export function board(data, state) {
  const cats = [...new Set(data.items.map((b) => b.category).filter(Boolean))].sort();
  const rows = state.filtered
    .map(
      (b) => `<tr>
        <td><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a><br><small>${esc(b.category ?? '')}</small></td>
        <td class="num">${pot(b)}</td>
        <td>${fee(b)}</td>
        <td>${timeLeft(b.deadline)}</td>
        <td class="num">${b.submissionCount}</td>
      </tr>`,
    )
    .join('');
  return `<h1>Open bounties</h1>
  <p class="meta">${state.filtered.length} of ${data.items.length} bounties · pots update live · <span id="updated"></span></p>
  <div class="filters" role="group" aria-label="Filter and sort">
    <label>Category
      <select id="cat">
        <option value="">All categories</option>
        ${cats.map((c) => `<option${state.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}
      </select>
    </label>
    <label>Sort
      <select id="sort">
        <option value="deadline"${state.sort === 'deadline' ? ' selected' : ''}>Ending soonest</option>
        <option value="pot"${state.sort === 'pot' ? ' selected' : ''}>Biggest pot</option>
        <option value="entries"${state.sort === 'entries' ? ' selected' : ''}>Most entries</option>
      </select>
    </label>
  </div>
  ${rows
    ? `<table class="board">
      <thead><tr><th scope="col">Bounty</th><th scope="col" class="num">Pot</th><th scope="col">Entry</th><th scope="col">Time left</th><th scope="col" class="num">Entries</th></tr></thead>
      <tbody>${rows}</tbody></table>`
    : `<p>No bounties match. <button id="clear" type="button">Clear filters</button></p>`}`;
}

export function bounty(b) {
  const rewards = b.rewards
    ? `<h2>Rewards</h2><table class="rewards"><thead><tr><th scope="col">Place</th><th scope="col" class="num">Prize</th></tr></thead><tbody>${
        Object.entries(b.rewards)
          .map(([place, amount]) => `<tr><td>${esc(place)}</td><td class="num">${money(amount)}</td></tr>`)
          .join('')
      }</tbody></table>`
    : '';
  return `
    <p><a href="#/">← All bounties</a></p>
    <h1>${esc(b.title)}</h1>
    <p>${esc(b.summary ?? '')}</p>
    <dl>
      <dt>Pot now</dt><dd>${pot(b)}${b.entryFeePayers ? ` (${b.entryFeePayers} entry fees paid in)` : ''}</dd>
      ${b.entryFeeUsd ? `<dt>Entry fee</dt><dd>${money(b.entryFeeUsd)}</dd>` : '<dt>Entry fee</dt><dd>None</dd>'}
      <dt>Deadline</dt><dd>${date(b.deadline)} (${timeLeft(b.deadline)})</dd>
      <dt>Entries</dt><dd>${b.submissionCount}</dd>
      ${b.category ? `<dt>Category</dt><dd>${esc(b.category)}</dd>` : ''}
      ${b.sponsor?.name ? `<dt>Sponsor</dt><dd>${esc(b.sponsor.name)}</dd>` : ''}
    </dl>
    <p><a href="#/leaderboard/${encodeURIComponent(b.slug)}">Leaderboard →</a> · <a href="https://make.fun/bounty/${encodeURIComponent(b.slug)}">Open on make.fun ↗</a></p>
    ${rewards}
    <h2>Description</h2>
    <div class="description">${esc(b.description ?? '')}</div>`;
}

export function leaderboard(lb) {
  const cols = lb.columns.filter((c) => !c.hidden);
  const rows = lb.entries
    .slice(0, 100)
    .map(
      (e) => `<tr>
        <td class="num">${e.rank}</td>
        <td><a href="#/profile/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a><br><small>${esc(e.title ?? '')}</small></td>
        ${cols.map((c) => `<td class="num">${cell(c.key, e)}</td>`).join('')}
      </tr>`,
    )
    .join('');
  const viewLinks = (lb.views ?? [])
    .map((v) => `<a href="#/leaderboard/${encodeURIComponent(lb.competition.slug)}?view=${encodeURIComponent(v)}"${v === lb.view ? ' aria-current="true"' : ''}>${esc(v)}</a>`)
    .join(' · ');
  return `
    <p><a href="#/bounty/${encodeURIComponent(lb.competition.slug)}">← ${esc(lb.competition.title)}</a></p>
    <h1>Leaderboard: ${esc(lb.competition.title)}</h1>
    <p class="meta">${lb.entries.length} entries · phase ${esc(lb.phase?.title ?? lb.phase?.key ?? '')} · views: ${viewLinks}</p>
    ${rows
      ? `<table class="board">
        <thead><tr><th scope="col" class="num">#</th><th scope="col">Entry</th>${cols.map((c) => `<th scope="col" class="num">${esc(c.title)}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody></table>
      <p class="meta">Showing the top 100 of ${lb.entries.length}.</p>`
      : '<p>No entries yet.</p>'}`;
}

export function profile(p) {
  const r = p.record ?? {};
  const solutions = (p.solutions ?? [])
    .map(
      (s) => `<li><a href="#/bounty/${encodeURIComponent(s.competition.slug)}">${esc(s.title)}</a>
        <small> — ${esc(s.competition.title)} · ${date(s.competition.deadline)}</small></li>`,
    )
    .join('');
  return `
    <p><a href="#/">← All bounties</a></p>
    <h1>@${esc(p.handle)}</h1>
    ${p.bio ? `<p>${esc(p.bio)}</p>` : ''}
    <dl>
      <dt>Joined</dt><dd>${date(p.joined_at)}</dd>
      <dt>Competitions entered</dt><dd>${r.competitions_entered ?? 0}</dd>
      <dt>Placements</dt><dd>${r.competitions_placed ?? 0} (${r.competitions_won ?? 0} wins)</dd>
      <dt>Best placement</dt><dd>${r.best_placement ? `#${r.best_placement}` : '—'}</dd>
      <dt>Prize money</dt><dd>${money(r.prize_usd ?? 0)}</dd>
      ${p.wallet?.address ? `<dt>Wallet</dt><dd><a href="${esc(p.wallet.explorer_url ?? '#')}">${esc(p.wallet.address.slice(0, 8))}…${esc(p.wallet.address.slice(-4))}</a></dd>` : ''}
    </dl>
    <h2>Entries</h2>
    ${solutions ? `<ul>${solutions}</ul>` : '<p>No public entries yet.</p>'}`;
}
