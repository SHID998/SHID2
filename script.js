/**
 * Forsko Platform - Master Script
 * Production Ready & Cleaned
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounterStats();
});

/* ==========================================================================
   1. Mobile Hamburger Menu & Navbar
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
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

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = hamburger.querySelector('i');
        if (icon) icon.classList.replace('fa-xmark', 'fa-bars');
      });
    });
  }
}

// ==========================================
// 2. 3D Tilt & Spotlight (About & Bento)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const visualCard = document.getElementById('aboutVisualCard');
  const spotlight = document.getElementById('aboutSpotlight');

  if (visualCard) {
    visualCard.addEventListener('mousemove', (e) => {
      const rect = visualCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (spotlight) {
        visualCard.style.setProperty('--spot-x', `${x}px`);
        visualCard.style.setProperty('--spot-y', `${y}px`);
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      visualCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    visualCard.addEventListener('mouseleave', () => {
      visualCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  }

  // Bento Cards
  const bentoCards = document.querySelectorAll('.bento-card[data-tilt]');
  bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--bento-x', `${x}px`);
      card.style.setProperty('--bento-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    });
  });
});

/* ==========================================================================
   3. Floating Action Button (FAB)
   ========================================================================== */
(function () {
  "use strict";

  function initFAB() {
    const fabContainer = document.getElementById("fabContainer");
    const fabMainBtn = document.getElementById("fabMainBtn");
    const fabMenu = document.getElementById("fabMenu");
    const fabBackdrop = document.getElementById("fabBackdrop");
    const fabProgressCircle = document.getElementById("fabProgressCircle");

    const fabSearch = document.getElementById("fabSearch");
    const fabBackToTop = document.getElementById("fabBackToTop");
    const fabFeedback = document.getElementById("fabFeedback");
    const menuItems = document.querySelectorAll(".fab-menu-item");

    if (!fabContainer || !fabMainBtn) return;

    let lastScrollY = window.scrollY || 0;
    let ticking = false;

    function openFabMenu() {
      fabContainer.classList.add("active");
      if (fabBackdrop) fabBackdrop.classList.add("active");
      fabMainBtn.setAttribute("aria-expanded", "true");
      if (fabMenu) fabMenu.setAttribute("aria-hidden", "false");
    }

    function closeFabMenu() {
      fabContainer.classList.remove("active");
      if (fabBackdrop) fabBackdrop.classList.remove("active");
      fabMainBtn.setAttribute("aria-expanded", "false");
      if (fabMenu) fabMenu.setAttribute("aria-hidden", "true");
    }

    function toggleFabMenu(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (fabContainer.classList.contains("active")) {
        closeFabMenu();
      } else {
        openFabMenu();
      }
    }

    fabMainBtn.addEventListener("click", toggleFabMenu);
    if (fabBackdrop) fabBackdrop.addEventListener("click", closeFabMenu);

    if (fabSearch) {
      fabSearch.addEventListener("click", function (e) {
        e.preventDefault();
        closeFabMenu();
        const searchInput = document.getElementById("searchInput");
        const searchSection = document.getElementById("globalsearch");
        if (searchSection) searchSection.scrollIntoView({ behavior: "smooth", block: "center" });
        if (searchInput) setTimeout(() => searchInput.focus(), 500);
      });
    }

    if (fabBackToTop) {
      fabBackToTop.addEventListener("click", function (e) {
        e.preventDefault();
        closeFabMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (fabFeedback) {
      fabFeedback.addEventListener("click", function (e) {
        e.preventDefault();
        closeFabMenu();
        window.location.href = "https://forms.gle/2wtCeo6uMhYx9Dpy8";
      });
    }

    menuItems.forEach(item => {
      if (item.tagName === "A") {
        item.addEventListener("click", () => closeFabMenu());
      }
    });

    document.addEventListener("click", (e) => {
      if (fabContainer.classList.contains("active") && !fabContainer.contains(e.target)) {
        closeFabMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeFabMenu();
    });

    function updateFABOnScroll() {
      const currentScrollY = window.scrollY || 0;
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const totalHeight = documentHeight - viewportHeight;

      if (fabProgressCircle && totalHeight > 0) {
        const progress = Math.min(Math.max(currentScrollY / totalHeight, 0), 1);
        fabProgressCircle.style.strokeDashoffset = (170 - progress * 170).toFixed(2);
      }

      if (!fabContainer.classList.contains("active")) {
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
          fabContainer.classList.add("fab-hidden");
        } else {
          fabContainer.classList.remove("fab-hidden");
        }
      } else {
        fabContainer.classList.remove("fab-hidden");
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateFABOnScroll);
        ticking = true;
      }
    }, { passive: true });

    closeFabMenu();
    updateFABOnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFAB, { once: true });
  } else {
    initFAB();
  }
})();

