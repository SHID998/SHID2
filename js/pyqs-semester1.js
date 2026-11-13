/**
 * Forsko - PYQs Semester Page JavaScript
 * Handles: Navbar Scroll, Mobile Menu, Single-Open Accordions, Real-Time Search Filtering,
 *          WhatsApp Share, and Firebase Live Likes (Base: 200), Dislikes & Pinned Comments.
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
     1. Navbar Scroll Effect
     -------------------------------------------------------------------------- */
  window.addEventListener('scroll', () => {
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
      if (navMenu.classList.contains('active')) {
        icon.classList.replace('fa-bars', 'fa-xmark');
      } else {
        icon.classList.replace('fa-xmark', 'fa-bars');
      }
    });
  }

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const icon = hamburger.querySelector('i');
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
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  }

  accordionCards.forEach(card => {
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

  /* --------------------------------------------------------------------------
     4. Real-Time Subject Search Filtering
     -------------------------------------------------------------------------- */
  function filterSubjects() {
    const query = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    if (query.length > 0) {
      searchClearBtn.classList.remove('hidden');
    } else {
      searchClearBtn.classList.add('hidden');
    }

    accordionCards.forEach(card => {
      const subjectData = card.getAttribute('data-subject') || '';
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

    if (visibleCount === 0) {
      noResultsState.classList.remove('hidden');
    } else {
      noResultsState.classList.add('hidden');
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
     5. One-Click WhatsApp Share
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.paper-card, .subject-accordion-card');
      const title = card ? (card.querySelector('.paper-title, .subject-title')?.textContent.trim() || 'Study Material') : 'Study Material';
      const pageUrl = window.location.href;

      const message = encodeURIComponent(`📚 *${title}*\nB.Sc. Computer Science ke PYQs aur Papers Forsko par mil gaye!\nAbhi check karo:\n🔗 ${pageUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    });
  });

  /* --------------------------------------------------------------------------
     6. Firebase Live Likes (Base 200), Dislikes & Pinned Comments
     -------------------------------------------------------------------------- */
  if (!db) {
    console.warn("Firebase SDK not loaded on this page. Add firebase-app-compat & firebase-firestore-compat scripts in HTML.");
    return;
  }

  const paperCards = document.querySelectorAll('.paper-card');

  paperCards.forEach((card, index) => {
    const cardId = card.getAttribute('data-card-id') || `paper_sem1_${index}`;

    const likeBtn = card.querySelector('.like-btn');
    const dislikeBtn = card.querySelector('.dislike-btn');
    const likeCountSpan = card.querySelector('.like-count');

    const commentToggleBtn = card.querySelector('.comment-toggle-btn');
    const commentDropdown = card.querySelector('.comments-dropdown');
    const commentCountBadge = card.querySelector('.comment-count-badge');
    const commentsList = card.querySelector('.comments-list');
    const commentForm = card.querySelector('.comment-form');

    if (!likeBtn || !dislikeBtn || !commentForm) return;

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
    });

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

      // Keep accordion height updated if open
      const parentAccordion = card.closest('.subject-accordion-card');
      const content = parentAccordion ? parentAccordion.querySelector('.accordion-content') : null;
      if (content && parentAccordion.classList.contains('open')) {
        content.style.maxHeight = content.scrollHeight + 300 + 'px';
      }
    });

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

        const parentAccordion = card.closest('.subject-accordion-card');
        const content = parentAccordion ? parentAccordion.querySelector('.accordion-content') : null;
        if (content && parentAccordion.classList.contains('open')) {
          content.style.maxHeight = content.scrollHeight + 300 + 'px';
        }
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
  });

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

});