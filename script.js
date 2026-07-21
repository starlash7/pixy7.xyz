const pixelDriftCanvas = document.querySelector("[data-pixel-drift]");

if (pixelDriftCanvas) {
  const pixelDriftText = "ONCHAIN IN MOTION";
  const pixelDriftFallback = document.querySelector(".pixel-drift-fallback");
  const pixelDriftContext = pixelDriftCanvas.getContext("2d");
  const pixelDriftReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!pixelDriftContext) {
    pixelDriftCanvas.hidden = true;
    pixelDriftFallback?.classList.add("is-visible");
  } else {
    let particles = [];
    let pointer = { active: false, x: 0, y: 0 };
    let canvasWidth = 0;
    let canvasHeight = 0;
    let devicePixelRatio = 1;
    const initialParticleSpread = 10;

    const createParticles = () => {
      const bounds = pixelDriftCanvas.getBoundingClientRect();
      canvasWidth = Math.max(1, Math.floor(bounds.width));
      canvasHeight = Math.max(1, Math.floor(bounds.height));
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      pixelDriftCanvas.width = canvasWidth * devicePixelRatio;
      pixelDriftCanvas.height = canvasHeight * devicePixelRatio;
      pixelDriftContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const textCanvas = document.createElement("canvas");
      textCanvas.width = canvasWidth;
      textCanvas.height = canvasHeight;
      const textContext = textCanvas.getContext("2d");

      if (!textContext) return;

      let fontSize = Math.min(canvasWidth * (canvasWidth < 600 ? 0.15 : 0.1), canvasWidth < 600 ? 54 : 132);
      textContext.textAlign = "center";
      textContext.textBaseline = "middle";
      textContext.font = `700 ${fontSize}px Inter, Helvetica Neue, Arial, sans-serif`;

      while (textContext.measureText(pixelDriftText).width > canvasWidth * 0.92 && fontSize > 24) {
        fontSize -= 1;
        textContext.font = `700 ${fontSize}px Inter, Helvetica Neue, Arial, sans-serif`;
      }

      textContext.fillStyle = "#ffffff";
      textContext.fillText(pixelDriftText, canvasWidth / 2, canvasHeight * 0.44);

      const pixels = textContext.getImageData(0, 0, canvasWidth, canvasHeight).data;
      const sampleStep = canvasWidth < 600 ? 3 : 5;
      const targets = [];

      for (let y = 0; y < canvasHeight; y += sampleStep) {
        for (let x = 0; x < canvasWidth; x += sampleStep) {
          const alpha = pixels[(y * canvasWidth + x) * 4 + 3];
          if (alpha > 120) targets.push({ x, y });
        }
      }

      particles = targets.map((target, index) => ({
        x: target.x + (Math.random() - 0.5) * initialParticleSpread,
        y: target.y + (Math.random() - 0.5) * initialParticleSpread,
        targetX: target.x,
        targetY: target.y,
        vx: 0,
        vy: 0,
        size: 1.6 + (index % 3) * 0.5,
        color: ["#c6e9ff", "#ffffff", "#ffd8b8"][index % 3],
      }));
    };

    const replayParticles = () => {
      particles.forEach((particle) => {
        particle.x = particle.targetX + (Math.random() - 0.5) * 120;
        particle.y = particle.targetY + (Math.random() - 0.5) * 100;
        particle.vx = 0;
        particle.vy = 0;
      });
    };

    const drawParticles = () => {
      pixelDriftContext.clearRect(0, 0, canvasWidth, canvasHeight);

      particles.forEach((particle) => {
        const homeX = particle.targetX - particle.x;
        const homeY = particle.targetY - particle.y;
        particle.vx += homeX * 0.012;
        particle.vy += homeY * 0.012;

        if (pointer.active && !pixelDriftReducedMotion) {
          const deltaX = particle.x - pointer.x;
          const deltaY = particle.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);

          if (distance < 110 && distance > 0) {
            const force = (1 - distance / 110) * 2.6;
            particle.vx += (deltaX / distance) * force;
            particle.vy += (deltaY / distance) * force;
          }
        }

        particle.vx *= 0.86;
        particle.vy *= 0.86;
        particle.x += particle.vx;
        particle.y += particle.vy;

        pixelDriftContext.fillStyle = particle.color;
        pixelDriftContext.fillRect(particle.x, particle.y, particle.size, particle.size);
      });

      if (!pixelDriftReducedMotion) window.requestAnimationFrame(drawParticles);
    };

    const updatePointer = (event) => {
      const bounds = pixelDriftCanvas.getBoundingClientRect();
      pointer = {
        active: true,
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
    };

    createParticles();
    drawParticles();
    pixelDriftCanvas.addEventListener("pointermove", updatePointer);
    pixelDriftCanvas.addEventListener("pointerleave", () => {
      pointer.active = false;
    });
    pixelDriftCanvas.addEventListener("click", replayParticles);
    window.addEventListener("resize", () => {
      createParticles();
      drawParticles();
    });
  }
}

