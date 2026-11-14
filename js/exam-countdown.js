/**
 * FORSKO - Horizontal Exam Countdowns & Motivational Quotes (Live Admin Sync)
 */

// Default Fallback Config (Admin se save karne par Firestore ise live override karega)
const COUNTDOWN_CONFIG = [
  { // Card 1: First Year
    id: "1",
    slotKey: "slot1",
    mode: "timer",
    targetDate: new Date("November 02, 2026 09:00:00").getTime(),
    daysId: "days-1",
    hoursId: "hours-1",
    minutesId: "minutes-1",
    secondsId: "seconds-1",
    timerId: "timer-1",
    expiredId: "expired-1"
  },
  { // Card 2: Second Year
    id: "2",
    slotKey: "slot2",
    mode: "timer",
    targetDate: new Date("December 21, 2026 09:00:00").getTime(),
    daysId: "days-2",
    hoursId: "hours-2",
    minutesId: "minutes-2",
    secondsId: "seconds-2",
    timerId: "timer-2",
    expiredId: "expired-2"
  },
  { // Card 3: Third Year
    id: "3",
    slotKey: "slot3",
    mode: "coming_soon",
    targetDate: NaN,
    daysId: "days-3",
    hoursId: "hours-3",
    minutesId: "minutes-3",
    secondsId: "seconds-3",
    timerId: "timer-3",
    expiredId: "expired-3"
  },
  { // Card 4: Back Exams
    id: "4",
    slotKey: "slot4",
    mode: "coming_soon",
    targetDate: NaN,
    daysId: "days-4",
    hoursId: "hours-4",
    minutesId: "minutes-4",
    secondsId: "seconds-4",
    timerId: "timer-4",
    expiredId: "expired-4"
  }
];

const MOTIVATIONAL_QUOTES = [
  "\"Every line of code you write brings you closer to your goal. Stay focused!\"",
  "\"Consistency beats intensity. 1 hour of daily revision creates top rankers!\"",
  "\"You are building your future. Finish your degree strong and make it count!\"",
  "\"Smart work + PYQ analysis = 90%+ in SGBAU Semester Exams.\"",
  "\"Believe in your logic, debug your doubts, and master your subjects!\"",
  "\"Small daily efforts multiply into massive exam success. Keep going!\""
];

document.addEventListener("DOMContentLoaded", () => {

  function padZero(num) {
    return String(num).padStart(2, "0");
  }

  function safeHref(url) {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (/^(javascript|data|vbscript):/i.test(trimmed)) return "";
    return trimmed;
  }

  function updateAllCountdowns() {
    const now = Date.now();

    COUNTDOWN_CONFIG.forEach(config => {
      const daysEl = document.getElementById(config.daysId);
      const hoursEl = document.getElementById(config.hoursId);
      const minutesEl = document.getElementById(config.minutesId);
      const secondsEl = document.getElementById(config.secondsId);
      const timerBox = document.getElementById(config.timerId);
      const expiredMsg = document.getElementById(config.expiredId);

      // Coming Soon mode
      if (config.mode === "coming_soon" || isNaN(config.targetDate)) {
        if (timerBox) timerBox.style.display = "none";
        if (expiredMsg) {
          expiredMsg.classList.remove("hidden");
          expiredMsg.innerHTML = '<span class="coming-soon-badge">⏳ Coming Soon</span>';
        }
        return;
      }

      const timeRemaining = config.targetDate - now;

      // Exam Started mode
      if (timeRemaining <= 0) {
        if (timerBox) timerBox.style.display = "none";
        if (expiredMsg) {
          expiredMsg.classList.remove("hidden");
          expiredMsg.innerHTML = '<span class="expired-badge">🎉 Exam Started</span>';
        }
        return;
      }

      // Live Timer Active
      if (timerBox) timerBox.style.display = "flex";
      if (expiredMsg) expiredMsg.classList.add("hidden");

      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = padZero(days);
      if (hoursEl) hoursEl.textContent = padZero(hours);
      if (minutesEl) minutesEl.textContent = padZero(minutes);
      if (secondsEl) secondsEl.textContent = padZero(seconds);
    });
  }

  // Live Firestore Sync with Admin Countdown Manager
  function connectAdminCountdowns() {
    if (typeof firebase === "undefined" || !firebase.apps.length) return;
    const db = firebase.firestore();
    const cards = document.querySelectorAll("#examCountdownSection .countdown-card");

    db.collection("site_settings").doc("exam_countdowns").onSnapshot(doc => {
      if (!doc.exists) return;
      const slots = doc.data().slots || {};

      COUNTDOWN_CONFIG.forEach((config, idx) => {
        const slotData = slots[config.slotKey];
        const cardEl = cards[idx];
        if (!slotData) return;

        // Update mode & targetDate
        config.mode = slotData.mode || "coming_soon";
        config.targetDate = slotData.examDateISO ? new Date(slotData.examDateISO).getTime() : NaN;

        if (cardEl) {
          // Update Card Title
          const titleEl = cardEl.querySelector(".card-title");
          if (titleEl && slotData.title) {
            titleEl.textContent = slotData.title;
          }

          // Update Footer Date Text
          const dateEl = cardEl.querySelector(".exam-date");
          if (dateEl) {
            dateEl.innerHTML = '<i class="fa-regular fa-calendar-days"></i> ';
            dateEl.appendChild(document.createTextNode(slotData.dateLabel || "Coming Soon"));
          }

          // Update / Add / Remove Schedule PDF Button
          const footer = cardEl.querySelector(".card-footer");
          if (footer) {
            let schedBtn = footer.querySelector(".card-btn");
            const cleanUrl = safeHref(slotData.scheduleUrl);
            if (cleanUrl) {
              if (!schedBtn) {
                schedBtn = document.createElement("a");
                schedBtn.className = "card-btn";
                schedBtn.innerHTML = 'Schedule <i class="fa-solid fa-arrow-right"></i>';
                footer.appendChild(schedBtn);
              }
              schedBtn.setAttribute("href", cleanUrl);
            } else if (schedBtn) {
              schedBtn.remove();
            }
          }
        }
      });

      updateAllCountdowns();
    }, err => {
      console.warn("Countdown Firestore sync error:", err);
    });
  }

  // Interactive Click to Change Motivational Quote
  ["1", "2", "3", "4"].forEach(id => {
    const box = document.getElementById(`motivation-${id}`);
    const textEl = document.getElementById(`quote-${id}`);

    if (box && textEl) {
      box.addEventListener("click", () => {
        textEl.style.opacity = "0";
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
          textEl.textContent = MOTIVATIONAL_QUOTES[randomIndex];
          textEl.style.opacity = "1";
        }, 200);
      });
    }
  });

  // Start Countdown & Admin Sync
  updateAllCountdowns();
  setInterval(updateAllCountdowns, 1000);
  connectAdminCountdowns();

});