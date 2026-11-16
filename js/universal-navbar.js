(function () {
  "use strict";

  // Script ke src se automatic folder depth pata lagaye ("", "../", "../../")
  var currentScript = document.currentScript;
  var scriptSrc = currentScript ? (currentScript.getAttribute("src") || "") : "";
  var basePath = scriptSrc.replace(/js\/universal-navbar\.js.*$/, "");

  var NAV_ITEMS = [
    { label: "Home", href: "index.html", match: ["index.html", ""] },
    { label: "Syllabus", href: "pages/syllabus.html", match: ["syllabus", "first-year", "second-year", "third-year", "semester1", "semester2", "semester3", "semester4", "semester5", "semester6"] },
    { label: "Notes", href: "pages/notes.html", match: ["notes"] },
    { label: "PYQs", href: "pages/pyqs.html", match: ["pyqs"] },
    { label: "Question Banks", href: "pages/question-bank.html", match: ["question-bank", "qb-"] },
    { label: "Sample Papers", href: "pages/paper-patterns.html", match: ["paper-patterns"] },
    { label: "Practicals", href: "pages/practical.html", match: ["p-","practical"] },
    { label: "Contact", href: "pages/contact.html", match: ["contact"] }
  ];

function getActiveHref() {
    var path = window.location.pathname.toLowerCase();
    var file = path.split("/").pop() || "index.html";

    // 1. Specific categories FIRST (taaki "first-year" ya "semester1" Syllabus se clash na kare)
    if (path.indexOf("/practical") !== -1 || file.indexOf("practical") !== -1 || path.indexOf("/lab") !== -1) {
      return "pages/practical.html";
    }
    if (path.indexOf("/notes/") !== -1 || file.indexOf("notes") !== -1) {
      return "pages/notes.html";
    }
    if (path.indexOf("/pyqs/") !== -1 || file.indexOf("pyq") !== -1) {
      return "pages/pyqs.html";
    }
    if (file.indexOf("qb-") !== -1 || file.indexOf("question-bank") !== -1 || path.indexOf("/qb") !== -1) {
      return "pages/question-bank.html";
    }
    if (file.indexOf("paper-pattern") !== -1 || file.indexOf("sample-paper") !== -1) {
      return "pages/paper-patterns.html";
    }
    if (file.indexOf("contact") !== -1) {
      return "pages/contact.html";
    }

    // 2. Breadcrumb fallback (agar file name me category na likhi ho)
    var bc = document.querySelector(".breadcrumb");
    if (bc) {
      var bcText = bc.textContent.toLowerCase();
      if (bcText.indexOf("practical") !== -1) return "pages/practical.html";
      if (bcText.indexOf("question bank") !== -1) return "pages/question-bank.html";
      if (bcText.indexOf("pyq") !== -1) return "pages/pyqs.html";
      if (bcText.indexOf("notes") !== -1) return "pages/notes.html";
      if (bcText.indexOf("paper pattern") !== -1 || bcText.indexOf("sample paper") !== -1) return "pages/paper-patterns.html";
      if (bcText.indexOf("syllabus") !== -1) return "pages/syllabus.html";
    }

    // 3. Home & Syllabus fallback
    if (file === "" || file === "index.html") {
      return "index.html";
    }

    for (var i = 0; i < NAV_ITEMS.length; i++) {
      var item = NAV_ITEMS[i];
      for (var j = 0; j < item.match.length; j++) {
        var token = item.match[j];
        if (token !== "" && file.indexOf(token) !== -1) return item.href;
      }
    }
    return "";
  }

  function buildNavbarHTML() {
    var activeHref = getActiveHref();

    var linksHTML = NAV_ITEMS.map(function (item) {
      var isActive = item.href === activeHref ? " active" : "";
      return '<a href="' + basePath + item.href + '" class="nav-link' + isActive + '">' + item.label + "</a>";
    }).join("\n        ");

    return (
      '<header class="navbar fors-u-nav" id="forskoUniversalNav">' +
        '<div class="nav-container">' +
          '<a href="' + basePath + 'index.html" class="logo">' +
            '<img src="' + basePath + 'images/FORSKO2.png" alt="Forsko Logo" class="logo-image">' +
          "</a>" +
          '<nav class="nav-menu" id="forskoNavMenu">' +
            linksHTML +
          "</nav>" +
          '<button class="hamburger" id="forskoHamburger" type="button" aria-label="Toggle navigation">' +
            '<i class="fa-solid fa-bars"></i>' +
          "</button>" +
        "</div>" +
      "</header>"
    );
  }

  function applyHeroOffset(navEl) {
    // Body par kabhi paddingTop nahi lagayenge (warna upar dark rectangle dikhta hai)
    document.body.style.paddingTop = "";

    var firstTarget = document.querySelector(".hero, .page-hero");

    if (!firstTarget) {
      var container = document.querySelector("main") || document.body;
      var children = Array.prototype.slice.call(container.children);
      for (var i = 0; i < children.length; i++) {
        var el = children[i];
        var tag = el.tagName;
        if (
          el === navEl ||
          el.id === "forskoLiveNoticeBar" ||
          tag === "SCRIPT" ||
          tag === "STYLE" ||
          tag === "LINK"
        ) {
          continue;
        }
        var cs = window.getComputedStyle(el);
        if (cs.position === "fixed" || cs.display === "none") {
          continue;
        }
        firstTarget = el;
        break;
      }
    }

    if (firstTarget) {
      firstTarget.classList.add("fors-nav-offset");

      // Agar page ki apni CSS strong !important se padding-top kam rakhe to inline safeguard
      var currentPad = parseFloat(window.getComputedStyle(firstTarget).paddingTop) || 0;
      var minPad = window.innerWidth <= 768 ? 112 : 125;
      if (currentPad < minPad) {
        firstTarget.style.setProperty("padding-top", minPad + "px", "important");
      }
    }
  }

  function initUniversalNavbar() {
    var mountPoint = document.getElementById("forsko-navbar") || document.getElementById("navbar");
    var wrapper = document.createElement("div");
    wrapper.innerHTML = buildNavbarHTML();
    var navEl = wrapper.firstElementChild;

    if (mountPoint && mountPoint.parentNode) {
      mountPoint.parentNode.replaceChild(navEl, mountPoint);
    } else {
      document.body.insertBefore(navEl, document.body.firstChild);
    }

    applyHeroOffset(navEl);

    var hamburger = document.getElementById("forskoHamburger");
    var navMenu = document.getElementById("forskoNavMenu");

    function closeMenu() {
      if (!navMenu) return;
      navMenu.classList.remove("active");
      var icon = hamburger ? hamburger.querySelector("i") : null;
      if (icon) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    }

    if (hamburger && navMenu) {
      hamburger.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = navMenu.classList.toggle("active");
        var icon = hamburger.querySelector("i");
        if (icon) {
          if (isOpen) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
          } else {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
          }
        }
      });

      navMenu.querySelectorAll(".nav-link").forEach(function (link) {
        link.addEventListener("click", closeMenu);
      });

      document.addEventListener("click", function (e) {
        if (navMenu.classList.contains("active") && !navEl.contains(e.target)) {
          closeMenu();
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
    }

    window.addEventListener("scroll", function () {
      if (window.scrollY > 20) {
        navEl.classList.add("scrolled");
      } else {
        navEl.classList.remove("scrolled");
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUniversalNavbar);
  } else {
    initUniversalNavbar();
  }
})();

