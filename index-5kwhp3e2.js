var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// src/pages/home.ts
var exports_home = {};
__export(exports_home, {
  unmount: () => unmount,
  template: () => template,
  mount: () => mount
});
function mount() {}
function unmount() {}
var template = `
    <section class="hero">
        <div class="hero-content">
            <h1 class="hero-title">
                <span class="line">
                    <span class="outline-text" data-text-en="HEY, I'M" data-text-de="HEY, ICH BIN">HEY, I'M</span> 
                    <span class="filled-text">MORITZ</span>
                </span>
                <span class="line">
                    <span class="outline-text" data-text-en="AND I'M AN" data-text-de="UND ICH BIN EIN">AND I'M AN</span> 
                    <span class="filled-text" data-text-en="TECH ENTHUSIAST" data-text-de="TECH ENTHUSIAST">TECH ENTHUSIAST</span>
                </span>
            </h1>

            <div class="hero-description">
                <p data-text-en="Research Engineer @ Fraunhofer IPA" data-text-de="Forschungsingenieur @ Fraunhofer IPA">Research Engineer @ Fraunhofer IPA</p>
            </div>

            <div class="hero-links">
                <a href="/work" class="pretty-arrow" data-text-en="research & projects" data-text-de="forschung & projekte">
                    <span class="arrow-icon">→</span>
                    <span class="arrow-text" data-text-en="research & projects" data-text-de="forschung & projekte">research & projects</span>
                </a>
                <a href="/about" class="pretty-arrow" data-text-en="about me" data-text-de="über mich">
                    <span class="arrow-icon">→</span>
                    <span class="arrow-text" data-text-en="about me" data-text-de="über mich">about me</span>
                </a>
            </div>
        </div>
    </section>
`;

// src/pages/about.ts
var exports_about = {};
__export(exports_about, {
  unmount: () => unmount2,
  template: () => template2,
  mount: () => mount2
});
function mount2() {}
function unmount2() {}
var template2 = `
    <div class="content-container">
        <section class="about-bio-section">
            <h1 data-text-en="ABOUT ME" data-text-de="ÜBER MICH">ABOUT ME</h1>
            <div class="bio-text">
                 <p data-text-en="I'm a tech enthusiast at heart with a background in Medical Informatics. Currently, I work as a Research Engineer at Fraunhofer IPA. I love figuring out how to use the latest tech. Whether it's contactless sensors or AI to solve actual problems in healthcare." data-text-de="Ich bin ein Tech-Enthusiast mit einem Hintergrund in Medical Informatics. Derzeit arbeite ich als Forschungsingenieur bei Fraunhofer IPA. Ich liebe es herauszufinden, wie man die neuesten Technologien nutzt. Ob Kontaktlos-Sensoren oder AI, um echte Probleme in der Gesundheitsversorgung zu lösen.">
                    I'm a tech enthusiast at heart with a background in Medical Informatics. Currently, I work as a Research Engineer at Fraunhofer IPA. I love figuring out how to use the latest tech. Whether it's contactless sensors or AI to solve actual problems in healthcare.
                </p>
                <br>
                <p data-text-en="For me, research isn't just about writing papers; it's about building solutions that work in the real world and help people." data-text-de="Für mich ist Forschung nicht nur darum, Papee zu schreiben; es geht darum, Lösungen zu entwickeln, die in der realen Welt funktionieren und Menschen helfen.">
                    For me, research isn't just about writing papers; it's about building solutions that work in the real world and help people.
                </p>

            </div>
        </section>

        <section class="experience-section">
             <h2 data-text-en="EXPERIENCE" data-text-de="ERFAHRUNG">EXPERIENCE</h2>
             <ul class="experience-list">
                 <li>
                     <span class="role" data-text-en="Research Engineer" data-text-de="Wissenschaftlicher Mitarbeiter">Research Engineer</span>
                     <span class="company">Fraunhofer IPA</span>
                     <span class="year">2024 - Present</span>
                 </li>
                 <li>
                     <span class="role" data-text-en="Student Research Assistant" data-text-de="Wissenschaftliche Hilfskraft">Student Research Assistant</span>
                     <span class="company">University Hospital Heidelberg</span>
                     <span class="year">2023</span>
                 </li>
                 <li>
                     <span class="role" data-text-en="Student Research Assistant" data-text-de="Wissenschaftliche Hilfskraft">Student Research Assistant</span>
                     <span class="company">Fraunhofer IPA</span>
                     <span class="year">2019 - 2024</span>
                 </li>
             </ul>
        </section>
    </div>
`;

