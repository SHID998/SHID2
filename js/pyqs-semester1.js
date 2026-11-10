/**
 * Forsko - PYQs Semester Page JavaScript
 * Handles: Navbar Scroll, Mobile Menu, Single-Open Accordions, Real-Time Search Filtering,
 *          WhatsApp Share, Paper Likes (Base: 200), Dislikes & Local Comments System.
 */

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
        // Agar click feedback button ya kisi action par ho toh accordion trigger na ho
        if (e.target.closest('.card-feedback') || e.target.closest('.paper-actions')) {
          return;
        }

        const isOpen = card.classList.contains('open');

        // Close all other open accordions
        accordionCards.forEach(otherCard => {
          if (otherCard !== card && otherCard.classList.contains('open')) {
            closeAccordion(otherCard);
          }
        });

        // Toggle clicked accordion
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
     6. Paper Feedback: Likes (Base 200), Dislikes & Comments
     -------------------------------------------------------------------------- */

  const BASE_LIKES = 200;
  const paperCards = document.querySelectorAll('.paper-card');

  paperCards.forEach((card, index) => {
    // Unique ID har paper card ke liye
    const cardId = card.getAttribute('data-card-id') || `paper_sem1_${index}`;
    
    const likeBtn = card.querySelector('.like-btn');
    const dislikeBtn = card.querySelector('.dislike-btn');
    const likeCountSpan = card.querySelector('.like-count');
    const heartIcon = likeBtn ? likeBtn.querySelector('i') : null;
    
    const commentToggleBtn = card.querySelector('.comment-toggle-btn');
    const commentDropdown = card.querySelector('.comments-dropdown');
    const commentCountBadge = card.querySelector('.comment-count-badge');
    const commentsList = card.querySelector('.comments-list');
    const commentForm = card.querySelector('.comment-form');

    /* --- A. Like & Dislike Handling --- */
    if (likeBtn && likeCountSpan) {
      const isLiked = localStorage.getItem(`liked_${cardId}`) === 'true';
      const isDisliked = localStorage.getItem(`disliked_${cardId}`) === 'true';

      // Base likes 200 se shuru
      let count = isLiked ? BASE_LIKES + 1 : BASE_LIKES;
      likeCountSpan.textContent = count;

      if (isLiked) {
        likeBtn.classList.add('active');
        if (heartIcon) heartIcon.classList.replace('fa-regular', 'fa-solid');
      }

      if (isDisliked && dislikeBtn) {
        dislikeBtn.classList.add('active');
      }

      // Like Button Click
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        const currentlyLiked = likeBtn.classList.contains('active');

        if (currentlyLiked) {
          // Unlike (201 -> 200)
          count--;
          likeBtn.classList.remove('active');
          if (heartIcon) heartIcon.classList.replace('fa-solid', 'fa-regular');
          localStorage.setItem(`liked_${cardId}`, 'false');
        } else {
          // Like (200 -> 201)
          count++;
          likeBtn.classList.add('active');
          if (heartIcon) heartIcon.classList.replace('fa-regular', 'fa-solid');
          localStorage.setItem(`liked_${cardId}`, 'true');

          // Agar dislike pehle se tha toh dislike hatao
          if (dislikeBtn && dislikeBtn.classList.contains('active')) {
            dislikeBtn.classList.remove('active');
            localStorage.setItem(`disliked_${cardId}`, 'false');
          }
        }
        likeCountSpan.textContent = count;
      });

      // Dislike Button Click
      if (dislikeBtn) {
        dislikeBtn.addEventListener('click', (e) => {
          e.stopPropagation();

          const currentlyDisliked = dislikeBtn.classList.contains('active');

          if (currentlyDisliked) {
            dislikeBtn.classList.remove('active');
            localStorage.setItem(`disliked_${cardId}`, 'false');
          } else {
            dislikeBtn.classList.add('active');
            localStorage.setItem(`disliked_${cardId}`, 'true');

            // Agar pehle like kiya hua tha toh like hatao
            if (likeBtn.classList.contains('active')) {
              count--;
              likeBtn.classList.remove('active');
              if (heartIcon) heartIcon.classList.replace('fa-solid', 'fa-regular');
              localStorage.setItem(`liked_${cardId}`, 'false');
              likeCountSpan.textContent = count;
            }
          }
        });
      }
    }

    /* --- B. Comments Handling --- */
    if (commentToggleBtn && commentDropdown) {
      // Comments Load from LocalStorage
      const savedComments = JSON.parse(localStorage.getItem(`comments_${cardId}`) || '[]');

      function renderComments() {
        if (!commentsList) return;
        commentsList.innerHTML = '';

        if (savedComments.length === 0) {
          commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to ask or help!</p>';
        } else {
          savedComments.forEach(item => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment-item');
            commentDiv.innerHTML = `
              <div class="comment-header">
                <span class="comment-author">${item.name}</span>
                <span class="comment-time">${item.time}</span>
              </div>
              <p class="comment-body">${item.text}</p>
            `;
            commentsList.appendChild(commentDiv);
          });
        }

        if (commentCountBadge) {
          commentCountBadge.textContent = savedComments.length;
        }
      }

      renderComments();

      // Comment Section Open/Close
      commentToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        commentDropdown.classList.toggle('show');

        // Accordion height adjust karein jab comment box khule
        const parentAccordion = card.closest('.subject-accordion-card');
        const content = parentAccordion ? parentAccordion.querySelector('.accordion-content') : null;
        if (content && parentAccordion.classList.contains('open')) {
          content.style.maxHeight = content.scrollHeight + 300 + 'px';
        }
      });

      // Form Submit (Add new comment)
      if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const nameInput = commentForm.querySelector('.user-name');
          const textInput = commentForm.querySelector('.user-text');

          const name = nameInput.value.trim();
          const text = textInput.value.trim();

          if (!name || !text) return;

          const newComment = {
            name: name,
            text: text,
            time: 'Just now'
          };

          savedComments.push(newComment);
          localStorage.setItem(`comments_${cardId}`, JSON.stringify(savedComments));

          renderComments();
          commentForm.reset();

          // Scroll to bottom of comments
          commentsList.scrollTop = commentsList.scrollHeight;
        });
      }
    }
  });

});
