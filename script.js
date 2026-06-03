// Page Loader
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('loaded'), 800);
    setTimeout(() => loader.remove(), 1500);
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

  function updateOpenStatus() {
    const dakarString = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Dakar",
    });
    const dakar = new Date(dakarString);
    const day = dakar.getDay();
    const minutesNow = dakar.getHours() * 60 + dakar.getMinutes();

    let isOpen = false;
    if (day === 5) {
      isOpen = minutesNow >= 15 * 60 && minutesNow < 23 * 60;
    } else {
      isOpen = minutesNow >= 10 * 60 && minutesNow < 23 * 60;
    }

    openStatus.dataset.state = isOpen ? "open" : "closed";
    statusText.textContent = isOpen ? "Ouvert maintenant" : "Fermé";
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