// src/scripts/components/lightbox.ts
function createLightbox(src, link = null) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  const img = document.createElement("img");
  img.src = src;
  const closeBtn = document.createElement("button");
  closeBtn.className = "lightbox-close";
  closeBtn.innerHTML = "&times;";
  lightbox.appendChild(img);
  lightbox.appendChild(closeBtn);
  if (link) {
    const linkBtn = document.createElement("a");
    linkBtn.href = link;
    linkBtn.target = "_blank";
    linkBtn.className = "lightbox-link-btn";
    linkBtn.textContent = "VISIT PROJECT ↗";
    lightbox.appendChild(linkBtn);
  }
  document.body.appendChild(lightbox);
  requestAnimationFrame(() => {
    lightbox.classList.add("active");
  });
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    setTimeout(() => {
      lightbox.remove();
    }, 300);
  };
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox)
      closeLightbox();
  });
}

// src/scripts/pages/work.ts
function handleImageError(img, fallbackSrc = "") {
  console.warn(`Failed to load image: ${img.src}`);
  if (fallbackSrc) {
    img.src = fallbackSrc;
  } else {
    img.src = "https://placehold.co/800x600/2a2a2a/FFF?text=Image+Not+Found";
  }
}
function initWorkPage() {
  const previewImg = document.getElementById("preview-img");
  const workItems = document.querySelectorAll(".work-item a");
  if (previewImg) {
    previewImg.addEventListener("error", () => {
      handleImageError(previewImg);
    });
  }
  if (workItems.length > 0) {
    workItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (window.innerWidth > 768 && previewImg) {
          const newSrc = item.getAttribute("data-img");
          if (newSrc) {
            if (!newSrc || newSrc.trim() === "") {
              console.warn("Empty or missing data-img attribute on work item");
              return;
            }
            previewImg.src = newSrc;
            previewImg.style.opacity = "1";
            previewImg.style.transform = "scale(1.05)";
          }
        }
      });
      item.addEventListener("mouseleave", () => {
        if (window.innerWidth > 768 && previewImg) {
          previewImg.style.opacity = "0";
          previewImg.style.transform = "scale(1)";
        }
      });
      item.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          let mobilePreview = item.parentElement?.querySelector(".mobile-preview");
          if (!mobilePreview && item.parentElement) {
            mobilePreview = document.createElement("div");
            mobilePreview.className = "mobile-preview";
            const img = document.createElement("img");
            const imgSrc = item.getAttribute("data-img");
            if (imgSrc && imgSrc.trim() !== "") {
              img.src = imgSrc;
              img.addEventListener("error", () => {
                handleImageError(img);
              });
            } else {
              console.warn("Empty or missing data-img attribute on work item");
            }
            mobilePreview.appendChild(img);
            item.parentElement.appendChild(mobilePreview);
          }
          if (mobilePreview) {
            if (mobilePreview.classList.contains("active")) {
              mobilePreview.classList.remove("active");
            } else {
              document.querySelectorAll(".mobile-preview").forEach((el) => el.classList.remove("active"));
              mobilePreview.classList.add("active");
              const mobileImg = mobilePreview.querySelector("img");
              if (mobileImg) {
                const newImg = mobileImg.cloneNode(true);
                mobileImg.parentNode?.replaceChild(newImg, mobileImg);
                newImg.addEventListener("click", (ev) => {
                  ev.stopPropagation();
                  const link = item.getAttribute("data-link");
                  createLightbox(newImg.src, link);
                });
              }
            }
          }
        } else {
          const link = item.getAttribute("data-link");
          if (link) {
            window.open(link, "_blank");
          }
        }
      });
    });
  }
  if (previewImg) {
    previewImg.addEventListener("click", () => {
      if (previewImg.style.opacity !== "0" && previewImg.src) {
        const activeLink = document.querySelector(".work-item a:hover")?.getAttribute("data-link");
        createLightbox(previewImg.src, activeLink || null);
      }
    });
  }
}
var init_work = () => {};