/* ==========================================================================
   4. Interactive Counter Stats & Parallax
   ========================================================================== */
function initCounterStats() {
  const statNumbers = document.querySelectorAll('.stat-number:not(#liveVisitorCounter)');
  const statsSection = document.querySelector('.stats-section');
  const statCards = document.querySelectorAll('.stat-card[data-tilt]');

  if (!statsSection || statNumbers.length === 0) return;

  let animated = false;

  function runCounterAnimation() {
    if (animated) return;
    animated = true;

    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10) || 0;
      if (target === 0) return;

      const duration = 1600;
      const startTime = performance.now();

      function step(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easedProgress * target);

        if (progress < 1) {
          stat.innerText = currentCount + '+';
          requestAnimationFrame(step);
        } else {
          stat.innerText = target + '+';
          stat.style.transform = 'scale(1.15)';
          setTimeout(() => stat.style.transform = 'scale(1)', 200);
        }
      }

      requestAnimationFrame(step);
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) runCounterAnimation();
    }, { threshold: 0.15 }).observe(statsSection);
  } else {
    runCounterAnimation();
  }

  statCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--stat-x', `${x}px`);
      card.style.setProperty('--stat-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    });
  });
}

/* ==========================================================================
   5. Dynamic Relative Time Calculator
   ========================================================================== */
