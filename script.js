// Page Loader
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('loaded'), 800);
    setTimeout(() => loader.remove(), 1500);
  }
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent failure: SW is progressive enhancement
    });
  }
});

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");
const reveals = document.querySelectorAll(".reveal");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("open");
  navLinks.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("open");
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

reveals.forEach((item) => revealObserver.observe(item));

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const motionSurfaces = document.querySelectorAll(
    ".nav-shell, .service-card, .expertise-card, .trust-card, .review-invite, .contact-details > a, .testimonial-card, .faq-item, .pricing-card"
  );
  const motionIcons = document.querySelectorAll(".service-icon, .mini-icon, .detail-icon");

  motionSurfaces.forEach((surface, index) => {
    const duration = 8 + Math.random() * 7;
    const delay = -(index * 1.9 + Math.random() * 5);
    surface.classList.add("motion-glass");
    surface.style.setProperty("--shine-duration", `${duration.toFixed(2)}s`);
    surface.style.setProperty("--shine-delay", `${delay.toFixed(2)}s`);
  });

  motionIcons.forEach((icon, index) => {
    const duration = 4.8 + Math.random() * 3.2;
    const delay = -(index * 0.75 + Math.random() * 2);
    icon.classList.add("motion-icon");
    icon.style.setProperty("--icon-duration", `${duration.toFixed(2)}s`);
    icon.style.setProperty("--icon-delay", `${delay.toFixed(2)}s`);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navItems.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55%", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

document.querySelector("#year").textContent = new Date().getFullYear();

// Scroll to Top
const scrollTopBtn = document.getElementById("scrollTop");
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 600);
  });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Live open/closed status (Africa/Dakar, UTC+0, no DST)
const openStatus = document.getElementById("openStatus");
if (openStatus) {
  const statusText = openStatus.querySelector(".status-text");
  const statusEta = openStatus.querySelector(".status-eta");

  // Schedule: day -> { open, close } in minutes from midnight
  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const SCHEDULE = {
    0: { open: 10 * 60, close: 23 * 60 }, // Dim
    1: { open: 10 * 60, close: 23 * 60 },
    2: { open: 10 * 60, close: 23 * 60 },
    3: { open: 10 * 60, close: 23 * 60 },
    4: { open: 10 * 60, close: 23 * 60 },
    5: { open: 15 * 60, close: 23 * 60 }, // Ven
    6: { open: 10 * 60, close: 23 * 60 }, // Sam
  };
  const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}`;
  }

  function formatCountdown(totalMinutes) {
    if (totalMinutes <= 0) return "à l'instant";
    if (totalMinutes < 60) return `dans ${totalMinutes} min`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) return `dans ${h} h`;
    return `dans ${h} h ${String(m).padStart(2, "0")}`;
  }

  function getDakarParts() {
    const dakar = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Africa/Dakar" })
    );
    return {
      day: dakar.getDay(),
      minutes: dakar.getHours() * 60 + dakar.getMinutes(),
    };
  }

  let lastState = null;

  function updateOpenStatus() {
    const { day, minutes } = getDakarParts();
    const today = SCHEDULE[day];

    let isOpen = false;
    let etaText = "";

    if (minutes >= today.open && minutes < today.close) {
      // Currently open
      isOpen = true;
      const remaining = today.close - minutes;
      if (remaining <= 120) {
        etaText = `Ferme ${formatCountdown(remaining)}`;
      } else {
        etaText = `Ferme à ${formatTime(today.close)}`;
      }
    } else {
      // Currently closed
      isOpen = false;
      if (minutes < today.open) {
        // Opens later today
        const wait = today.open - minutes;
        etaText = wait <= 240
          ? `Ouvre ${formatCountdown(wait)}`
          : `Ouvre à ${formatTime(today.open)}`;
      } else {
        // Opens next open day
        for (let offset = 1; offset <= 7; offset++) {
          const nextDay = (day + offset) % 7;
          const next = SCHEDULE[nextDay];
          if (next.open < next.close) {
            const dayLabel = offset === 1 ? "demain" : DAY_NAMES[nextDay];
            etaText = `Ouvre ${dayLabel} ${formatTime(next.open)}`;
            break;
          }
        }
      }
    }

    const newState = isOpen ? "open" : "closed";
    if (lastState !== null && lastState !== newState) {
      openStatus.classList.add("is-changing");
      setTimeout(() => openStatus.classList.remove("is-changing"), 500);
    }
    lastState = newState;

    openStatus.dataset.state = newState;
    statusText.textContent = isOpen ? "Ouvert" : "Fermé";
    statusEta.textContent = etaText;
    openStatus.setAttribute("aria-label",
      isOpen
        ? `Ouvert maintenant. ${etaText}.`
        : `Fermé. ${etaText}.`
    );
  }

  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);
}

// Lazy-load videos: load source only when the video enters the viewport
const lazyVideos = document.querySelectorAll("video[data-lazy-video]");
if (lazyVideos.length && "IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        const sources = video.querySelectorAll("source[data-src]");
        sources.forEach((source) => {
          source.src = source.dataset.src;
        });
        video.load();
        videoObserver.unobserve(video);
      });
    },
    { rootMargin: "200px 0px" }
  );
  lazyVideos.forEach((video) => videoObserver.observe(video));
}

// Floating WhatsApp button: ensure it doesn't cover content at the bottom
const whatsappFloat = document.querySelector(".whatsapp-float");
const footer = document.querySelector("footer");
if (whatsappFloat && footer) {
  const floatObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        whatsappFloat.classList.toggle("near-footer", entry.isIntersecting);
      });
    },
    { threshold: 0.1 }
  );
  floatObserver.observe(footer);
}

// Mobile sticky CTA: hide when the footer comes into view
const mobileCta = document.getElementById("mobileCta");
if (mobileCta && footer) {
  const ctaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        mobileCta.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    { threshold: 0.05 }
  );
  ctaObserver.observe(footer);
}
