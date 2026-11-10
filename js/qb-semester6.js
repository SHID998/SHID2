/**
 * Forsko - Semester I Question Bank JavaScript
 * Controls: Navigation, Accordions, Live Search, and Firebase Likes & Comments per Resource
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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  const accordionCards = document.querySelectorAll('.subject-accordion-card');
  const subjectSearch = document.getElementById('subjectSearch');
  const searchClearBtn = document.getElementById('searchClearBtn');
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
     3. Accordion Toggle Logic
     -------------------------------------------------------------------------- */
  accordionCards.forEach(card => {
    const toggleBtn = card.querySelector('.accordion-toggle-btn');
    const header = card.querySelector('.accordion-header');

    const toggleAccordion = (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;

      const isActive = card.classList.contains('active');
      card.classList.toggle('active');

      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', !isActive);
        const btnText = toggleBtn.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = !isActive ? 'Hide Question Bank' : 'View Question Bank';
        }
      }
    };

    if (header) {
      header.addEventListener('click', toggleAccordion);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = card.classList.contains('active');
        card.classList.toggle('active');
        toggleBtn.setAttribute('aria-expanded', !isActive);
        const btnText = toggleBtn.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = !isActive ? 'Hide Question Bank' : 'View Question Bank';
        }
      });
    }
  });

  /* --------------------------------------------------------------------------
     4. Subject Live Search & Filtering
     -------------------------------------------------------------------------- */
  if (subjectSearch) {
    subjectSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      if (query.length > 0) {
        if (searchClearBtn) searchClearBtn.classList.remove('hidden');
      } else {
        if (searchClearBtn) searchClearBtn.classList.add('hidden');
      }

      let visibleCount = 0;

      accordionCards.forEach(card => {
        const subjectAttr = card.getAttribute('data-subject') || '';
        const titleText = card.querySelector('.subject-title')?.textContent.toLowerCase() || '';
        const descText = card.querySelector('.subject-description')?.textContent.toLowerCase() || '';

        if (subjectAttr.includes(query) || titleText.includes(query) || descText.includes(query)) {
          card.style.display = 'block';
          visibleCount++;

          if (query.length >= 2) {
            card.classList.add('active');
            const toggleBtn = card.querySelector('.accordion-toggle-btn');
            if (toggleBtn) {
              toggleBtn.setAttribute('aria-expanded', 'true');
              const btnText = toggleBtn.querySelector('.btn-text');
              if (btnText) btnText.textContent = 'Hide Question Bank';
            }
          }
        } else {
          card.style.display = 'none';
        }
      });

      if (visibleCount === 0) {
        if (noResultsState) noResultsState.classList.remove('hidden');
      } else {
        if (noResultsState) noResultsState.classList.add('hidden');
      }
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        subjectSearch.value = '';
        searchClearBtn.classList.add('hidden');
        if (noResultsState) noResultsState.classList.add('hidden');

        accordionCards.forEach(card => {
          card.style.display = 'block';
          card.classList.remove('active');
          const toggleBtn = card.querySelector('.accordion-toggle-btn');
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            const btnText = toggleBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'View Question Bank';
          }
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     5. Firebase Live Likes & Comments Per Resource Card
     -------------------------------------------------------------------------- */
  const resourceCards = document.querySelectorAll('.paper-card[data-card-id]');

  resourceCards.forEach(resource => {
    const cardId = resource.getAttribute('data-card-id');
    const likeBtn = resource.querySelector('.like-btn');
    const dislikeBtn = resource.querySelector('.dislike-btn');
    const commentToggleBtn = resource.querySelector('.comment-toggle-btn');
    const commentsDropdown = resource.querySelector('.comments-dropdown');
    const commentForm = resource.querySelector('.comment-form');
    const commentsList = resource.querySelector('.comments-list');
    const likeCountSpan = resource.querySelector('.like-count');
    const commentCountBadge = resource.querySelector('.comment-count-badge');

    if (!likeBtn || !dislikeBtn || !commentForm) return;

    likeCountSpan.textContent = BASE_LIKES;

    let userReaction = localStorage.getItem(`reaction_${cardId}`) || null;

    function renderUserButtons() {
      const heartIcon = likeBtn.querySelector('i');
      if (userReaction === 'like') {
        likeBtn.classList.add('active');
        heartIcon.className = 'fa-solid fa-heart';
      } else {
        likeBtn.classList.remove('active');
        heartIcon.className = 'fa-regular fa-heart';
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

    // LIVE COMMENTS LISTENER
    const commentsColRef = cardDocRef.collection('comments').orderBy('createdAt', 'asc');
    commentsColRef.onSnapshot(snapshot => {
      commentsList.innerHTML = '';
      commentCountBadge.textContent = snapshot.size;

      if (snapshot.empty) {
        commentsList.innerHTML = `<div class="no-comments">Comments</div>`;
        return;
      }

      snapshot.forEach(docSnap => {
        const c = docSnap.data();
        let formattedTime = 'Abhi';
        if (c.createdAt && c.createdAt.toDate) {
          const date = c.createdAt.toDate();
          formattedTime = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
                          date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `
          <div class="comment-header">
            <span class="comment-author">${escapeHTML(c.name)}</span>
            <span class="comment-time">${formattedTime}</span>
          </div>
          <div class="comment-body">${escapeHTML(c.text)}</div>
        `;
        commentsList.appendChild(item);
      });

      commentsList.scrollTop = commentsList.scrollHeight;
    });

    // LIKE CLICK
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

    // DISLIKE CLICK
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
    commentToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      commentsDropdown.classList.toggle('show');
    });

    // SUBMIT COMMENT
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const nameInput = resource.querySelector('.user-name');
      const textInput = resource.querySelector('.user-text');
      const sendBtn = resource.querySelector('.comment-send-btn');

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      sendBtn.disabled = true;
      try {
        await cardDocRef.collection('comments').add({
          name: name,
          text: text,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        textInput.value = '';
      } catch (error) {
        alert("Comment post nahi ho saka. Kripya check karein ki Firebase rules publish ho chuke hain.");
        console.error("Comment Error:", error);
      } finally {
        sendBtn.disabled = false;
      }
    });

  });

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
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



// One-Click WhatsApp Share
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.subject-card, .paper-card, .glass-card, .subject-accordion-card');
      const title = card ? (card.querySelector('.subject-title, .paper-title, .card-title, h2, h3')?.textContent.trim() || 'Study Material') : 'Study Material';
      const pageUrl = window.location.href;

      const message = encodeURIComponent(`📚 *${title}*\nB.Sc. Computer Science ke Question Banks Forsko par mil gaye!\nAbhi check karo:\n🔗 ${pageUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    });
  });
