/**
 * admin.js — Trang Quản Trị Riêng Biệt (Tr_Hiuz Admin)
 * - Giám sát IP đang Online / Offline theo thời gian thực (polling 3s)
 * - Ghi chú & cập nhật tiện ích
 * - Thêm tiện ích mới
 * - Cấu hình tiêu đề, tên tác giả, lời giới thiệu
 */

import { CATALOG_ITEMS } from './catalog-data.js';

const CUSTOM_TOOLS_KEY = 'tr_hiuz_custom_utilities_v2';
const EXTRA_ADDED_KEY = 'tr_hiuz_extra_changelog_v1';
const NEON_THEME_KEY = 'tr_hiuz_cyber_neon_v1';
const CONFIG_KEY = 'tr_hiuz_portal_config_v1';

let statusFilter = 'all';
let latestClients = [];

function showToast(message) {
  const toast = document.getElementById('cyberToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2600);
}

function formatDuration(totalSec) {
  const sec = Math.max(0, Math.floor(totalSec || 0));
  if (sec < 60) return `${sec} giây`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  if (min < 60) return `${min} phút ${remSec} giây`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return `${hr} giờ ${remMin} phút`;
}

/* 1. Theme Switcher */
function initThemeSwitcher() {
  const saved = localStorage.getItem(NEON_THEME_KEY) || 'cyan';
  applyTheme(saved);

  document.querySelectorAll('[data-neon-select]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-neon-select') || 'cyan';
      applyTheme(mode);
      try {
        localStorage.setItem(NEON_THEME_KEY, mode);
      } catch {}
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

/* 2. Sidebar Section Navigation */
function initSectionNavigation() {
  const sections = {
    liveMonitor: document.getElementById('secLiveMonitor'),
    notesManager: document.getElementById('secNotesManager'),
    addUtility: document.getElementById('secAddUtility'),
    webConfig: document.getElementById('secWebConfig')
  };

  document.querySelectorAll('[data-admin-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-admin-section');
      document.querySelectorAll('[data-admin-section]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      Object.entries(sections).forEach(([key, el]) => {
        if (el) el.hidden = key !== target;
      });
    });
  });
}

/* 3. Real-Time IP & Online/Offline Polling */
async function fetchClients() {
  try {
    const res = await fetch('/api/admin/clients', { cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    latestClients = Array.isArray(data.clients) ? data.clients : [];

    document.getElementById('statOnline').textContent = `${data.onlineCount || 0} Máy`;
    document.getElementById('statOffline').textContent = `${data.offlineCount || 0} Máy`;
    document.getElementById('statTotal').textContent = `${data.totalCount || 0} IP`;
    document.getElementById('badgeOnlineCount').textContent = `${data.onlineCount || 0} ON`;
    document.getElementById('lastUpdatedLabel').textContent = `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN')}`;

    renderClientsTable();
  } catch {
    document.getElementById('lastUpdatedLabel').textContent = 'Không kết nối được server API (chạy node server.js)';
  }
}

function renderClientsTable() {
  const tbody = document.getElementById('adminClientsBody');
  if (!tbody) return;

  const filtered = latestClients.filter((c) => {
    if (statusFilter === 'online') return c.isOnline;
    if (statusFilter === 'offline') return !c.isOnline;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">Không có địa chỉ IP nào khớp bộ lọc.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const statusBadge = c.isOnline
        ? `<span class="status-pill"><span class="status-dot"></span> Đang hoạt động</span>`
        : `<span class="status-pill" style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.14); color:var(--text-muted);"><span class="status-dot" style="box-shadow:none;"></span> Đã tắt (Offline)</span>`;

      const timeCell = c.isOnline
        ? `<span style="color:var(--status-online); font-weight:600;">⏱️ Đang bật (${formatDuration(c.activeSeconds)})</span>`
        : `<span style="color:var(--text-muted);">💤 Tắt cách đây ${formatDuration(c.offlineSeconds)}</span>`;

      return `
        <tr>
          <td>${statusBadge}</td>
          <td style="font-family:var(--font-mono); font-weight:700; color:var(--neon-primary);">${c.ip}</td>
          <td>${timeCell}</td>
          <td><strong style="color:var(--text-bright);">${c.utility || 'Chưa rõ'}</strong></td>
          <td style="color:var(--text-muted); font-size:0.8rem;">${c.device || 'Chrome'}</td>
        </tr>`;
    })
    .join('');
}

function initMonitorControls() {
  document.querySelectorAll('[data-filter-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      statusFilter = btn.getAttribute('data-filter-status') || 'all';
      document.querySelectorAll('[data-filter-status]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderClientsTable();
    });
  });

  document.getElementById('btnRefreshClients')?.addEventListener('click', () => {
    fetchClients();
    showToast('Đã làm mới danh sách IP!');
  });

  document.getElementById('btnClearClients')?.addEventListener('click', async () => {
    if (!confirm('Xóa toàn bộ nhật ký IP đã ghi nhận?')) return;
    await fetch('/api/admin/clients', { method: 'DELETE' });
    fetchClients();
    showToast('Đã xóa sạch nhật ký IP!');
  });
}