// src/pages/work.ts
var exports_work = {};
__export(exports_work, {
  unmount: () => unmount3,
  template: () => template3,
  mount: () => mount3
});
function mount3() {
  initWorkPage();
}
function unmount3() {
  workPageListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  workPageListeners = [];
}
var template3 = `
    <div class="split-view">
        <!-- LEFT SIDE: IMAGE PREVIEW -->
        <div class="preview-container">
            <div class="preview-image-wrapper">
                <img id="preview-img" src="https://placehold.co/800x600/2a2a2a/FFF?text=Select+Project" alt="Project Preview">
            </div>
        </div>

        <!-- RIGHT SIDE: PROJECT LIST -->
        <div class="list-container">
            
            <div class="work-header-group">
                <h1 class="work-main-title">WORK</h1>
                <span class="work-count">5</span>
            </div>

            <ul class="work-list">
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="/images/thoraxmonitor.png" data-link="https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/thoraxmonitor.html">
                        <span class="work-title">Thoraxmonitor</span>
                        <span class="work-cat" data-text-en="Medical Tech" data-text-de="Medizintechnik">Medical Tech</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="/images/TEDIAS.jpg" data-link="https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/rag-chatbot.html">
                        <span class="work-title">TEDIAS & AHEAD</span>
                        <span class="work-cat" data-text-en="Medical Tech" data-text-de="Medizintechnik">Medical Tech</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="/images/reconstruction_paper.png" data-link="https://www.mdpi.com/1424-8220/25/23/7114">
                        <span class="work-title" data-text-en="Respiration Flow Reconstruction" data-text-de="Rekonstruktion des Atemflusses">Respiration Flow Reconstruction</span>
                        <span class="work-cat" data-text-en="Publication" data-text-de="Publikation">Publication</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="/images/federated_paper.webp" data-link="https://www.nature.com/articles/s41746-025-01434-3">
                        <span class="work-title" data-text-en="Cardiac CT Federated Learning" data-text-de="Föderiertes Lernen für Kardio-CT">Cardiac CT Federated Learning</span>
                        <span class="work-cat" data-text-en="Publication" data-text-de="Publikation">Publication</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="/images/homelab.png">
                        <span class="work-title" data-text-en="Home Server Setup" data-text-de="Home Server Setup">Home Server Setup</span>
                        <span class="work-cat" data-text-en="Development" data-text-de="Entwicklung">Development</span>
                    </a>
                </li>
            </ul>

        </div>
    </div>
`, workPageListeners;
var init_work2 = __esm(() => {
  init_work();
  workPageListeners = [];
});

// src/pages/project-detail.ts
var exports_project_detail = {};
__export(exports_project_detail, {
  unmount: () => unmount4,
  template: () => template4,
  mount: () => mount4
});
function mount4() {}
function unmount4() {}
var template4 = `
    <div class="detail-content">
        <h1>Project Title Placeholder</h1>
        <p>Details regarding the specific project will go here. This is a template.</p>
        <img src="https://placehold.co/1200x600" alt="Project Detail">
    </div>
`;

// src/scripts/components/blobs.ts
function injectBackgroundBlobs() {
  if (document.querySelector(".background-blobs"))
    return;
  const blobsContainer = document.createElement("div");
  blobsContainer.className = "background-blobs";
  blobsContainer.innerHTML = `
        <div class="blob-wrapper blob-wrapper-1"><div class="blob blob-inner-1"></div></div>
        <div class="blob-wrapper blob-wrapper-2"><div class="blob blob-inner-2"></div></div>
        <div class="blob-wrapper blob-wrapper-3"><div class="blob blob-inner-3"></div></div>
        <div class="blob-wrapper blob-wrapper-4"><div class="blob blob-inner-4"></div></div>
        <div class="blob-wrapper blob-wrapper-5"><div class="blob blob-inner-5"></div></div>
        <div class="blob-wrapper blob-wrapper-6"><div class="blob blob-inner-6"></div></div>
        <div class="blob-wrapper blob-wrapper-7"><div class="blob blob-inner-7"></div></div>
        <div class="blob-wrapper blob-wrapper-8"><div class="blob blob-inner-8"></div></div>

    `;
  document.body.prepend(blobsContainer);
}
function initBlobInteraction() {
  const blobWrappers = document.querySelectorAll(".blob-wrapper");
  let animationFrameId = null;
  let lastX = 0;
  let lastY = 0;
  return function interactWithBlobs(x, y) {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(() => {
      blobWrappers.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = x - centerX;
        const distY = y - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        const radius = 400;
        const maxPush = 100;
        let moveX = 0, moveY = 0;
        if (distance < radius) {
          const force = (radius - distance) / radius;
          moveX = -(distX / distance) * force * maxPush;
          moveY = -(distY / distance) * force * maxPush;
        }
        wrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      lastX = x;
      lastY = y;
    });
  };
}

