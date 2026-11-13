/**
 * Forsko - Live System
 * Navigation + Global Red Heart Likes (Base 200) & Live Pinned Comments
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

// Shuruat ke base likes (Aap ise kabhi bhi change kar sakte hain)
const BASE_LIKES = 200;

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. Sticky Navbar & Mobile Hamburger Menu
  --------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

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

  /* ---------------------------------------------------------
     2. Global Likes (Heart) & Comments Per Subject Card
  --------------------------------------------------------- */
  const cards = document.querySelectorAll('.subject-card[data-card-id]');

  cards.forEach(card => {
    const cardId = card.getAttribute('data-card-id');
    const likeBtn = card.querySelector('.like-btn');
    const dislikeBtn = card.querySelector('.dislike-btn');
    const commentToggleBtn = card.querySelector('.comment-toggle-btn');
    const commentsDropdown = card.querySelector('.comments-dropdown');
    const commentForm = card.querySelector('.comment-form');
    const commentsList = card.querySelector('.comments-list');
    const likeCountSpan = card.querySelector('.like-count');
    const commentCountBadge = card.querySelector('.comment-count-badge');

    if (!likeBtn || !dislikeBtn || !commentForm) return;

    // Pehle se screen par 200 show karein
    likeCountSpan.textContent = BASE_LIKES;

    let userReaction = localStorage.getItem(`reaction_${cardId}`) || null;

    function renderUserButtons() {
      const heartIcon = likeBtn.querySelector('i');

      // Heart Icon Toggle (Solid Red Heart vs Outline Heart)
      if (userReaction === 'like') {
        likeBtn.classList.add('active');
        heartIcon.className = 'fa-solid fa-heart';
      } else {
        likeBtn.classList.remove('active');
        heartIcon.className = 'fa-regular fa-heart';
      }

      // Down Arrow Toggle
      if (userReaction === 'dislike') {
        dislikeBtn.classList.add('active');
      } else {
        dislikeBtn.classList.remove('active');
      }
    }
    renderUserButtons();

    // LIVE LIKES LISTENER (Cloud Database + 200 Base)
    const cardDocRef = db.collection('cards_data').doc(cardId);
    cardDocRef.onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        const userAddedLikes = Math.max(0, data.likes || 0);
        // Base 200 + Naye likes
        likeCountSpan.textContent = BASE_LIKES + userAddedLikes;
      } else {
        likeCountSpan.textContent = BASE_LIKES;
      }
    });

    // LIVE COMMENTS LISTENER (Pinned comments top par aayenge aur Badge dikhega)
    const commentsColRef = cardDocRef.collection('comments');
    commentsColRef.onSnapshot(snapshot => {
      commentsList.innerHTML = '';
      commentCountBadge.textContent = snapshot.size;

      if (snapshot.empty) {
        commentsList.innerHTML = `<div class="no-comments">Comments</div>`;
        return;
      }

      // Saare comments ko array me convert karna
      const commentsArray = [];
      snapshot.forEach(docSnap => {
        const c = docSnap.data();
        commentsArray.push({
          name: c.name || 'Anonymous',
          text: c.text || '',
          pinned: Boolean(c.pinned),
          createdAt: c.createdAt && c.createdAt.toDate ? c.createdAt.toDate() : new Date()
        });
      });

      // SORTING: Pinned comment sabse pehle aayega, baaki newest first
      commentsArray.sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return b.createdAt - a.createdAt;
      });

      commentsArray.forEach(c => {
        const formattedTime = c.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
                              c.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const item = document.createElement('div');
        // Agar pinned hai toh 'is-pinned' class jud jayegi
        item.className = `comment-item ${c.pinned ? 'is-pinned' : ''}`;

        item.innerHTML = `
          <div class="comment-header">
            <div>
              <span class="comment-author">${escapeHTML(c.name)}</span>
              ${c.pinned ? '<span class="pinned-tag"><i class="fa-solid fa-thumbtack"></i> Pinned</span>' : ''}
            </div>
            <span class="comment-time">${formattedTime}</span>
          </div>
          <div class="comment-body">${escapeHTML(c.text)}</div>
        `;
        commentsList.appendChild(item);
      });

      commentsList.scrollTop = 0;
    });

    // LIKE BUTTON CLICK (Heart toggle)
    likeBtn.addEventListener('click', async () => {
      likeBtn.disabled = true;
      try {
        if (userReaction === 'like') {
          // Unlike karna (Minus 1)
          userReaction = null;
          await cardDocRef.set({
            likes: firebase.firestore.FieldValue.increment(-1)
          }, { merge: true });
        } else {
          // Like karna (Plus 1)
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

    // DISLIKE BUTTON CLICK (Down Arrow, No count)
    dislikeBtn.addEventListener('click', async () => {
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
    commentToggleBtn.addEventListener('click', () => {
      commentsDropdown.classList.toggle('show');
    });

    // SUBMIT COMMENT
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = card.querySelector('.user-name');
      const textInput = card.querySelector('.user-text');
      const sendBtn = card.querySelector('.comment-send-btn');

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      sendBtn.disabled = true;
      try {
        // Parent doc ensure karein taaki Admin dashboard me comment miss na ho
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
        alert("Comment post nahi ho saka. Kripya check karein ki Firebase rules publish ho chuke hain.");
        console.error("Comment Error:", error);
      } finally {
        sendBtn.disabled = false;
      }
    });

  });

  // Safe Text Helper (Security)
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

// One-Click WhatsApp Share
document.querySelectorAll('.share-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.subject-card, .paper-card, .glass-card, .subject-accordion-card');
    const title = card ? (card.querySelector('.subject-title, .paper-title, .card-title, h2, h3')?.textContent.trim() || 'Study Material') : 'Study Material';
    const pageUrl = window.location.href;

    const message = encodeURIComponent(`📚 *${title}*\nB.Sc. Computer Science ka Syllabus Forsko par mil gaya!\nAbhi check karo:\n🔗 ${pageUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  });
});