const aboutWindow = document.querySelector("[data-about-window]");
const dockProfile = document.querySelector(".dock-profile");
const aboutCloseButtons = aboutWindow ? [...aboutWindow.querySelectorAll("[data-about-close]")] : [];
let lastFocusedElement = null;

if (aboutWindow && dockProfile) {
  const closeAbout = () => {
    aboutWindow.classList.remove("is-visible");
    dockProfile.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");

    window.setTimeout(() => {
      aboutWindow.hidden = true;
      lastFocusedElement?.focus();
      lastFocusedElement = null;
    }, 180);
  };

  const openAbout = () => {
    lastFocusedElement = document.activeElement;
    aboutWindow.hidden = false;
    dockProfile.setAttribute("aria-expanded", "true");
    document.body.classList.add("modal-open");

    window.requestAnimationFrame(() => {
      aboutWindow.classList.add("is-visible");
      aboutCloseButtons.at(-1)?.focus();
    });
  };

  dockProfile.addEventListener("click", openAbout);
  aboutCloseButtons.forEach((button) => button.addEventListener("click", closeAbout));

  aboutWindow.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAbout();
    }
  });
}

const splash = document.querySelector("[data-splash]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const splashSeenKey = "theo-yang-intro-v2-seen";

if (splash) {
  let hasSeenSplash = false;

  try {
    hasSeenSplash = window.localStorage.getItem(splashSeenKey) === "true";
  } catch {
    hasSeenSplash = false;
  }

  const splashTransition = splash.querySelector("[data-splash-transition]");
  const splashEnter = splash.querySelector("[data-splash-enter]");
  const transitionText = "entering the world.";
  const hideSplash = () => splash.classList.add("is-hidden");
  const revealHome = () => {
    document.body.classList.add("home-visible");
    hideSplash();
  };

  const enterSplash = () => {
    if (splash.classList.contains("is-transitioning") || splash.classList.contains("is-hidden")) return;

    splash.classList.add("is-transitioning");
    splashEnter?.setAttribute("disabled", "true");
    splashTransition?.setAttribute("aria-hidden", "false");

    if (!splashTransition) {
      revealHome();
      return;
    }

    let characterIndex = 0;
    splashTransition.textContent = "";

    const typeNext = () => {
      characterIndex += 1;
      splashTransition.textContent = transitionText.slice(0, characterIndex);

      if (characterIndex < transitionText.length) {
        window.setTimeout(typeNext, 52);
        return;
      }

      window.setTimeout(revealHome, reducedMotion ? 100 : 520);
    };

    typeNext();
  };

  splashEnter?.addEventListener("click", enterSplash);

  if (reducedMotion || hasSeenSplash) {
    hideSplash();
  } else {
    try {
      window.localStorage.setItem(splashSeenKey, "true");
    } catch {
      // The animation still completes when storage is unavailable.
    }
    splashEnter?.focus({ preventScroll: true });
  }
}

const projects = {
  zkps: {
    type: "Writing",
    title: "Fundamentals of ZKPs",
    description: "An introduction to zero-knowledge proofs, why they matter for privacy and scalability, and where they fit in blockchain systems.",
    art: "one",
    image: "assets/projects/zkps.png",
    links: [{ label: "Read on Medium", href: "https://medium.com/@pixy7/fundamentals-of-zkps-ac737a39cfff" }],
  },
  pixymon: {
    type: "Project",
    title: "Pixymon",
    description: "A character-driven X agent that digests onchain signals, builds memory, and posts with a growing narrative instead of acting like a market-summary bot.",
    art: "two",
    image: "assets/projects/pixymon-fit.png",
    links: [
      { label: "View on X", href: "https://x.com/Pixy_mon" },
      { label: "View on GitHub", href: "https://github.com/starlash7/Pixymon" },
    ],
  },
  nansen: {
    type: "Project",
    title: "Nansen City",
    description: "A broadcast-style onchain city map for Nansen CLI that turns market signals into a more legible visual surface.",
    art: "three",
    image: "assets/projects/nansen.png",
    links: [{ label: "View on GitHub", href: "https://github.com/starlash7/Nansen-City" }],
  },
  kalshi: {
    type: "Dashboard",
    title: "Kalshi APAC Dashboard",
    description: "A Dune dashboard for tracking Kalshi activity from an APAC perspective.",
    art: "four",
    image: "assets/projects/kalshi.png",
    links: [{ label: "View on Dune", href: "https://dune.com/starlash7/kalshi-apac-dashboard" }],
  },
  "github-candles": {
    type: "Project",
    title: "GitHub Candles",
    description: "Your GitHub contributions rendered as a trading chart, with weekly and daily candle views for reading commit activity like price action.",
    art: "five",
    image: "assets/projects/github-candles.png",
    links: [{ label: "View on GitHub", href: "https://github.com/starlash7/github-candles" }],
  },
  "tip-on-arc": {
    type: "Project",
    title: "Tip on Arc",
    description: "An open-source USDC tip app on Arc Testnet for sending onchain tips with an optional message.",
    art: "six",
    links: [
      { label: "View on GitHub", href: "https://github.com/starlash7/Tip-on-Arc" },
      { label: "Open live app", href: "https://starlash7.github.io/Tip-on-Arc/" },
    ],
  },
  "pixy-terminal": {
    type: "Project",
    title: "PIXY Terminal",
    description: "A persistent local shell for Hermes Agent that keeps chat, memory, sessions, and runtime state visible in one place.",
    art: "seven",
    image: "assets/projects/pixy-terminal.png",
    links: [{ label: "View on GitHub", href: "https://github.com/starlash7/PIXY-Terminal" }],
  },
  narkina5: {
    type: "Project",
    title: "Narkina5",
    description: "An autonomous Solana launch-selection arena where 512 agents compete across seven floors and one survivor advances.",
    art: "eight",
    image: "assets/projects/narkina5.png",
    links: [
      { label: "View on GitHub", href: "https://github.com/starlash7/Narkina5" },
      { label: "Open product", href: "https://narkina5.vercel.app/" },
    ],
  },
};

const projectWindow = document.querySelector("[data-project-window]");
const projectCards = [...document.querySelectorAll("[data-project]")];
const projectCloseButtons = projectWindow ? [...projectWindow.querySelectorAll("[data-project-close]")] : [];
const projectType = projectWindow?.querySelector("[data-project-type]");
const projectTitle = projectWindow?.querySelector("[data-project-title]");
const projectDescription = projectWindow?.querySelector("[data-project-description]");
const projectArt = projectWindow?.querySelector("[data-project-art]");
const projectLinks = projectWindow?.querySelector("[data-project-links]");
let lastProjectFocus = null;

if (projectWindow && projectCards.length) {
  const closeProject = () => {
    projectWindow.classList.remove("is-visible");
    document.body.classList.remove("modal-open");

    window.setTimeout(() => {
      projectWindow.hidden = true;
      lastProjectFocus?.focus();
      lastProjectFocus = null;
    }, 180);
  };

  const openProject = (key) => {
    const project = projects[key];
    if (!project || !projectType || !projectTitle || !projectDescription || !projectArt || !projectLinks) return;

    lastProjectFocus = document.activeElement;
    projectType.textContent = project.type;
    projectTitle.textContent = project.title;
    projectDescription.textContent = project.description;
    projectArt.dataset.art = project.art;
    projectArt.replaceChildren();

    if (project.image) {
      const image = document.createElement("img");
      image.src = project.image;
      image.alt = "";
      projectArt.append(image);
    }

    projectLinks.replaceChildren(
      ...project.links.map((link) => {
        const anchor = document.createElement("a");
        anchor.className = "project-dialog-link";
        anchor.href = link.href;
        anchor.target = "_blank";
        anchor.rel = "noreferrer";
        anchor.textContent = `${link.label} ↗`;
        return anchor;
      }),
    );

    projectWindow.hidden = false;
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => {
      projectWindow.classList.add("is-visible");
      projectCloseButtons.at(-1)?.focus();
    });
  };

  projectCards.forEach((card) => card.addEventListener("click", () => openProject(card.dataset.project)));
  projectCloseButtons.forEach((button) => button.addEventListener("click", closeProject));
  projectWindow.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProject();
  });
}