// src/scripts/components/cursor.ts
function injectCursor() {
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches)
    return;
  if (document.querySelector(".cursor-dot"))
    return;
  const cursorDot = document.createElement("div");
  cursorDot.className = "cursor-dot";
  const cursorCircle = document.createElement("div");
  cursorCircle.className = "cursor-circle";
  document.body.prepend(cursorCircle);
  document.body.prepend(cursorDot);
}
function initCursor(interactWithBlobs) {
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches)
    return;
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorCircle = document.querySelector(".cursor-circle");
  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  if (cursorDot && cursorCircle) {
    let animateCursor = function() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.25;
      cursorY += dy * 0.25;
      cursorCircle.style.left = cursorX + "px";
      cursorCircle.style.top = cursorY + "px";
      requestAnimationFrame(animateCursor);
    };
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + "px";
      cursorDot.style.top = mouseY + "px";
      if (interactWithBlobs) {
        interactWithBlobs(mouseX, mouseY);
      }
    });
    animateCursor();
  }
}

// src/scripts/components/header.ts
function injectHeader() {
  if (document.querySelector(".site-header"))
    return;
  const header = document.createElement("header");
  header.className = "site-header";
  const isDetailPage = document.body.classList.contains("page-detail") || window.location.pathname.includes("project-detail");
  if (isDetailPage) {
    header.innerHTML = `
            <div class="logo">
                 <a href="/" data-text-en="BACK" data-text-de="ZURÜCK">BACK</a>
            </div>
        `;
  } else {
    header.innerHTML = `
            <div class="logo">
                <a href="/" aria-label="Back to Home">
                    <div class="logo-wrapper">
                        <svg class="logo-light" width="50" height="37" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <path id="mo-path-dark" d="M50 160 C 40 90, 90 90, 100 140 C 110 180, 140 180, 150 140 C 160 80, 210 80, 210 130 C 210 185, 270 170, 260 120 C 250 80, 195 95, 205 135" />
                                <mask id="hollow-mask-black">
                                    <use href="#mo-path-dark" stroke="white" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                    <use href="#mo-path-dark" stroke="black" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                </mask>
                            </defs>
                            <rect x="0" y="0" width="300" height="220" fill="#151515" mask="url(#hollow-mask-black)"/>
                        </svg>
                        <svg class="logo-dark" width="50" height="50" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">
                            <path d="M50 180 C 40 100, 80 80, 90 140 C 100 190, 130 190, 140 140 C 150 80, 200 80, 190 140 C 180 190, 250 180, 240 130 C 230 80, 170 80, 180 130 C 185 155, 210 160, 225 145" 
                                  stroke="#F0F0F0" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </a>
            </div>
            
            <div class="header-controls">
                <button class="lang-switch">EN</button>
                <button class="theme-toggle" aria-label="Toggle Dark Mode">
                    <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                </button>
                <button class="menu-trigger" aria-label="Open Menu">
                    <div class="grid-dots">
                        <span></span><span></span><span></span>
                        <span></span><span></span><span></span>
                        <span></span><span></span><span></span>
                    </div>
                    <div class="close-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </button>
            </div>
        `;
  }
  const main = document.querySelector("main");
  if (main) {
    main.before(header);
  } else {
    document.body.prepend(header);
  }
}

// src/scripts/components/menu.ts
function injectMenuOverlay() {
  if (document.querySelector(".menu-overlay"))
    return;
  const menuContainer = document.createElement("div");
  menuContainer.className = "menu-overlay";
  menuContainer.innerHTML = `
        <nav class="menu-nav">
            <ul>
                <li><a href="/" class="menu-link" data-text-en="HOME" data-text-de="START">HOME</a><span class="menu-number">01</span></li>
                <li><a href="/work" class="menu-link" data-text-en="WORK" data-text-de="PROJEKTE">WORK</a><span class="menu-number">02</span></li>
                <li><a href="/about" class="menu-link" data-text-en="ABOUT" data-text-de="ÜBER MICH">ABOUT</a><span class="menu-number">03</span></li>
                <li><a href="mailto:contact@moritzbednorz.com" class="menu-link" data-text-en="CONTACT" data-text-de="KONTAKT">CONTACT</a><span class="menu-number">04</span></li>
            </ul>
        </nav>
        <div class="menu-footer">
            <a href="https://www.linkedin.com/in/moritz-bednorz/" target="_blank">↗ LinkedIn</a>
            <a href="https://orcid.org/0000-0002-4981-5732" target="_blank">↗ ORCID</a>
        </div>
    `;
  const blobs = document.querySelector(".background-blobs");
  if (blobs) {
    blobs.after(menuContainer);
  } else {
    document.body.prepend(menuContainer);
  }
}
function initMenu() {
  const menuTrigger = document.querySelector(".menu-trigger");
  if (menuTrigger) {
    menuTrigger.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  }
}

