/**
 * app.js — Trang Người Dùng Công Khai (Tr_Hiuz Portal)
 * - Tự động gửi Heartbeat lên server mỗi 8s để báo máy đang Online.
 * - Nhấp 3 lần vào tên Tr_Hiuz: chuyển hướng sang trang riêng admin.html.
 * - Ghi nhận lượt tải tiện ích và đồng bộ trực tiếp lên server.
 */

import { CATALOG_ITEMS, getCatalogItemById } from './catalog-data.js';
import { generateQrSvg } from './qr-generator.js';

const CUSTOM_TOOLS_KEY = 'tr_hiuz_custom_utilities_v2';
const EXTRA_ADDED_KEY = 'tr_hiuz_extra_changelog_v1';
const NEON_THEME_KEY = 'tr_hiuz_cyber_neon_v1';
const CLIENT_ID_KEY = 'tr_hiuz_client_id_v1';

let currentView = 'home';
let activeUtilityId = null;
let currentClientIp = '127.0.0.1';

function getOrCreateClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

const CLIENT_ID = getOrCreateClientId();

function getDeviceName() {
  const ua = navigator.userAgent;
  let browser = 'Chrome';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Brave')) browser = 'Brave';
  else if (ua.includes('CocCoc')) browser = 'Cốc Cốc';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  return `${browser} / Windows`;
}

function showToast(message) {
  const toast = document.getElementById('cyberToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2400);
}

/* 1. Real-Time Heartbeat: Báo trạng thái Online / Đang dùng */
async function sendHeartbeat(options = {}) {
  try {
    const payload = {
      clientId: CLIENT_ID,
      ip: currentClientIp,
      device: getDeviceName(),
      utility: options.utility || (currentView === 'home' ? 'Trang Chủ Portal' : `Xem ${currentView}`),
      isDownload: Boolean(options.isDownload)
    };

    const res = await fetch('/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ip) currentClientIp = data.ip;
    }
  } catch {}
}

function initHeartbeat() {
  fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2500) })
    .then((r) => r.json())
    .then((d) => {
      if (d && d.ip) currentClientIp = d.ip;
      sendHeartbeat();
    })
    .catch(() => sendHeartbeat());

  setInterval(() => {
    sendHeartbeat();
  }, 10000);
}

/* 2. Easter Egg: Nhấp 3 lần vào tên Tr_Hiuz -> Chuyển sang trang riêng admin.html */
function initAdminEasterEgg() {
  let clickCount = 0;
  let clickTimer = null;

  const triggers = [
    document.getElementById('adminTriggerName'),
    document.getElementById('brandAvatar')
  ].filter(Boolean);

  triggers.forEach((el) => {
    el.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 700);

      if (clickCount >= 3) {
        clickCount = 0;
        showToast('👑 Chuyển sang Trang Quản Trị Riêng của Tr_Hiuz...');
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 600);
      }
    });
  });
}

/* 3. Utilities & Theme */
function loadCustomUtilities() {
  try {
    const raw = localStorage.getItem(CUSTOM_TOOLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadExtraAddedMap() {
  try {
    const raw = localStorage.getItem(EXTRA_ADDED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getAllUtilities() {
  return [...CATALOG_ITEMS, ...loadCustomUtilities()];
}

function initTheme() {
  const saved = localStorage.getItem(NEON_THEME_KEY) || 'cyan';
  applyTheme(saved);

  document.querySelectorAll('[data-neon-select]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-neon-select') || 'cyan';
      applyTheme(mode);
      try {
        localStorage.setItem(NEON_THEME_KEY, mode);
      } catch {}
      renderQrCode();
    });
  });
}

function applyTheme(mode) {
  if (mode === 'cyan') document.documentElement.removeAttribute('data-neon');
  else document.documentElement.setAttribute('data-neon', mode);

  document.querySelectorAll('[data-neon-select]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-neon-select') === mode);
  });
}

/* 4. Navigation & Views */
function renderSidebarUtilities() {
  const container = document.getElementById('sidebarUtilityList');
  const badge = document.getElementById('navTotalBadge');
  const homeCount = document.getElementById('homeCountTools');
  const all = getAllUtilities();

  if (badge) badge.textContent = String(all.length);
  if (homeCount) homeCount.textContent = `${all.length} Tiện Ích`;
  if (!container) return;

  container.innerHTML = '';
  all.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `submenu-item${currentView === item.id ? ' is-active' : ''}`;
    btn.innerHTML = `
      <span>${item.shortMenuName || item.name}</span>
      <span style="font-size:0.76rem; opacity:0.6;">→</span>
    `;
    btn.addEventListener('click', () => openUtilityView(item.id));
    container.appendChild(btn);
  });
}