/* 4. Notes, Custom Utilities & Config Sync */
function getCustomUtilities() {
  try {
    const raw = localStorage.getItem(CUSTOM_TOOLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getExtraNotesMap() {
  try {
    const raw = localStorage.getItem(EXTRA_ADDED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function syncToServerConfig(payload) {
  try {
    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {}
}

function populateUtilityDropdown() {
  const select = document.getElementById('selectAdminUtility');
  if (!select) return;
  const all = [...CATALOG_ITEMS, ...getCustomUtilities()];
  select.innerHTML = all
    .map((item) => `<option value="${item.id}">${item.shortMenuName || item.name}</option>`)
    .join('');
  renderSavedNotesForSelected();
}

function renderSavedNotesForSelected() {
  const select = document.getElementById('selectAdminUtility');
  const listEl = document.getElementById('adminSavedNotesList');
  if (!select || !listEl) return;

  const utilId = select.value;
  const map = getExtraNotesMap();
  const notes = Array.isArray(map[utilId]) ? map[utilId] : [];

  if (notes.length === 0) {
    listEl.innerHTML = `<li style="color:var(--text-muted);">Chưa có ghi chú thêm nào cho tiện ích này.</li>`;
    return;
  }

  listEl.innerHTML = notes
    .map((n) => `<li><span style="color:var(--status-online);">✔</span><span>${n}</span></li>`)
    .join('');
}

function initAdminForms() {
  document.getElementById('selectAdminUtility')?.addEventListener('change', renderSavedNotesForSelected);

  // Save Note
  document.getElementById('formAdminNote')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const utilId = document.getElementById('selectAdminUtility')?.value;
    const note = document.getElementById('adminNoteInput')?.value.trim();
    if (!utilId || !note) return;

    const map = getExtraNotesMap();
    if (!Array.isArray(map[utilId])) map[utilId] = [];
    map[utilId].push(note);
    localStorage.setItem(EXTRA_ADDED_KEY, JSON.stringify(map));

    await syncToServerConfig({ extraNotes: map });
    document.getElementById('adminNoteInput').value = '';
    renderSavedNotesForSelected();
    showToast('Đã lưu ghi chú cập nhật!');
  });

  // Add New Utility
  document.getElementById('formAddUtilityPage')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('newTitle').value.trim();
    const folderPath = document.getElementById('newFolderPath').value.trim();
    const tagline = document.getElementById('newTagline').value.trim();
    const addedNote = document.getElementById('newWhatsAdded').value.trim() || 'Bản khởi tạo hoàn chỉnh.';
    if (!title) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      shortMenuName: `✨ ${title.split('—')[0].trim()}`,
      name: title,
      vietnameseTitle: title,
      tagline,
      summary: tagline,
      category: 'extensions',
      folderPath,
      statusLabel: 'Tiện Ích Cá Nhân',
      badge: 'CUSTOM UTILITY · MV3',
      iconSvg: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#282041"/><circle cx="50" cy="50" r="30" fill="#130f1e"/><path d="M50 32 V68 M32 50 H68" stroke="#ff9ebb" stroke-width="4" stroke-linecap="round"/></svg>`,
      pills: ['✨ Cá Nhân', 'Sẵn Sàng'],
      features: [{ title: 'Tính năng chính', desc: tagline }],
      whatsAdded: [addedNote],
      fileTree: [`${folderPath} — Thư mục mã nguồn`],
      steps: [{ step: 1, text: `Mở thư mục ${folderPath} và nạp vào trình duyệt Chrome.` }],
      actions: {
        primary: { label: '📂 Xem Chi Tiết', href: '#', isDownload: false }
      }
    };

    const customList = getCustomUtilities();
    customList.push(newItem);
    localStorage.setItem(CUSTOM_TOOLS_KEY, JSON.stringify(customList));

    await syncToServerConfig({ customUtilities: customList });
    populateUtilityDropdown();
    e.target.reset();
    showToast(`Đã thêm "${title}" vào kho tiện ích!`);
  });

  // Load saved site config
  (async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.title) document.getElementById('cfgTitle').value = cfg.title;
        if (cfg.author) document.getElementById('cfgAuthor').value = cfg.author;
        if (cfg.subtitle) document.getElementById('cfgSubtitle').value = cfg.subtitle;
        if (cfg.customUtilities) localStorage.setItem(CUSTOM_TOOLS_KEY, JSON.stringify(cfg.customUtilities));
        if (cfg.extraNotes) localStorage.setItem(EXTRA_ADDED_KEY, JSON.stringify(cfg.extraNotes));
        populateUtilityDropdown();
      }
    } catch {}
  })();

  // Save Site Config
  document.getElementById('formWebConfig')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('cfgTitle').value.trim();
    const author = document.getElementById('cfgAuthor').value.trim();
    const subtitle = document.getElementById('cfgSubtitle').value.trim();

    localStorage.setItem(CONFIG_KEY, JSON.stringify({ title, author, subtitle }));
    await syncToServerConfig({ title, author, subtitle });
    showToast('Đã lưu cấu hình trang web!');
  });

  // Reset All
  document.getElementById('btnResetConfig')?.addEventListener('click', async () => {
    if (!confirm('Khôi phục toàn bộ cấu hình về mặc định?')) return;
    localStorage.removeItem(CUSTOM_TOOLS_KEY);
    localStorage.removeItem(EXTRA_ADDED_KEY);
    localStorage.removeItem(CONFIG_KEY);
    await syncToServerConfig({ title: null, author: null, subtitle: null, customUtilities: [], extraNotes: {} });
    location.reload();
  });
}

/* Bootstrap */
document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initSectionNavigation();
  initMonitorControls();
  populateUtilityDropdown();
  initAdminForms();

  // Send admin heartbeat so admin machine stays online
  fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2500) })
    .then((r) => r.json())
    .then((d) => {
      const ip = d && d.ip ? d.ip : '127.0.0.1';
      const sendAdminHb = () => {
        fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip,
            device: 'Chrome / Windows (Admin)',
            utility: 'Đang mở Trang Admin Quản Trị'
          })
        }).catch(() => {});
      };
      sendAdminHb();
      setInterval(sendAdminHb, 10000);
    })
    .catch(() => {
      const sendAdminHb = () => {
        fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device: 'Chrome / Windows (Admin)',
            utility: 'Đang mở Trang Admin Quản Trị'
          })
        }).catch(() => {});
      };
      sendAdminHb();
      setInterval(sendAdminHb, 10000);
    });

  fetchClients();
  setInterval(fetchClients, 3000);
});