// src/scripts/utils/theme.ts
function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function initTheme() {
  const themeToggleBtn = document.querySelector(".theme-toggle");
  const htmlElement = document.documentElement;
  if (themeToggleBtn) {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme || savedTheme === "system") {
      const systemTheme = getSystemTheme();
      if (systemTheme === "dark") {
        htmlElement.setAttribute("data-theme", "dark");
      } else {
        htmlElement.removeAttribute("data-theme");
      }
      updateThemeUI(systemTheme);
    } else {
      htmlElement.setAttribute("data-theme", savedTheme);
      updateThemeUI(savedTheme);
    }
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = htmlElement.getAttribute("data-theme");
      let newTheme;
      if (!currentTheme) {
        newTheme = "dark";
      } else if (currentTheme === "dark") {
        newTheme = "light";
      } else {
        newTheme = "system";
      }
      if (newTheme === "system") {
        const systemTheme = getSystemTheme();
        if (systemTheme === "dark") {
          htmlElement.setAttribute("data-theme", "dark");
        } else {
          htmlElement.removeAttribute("data-theme");
        }
        localStorage.removeItem("theme");
        updateThemeUI(systemTheme);
      } else {
        htmlElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeUI(newTheme);
      }
    });
  }
}
function updateThemeUI(theme) {
  const iconSun = document.querySelector(".icon-sun");
  const iconMoon = document.querySelector(".icon-moon");
  const logoLight = document.querySelector(".logo-light");
  const logoDark = document.querySelector(".logo-dark");
  if (theme === "dark") {
    if (iconMoon)
      iconMoon.style.display = "none";
    if (iconSun)
      iconSun.style.display = "block";
    if (logoLight)
      logoLight.style.display = "none";
    if (logoDark)
      logoDark.style.display = "block";
  } else {
    if (iconMoon)
      iconMoon.style.display = "block";
    if (iconSun)
      iconSun.style.display = "none";
    if (logoLight)
      logoLight.style.display = "block";
    if (logoDark)
      logoDark.style.display = "none";
  }
}

// src/scripts/utils/language.ts
var eventDelegationSetup = false;
function initLanguage() {
  const translatableElements = document.querySelectorAll("[data-text-en]");
  const supportedLanguages = ["en", "de"];
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang");
  const savedLang = localStorage.getItem("lang");
  const systemLang = navigator.language.split("-")[0];
  let targetLang = "en";
  if (urlLang && supportedLanguages.includes(urlLang)) {
    targetLang = urlLang;
  } else if (savedLang && supportedLanguages.includes(savedLang)) {
    targetLang = savedLang;
  } else if (supportedLanguages.includes(systemLang)) {
    targetLang = systemLang;
  }
  setLanguage(targetLang, false);
  if (!eventDelegationSetup) {
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest(".lang-switch")) {
        const currentLang = localStorage.getItem("lang") || "en";
        const newLang = currentLang === "en" ? "de" : "en";
        setLanguage(newLang, true);
      }
    });
    eventDelegationSetup = true;
  }
}
function setLanguage(lang, pushState = true) {
  const langSwitchBtn = document.querySelector(".lang-switch");
  const translatableElements = document.querySelectorAll("[data-text-en]");
  translatableElements.forEach((el) => {
    const text = el.getAttribute(`data-text-${lang}`);
    if (text)
      el.textContent = text;
  });
  if (langSwitchBtn) {
    langSwitchBtn.textContent = lang === "en" ? "DE" : "EN";
  }
  localStorage.setItem("lang", lang);
  const url = new URL(window.location.href);
  if (lang === "de") {
    url.searchParams.set("lang", "de");
  } else {
    url.searchParams.delete("lang");
  }
  if (pushState) {
    window.history.pushState({}, "", url);
  } else {
    window.history.replaceState({}, "", url);
  }
  if (window.location.pathname.includes("/de")) {
    const cleanPath = window.location.pathname.replace("/de", "").replace("//", "/");
    const cleanUrl = new URL(window.location.href);
    cleanUrl.pathname = cleanPath;
    if (lang === "de")
      cleanUrl.searchParams.set("lang", "de");
    window.history.replaceState({}, "", cleanUrl);
  }
}