function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (isNaN(past.getTime()) || diffInSeconds < 0) return "Recently";
  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) return "1 week ago";
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "1 month ago";
  if (diffInMonths < 12) return `${diffInMonths} months ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
}

document.addEventListener('DOMContentLoaded', () => {
  const dateElements = document.querySelectorAll('.update-date[data-date]');
  dateElements.forEach(el => {
    const rawDate = el.getAttribute('data-date');
    const relativeTime = formatTimeAgo(rawDate);
    let textSpan = el.querySelector('.time-text');
    if (!textSpan) {
      textSpan = document.createElement('span');
      textSpan.className = 'time-text';
      el.appendChild(textSpan);
    }
    textSpan.textContent = relativeTime;
  });
});

/* ==========================================================================
   6. SGBAU NEP Official Verticals Calculator Engine
   ========================================================================== */
const SGBAU_NEP_GRADE_SCALE = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0 };

const SGBAU_SCHEME = {
  sem1: [
    { vertical: "Major-T1", title: "Fundamentals of Computer", credit: 2 },
    { vertical: "Major-P1", title: "Lab on Office Automation Tools", credit: 2 },
    { vertical: "Minor-T", title: "Minor Theory", credit: 2 },
    { vertical: "Minor-P", title: "Minor Practical", credit: 2 },
    { vertical: "GOEC-T1", title: "GOEC - I", credit: 2 },
    { vertical: "GOEC-T2", title: "GOEC - II", credit: 2 },
    { vertical: "SEC-P3", title: "SEC Laboratory", credit: 2 },
    { vertical: "AEC-English", title: "AEC English", credit: 1 },
    { vertical: "AEC-MIL", title: "AEC MIL", credit: 1 },
    { vertical: "IKS-Generic", title: "Indian Knowledge Systems", credit: 2 },
    { vertical: "VEC", title: "Value Education Course", credit: 2 },
    { vertical: "CC", title: "Co-Curricular Course", credit: 2 }
  ],
  sem2: [
    { vertical: "Major-T2", title: "Programming with C", credit: 2 },
    { vertical: "Major-P4", title: "Lab on Programming with C", credit: 2 },
    { vertical: "Minor-T", title: "Minor Theory", credit: 2 },
    { vertical: "Minor-P", title: "Minor Practical", credit: 2 },
    { vertical: "GOEC-T3", title: "GOEC - III", credit: 2 },
    { vertical: "GOEC-T4", title: "GOEC - IV", credit: 2 },
    { vertical: "VSC-P6", title: "VSC Laboratory", credit: 2 },
    { vertical: "SEC-P7", title: "SEC Laboratory", credit: 2 },
    { vertical: "AEC-English", title: "AEC English", credit: 1 },
    { vertical: "AEC-MIL", title: "AEC MIL", credit: 1 },
    { vertical: "VEC", title: "Value Education Course", credit: 2 },
    { vertical: "CC", title: "Co-Curricular Course", credit: 2 }
  ],
  sem3: [
    { vertical: "Major-T1", title: "Major Theory - I", credit: 2 },
    { vertical: "Major-T2", title: "Major Theory - II", credit: 2 },
    { vertical: "Major-P", title: "Major Laboratory", credit: 2 },
    { vertical: "IKS-T", title: "IKS in Computational Sciences", credit: 2 },
    { vertical: "Minor-T", title: "Minor Theory", credit: 2 },
    { vertical: "Minor-P", title: "Minor Practical", credit: 2 },
    { vertical: "GOEC-T", title: "GOEC ", credit: 2 },
    { vertical: "VSC-P", title: "VSC Laboratory", credit: 2 },
    { vertical: "AEC-English", title: "AEC English", credit: 1 },
    { vertical: "AEC-MIL", title: "AEC MIL", credit: 1 },
    { vertical: "FP/CES", title: "Field Project Phase-I", credit: 2 },
    { vertical: "CC", title: "Co-Curricular Course", credit: 2 }
  ],
  sem4: [
    { vertical: "Major-T1", title: "Major Theory - I", credit: 2 },
    { vertical: "Major-T2", title: "Major Theory - II", credit: 2 },
    { vertical: "Major-T3", title: "Major Theory - III", credit: 2 },
    { vertical: "Major-P", title: "Major Laboratory", credit: 2 },
    { vertical: "Minor-T", title: "Minor Theory", credit: 2 },
    { vertical: "Minor-P", title: "Minor Practical", credit: 2 },
    { vertical: "GOEC-T", title: "GOEC ", credit: 2 },
    { vertical: "VSC-P", title: "VSC Laboratory", credit: 2 },
    { vertical: "AEC-English", title: "AEC English", credit: 1 },
    { vertical: "AEC-MIL", title: "AEC MIL", credit: 1 },
    { vertical: "FP/CES", title: "Field Project Phase-II", credit: 2 },
    { vertical: "CC", title: "Co-Curricular Course", credit: 2 }
  ],
  sem5: [
    { vertical: "Major-T7", title: "Major Theory - I", credit: 2 },
    { vertical: "Major-T8", title: "Major Theory - II", credit: 2 },
    { vertical: "Major-T9", title: "Advanced Python Programming", credit: 2 },
    { vertical: "Major-Lab-15", title: "Major Laboratory", credit: 2 },
    { vertical: "Major-Elec T1", title: "Major Elective - I", credit: 2 },
    { vertical: "Major-Elec P17", title: "Major Elective Laboratory ", credit: 2 },
    { vertical: "Minor-T5", title: "Computer Networks & Advanced Python", credit: 2 },
    { vertical: "Minor-P18", title: "Minor Laboratory", credit: 2 },
    { vertical: "VSC-P19", title: "VSC Laboratory", credit: 2 },
    { vertical: "SEC-P", title: "SEC Laboratory", credit: 2 },
    { vertical: "FP/CES", title: "Field Project Phase-III", credit: 2 }
  ],
  sem6: [
    { vertical: "Major-T10", title: "Major Theory - I", credit: 2 },
    { vertical: "Major-T11", title: "Major Theory - II", credit: 2 },
    { vertical: "Major-T12", title: "Major Theory - III", credit: 2 },
    { vertical: "Major-Lab-20", title: "Major Laboratory", credit: 2 },
    { vertical: "Major-Elec T12", title: "Major Elective - II", credit: 2 },
    { vertical: "Major-Elec P22", title: "Major Elective Laboratory ", credit: 2 },
    { vertical: "Minor-T6", title: "Minor Theory", credit: 2 },
    { vertical: "Minor-P23", title: "Minor Laboratory", credit: 2 },
    { vertical: "VSC-P24", title: "VSC Laboratory", credit: 2 },
    { vertical: "Internship", title: "Internship / Apprenticeship", credit: 4 }
  ]
};

function switchNepTab(tab) {
  const sgpaView = document.getElementById('nepSgpaView');
  const cgpaView = document.getElementById('nepCgpaView');
  const sgpaBtn = document.getElementById('tabSgpaBtn');
  const cgpaBtn = document.getElementById('tabCgpaBtn');
  const scoreTitle = document.getElementById('dispScoreTitle');

  if (tab === 'sgpa') {
    sgpaView.classList.remove('hidden');
    cgpaView.classList.add('hidden');
    sgpaBtn.classList.add('active');
    cgpaBtn.classList.remove('active');
    scoreTitle.textContent = "Semester SGPA";
    calculateNepSgpa();
  } else {
    sgpaView.classList.add('hidden');
    cgpaView.classList.remove('hidden');
    sgpaBtn.classList.remove('active');
    cgpaBtn.classList.add('active');
    scoreTitle.textContent = "Cumulative CGPA";
    calculateNepCgpa();
  }
}

function renderNepVerticals() {
  const select = document.getElementById('nepSemDropdown');
  const container = document.getElementById('nepVerticalsContainer');
  if (!select || !container) return;

  const semKey = select.value;
  const courses = SGBAU_SCHEME[semKey] || [];
  container.innerHTML = '';

  courses.forEach((c) => {
    let tagClass = "v-major";
    const v = c.vertical.toLowerCase();
    if (v.includes("minor")) tagClass = "v-minor";
    else if (v.includes("vsc") || v.includes("sec")) tagClass = "v-vsc";
    else if (v.includes("iks") || v.includes("goec")) tagClass = "v-iks";
    else if (v.includes("fp") || v.includes("intern")) tagClass = "v-fp";

    const row = document.createElement('div');
    row.className = 'nep-v-row';
    row.innerHTML = `
      <span class="v-tag ${tagClass}">${c.vertical}</span>
      <span class="v-title">${c.title}</span>
      <span class="v-credit" data-credit="${c.credit}">${c.credit}</span>
      <select class="v-grade-select" onchange="calculateNepSgpa()">
        <option value="O">O (10 Pts)</option>
        <option value="A+" selected>A+ (9 Pts)</option>
        <option value="A">A (8 Pts)</option>
        <option value="B+">B+ (7 Pts)</option>
        <option value="B">B (6 Pts)</option>
        <option value="C">C (5 Pts)</option>
        <option value="P">P (4 Pts)</option>
        <option value="F">F (0 Pts)</option>
      </select>
      <span class="v-pts">0</span>
    `;
    container.appendChild(row);
  });

  calculateNepSgpa();
}

function calculateNepSgpa() {
  const rows = document.querySelectorAll('.nep-v-row');
  let totalCredits = 0;
  let totalPoints = 0;

  rows.forEach(row => {
    const credit = parseFloat(row.querySelector('.v-credit').dataset.credit) || 0;
    const grade = row.querySelector('.v-grade-select').value;
    const gradePoint = SGBAU_NEP_GRADE_SCALE[grade] !== undefined ? SGBAU_NEP_GRADE_SCALE[grade] : 0;
    const coursePoints = credit * gradePoint;

    row.querySelector('.v-pts').textContent = coursePoints;
    totalCredits += credit;
    totalPoints += coursePoints;
  });

  const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  let percentage = sgpa > 0 ? ((sgpa - 0.75) * 10) : 0;
  if (percentage < 0) percentage = 0;

  document.getElementById('dispTotalCredits').textContent = totalCredits;
  document.getElementById('dispCreditPoints').textContent = totalPoints;
  document.getElementById('dispScoreVal').textContent = sgpa.toFixed(2);
  document.getElementById('dispPercentVal').textContent = percentage.toFixed(2) + '%';
}

function setupNepCgpaGrid() {
  const container = document.getElementById('nepCgpaGrid');
  if (!container) return;
  container.innerHTML = '';

  for (let s = 1; s <= 6; s++) {
    const card = document.createElement('div');
    card.className = 'cgpa-sem-card';
    card.innerHTML = `
      <label>Semester ${s} (22 Credits)</label>
      <div class="cgpa-sem-inputs">
        <input type="number" step="0.01" min="0" max="10" class="calc-input sem-sgpa-val" placeholder="SGPA" oninput="calculateNepCgpa()">
      </div>
    `;
    container.appendChild(card);
  }
}

function calculateNepCgpa() {
  const inputs = document.querySelectorAll('.sem-sgpa-val');
  let totalCredits = 0;
  let totalWeighted = 0;

  inputs.forEach(input => {
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
      totalCredits += 22;
      totalWeighted += (val * 22);
    }
  });

  const cgpa = totalCredits > 0 ? (totalWeighted / totalCredits) : 0;
  let percentage = cgpa > 0 ? ((cgpa - 0.75) * 10) : 0;
  if (percentage < 0) percentage = 0;

  document.getElementById('dispTotalCredits').textContent = totalCredits;
  document.getElementById('dispCreditPoints').textContent = totalWeighted.toFixed(1);
  document.getElementById('dispScoreVal').textContent = cgpa.toFixed(2);
  document.getElementById('dispPercentVal').textContent = percentage.toFixed(2) + '%';
}

function resetCurrentSemGrades() {
  document.querySelectorAll('.v-grade-select').forEach(sel => sel.value = 'A');
  calculateNepSgpa();
}

function resetCgpaAll() {
  document.querySelectorAll('.sem-sgpa-val').forEach(inp => inp.value = '');
  calculateNepCgpa();
}

document.addEventListener('DOMContentLoaded', () => {
  renderNepVerticals();
  setupNepCgpaGrid();
});

/* ==========================================================================
   7. LIVE CLICK COUNTER (Working Active API - Starts from 500)
   ========================================================================== */
(function() {
  const BASE_CLICKS = 500;
  const STORAGE_KEY = 'forsko_clicks_live_v2';
  
  let savedLocalCount = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
  let targetTotal = BASE_CLICKS + savedLocalCount;
  let hasAnimated = false;

  // Active High-Speed Counter API (Miles Hilliard Free CountAPI Engine)
  fetch('https://countapi.mileshilliard.com/api/v1/hit/forsko_in_prod_500')
    .then(res => {
      if (!res.ok) throw new Error('API offline');
      return res.json();
    })
    .then(data => {
      if (data && (data.value !== undefined)) {
        const cloudCount = parseInt(data.value, 10) || 1;
        targetTotal = BASE_CLICKS + cloudCount;
        localStorage.setItem(STORAGE_KEY, cloudCount);

        const counterEl = document.getElementById('liveVisitorCounter');
        if (counterEl && hasAnimated) {
          counterEl.innerText = targetTotal.toLocaleString();
        }
      }
    })
    .catch(() => {
      // Offline fallback: Har visit par +1 locally badhega
      savedLocalCount++;
      localStorage.setItem(STORAGE_KEY, savedLocalCount);
      targetTotal = BASE_CLICKS + savedLocalCount;
    });

  function animateClickNumber() {
    const counterEl = document.getElementById('liveVisitorCounter');
    if (!counterEl || hasAnimated) return;
    hasAnimated = true;

    const duration = 1400;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * targetTotal);

      counterEl.innerText = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counterEl.innerText = targetTotal.toLocaleString();
        counterEl.style.transform = 'scale(1.15)';
        setTimeout(() => counterEl.style.transform = 'scale(1)', 200);
      }
    }

    requestAnimationFrame(step);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(animateClickNumber, 100);
        }
      }, { threshold: 0.15 }).observe(statsSection);
    } else {
      setTimeout(animateClickNumber, 400);
    }
  });
})();

/* ==========================================================================
   8. Clean Auto-Resizing College Rotator
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const windowEl = document.getElementById('rotatorWindow');
  const rotatorBox = document.getElementById('heroCollegeRotator');
  if (!windowEl || !rotatorBox) return;

  const items = Array.from(windowEl.querySelectorAll('.rotator-item'));
  if (items.length <= 1) return;

  function fitWidth(item) {
    if (item) {
      const targetWidth = Math.min(item.scrollWidth + 4, 380);
      windowEl.style.width = targetWidth + 'px';
    }
  }

  fitWidth(items[0]);

  let currentIndex = 0;
  let isHovered = false;

  rotatorBox.addEventListener('mouseenter', () => { isHovered = true; });
  rotatorBox.addEventListener('mouseleave', () => { isHovered = false; });

  setInterval(() => {
    if (isHovered) return;

    const currentItem = items[currentIndex];
    currentItem.classList.remove('active');
    currentItem.classList.add('exit');

    currentIndex = (currentIndex + 1) % items.length;
    const nextItem = items[currentIndex];

    fitWidth(nextItem);
    nextItem.classList.remove('exit');
    nextItem.classList.add('active');

    setTimeout(() => {
      currentItem.classList.remove('exit');
    }, 400);
  }, 2800);
});

/* ==========================================================================
   9. Collapsible Toggles (Latest Updates & Calculator - Default Hidden)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Calculator Toggle
  const toggleCalcBtn = document.getElementById('toggleCalcBtn');
  const calcCardWrapper = document.getElementById('calcCardWrapper');
  const toggleCalcText = document.getElementById('toggleCalcText');
  const toggleCalcIcon = document.getElementById('toggleCalcIcon');

  if (toggleCalcBtn && calcCardWrapper) {
    toggleCalcBtn.addEventListener('click', () => {
      const isCollapsed = calcCardWrapper.classList.toggle('collapsed');
      toggleCalcText.textContent = isCollapsed ? 'Show' : 'Hide';
      toggleCalcIcon.className = isCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
      toggleCalcBtn.setAttribute('aria-expanded', !isCollapsed);
    });
  }

  // Updates Toggle
  const toggleUpdatesBtn = document.getElementById('toggleUpdatesBtn');
  const updatesGridWrapper = document.getElementById('updatesGridWrapper');
  const toggleUpdatesText = document.getElementById('toggleUpdatesText');
  const toggleUpdatesIcon = document.getElementById('toggleUpdatesIcon');

  if (toggleUpdatesBtn && updatesGridWrapper) {
    toggleUpdatesBtn.addEventListener('click', () => {
      const isCollapsed = updatesGridWrapper.classList.toggle('collapsed');
      toggleUpdatesText.textContent = isCollapsed ? 'Show' : 'Hide';
      toggleUpdatesIcon.className = isCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
      toggleUpdatesBtn.setAttribute('aria-expanded', !isCollapsed);
    });
  }

  // FAB Menu se direct Calculator open ho
  const fabCalcBtn = document.getElementById('fabSGPACGPA');
  if (fabCalcBtn && calcCardWrapper) {
    fabCalcBtn.addEventListener('click', () => {
      if (calcCardWrapper.classList.contains('collapsed')) {
        calcCardWrapper.classList.remove('collapsed');
        if (toggleCalcText) toggleCalcText.textContent = 'Hide';
        if (toggleCalcIcon) toggleCalcIcon.className = 'fa-solid fa-chevron-up';
        if (toggleCalcBtn) toggleCalcBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // FAB Menu se direct Updates open ho
  const fabFeedBtn = document.getElementById('fabFeedSecondary');
  if (fabFeedBtn && updatesGridWrapper) {
    fabFeedBtn.addEventListener('click', () => {
      if (updatesGridWrapper.classList.contains('collapsed')) {
        updatesGridWrapper.classList.remove('collapsed');
        if (toggleUpdatesText) toggleUpdatesText.textContent = 'Hide';
        if (toggleUpdatesIcon) toggleUpdatesIcon.className = 'fa-solid fa-chevron-up';
        if (toggleUpdatesBtn) toggleUpdatesBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }
});


/* ==========================================================================
   FORSKO ANNOUNCEMENT MODAL CONTROLLER (Fixed DOM Timing & Session Handler)
   ========================================================================== */
function initForskoPricingModal() {
  const SESSION_KEY = 'forsko_pricing_popup_seen';
  const overlay = document.getElementById('forskoPricingOverlay');
  const closeBtn = document.getElementById('forskoPricingCloseBtn');
  const actionBtn = document.getElementById('forskoPricingActionBtn');

  // If the popup HTML is not on this page, exit gracefully
  if (!overlay) return;

  function markSessionSeen() {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {}
  }

  function isSessionSeen() {
    try {
      // Allows testing instantly by adding ?test_popup=1 to the URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('test_popup') === '1') return false;

      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function openPricingPopup() {
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');

    // Force layout reflow before triggering smooth opacity & scale transition
    void overlay.offsetWidth;
    overlay.classList.add('active');

    if (closeBtn) closeBtn.focus();
  }

  function closePricingPopup() {
    markSessionSeen();
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      overlay.style.display = 'none';
    }, 320);
  }

  // Event Listeners for Closing
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closePricingPopup();
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closePricingPopup();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closePricingPopup();
    }
  });

  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      closePricingPopup();
    });
  }

  // Trigger popup after page and splash screen finish loading
  function schedulePopup() {
    if (isSessionSeen()) return;

    // Checks if the cinematic splash screen is running
    const splash = document.getElementById('forskoSplashScreen');
    const delayTime = splash ? 3500 : 800;

    setTimeout(() => {
      if (!isSessionSeen()) {
        openPricingPopup();
      }
    }, delayTime);
  }

  // If the window has already loaded, trigger immediately; otherwise listen for 'load'
  if (document.readyState === 'complete') {
    schedulePopup();
  } else {
    window.addEventListener('load', schedulePopup);
  }
}

// Ensure the HTML DOM elements are completely parsed before running
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForskoPricingModal);
} else {
  initForskoPricingModal();
}