function showHomeView() {
  currentView = 'home';
  activeUtilityId = null;

  document.getElementById('viewHome').hidden = false;
  document.getElementById('viewUtility').hidden = true;
  document.getElementById('btnNavHome')?.classList.add('is-active');

  renderSidebarUtilities();
  sendHeartbeat({ utility: 'Trang Chủ Portal' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openUtilityView(utilityId) {
  const item = getAllUtilities().find((x) => x.id === utilityId) || getCatalogItemById(utilityId);
  if (!item) return;

  currentView = item.id;
  activeUtilityId = item.id;

  const acc = document.getElementById('utilitiesAccordion');
  if (acc) acc.open = true;

  document.getElementById('btnNavHome')?.classList.remove('is-active');
  renderSidebarUtilities();

  document.getElementById('utilDetailStatus').textContent = item.statusLabel || 'Sẵn Sàng';
  document.getElementById('utilDetailIcon').innerHTML = item.iconSvg || '🌸';
  document.getElementById('utilDetailBadge').textContent = item.badge || 'TIỆN ÍCH';
  document.getElementById('utilDetailTitle').textContent = item.vietnameseTitle || item.name;
  document.getElementById('utilDetailSummary').textContent = item.summary || item.tagline || '';
  document.getElementById('utilDetailPath').textContent = item.folderPath || 'D:\\Tr_Hiuz\\Tiện ích';

  // Action Buttons
  const actionsBox = document.getElementById('utilDetailActions');
  if (actionsBox) {
    actionsBox.innerHTML = '';
    if (item.actions?.primary) {
      const p = item.actions.primary;
      const btn = document.createElement('a');
      btn.href = p.href;
      if (p.isDownload) btn.setAttribute('download', '');
      btn.className = 'btn-cute-primary';
      btn.textContent = p.label;
      btn.addEventListener('click', () => {
        sendHeartbeat({ utility: item.vietnameseTitle || item.name, isDownload: true });
        showToast(`Đang tải ${item.vietnameseTitle || item.name}...`);
      });
      actionsBox.appendChild(btn);
    }
    if (item.actions?.secondary) {
      const s = item.actions.secondary;
      const btnSec = document.createElement('a');
      btnSec.href = s.href;
      if (s.isDownload) btnSec.setAttribute('download', '');
      btnSec.className = 'btn-cute-secondary';
      btnSec.textContent = s.label;
      btnSec.addEventListener('click', () => {
        sendHeartbeat({ utility: item.vietnameseTitle || item.name, isDownload: true });
      });
      actionsBox.appendChild(btnSec);
    }
  }

  // 1. Features
  const featBox = document.getElementById('utilFeaturesList');
  if (featBox) {
    featBox.innerHTML = (item.features || [])
      .map(
        (f) => `
        <div class="metric-box">
          <div style="font-weight:700; color:var(--text-bright); font-size:0.94rem;">✦ ${f.title}</div>
          <div style="font-size:0.86rem; color:var(--text-muted); margin-top:4px; line-height:1.5;">${f.desc}</div>
        </div>`
      )
      .join('');
  }

  // 2. Changelog
  renderUtilityAddedList(item);

  // 3. File Tree
  const treeBox = document.getElementById('utilFileTree');
  if (treeBox) {
    treeBox.innerHTML = (item.fileTree || [`${item.folderPath} — Sẵn sàng sử dụng`])
      .map((line) => `<li>📄 ${line}</li>`)
      .join('');
  }

  // 4. Steps
  const stepsBox = document.getElementById('utilStepsList');
  if (stepsBox) {
    stepsBox.innerHTML = (item.steps || [])
      .map(
        (s) => `
        <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--glass-border);">
          <span class="status-pill" style="min-width:32px; justify-content:center;">B${s.step}</span>
          <span style="font-size:0.88rem; color:var(--text-bright); line-height:1.5;">${s.text}</span>
        </div>`
      )
      .join('');
  }

  document.getElementById('viewHome').hidden = true;
  document.getElementById('viewUtility').hidden = false;
  sendHeartbeat({ utility: `Đang xem ${item.vietnameseTitle || item.name}` });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderUtilityAddedList(item) {
  const listEl = document.getElementById('utilAddedList');
  if (!listEl) return;

  const extraMap = loadExtraAddedMap();
  const extraItems = Array.isArray(extraMap[item.id]) ? extraMap[item.id] : [];
  const combined = [...(item.whatsAdded || []), ...extraItems];

  listEl.innerHTML = combined
    .map((txt) => `<li><span style="color:var(--status-online); font-weight:700;">✔</span><span>${txt}</span></li>`)
    .join('');
}

/* 5. Render Home Cards */
function renderHomeCards() {
  const grid = document.getElementById('homeCatalogGrid');
  if (!grid) return;

  const allItems = getAllUtilities();
  grid.innerHTML = '';

  allItems.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'cyber-card';

    const pillsHtml = (item.pills || [])
      .map((p) => `<span class="tech-tag">${p}</span>`)
      .join('');

    card.innerHTML = `
      <div>
        <div class="card-top">
          <div class="card-icon-wrap">${item.iconSvg || '🌸'}</div>
          <span class="status-pill">
            <span class="status-dot"></span>
            <span>${item.statusLabel || 'Sẵn Sàng'}</span>
          </span>
        </div>
        <div style="margin-top: 14px;">
          <div class="eyebrow-tag">${item.badge || 'TIỆN ÍCH'}</div>
          <h4 class="card-title" style="margin-top: 4px;">${item.vietnameseTitle || item.name}</h4>
          <p class="card-tagline">${item.tagline || ''}</p>
        </div>
      </div>

      <div>
        <div class="card-tags" style="margin-bottom: 16px;">${pillsHtml}</div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-cute-primary btn-card-action" style="flex: 1;">
            ${item.actions?.primary?.label || 'Cài Đặt'}
          </button>
          <button type="button" class="btn-glass btn-card-detail" style="padding: 9px 14px;">
            Chi Tiết 👀
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-card-action')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sendHeartbeat({ utility: item.vietnameseTitle || item.name, isDownload: true });
      if (item.actions?.primary?.href) {
        const tempLink = document.createElement('a');
        tempLink.href = item.actions.primary.href;
        if (item.actions.primary.isDownload) tempLink.setAttribute('download', '');
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
        showToast(`Đang tải ${item.vietnameseTitle || item.name}...`);
      }
    });

    card.querySelector('.btn-card-detail')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openUtilityView(item.id);
    });

    card.addEventListener('click', () => openUtilityView(item.id));
    grid.appendChild(card);
  });
}

/* 6. QR Code */
function renderQrCode() {
  const input = document.getElementById('qrCustomInput');
  const box = document.getElementById('qrSvgContainer');
  if (!input || !box) return;

  const value = input.value.trim() || 'downloads/cutetube.zip';
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--neon-primary').trim() || '#ff9ebb';

  box.innerHTML = generateQrSvg(value, {
    size: 160,
    margin: 2,
    fgColor: accent,
    bgColor: '#181224'
  });
}

function initQrGenerator() {
  const input = document.getElementById('qrCustomInput');
  renderQrCode();
  input?.addEventListener('input', renderQrCode);

  document.querySelectorAll('[data-qr-val]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-qr-val]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (input) {
        input.value = btn.getAttribute('data-qr-val') || '';
        renderQrCode();
      }
    });
  });
}

/* 7. Đồng bộ cấu hình từ server */
async function syncServerConfig() {
  try {
    const res = await fetch('/api/admin/config');
    if (res.ok) {
      const cfg = await res.json();
      if (cfg.title) {
        const heading = document.getElementById('homeHeading');
        if (heading) heading.textContent = cfg.title;
      }
      if (cfg.author) {
        const authorHeading = document.querySelector('.brand-name-box h1');
        if (authorHeading) authorHeading.textContent = cfg.author;
      }
      if (cfg.subtitle) {
        const sub = document.getElementById('homeSubtitle');
        if (sub) sub.textContent = cfg.subtitle;
      }
      if (cfg.customUtilities && Array.isArray(cfg.customUtilities)) {
        localStorage.setItem(CUSTOM_TOOLS_KEY, JSON.stringify(cfg.customUtilities));
        renderSidebarUtilities();
        renderHomeCards();
      }
      if (cfg.extraNotes) {
        localStorage.setItem(EXTRA_ADDED_KEY, JSON.stringify(cfg.extraNotes));
      }
    }
  } catch {}
}

/* Bootstrap */
document.addEventListener('DOMContentLoaded', () => {
  initHeartbeat();
  initTheme();
  renderSidebarUtilities();
  renderHomeCards();
  initQrGenerator();
  initAdminEasterEgg();
  syncServerConfig();

  document.getElementById('btnNavHome')?.addEventListener('click', showHomeView);
  document.getElementById('btnBackToHome')?.addEventListener('click', showHomeView);

  document.getElementById('btnCopyChromeExtUrl')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('chrome://extensions');
      showToast('Đã copy "chrome://extensions" vào khay nhớ tạm!');
    } catch {
      showToast('chrome://extensions');
    }
  });

  document.getElementById('btnCopyFolderPath')?.addEventListener('click', async () => {
    const pathText = document.getElementById('utilDetailPath')?.textContent || '';
    try {
      await navigator.clipboard.writeText(pathText);
      showToast(`Đã copy: ${pathText}`);
    } catch {
      showToast(pathText);
    }
  });

  document.querySelectorAll('[data-track-dl]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-track-dl') || '';
      let utilName = 'Tiện ích';
      if (tag.includes('cute')) utilName = 'CuteTube Personalizer';
      else if (tag.includes('adshield')) utilName = 'AdShield Pro MV3';
      else if (tag.includes('facebook')) utilName = 'Facebook Toolkit Pro';
      sendHeartbeat({ utility: utilName, isDownload: true });
      showToast(`Đang tải trình cài đặt ${utilName}...`);
    });
  });
});