// src/scripts/utils/transitions.ts
function initTransitions() {
  const links = document.querySelectorAll("a, button, .work-item");
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
    link.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
  });
  const internalLinks = document.querySelectorAll('a[href^="index.html"], a[href^="work.html"], a[href^="about.html"], a[href^="project-detail.html"]');
  internalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const targetUrl = link.getAttribute("href");
        if (!targetUrl)
          return;
        document.body.classList.add("exiting");
        if (link.classList.contains("menu-link")) {
          document.body.classList.add("exiting-menu");
        }
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
      }
    });
  });
}

// src/router.ts
var routes = {
  "/": () => Promise.resolve().then(() => exports_home),
  "/about": () => Promise.resolve().then(() => exports_about),
  "/work": () => Promise.resolve().then(() => (init_work2(), exports_work)),
  "/project-detail": () => Promise.resolve().then(() => exports_project_detail)
};
var pageTitles = {
  "/": "Moritz Bednorz | Research Engineer & Tech Enthusiast",
  "/about": "About Me | Moritz Bednorz",
  "/work": "Work & Projects | Moritz Bednorz",
  "/project-detail": "Project Details | Moritz Bednorz"
};
var pageClasses = {
  "/": "page-home",
  "/about": "page-about",
  "/work": "page-work",
  "/project-detail": "page-detail"
};

class Router {
  container;
  currentPage = null;
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }
    this.init();
  }
  init() {
    document.addEventListener("click", this.handleLinkClick.bind(this));
    window.addEventListener("popstate", this.handlePopState.bind(this));
    this.navigate(window.location.pathname, false);
  }
  handleLinkClick(e) {
    const link = e.target.closest("a");
    if (!link)
      return;
    const href = link.getAttribute("href");
    if (href && href.startsWith("/") && !href.startsWith("//") && !href.startsWith("http")) {
      if (link.classList.contains("disabled-link")) {
        return;
      }
      e.preventDefault();
      this.navigate(href);
    }
  }
  handlePopState(_e) {
    this.navigate(window.location.pathname, false);
  }
  async navigate(path, pushState = true) {
    if (!this.container)
      return;
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
    const routeHandler = routes[normalizedPath];
    if (!routeHandler) {
      console.warn(`Route not found: ${normalizedPath}`);
      return;
    }
    if (this.currentPage && typeof this.currentPage.unmount === "function") {
      try {
        this.currentPage.unmount();
      } catch (error) {
        console.error("Error unmounting page:", error);
      }
    }
    if (pushState) {
      window.history.pushState({}, "", normalizedPath);
    }
    const bodyClass = pageClasses[normalizedPath] || "page-home";
    document.body.className = bodyClass;
    const title = pageTitles[normalizedPath] || pageTitles["/"];
    document.title = title;
    try {
      const pageModule = await routeHandler();
      if (pageModule.template) {
        this.container.innerHTML = pageModule.template;
      } else {
        console.error("Page module does not export template");
        return;
      }
      this.currentPage = pageModule;
      if (typeof pageModule.mount === "function") {
        requestAnimationFrame(() => {
          try {
            pageModule.mount?.();
          } catch (error) {
            console.error("Error mounting page:", error);
          }
        });
      }
      if (window.initLanguage) {
        requestAnimationFrame(() => {
          window.initLanguage?.();
        });
      }
    } catch (error) {
      console.error("Error loading page:", error);
    }
  }
}

// src/scripts/main.ts
window.initLanguage = initLanguage;
document.addEventListener("DOMContentLoaded", () => {
  injectBackgroundBlobs();
  injectMenuOverlay();
  injectCursor();
  injectHeader();
  const interactWithBlobs = initBlobInteraction();
  initCursor(interactWithBlobs);
  initMenu();
  initTheme();
  initLanguage();
  initTransitions();
  const router = new Router("app");
});
