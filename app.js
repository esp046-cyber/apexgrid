'use strict';

// ---------- Service worker ----------
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return; // skip first install
    reloading = true;
    window.location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW registered, scope:', reg.scope))
      .catch((err) => console.error('SW registration failed:', err));
  });
}

// ---------- DOM ----------
const tabs = Array.from(document.querySelectorAll('.nav-tab'));
const tabPanes = Array.from(document.querySelectorAll('.tab-pane'));
const monthSelect = document.getElementById('month-select');
const snapshotSub = document.getElementById('snapshot-sub');
const driversContainer = document.getElementById('drivers-container');
const connectionStatus = document.getElementById('connection-status');
const statusText = document.getElementById('status-text');
const installBanner = document.getElementById('pwa-install-banner');
const installBtn = document.getElementById('install-btn');
const installText = document.getElementById('install-text');
const dismissInstallBtn = document.getElementById('dismiss-install');

const DISMISS_DAYS = 14;
let deferredPrompt = null;
let standingsData = null;

// ---------- Helpers ----------
function storeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function storeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ } }

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function labelled(className, label, value) {
  const wrap = el('div', className);
  wrap.appendChild(el('strong', null, label + ' '));
  wrap.appendChild(document.createTextNode(value));
  return wrap;
}

// ---------- Tabs ----------
function activateTab(tab, focus) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.classList.toggle('active', selected);
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
  });
  tabPanes.forEach((pane) => {
    const show = pane.id === tab.dataset.tab;
    pane.classList.toggle('active', show);
    pane.hidden = !show;
  });
  if (focus) tab.focus();
  storeSet('apexgrid:tab', tab.dataset.tab);
  window.scrollTo({ top: 0 });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab, false));
  tab.addEventListener('keydown', (e) => {
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); activateTab(next, true); }
  });
});

// ---------- Data loading with skeleton / error / empty states ----------
function showSkeleton() {
  driversContainer.setAttribute('aria-busy', 'true');
  driversContainer.textContent = '';
  for (let i = 0; i < 10; i += 1) {
    const card = el('div', 'skeleton-card');
    card.setAttribute('aria-hidden', 'true');
    card.appendChild(el('div', 'skeleton-rank'));
    const body = el('div', 'skeleton-body');
    body.appendChild(el('div', 'skeleton-line w60'));
    body.appendChild(el('div', 'skeleton-line w40'));
    body.appendChild(el('div', 'skeleton-line w90'));
    body.appendChild(el('div', 'skeleton-line w90'));
    card.appendChild(body);
    driversContainer.appendChild(card);
  }
}

function showState(title, message, withRetry) {
  driversContainer.setAttribute('aria-busy', 'false');
  driversContainer.textContent = '';
  const card = el('div', 'state-card');
  card.setAttribute('role', 'alert');
  card.appendChild(el('h3', null, title));
  card.appendChild(el('p', null, message));
  if (withRetry) {
    const btn = el('button', 'btn btn-primary', 'Try again');
    btn.type = 'button';
    btn.addEventListener('click', () => init(true));
    card.appendChild(btn);
  }
  driversContainer.appendChild(card);
}

