/**
 * Forsko - PYQs Semester Page JavaScript
 * Handles: Navbar Scroll, Mobile Menu, Single-Open Accordions, Real-Time Search Filtering,
 *          WhatsApp Share, Firebase Live Likes (Base: 200), Dislikes, Pinned Comments,
 *          and Real-Time Admin PYQ Unlocker / Adder (Firestore `live_pyqs`).
 */

const firebaseConfig = {
  apiKey: "AIzaSyDL0vx03wwcpmX9ToR7A1sWBiLH9vTZlcY",
  authDomain: "forsko-app.firebaseapp.com",
  projectId: "forsko-app",
  storageBucket: "forsko-app.firebasestorage.app",
  messagingSenderId: "411451295613",
  appId: "1:411451295613:web:4b64444f7059ef9ff82e14",
  measurementId: "G-R3NFPJ797P"
};

const BASE_LIKES = 200;
let db = null;

if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
}

document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  const searchInput = document.getElementById('subjectSearch');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const accordionCards = document.querySelectorAll('.subject-accordion-card');
  const noResultsState = document.getElementById('noResultsState');

  /* --------------------------------------------------------------------------
     Helpers: Sanitization & Semester Detection
     -------------------------------------------------------------------------- */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function safeUrl(rawUrl) {
    if (!rawUrl) return '#';
    const trimmed = String(rawUrl).trim();
    if (/^(https?:\/\/|\.\.?\/|\/)/i.test(trimmed)) {
      return trimmed;
    }
    return '#';
  }

  function detectCurrentPyqSemester() {
    const text = `${document.title || ''} ${window.location.pathname || ''}`;
    if (/semester\s+iii\b|semester[-_]?3\b|sem[-_]?3\b/i.test(text)) return 'Sem 3';
    if (/semester\s+ii\b|semester[-_]?2\b|sem[-_]?2\b/i.test(text)) return 'Sem 2';
    if (/semester\s+iv\b|semester[-_]?4\b|sem[-_]?4\b/i.test(text)) return 'Sem 4';
    if (/semester\s+vi\b|semester[-_]?6\b|sem[-_]?6\b/i.test(text)) return 'Sem 6';
    if (/semester\s+v\b|semester[-_]?5\b|sem[-_]?5\b/i.test(text)) return 'Sem 5';
    if (/semester\s+i\b|semester[-_]?1\b|sem[-_]?1\b/i.test(text)) return 'Sem 1';
    return null;
  }

  const currentSem = detectCurrentPyqSemester();
  const semSlug = (currentSem || 'sem1').toLowerCase().replace(/\s+/g, '');

  function refreshAccordionHeight(accordionCard) {
    if (!accordionCard || !accordionCard.classList.contains('open')) return;
    const content = accordionCard.querySelector('.accordion-content');
    if (content) {
      content.style.maxHeight = content.scrollHeight + 40 + 'px';
    }
  }

  function updatePaperCountBadge(accordionCard) {
    if (!accordionCard) return;
    const grid = accordionCard.querySelector('.papers-grid');
    const countBadge = accordionCard.querySelector('.papers-count-badge');
    if (!grid || !countBadge) return;
    const availCount = grid.querySelectorAll('.status-available').length;
    countBadge.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${availCount} Paper${availCount === 1 ? '' : 's'}`;
  }

  /* --------------------------------------------------------------------------
     1. Navbar Scroll Effect
     -------------------------------------------------------------------------- */
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* --------------------------------------------------------------------------
     2. Mobile Menu Toggle
     -------------------------------------------------------------------------- */
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.classList.replace('fa-bars', 'fa-xmark');
        } else {
          icon.classList.replace('fa-xmark', 'fa-bars');
        }
      }
    });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const icon = hamburger?.querySelector('i');
        if (icon) {
          icon.classList.replace('fa-xmark', 'fa-bars');
        }
      }
    });
  });

  /* --------------------------------------------------------------------------
     3. Smooth Accordion Interactivity (Only One Open at a Time)
     -------------------------------------------------------------------------- */
  function closeAccordion(card) {
    card.classList.remove('open');
    const toggleBtn = card.querySelector('.accordion-toggle-btn');
    const content = card.querySelector('.accordion-content');

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      const btnText = toggleBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'View Papers';
    }

    if (content) {
      content.style.maxHeight = null;
    }
  }

  function openAccordion(card) {
    card.classList.add('open');
    const toggleBtn = card.querySelector('.accordion-toggle-btn');
    const content = card.querySelector('.accordion-content');

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
      const btnText = toggleBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Hide Papers';
    }

    if (content) {
      content.style.maxHeight = content.scrollHeight + 40 + 'px';
    }
  }

  accordionCards.forEach(card => {
    updatePaperCountBadge(card);
    const header = card.querySelector('.accordion-header');

    if (header) {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.card-feedback') || e.target.closest('.paper-actions')) {
          return;
        }

        const isOpen = card.classList.contains('open');

        accordionCards.forEach(otherCard => {
          if (otherCard !== card && otherCard.classList.contains('open')) {
            closeAccordion(otherCard);
          }
        });

        if (isOpen) {
          closeAccordion(card);
        } else {
          openAccordion(card);
        }
      });
    }
  });

  window.addEventListener('resize', () => {
    accordionCards.forEach(card => refreshAccordionHeight(card));
  });

  /* --------------------------------------------------------------------------
     4. Real-Time Subject Search Filtering
     -------------------------------------------------------------------------- */
  function filterSubjects() {
    const query = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    if (searchClearBtn) {
      if (query.length > 0) {
        searchClearBtn.classList.remove('hidden');
      } else {
        searchClearBtn.classList.add('hidden');
      }
    }

    accordionCards.forEach(card => {
      const subjectData = (card.getAttribute('data-subject') || '').toLowerCase();
      const titleText = card.querySelector('.subject-title')?.textContent.toLowerCase() || '';
      const descText = card.querySelector('.subject-description')?.textContent.toLowerCase() || '';

      const match = subjectData.includes(query) || titleText.includes(query) || descText.includes(query);

      if (match) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
        if (card.classList.contains('open')) {
          closeAccordion(card);
        }
      }
    });

    if (noResultsState) {
      if (visibleCount === 0) {
        noResultsState.classList.remove('hidden');
      } else {
        noResultsState.classList.add('hidden');
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterSubjects);
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterSubjects();
      searchInput.focus();
    });
  }

  /* --------------------------------------------------------------------------
     5. Reusable WhatsApp Share + Firebase Feedback Binding
     -------------------------------------------------------------------------- */
  function bindShareButton(btn) {
    if (!btn || btn.dataset.shareBound === 'true') return;
    btn.dataset.shareBound = 'true';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.paper-card, .subject-accordion-card');
      const accordion = btn.closest('.subject-accordion-card');
      const subjectName = accordion?.querySelector('.subject-title')?.textContent.trim() || '';
      const paperTitle = card?.querySelector('.paper-title, .subject-title')?.textContent.trim() || 'Study Material';
      const fullTitle = subjectName && paperTitle !== subjectName ? `${subjectName} (${paperTitle})` : paperTitle;
      const pageUrl = window.location.href;

      const message = encodeURIComponent(`📚 *${fullTitle}*\nB.Sc. Computer Science ke PYQs aur Papers Forsko par mil gaye!\nAbhi check karo:\n🔗 ${pageUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank', 'noopener,noreferrer');
    });
  }

  function createFeedbackMarkup() {
    return `
      <div class="feedback-actions">
        <button type="button" class="action-btn like-btn" title="Like">
          <i class="fa-regular fa-heart"></i>
          <span class="like-count">${BASE_LIKES}</span>
        </button>
        <button type="button" class="action-btn dislike-btn" title="Dislike">
          <i class="fa-solid fa-arrow-down"></i>
        </button>
        <button type="button" class="action-btn comment-toggle-btn" title="Comments">
          <i class="fa-regular fa-comment-dots"></i>
          <span class="comment-count-badge">0</span>
        </button>
        <button type="button" class="action-btn share-btn" title="Share on WhatsApp">
          <i class="fa-brands fa-whatsapp"></i>
        </button>
      </div>

      <div class="comments-dropdown">
        <div class="comments-list"></div>
        <form class="comment-form">
          <input type="text" class="comment-input user-name" placeholder="Your Name..." required>
          <div class="input-with-btn">
            <input type="text" class="comment-input user-text" placeholder="Write a Comment...." required>
            <button type="submit" class="comment-send-btn"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </form>
      </div>
    `;
  }

  function bindPaperCardFeedback(card, fallbackIndex = 0) {
    if (!card || card.dataset.feedbackBound === 'true') return;

    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) bindShareButton(shareBtn);

    if (!db) return;

    const likeBtn = card.querySelector('.like-btn');
    const dislikeBtn = card.querySelector('.dislike-btn');
    const likeCountSpan = card.querySelector('.like-count');
    const commentToggleBtn = card.querySelector('.comment-toggle-btn');
    const commentDropdown = card.querySelector('.comments-dropdown');
    const commentCountBadge = card.querySelector('.comment-count-badge');
    const commentsList = card.querySelector('.comments-list');
    const commentForm = card.querySelector('.comment-form');

    if (!likeBtn || !dislikeBtn || !commentForm) return;

    card.dataset.feedbackBound = 'true';

    const cardId = card.getAttribute('data-card-id') || `paper_${semSlug}_${fallbackIndex}`;
    likeCountSpan.textContent = BASE_LIKES;

    let userReaction = localStorage.getItem(`reaction_${cardId}`) || null;

    function renderUserButtons() {
      const heartIcon = likeBtn.querySelector('i');
      if (userReaction === 'like') {
        likeBtn.classList.add('active');
        if (heartIcon) heartIcon.className = 'fa-solid fa-heart';
      } else {
        likeBtn.classList.remove('active');
        if (heartIcon) heartIcon.className = 'fa-regular fa-heart';
      }

      if (userReaction === 'dislike') {
        dislikeBtn.classList.add('active');
      } else {
        dislikeBtn.classList.remove('active');
      }
    }
    renderUserButtons();

    // LIVE LIKES LISTENER
    const cardDocRef = db.collection('cards_data').doc(cardId);
    cardDocRef.onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        const userAddedLikes = Math.max(0, data.likes || 0);
        likeCountSpan.textContent = BASE_LIKES + userAddedLikes;
      } else {
        likeCountSpan.textContent = BASE_LIKES;
      }
    }, err => console.warn(`Likes sync error (${cardId}):`, err));

    // LIVE COMMENTS LISTENER (Pinned Sabse Upar + Newest First)
    const commentsColRef = cardDocRef.collection('comments');
    commentsColRef.onSnapshot(snapshot => {
      if (!commentsList) return;
      commentsList.innerHTML = '';
      if (commentCountBadge) commentCountBadge.textContent = snapshot.size;

      if (snapshot.empty) {
        commentsList.innerHTML = `<p class="no-comments">No comments yet. Be the first to ask or help!</p>`;
        return;
      }

      const comments = snapshot.docs.map(docSnap => docSnap.data());

      comments.sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) {
          return a.pinned ? -1 : 1;
        }
        const timeA = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      comments.forEach(c => {
        let formattedTime = 'Abhi';
        if (c.createdAt && c.createdAt.toDate) {
          const date = c.createdAt.toDate();
          formattedTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
                          date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        const isPinned = Boolean(c.pinned);
        const commentDiv = document.createElement('div');
        commentDiv.className = isPinned ? 'comment-item is-pinned' : 'comment-item';
        commentDiv.innerHTML = `
          <div class="comment-header">
            <span class="comment-author">
              ${escapeHTML(c.name)}
              ${isPinned ? '<span class="pin-badge"><i class="fa-solid fa-thumbtack"></i> PINNED</span>' : ''}
            </span>
            <span class="comment-time">${formattedTime}</span>
          </div>
          <p class="comment-body">${escapeHTML(c.text)}</p>
        `;
        commentsList.appendChild(commentDiv);
      });

      commentsList.scrollTop = 0;
      refreshAccordionHeight(card.closest('.subject-accordion-card'));
    }, err => console.warn(`Comments sync error (${cardId}):`, err));

    // LIKE BUTTON CLICK
    likeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      likeBtn.disabled = true;
      try {
        if (userReaction === 'like') {
          userReaction = null;
          await cardDocRef.set({
            likes: firebase.firestore.FieldValue.increment(-1)
          }, { merge: true });
        } else {
          userReaction = 'like';
          await cardDocRef.set({
            likes: firebase.firestore.FieldValue.increment(1)
          }, { merge: true });
        }
        localStorage.setItem(`reaction_${cardId}`, userReaction || '');
        renderUserButtons();
      } catch (err) {
        console.error("Like error:", err);
      } finally {
        likeBtn.disabled = false;
      }
    });

    // DISLIKE BUTTON CLICK
    dislikeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      dislikeBtn.disabled = true;
      try {
        if (userReaction === 'dislike') {
          userReaction = null;
        } else {
          if (userReaction === 'like') {
            await cardDocRef.set({
              likes: firebase.firestore.FieldValue.increment(-1)
            }, { merge: true });
          }
          userReaction = 'dislike';
        }
        localStorage.setItem(`reaction_${cardId}`, userReaction || '');
        renderUserButtons();
      } catch (err) {
        console.error("Dislike error:", err);
      } finally {
        dislikeBtn.disabled = false;
      }
    });

    // COMMENT TOGGLE
    if (commentToggleBtn && commentDropdown) {
      commentToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        commentDropdown.classList.toggle('show');
        refreshAccordionHeight(card.closest('.subject-accordion-card'));
      });
    }

    // SUBMIT COMMENT
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const nameInput = commentForm.querySelector('.user-name');
      const textInput = commentForm.querySelector('.user-text');
      const sendBtn = commentForm.querySelector('.comment-send-btn');

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      if (sendBtn) sendBtn.disabled = true;
      try {
        await cardDocRef.set({
          likes: firebase.firestore.FieldValue.increment(0)
        }, { merge: true });

        await cardDocRef.collection('comments').add({
          name: name,
          text: text,
          pinned: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        textInput.value = '';
      } catch (error) {
        alert("Comment post nahi ho saka. Kripya Firebase rules check karein.");
        console.error("Comment Error:", error);
      } finally {
        if (sendBtn) sendBtn.disabled = false;
      }
    });
  }

  document.querySelectorAll('.share-btn').forEach(bindShareButton);

  if (!db) {
    console.warn("Firebase SDK not loaded on this page. Add firebase-app-compat & firebase-firestore-compat scripts in HTML.");
    return;
  }

  document.querySelectorAll('.paper-card').forEach((card, index) => {
    bindPaperCardFeedback(card, index);
  });

  /* --------------------------------------------------------------------------
     6. Dynamic PYQ Unlocker & Future Paper Adder (`live_pyqs` from Admin Panel)
     -------------------------------------------------------------------------- */
  const SUBJECT_ALIASES = {
    'foc': ['fundamentals of computer'],
    'c': ['programming with c'],
    'ds': ['data structures', 'data structure'],
    'rdbms': ['relational database management systems', 'rdbms'],
    'iks': ['iks in computational sciences', 'iks theory'],
    'oop': ['object oriented programming', 'c++'],
    'oop c++': ['object oriented programming with c++'],
    'cn': ['computer networks'],
    'python': ['python programming'],
    'java': ['core java programming'],
    'core java': ['core java programming'],
    'se': ['software engineering'],
    'adv python': ['advanced python programming'],
    'adv java': ['advanced java programming'],
    'animation': ['computer animation'],
    'dsm': ['digital systems and microprocessors'],
    'ai': ['artificial intelligence'],
    'ml': ['machine learning'],
    'data mining': ['data mining'],
    'data science': ['data science'],
    'minor cn & adv python': ['minor theory - computer networks and advanced python'],
    'minor cn & python': ['minor theory - computer networks and advanced python'],
    'minor ds & rdbms': ['minor theory - data structures and rdbms'],
    'minor c++ & python': ['minor theory - c++ and python'],
    'minor se & java': ['minor theory - software engineering and java']
  };

  function findTargetAccordion(accordions, subjectQuery) {
    if (!subjectQuery) return null;
    const clean = subjectQuery.toLowerCase().trim();
    const wantsMinor = clean.includes('minor');
    const aliases = SUBJECT_ALIASES[clean] || [clean];

    // Prefer exact Minor/Major separation so "Data Structures" doesn't hit "Minor Data Structures"
    const pool = accordions.filter(acc => {
      const ds = (acc.getAttribute('data-subject') || '').toLowerCase();
      const tt = (acc.querySelector('.subject-title')?.textContent || '').toLowerCase();
      const isMinorAcc = ds.includes('minor') || tt.includes('minor');
      return wantsMinor ? isMinorAcc : !isMinorAcc;
    });

    const searchList = pool.length ? pool : accordions;

    return searchList.find(acc => {
      const ds = (acc.getAttribute('data-subject') || '').toLowerCase();
      const tt = (acc.querySelector('.subject-title')?.textContent || '').toLowerCase();
      const combined = `${ds} ${tt}`;

      if (aliases.some(term => combined.includes(term))) return true;
      // Exact word match fallback for short abbreviations
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(combined);
    }) || null;
  }

  function buildPaperActionsHtml(pdfUrl, isAvailable) {
    if (isAvailable && pdfUrl) {
      const cleanUrl = escapeHTML(safeUrl(pdfUrl));
      return `
        <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="paper-btn btn-preview">
          <i class="fa-solid fa-eye"></i> Preview
        </a>
        <a href="${cleanUrl}" download class="paper-btn btn-download">
          <i class="fa-solid fa-download"></i> Download
        </a>
      `;
    }
    return `
      <button type="button" class="paper-btn btn-disabled" disabled>
        <i class="fa-solid fa-lock"></i> Coming Soon
      </button>
    `;
  }

  function syncDynamicPyqs() {
    if (!currentSem || !document.getElementById('accordionsList')) return;

    const accordions = Array.from(document.querySelectorAll('.subject-accordion-card'));

    db.collection('live_pyqs')
      .where('sem', '==', currentSem)
      .onSnapshot(snap => {
        if (snap.empty) return;

        snap.forEach(docSnap => {
          const p = docSnap.data() || {};
          const cardId = docSnap.id;
          const subjQuery = (p.subject || '').trim();
          const examQuery = (p.examTitle || '').toLowerCase().trim();
          const isAvail = p.status === 'available' && Boolean(p.pdfUrl);

          // 1. Pehle poore page par exact data-card-id se dhundhein (most reliable!)
          let targetCard = document.querySelector(`.paper-card[data-card-id="${CSS.escape(cardId)}"]`);
          let targetAcc = targetCard ? targetCard.closest('.subject-accordion-card') : findTargetAccordion(accordions, subjQuery);

          if (!targetAcc) return;
          const grid = targetAcc.querySelector('.papers-grid');
          if (!grid) return;

          // 2. Agar data-card-id page par nahi tha, to accordion ke andar examTitle se match karein
          if (!targetCard && examQuery) {
            targetCard = Array.from(grid.querySelectorAll('.paper-card')).find(c => {
              const t = (c.querySelector('.paper-title')?.textContent || '').toLowerCase().trim();
              return t === examQuery;
            }) || null;
          }

          if (targetCard) {
            // Existing card ("Coming Soon" ya existing paper) ko live update karein
            targetCard.setAttribute('data-card-id', cardId);

            const yrEl = targetCard.querySelector('.year-badge');
            if (yrEl && p.year) yrEl.textContent = p.year;

            const titleEl = targetCard.querySelector('.paper-title');
            if (titleEl && p.examTitle) titleEl.textContent = p.examTitle;

            const badgeEl = targetCard.querySelector('.status-badge');
            if (badgeEl) {
              badgeEl.className = isAvail ? 'status-badge status-available' : 'status-badge status-coming-soon';
              badgeEl.innerHTML = isAvail
                ? '<i class="fa-solid fa-circle-check"></i> Available'
                : '<i class="fa-solid fa-clock"></i> Coming Soon';
            }

            const actionsEl = targetCard.querySelector('.paper-actions');
            if (actionsEl) {
              actionsEl.innerHTML = buildPaperActionsHtml(p.pdfUrl, isAvail);
            }

            // Agar Coming Soon card par feedback section nahi tha aur ab unlock hua hai to add karein
            if (isAvail && !targetCard.querySelector('.card-feedback')) {
              const feedbackDiv = document.createElement('div');
              feedbackDiv.className = 'card-feedback';
              feedbackDiv.innerHTML = createFeedbackMarkup();
              targetCard.appendChild(feedbackDiv);
            }

            bindPaperCardFeedback(targetCard);
          } else {
            // 3. Brand-New Paper Card (e.g. Winter 2027 / Summer 2027) create karein
            const newCard = document.createElement('div');
            newCard.className = 'paper-card';
            newCard.setAttribute('data-card-id', cardId);
            newCard.setAttribute('data-dynamic-pyq', 'true');
            newCard.innerHTML = `
              <div class="paper-header">
                <span class="year-badge"></span>
                <span class="status-badge ${isAvail ? 'status-available' : 'status-coming-soon'}">
                  ${isAvail ? '<i class="fa-solid fa-circle-check"></i> Available' : '<i class="fa-solid fa-clock"></i> Coming Soon'}
                </span>
              </div>
              <h3 class="paper-title"></h3>
              <div class="paper-actions">${buildPaperActionsHtml(p.pdfUrl, isAvail)}</div>
              <div class="card-feedback">${createFeedbackMarkup()}</div>
            `;
            newCard.querySelector('.year-badge').textContent = p.year || '2027';
            newCard.querySelector('.paper-title').textContent = p.examTitle || 'New Examination';
            grid.appendChild(newCard);

            bindPaperCardFeedback(newCard);
          }

          updatePaperCountBadge(targetAcc);
          refreshAccordionHeight(targetAcc);
        });

        if (typeof window.attachBookmarkButtons === 'function') {
          window.attachBookmarkButtons();
        }
      }, err => {
        console.warn('Dynamic PYQs sync error:', err);
      });
  }

  syncDynamicPyqs();

});