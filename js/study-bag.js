/**
 * Forsko - My Saved / Bookmarks (Student Study Bag)
 * Auto-injects Bookmark buttons on all [data-card-id] cards + Floating Study Bag Drawer
 */
(function () {
  const STORAGE_KEY = 'forsko_study_bag_v1';

  /* --------------------------------------------------------------------------
     1. Storage Helpers
     -------------------------------------------------------------------------- */
  function getBag() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveBag(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Study Bag storage error:', e);
    }
  }

  function isSaved(cardId) {
    return getBag().some(item => item.id === cardId);
  }

  function detectCategory(cardId) {
    const id = (cardId || '').toLowerCase();
    if (id.startsWith('notes-')) return 'Notes';
    if (id.startsWith('pyq-')) return 'PYQs';
    if (id.startsWith('qb-')) return 'Question Bank';
    if (id.includes('sample-paper') || id.includes('paper-pattern')) return 'Sample Paper';
    if (/^sem[1-6]-/.test(id)) return 'Syllabus';
    return 'Resource';
  }

  function safeUrl(rawUrl) {
    try {
      const resolved = new URL(rawUrl, window.location.href);
      if (resolved.protocol === 'http:' || resolved.protocol === 'https:' || resolved.protocol === 'file:') {
        return resolved.href;
      }
      return window.location.href;
    } catch {
      return window.location.href;
    }
  }

  function extractCardInfo(cardEl) {
    const cardId = cardEl.getAttribute('data-card-id');

    // Title extract (badge pills hata kar clean title nikalna)
    const titleNode = cardEl.querySelector('.paper-title, .subject-title, .card-title, h3, h2');
    let title = cardId;
    if (titleNode) {
      const clone = titleNode.cloneNode(true);
      clone.querySelectorAll('.free-pill, .solved-pill, .badge, span.tag').forEach(el => el.remove());
      title = clone.textContent.replace(/\s+/g, ' ').trim() || titleNode.textContent.trim();
    }

    // Subject / Page Context
    const accordion = cardEl.closest('.subject-accordion-card');
    const accTitle = accordion?.querySelector('.subject-title')?.textContent.trim();
    const pageTitle = document.title.split('|')[0].trim();
    const context = accTitle || pageTitle || 'Forsko Material';

    // Primary PDF / Page URL
    const linkEl = cardEl.querySelector(
      '.paper-actions a, .card-actions a, a.btn-view-full, a.btn-preview, a.paper-btn, a[href$=".pdf"]'
    );
    const url = linkEl && linkEl.getAttribute('href')
      ? safeUrl(linkEl.getAttribute('href'))
      : window.location.href;

    return {
      id: cardId,
      title,
      context,
      cat: detectCategory(cardId),
      url,
      savedAt: Date.now()
    };
  }

  /* --------------------------------------------------------------------------
     2. Inject Scoped CSS
     -------------------------------------------------------------------------- */
  function injectStyles() {
    if (document.getElementById('fsb-styles')) return;
    const style = document.createElement('style');
    style.id = 'fsb-styles';
    style.textContent = `
      /* Bookmark Button Inside Cards */
      .action-btn.fsb-bookmark-btn.active {
        background: rgba(56, 189, 248, 0.18) !important;
        border-color: rgba(56, 189, 248, 0.5) !important;
        color: #38bdf8 !important;
      }
      .action-btn.fsb-bookmark-btn.active i {
        color: #38bdf8 !important;
      }

      /* Floating Study Bag Trigger Pill (Bottom-Left) */
      #fsbFloatingBtn {
        position: fixed;
        bottom: 24px;
        left: 22px;
        z-index: 940;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 10px 16px;
        border-radius: 999px;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.86rem;
        font-weight: 700;
        color: #f8fafc;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 58, 138, 0.72));
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(56, 189, 248, 0.42);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      }
      #fsbFloatingBtn:hover {
        transform: translateY(-3px);
        border-color: #38bdf8;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55), 0 0 28px rgba(56, 189, 248, 0.35);
      }
      #fsbFloatingBtn i {
        color: #38bdf8;
        font-size: 0.95rem;
      }
      .fsb-count-pill {
        background: #38bdf8;
        color: #02131e;
        font-size: 0.72rem;
        font-weight: 800;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* Study Bag Modal / Drawer */
      #fsbOverlay {
        position: fixed;
        inset: 0;
        background: rgba(5, 8, 17, 0.78);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        z-index: 100050;
      }
      #fsbOverlay.active {
        display: flex;
        animation: fsbFade 0.2s ease;
      }
      @keyframes fsbFade {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .fsb-modal {
        width: 100%;
        max-width: 560px;
        max-height: 82vh;
        display: flex;
        flex-direction: column;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.28);
        border-radius: 20px;
        padding: 22px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(56, 189, 248, 0.14);
        color: #f8fafc;
      }

      .fsb-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .fsb-title-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .fsb-title-wrap h3 {
        margin: 0;
        font-size: 1.18rem;
        font-weight: 800;
        color: #fff;
      }
      .fsb-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fsb-btn-clear {
        background: rgba(244, 63, 94, 0.12);
        border: 1px solid rgba(244, 63, 94, 0.3);
        color: #fb7185;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
      }
      .fsb-btn-clear:hover {
        background: #f43f5e;
        color: #fff;
      }
      .fsb-btn-close {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fsb-btn-close:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
      }

      .fsb-filters {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 0;
      }
      .fsb-filter-pill {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: 0.2s;
      }
      .fsb-filter-pill.active {
        background: rgba(56, 189, 248, 0.18);
        border-color: #38bdf8;
        color: #38bdf8;
      }

      .fsb-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-right: 4px;
      }

      .fsb-item {
        background: rgba(30, 41, 59, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 13px 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        transition: border-color 0.2s;
      }
      .fsb-item:hover {
        border-color: rgba(56, 189, 248, 0.4);
      }
      .fsb-item-info {
        min-width: 0;
        flex: 1;
      }
      .fsb-cat-tag {
        display: inline-block;
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.14);
        border: 1px solid rgba(56, 189, 248, 0.3);
        padding: 2px 7px;
        border-radius: 6px;
        margin-bottom: 4px;
      }
      .fsb-item-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fsb-item-ctx {
        font-size: 0.75rem;
        color: #94a3b8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fsb-item-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .fsb-btn-open {
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: #fff;
        font-size: 0.76rem;
        font-weight: 700;
        padding: 7px 12px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .fsb-btn-open:hover { opacity: 0.92; }
      .fsb-btn-remove {
        background: rgba(244, 63, 94, 0.12);
        border: 1px solid rgba(244, 63, 94, 0.25);
        color: #fb7185;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fsb-btn-remove:hover {
        background: #f43f5e;
        color: #fff;
      }

      .fsb-empty {
        text-align: center;
        padding: 36px 16px;
        color: #94a3b8;
        font-size: 0.88rem;
        line-height: 1.5;
      }
      .fsb-empty i {
        font-size: 2rem;
        color: #38bdf8;
        margin-bottom: 10px;
        display: block;
      }

      /* Mini Toast */
      #fsbToast {
        position: fixed;
        bottom: 78px;
        left: 22px;
        z-index: 100060;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #f8fafc;
        padding: 9px 15px;
        border-radius: 10px;
        font-size: 0.82rem;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: all 0.25s ease;
      }
      #fsbToast.show {
        opacity: 1;
        transform: translateY(0);
      }

      @media (max-width: 600px) {
        #fsbFloatingBtn { bottom: 18px; left: 14px; padding: 9px 13px; font-size: 0.8rem; }
        #fsbFloatingBtn .fsb-btn-label { display: none; }
        #fsbToast { left: 14px; bottom: 66px; }
      }
    `;
    document.head.appendChild(style);
  }

  /* --------------------------------------------------------------------------
     3. Build Floating Button, Drawer & Toast
     -------------------------------------------------------------------------- */
  let currentFilter = 'all';
  let toastTimer = null;

  function showMiniToast(msg) {
    let toast = document.getElementById('fsbToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'fsbToast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function createDrawerAndButton() {
    if (!document.getElementById('fsbFloatingBtn')) {
      const btn = document.createElement('button');
      btn.id = 'fsbFloatingBtn';
      btn.type = 'button';
      btn.title = 'Open My Saved Study Bag';
      btn.innerHTML = `
        <i class="fa-solid fa-bookmark"></i>
        <span class="fsb-btn-label">Study Bag</span>
        <span class="fsb-count-pill" id="fsbCountBadge">0</span>
      `;
      btn.addEventListener('click', openStudyBag);
      document.body.appendChild(btn);
    }

    if (!document.getElementById('fsbOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'fsbOverlay';
      overlay.innerHTML = `
        <div class="fsb-modal" role="dialog" aria-modal="true" aria-label="My Study Bag">
          <div class="fsb-header">
            <div class="fsb-title-wrap">
              <i class="fa-solid fa-bookmark" style="color:#38bdf8; font-size:1.15rem;"></i>
              <h3>My Study Bag</h3>
            </div>
            <div class="fsb-header-actions">
              <button type="button" class="fsb-btn-clear" id="fsbClearAllBtn">Clear All</button>
              <button type="button" class="fsb-btn-close" id="fsbCloseBtn" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <div class="fsb-filters" id="fsbFilters">
            <button type="button" class="fsb-filter-pill active" data-cat="all">All</button>
            <button type="button" class="fsb-filter-pill" data-cat="Notes">Notes</button>
            <button type="button" class="fsb-filter-pill" data-cat="PYQs">PYQs</button>
            <button type="button" class="fsb-filter-pill" data-cat="Question Bank">Question Banks</button>
            <button type="button" class="fsb-filter-pill" data-cat="Syllabus">Syllabus</button>
            <button type="button" class="fsb-filter-pill" data-cat="Sample Paper">Sample Papers</button>
          </div>

          <div class="fsb-list" id="fsbList"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', e => {
        if (e.target === overlay) closeStudyBag();
      });
      document.getElementById('fsbCloseBtn').addEventListener('click', closeStudyBag);
      document.getElementById('fsbClearAllBtn').addEventListener('click', () => {
        if (!getBag().length) return;
        saveBag([]);
        syncAllCardButtons();
        renderStudyBagList();
        showMiniToast('Study Bag cleared');
      });

      document.querySelectorAll('#fsbFilters .fsb-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          document.querySelectorAll('#fsbFilters .fsb-filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          currentFilter = pill.getAttribute('data-cat');
          renderStudyBagList();
        });
      });
    }
  }

  function renderStudyBagList() {
    const listEl = document.getElementById('fsbList');
    const badgeEl = document.getElementById('fsbCountBadge');
    const items = getBag();

    if (badgeEl) badgeEl.textContent = items.length;
    if (!listEl) return;

    const filtered = currentFilter === 'all'
      ? items
      : items.filter(i => i.cat === currentFilter);

    listEl.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'fsb-empty';
      empty.innerHTML = `
        <i class="fa-regular fa-bookmark"></i>
        <b>${items.length === 0 ? 'Your Study Bag is empty!' : 'No items in this category.'}</b><br>
        Tap the bookmark icon on any Notes, PYQs, Syllabus, or Question Bank card to save it for quick exam revision.
      `;
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach(item => {
      const row = document.createElement('div');
      row.className = 'fsb-item';

      const info = document.createElement('div');
      info.className = 'fsb-item-info';

      const catTag = document.createElement('span');
      catTag.className = 'fsb-cat-tag';
      catTag.textContent = item.cat || 'Resource';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'fsb-item-title';
      titleDiv.textContent = item.title || item.id;

      const ctxDiv = document.createElement('div');
      ctxDiv.className = 'fsb-item-ctx';
      ctxDiv.textContent = item.context || 'Forsko';

      info.appendChild(catTag);
      info.appendChild(titleDiv);
      info.appendChild(ctxDiv);

      const actions = document.createElement('div');
      actions.className = 'fsb-item-actions';

      const openLink = document.createElement('a');
      openLink.className = 'fsb-btn-open';
      openLink.href = safeUrl(item.url);
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
      openLink.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Open';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'fsb-btn-remove';
      removeBtn.title = 'Remove from Study Bag';
      removeBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      removeBtn.addEventListener('click', () => {
        const updated = getBag().filter(x => x.id !== item.id);
        saveBag(updated);
        syncAllCardButtons();
        renderStudyBagList();
        showMiniToast('Removed from Study Bag');
      });

      actions.appendChild(openLink);
      actions.appendChild(removeBtn);

      row.appendChild(info);
      row.appendChild(actions);
      listEl.appendChild(row);
    });
  }

  window.openStudyBag = function () {
    const overlay = document.getElementById('fsbOverlay');
    if (!overlay) return;
    renderStudyBagList();
    overlay.classList.add('active');
  };

  window.closeStudyBag = function () {
    document.getElementById('fsbOverlay')?.classList.remove('active');
  };

  /* --------------------------------------------------------------------------
     4. Auto-Inject Bookmark Buttons onto Every [data-card-id] Card
     -------------------------------------------------------------------------- */
  function syncAllCardButtons() {
    document.querySelectorAll('.fsb-bookmark-btn').forEach(btn => {
      const cardId = btn.getAttribute('data-card-id');
      const saved = isSaved(cardId);
      btn.classList.toggle('active', saved);
      const ico = btn.querySelector('i');
      if (ico) {
        ico.className = saved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
      }
      btn.title = saved ? 'Saved in Study Bag' : 'Save to Study Bag';
    });

    const badgeEl = document.getElementById('fsbCountBadge');
    if (badgeEl) badgeEl.textContent = getBag().length;
  }

  function attachBookmarkButtons() {
    const cards = document.querySelectorAll('[data-card-id]');
    cards.forEach(card => {
      const cardId = card.getAttribute('data-card-id');
      const actionsRow = card.querySelector('.feedback-actions');
      if (!cardId || !actionsRow || actionsRow.querySelector('.fsb-bookmark-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'action-btn fsb-bookmark-btn';
      btn.setAttribute('data-card-id', cardId);
      btn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const bag = getBag();
        const existsIdx = bag.findIndex(item => item.id === cardId);

        if (existsIdx !== -1) {
          bag.splice(existsIdx, 1);
          saveBag(bag);
          showMiniToast('Removed from Study Bag');
        } else {
          bag.unshift(extractCardInfo(card));
          saveBag(bag);
          showMiniToast('Saved to My Study Bag!');
        }
        syncAllCardButtons();
      });

      actionsRow.appendChild(btn);
    });

    syncAllCardButtons();
  }

  /* --------------------------------------------------------------------------
     5. Init
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    createDrawerAndButton();
    attachBookmarkButtons();
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeStudyBag();
  });

  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) {
      syncAllCardButtons();
      if (document.getElementById('fsbOverlay')?.classList.contains('active')) {
        renderStudyBagList();
      }
    }
  });
})();