async function loadStandings() {
  const response = await fetch('./data/standings.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  const data = await response.json();
  if (!data || data.schema_version !== 2 || !data.snapshots || !Array.isArray(data.month_order)) {
    throw new Error('Malformed standings data');
  }
  return data;
}

// ---------- Drivers ----------
function renderDrivers(month) {
  const snaps = standingsData.snapshots;
  const order = standingsData.month_order;
  const key = snaps[month] ? month : order[order.length - 1];
  const snap = snaps[key];
  const prevKey = order[order.indexOf(key) - 1];
  const prevRanks = {};
  if (prevKey && snaps[prevKey]) snaps[prevKey].drivers.forEach((d) => { prevRanks[d.id] = d.rank; });

  snapshotSub.textContent = snap.as_of;
  driversContainer.textContent = '';
  driversContainer.setAttribute('aria-busy', 'false');

  if (!snap.drivers || snap.drivers.length === 0) {
    showState('No standings yet', 'There is no published Top 10 for this month.', false);
    return;
  }

  const leaderPoints = snap.drivers[0].points;
  snap.drivers.forEach((d) => {
    const isChampion = d.rank === 1 && key === order[order.length - 1];
    const card = el('article', 'driver-card' + (isChampion ? ' champion' : ''));

    const rankBox = el('div', 'driver-rank');
    rankBox.setAttribute('aria-label', 'Rank ' + d.rank);
    rankBox.appendChild(el('span', null, '#' + d.rank));
    if (prevKey && prevRanks[d.id]) {
      const diff = prevRanks[d.id] - d.rank;
      const move = el('span', 'rank-move ' + (diff > 0 ? 'up' : diff < 0 ? 'down' : ''),
        diff > 0 ? '▲' + diff : diff < 0 ? '▼' + Math.abs(diff) : '–');
      move.setAttribute('aria-label', diff > 0 ? 'Up ' + diff + ' since ' + snaps[prevKey].label
        : diff < 0 ? 'Down ' + Math.abs(diff) + ' since ' + snaps[prevKey].label : 'No change');
      rankBox.appendChild(move);
    }

    const body = el('div', 'driver-body');
    const top = el('div', 'driver-top');
    const who = el('div');
    who.appendChild(el('div', 'driver-name', d.name));
    who.appendChild(el('span', 'team-pill', d.team));
    const pts = el('div', 'points-wrap');
    pts.appendChild(el('span', 'points-tag', (d.points_approx ? '≈' : '') + d.points + ' PTS'));
    if (d.rank > 1) pts.appendChild(el('span', 'gap-tag', '-' + (leaderPoints - d.points) + ' to leader'));
    top.appendChild(who);
    top.appendChild(pts);

    body.appendChild(top);
    body.appendChild(labelled('driver-car-info', 'Car:', d.car.chassis + ' (' + d.car.power_unit + ' power unit)'));
    body.appendChild(labelled('driver-awards', 'Status:', d.status));
    body.appendChild(labelled('driver-known-for', 'Known for:', d.known_for));

    card.appendChild(rankBox);
    card.appendChild(body);
    driversContainer.appendChild(card);
  });

  if (snap.drivers.some((d) => d.points_approx)) {
    driversContainer.appendChild(el('p', 'data-note', '≈ points derived from the next official table; may differ slightly.'));
  }
}

async function init(isRetry) {
  showSkeleton();
  try {
    standingsData = await loadStandings();
  } catch (err) {
    console.error('Standings failed to load:', err);
    showState(
      navigator.onLine ? 'Couldn’t load standings' : 'You’re offline',
      navigator.onLine
        ? 'Something went wrong fetching the latest data.'
        : 'Standings aren’t saved on this device yet. Reconnect once and they’ll be available offline.',
      true
    );
    return;
  }
  const saved = storeGet('apexgrid:month');
  if (!isRetry && saved && standingsData.snapshots[saved]) monthSelect.value = saved;
  renderDrivers(monthSelect.value);
}

monthSelect.addEventListener('change', (e) => {
  storeSet('apexgrid:month', e.target.value);
  if (standingsData) renderDrivers(e.target.value);
});

// ---------- Online / offline ----------
function updateOnlineStatus() {
  const online = navigator.onLine;
  connectionStatus.className = 'status-indicator ' + (online ? 'online' : 'offline');
  statusText.textContent = online ? 'Online' : 'Offline (cached)';
}
window.addEventListener('online', () => { updateOnlineStatus(); if (!standingsData) init(true); });
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// ---------- Install flow ----------
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function dismissedRecently() {
  const ts = Number(storeGet('apexgrid:install-dismissed'));
  return ts && Date.now() - ts < DISMISS_DAYS * 86400000;
}
function hideInstallBanner(persist) {
  installBanner.classList.add('hidden');
  if (persist) storeSet('apexgrid:install-dismissed', String(Date.now()));
}

if (storeGet('apexgrid:installed') === '1') {
  /* already installed on this browser: never show */
} else if (!isStandalone && !dismissedRecently()) {
  if (isIOS) {
    // iOS has no beforeinstallprompt: show manual Add to Home Screen instructions.
    installText.textContent = 'Tap the Share button, then “Add to Home Screen”.';
    installBtn.classList.add('hidden');
    installBanner.classList.remove('hidden');
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
    installBanner.classList.remove('hidden');
  });
}

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  console.log('Install prompt outcome:', choice.outcome);
  deferredPrompt = null;
  hideInstallBanner(choice.outcome !== 'accepted');
});

dismissInstallBtn.addEventListener('click', () => hideInstallBanner(true));

window.addEventListener('appinstalled', () => {
  storeSet('apexgrid:installed', '1');
  hideInstallBanner(false);
  deferredPrompt = null;
  console.log('ApexGrid installed');
});

// ---------- Init ----------
const savedTab = storeGet('apexgrid:tab');
const initialTab = tabs.find((t) => t.dataset.tab === savedTab);
if (initialTab) activateTab(initialTab, false);
init(false);
