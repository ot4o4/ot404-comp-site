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

// =========================================================
// Formulaire "Décrivez votre panne" → WhatsApp
// =========================================================
(function initRepairForm() {
  const WHATSAPP_NUMBER = "221772947958";
  const MAX_FILES = 8;
  const MAX_FILE_BYTES = 16 * 1024 * 1024; // 16 Mo par fichier
  const MAX_TOTAL_BYTES = 80 * 1024 * 1024; // 80 Mo au total

  const form = document.getElementById("repairForm");
  if (!form) return;

  const fileInput = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreview");
  const filesCountEl = document.getElementById("filesCount");
  const problemText = document.getElementById("problemText");
  const formHint = document.getElementById("formHint");
  const pxShell = document.getElementById("pxShell");
  const sendBtn = form.querySelector(".px-send");

  /** @type {File[]} */
  let attachedFiles = [];
  /** Map<File, string> pour libérer les object URLs */
  const objectUrls = new Map();

  // ---------- Format helpers ----------
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / 1024 / 1024).toFixed(1) + " Mo";
  }

  function revokeObjectUrl(file) {
    const url = objectUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.delete(file);
    }
  }

  // ---------- File handling ----------
  function addFiles(fileList) {
    let rejected = null;
    let totalBytes = attachedFiles.reduce((sum, f) => sum + f.size, 0);

    for (const file of Array.from(fileList)) {
      if (attachedFiles.length >= MAX_FILES) {
        rejected = `Maximum ${MAX_FILES} fichiers.`;
        break;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        rejected = "Format non supporté. Utilisez une image ou une vidéo.";
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        rejected = `"${file.name}" dépasse 16 Mo.`;
        continue;
      }
      if (totalBytes + file.size > MAX_TOTAL_BYTES) {
        rejected = "Total des pièces jointes trop volumineux (80 Mo max).";
        break;
      }
      attachedFiles.push(file);
      totalBytes += file.size;
    }

    renderFiles();
    setHint(rejected, rejected ? "is-error" : null);
  }

  function removeFile(file) {
    const idx = attachedFiles.indexOf(file);
    if (idx === -1) return;
    attachedFiles.splice(idx, 1);
    revokeObjectUrl(file);
    renderFiles();
  }

  function renderFiles() {
    filePreview.innerHTML = "";
    if (attachedFiles.length === 0) {
      filePreview.hidden = true;
      filesCountEl.hidden = true;
      return;
    }
    filePreview.hidden = false;
    filesCountEl.hidden = false;
    filesCountEl.textContent =
      attachedFiles.length === 1
        ? "1 fichier"
        : `${attachedFiles.length} fichiers`;

    for (const file of attachedFiles) {
      const chip = document.createElement("div");
      chip.className = "px-chip";

      // Vignette
      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.className = "px-chip-thumb";
        img.alt = "";
        let url = objectUrls.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          objectUrls.set(file, url);
        }
        img.src = url;
        img.onload = () => {
          // Libère après que le navigateur ait décodé l'image
          setTimeout(() => revokeObjectUrl(file), 30000);
        };
        chip.appendChild(img);
      } else {
        const thumb = document.createElement("div");
        thumb.className = "px-chip-thumb is-video";
        thumb.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
        chip.appendChild(thumb);
      }

      const name = document.createElement("span");
      name.className = "px-chip-name";
      name.textContent = file.name;
      chip.appendChild(name);

      const size = document.createElement("span");
      size.className = "px-chip-size";
      size.textContent = formatBytes(file.size);
      chip.appendChild(size);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "px-chip-remove";
      remove.setAttribute("aria-label", `Retirer ${file.name}`);
      remove.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
      remove.addEventListener("click", () => removeFile(file));
      chip.appendChild(remove);

      filePreview.appendChild(chip);
    }
  }

  function setHint(message, state) {
    if (!formHint) return;
    formHint.classList.remove("is-error", "is-success");
    if (state) formHint.classList.add(state);
    if (message) {
      formHint.innerHTML = message;
    }
  }

  // ---------- File input + drag & drop ----------
  fileInput.addEventListener("change", (e) => {
    addFiles(e.target.files);
    // reset pour pouvoir re-sélectionner le même fichier
    fileInput.value = "";
  });

  if (pxShell) {
    let dragDepth = 0;
    ["dragenter"].forEach((evt) => {
      pxShell.addEventListener(evt, (e) => {
        e.preventDefault();
        dragDepth++;
        pxShell.classList.add("is-drag");
      });
    });
    ["dragleave"].forEach((evt) => {
      pxShell.addEventListener(evt, (e) => {
        e.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) pxShell.classList.remove("is-drag");
      });
    });
    ["dragover", "drop"].forEach((evt) => {
      pxShell.addEventListener(evt, (e) => {
        e.preventDefault();
        if (evt === "drop") {
          dragDepth = 0;
          pxShell.classList.remove("is-drag");
          if (e.dataTransfer && e.dataTransfer.files) {
            addFiles(e.dataTransfer.files);
          }
        }
      });
    });
  }

  // Empêche la page d'ouvrir un fichier si on loupe la cible
  ["dragover", "drop"].forEach((evt) => {
    window.addEventListener(evt, (e) => {
      if (!e.target.closest(".px-shell")) e.preventDefault();
    });
  });

  // ---------- Pills (sélecteurs) ----------
  document.querySelectorAll(".px-pill").forEach((pill) => {
    const menu = pill.querySelector(".px-pill-menu");
    const label = pill.querySelector(".px-pill-label");
    if (!menu || !label) return;

    pill.addEventListener("click", (e) => {
      if (e.target.closest(".px-pill-menu")) return;
      const willOpen = !pill.classList.contains("open");
      document
        .querySelectorAll(".px-pill.open")
        .forEach((p) => {
          if (p !== pill) p.classList.remove("open");
        });
      pill.classList.toggle("open", willOpen);
    });

    menu.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = btn.dataset.value;
        label.textContent = value;
        pill.dataset.value = value;
        menu.querySelectorAll("button").forEach((b) =>
          b.classList.remove("active")
        );
        btn.classList.add("active");
        pill.classList.remove("open");
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".px-pill")) {
      document
        .querySelectorAll(".px-pill.open")
        .forEach((p) => p.classList.remove("open"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".px-pill.open")
        .forEach((p) => p.classList.remove("open"));
    }
  });

  // ---------- Submit → WhatsApp + downloads ----------
  function buildWhatsAppUrl() {
    const text = (problemText.value || "").trim();
    const type = document.querySelector('[data-pill="type"]')?.dataset.value || "Mobile";
    const urgency =
      document.querySelector('[data-pill="urgency"]')?.dataset.value || "Normal";

    const lines = [];
    lines.push("Bonjour OT404 COMP.,");
    lines.push("");
    lines.push("*Demande de réparation*");
    lines.push(`• Type d'appareil : ${type}`);
    lines.push(`• Urgence : ${urgency}`);
    lines.push("");
    if (text) {
      lines.push("*Description :*");
      lines.push(text);
    } else {
      lines.push("*(Description à compléter)*");
    }

    if (attachedFiles.length > 0) {
      lines.push("");
      const n = attachedFiles.length;
      lines.push(
        `📎 ${n} pièce${n > 1 ? "s" : ""} jointe${n > 1 ? "s" : ""} téléchargée${
          n > 1 ? "s" : ""
        } :`
      );
      attachedFiles.forEach((f, i) => {
        lines.push(`  ${i + 1}. ${f.name} (${formatBytes(f.size)})`);
      });
      lines.push("");
      lines.push("👉 Joignez ces fichiers à ce message pour finaliser la demande.");
    }

    lines.push("");
    lines.push("Merci !");

    const message = lines.join("\n");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function downloadFile(file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Garde l'URL vivante un peu puis libère
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = (problemText.value || "").trim();

    if (!text && attachedFiles.length === 0) {
      problemText.focus();
      setHint(
        "Décrivez votre panne ou ajoutez au moins une photo pour continuer.",
        "is-error"
      );
      return;
    }

    const url = buildWhatsAppUrl();
    sendBtn.disabled = true;

    // Ouvre WhatsApp en priorité (évite les popups bloqués)
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      // Fallback : redirige l'onglet courant si popup bloquée
      window.location.href = url;
      return;
    }

    // Déclenche les téléchargements des pièces jointes
    if (attachedFiles.length > 0) {
      attachedFiles.forEach((file, i) => {
        setTimeout(() => downloadFile(file), i * 180);
      });
      setHint(
        "✓ WhatsApp s'est ouvert. Vos pièces jointes ont été téléchargées — glissez-les dans le message WhatsApp.",
        "is-success"
      );
    } else {
      setHint("✓ WhatsApp s'est ouvert avec votre message.", "is-success");
    }

    setTimeout(() => {
      sendBtn.disabled = false;
    }, 1500);
  });

  // Auto-grow du textarea
  problemText.addEventListener("input", () => {
    problemText.style.height = "auto";
    const newHeight = Math.min(problemText.scrollHeight, 220);
    problemText.style.height = newHeight + "px";
  });
})();
