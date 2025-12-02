document.addEventListener('DOMContentLoaded', () => {

    // 0. INJECT GLOBAL COMPONENTS (Blobs, Menu, Cursor, Header)
    injectBackgroundBlobs();
    injectMenuOverlay();
    injectCursor();
    injectHeader();
    
    // 1. CURSOR
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorCircle = document.querySelector('.cursor-circle');
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

    if(cursorDot && cursorCircle) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
            interactWithBlobs(mouseX, mouseY);
        });

        function animateCursor() {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            cursorX += dx * 0.25; 
            cursorY += dy * 0.25;
            cursorCircle.style.left = cursorX + 'px';
            cursorCircle.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // 2. BLOB INTERACTION
    const blobWrappers = document.querySelectorAll('.blob-wrapper');
    function interactWithBlobs(x, y) {
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
    }

    // 3. IMAGE PREVIEW (WORK PAGE)
    const previewImg = document.getElementById('preview-img');
    const workItems = document.querySelectorAll('.work-item a');

    if (workItems.length > 0) {
        workItems.forEach(item => {
            // Desktop Hover
            item.addEventListener('mouseenter', () => {
                if(window.innerWidth > 768 && previewImg) { // Check for desktop
                    const newSrc = item.getAttribute('data-img');
                    if(newSrc) {
                        previewImg.src = newSrc;
                        previewImg.style.opacity = '1';
                        previewImg.style.transform = 'scale(1.05)';
                    }
                }
            });
            item.addEventListener('mouseleave', () => {
                if(window.innerWidth > 768 && previewImg) { // Check for desktop
                    previewImg.style.opacity = '0';
                    previewImg.style.transform = 'scale(1)';
                }
            });

            // Mobile Click Handling (Toggle Preview)
            item.addEventListener('click', (e) => {
                if(window.innerWidth <= 768) {
                    e.preventDefault(); // Prevent navigation on mobile too if needed, though disabled-link handles it mostly
                    
                    // Find or Create Mobile Preview Container for THIS item
                    // Check if preview already exists
                    let mobilePreview = item.parentNode.querySelector('.mobile-preview');
                    
                    if (!mobilePreview) {
                        // Create it
                        mobilePreview = document.createElement('div');
                        mobilePreview.className = 'mobile-preview';
                        const img = document.createElement('img');
                        img.src = item.getAttribute('data-img');
                        mobilePreview.appendChild(img);
                        item.parentNode.appendChild(mobilePreview);
                    }

                    // Toggle Visibility
                    if (mobilePreview.classList.contains('active')) {
                        mobilePreview.classList.remove('active');
                    } else {
                        // Close others? Optional. Let's close others for cleaner UI.
                        document.querySelectorAll('.mobile-preview').forEach(el => el.classList.remove('active'));
                        mobilePreview.classList.add('active');
                        
                        // Add click listener to the image for Lightbox (Mobile)
                        const mobileImg = mobilePreview.querySelector('img');
                        if(mobileImg) {
                             // Remove old listeners to prevent duplicates if toggled multiple times (though recreating element avoids this, but good practice)
                             const newImg = mobileImg.cloneNode(true);
                             mobileImg.parentNode.replaceChild(newImg, mobileImg);
                             
                             newImg.addEventListener('click', (ev) => {
                                 ev.stopPropagation(); // Prevent bubbling to item click
                                 const link = item.getAttribute('data-link');
                                 createLightbox(newImg.src, link);
                             });
                        }
                    }
                } else {
                    // Desktop Click Handling: Open Link if available
                     const link = item.getAttribute('data-link');
                     if (link) {
                         window.open(link, '_blank');
                     }
                }
            });
        });
    }

    // 8. LIGHTBOX (Desktop Preview Image Click)
    if (previewImg) {
        previewImg.addEventListener('click', () => {
            // Only activate if visible and has valid source
            if (previewImg.style.opacity !== '0' && previewImg.src) {
                const activeLink = document.querySelector('.work-item a:hover')?.getAttribute('data-link');
                createLightbox(previewImg.src, activeLink);
            }
        });
    }

    function createLightbox(src, link = null) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const img = document.createElement('img');
        img.src = src;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;'; // Close X symbol
        
        lightbox.appendChild(img);
        lightbox.appendChild(closeBtn);

        // Add "Visit Project" button if link exists
        if (link) {
            const linkBtn = document.createElement('a');
            linkBtn.href = link;
            linkBtn.target = '_blank';
            linkBtn.className = 'lightbox-link-btn';
            linkBtn.textContent = 'VISIT PROJECT ↗';
            lightbox.appendChild(linkBtn);
        }

        document.body.appendChild(lightbox);
        
        // Trigger fade in
        requestAnimationFrame(() => {
            lightbox.classList.add('active');
        });
        
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            setTimeout(() => {
                lightbox.remove();
            }, 300); // Wait for transition
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // 4. MENU & THEME
    const menuTrigger = document.querySelector('.menu-trigger');
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const htmlElement = document.documentElement;

    if(menuTrigger) {
        menuTrigger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
    }

    if(themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    }

    function updateThemeUI(theme) {
        const iconSun = document.querySelector('.icon-sun');
        const iconMoon = document.querySelector('.icon-moon');
        const logoLight = document.querySelector('.logo-light');
        const logoDark = document.querySelector('.logo-dark');

        if (theme === 'dark') {
            if(iconMoon) iconMoon.style.display = 'none';
            if(iconSun) iconSun.style.display = 'block';
            if(logoLight) logoLight.style.display = 'none';
            if(logoDark) logoDark.style.display = 'block';
        } else {
            if(iconMoon) iconMoon.style.display = 'block';
            if(iconSun) iconSun.style.display = 'none';
            if(logoLight) logoLight.style.display = 'block';
            if(logoDark) logoDark.style.display = 'none';
        }
    }

    // 5. LANG SWITCH
    const langSwitchBtn = document.querySelector('.lang-switch');
    const translatableElements = document.querySelectorAll('[data-text-en]');

    // Initialize Language
    function initLanguage() {
        // Check URL query param first, then localStorage, default to 'en'
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        let savedLang = localStorage.getItem('lang') || 'en';
        
        // If URL has ?lang=de, allow override (or just stick to saved if navigating internally)
        // Usually URL param overrides storage for sharing purposes
        if (urlLang === 'de') {
            savedLang = 'de';
        }

        setLanguage(savedLang, false); // false = don't push state on init, just replace
    }

    function setLanguage(lang, pushState = true) {
        // Update Text Content
        translatableElements.forEach(el => {
            const text = el.getAttribute(`data-text-${lang}`);
            if(text) el.textContent = text;
        });

        // Update Button Text (Show TARGET language)
        if (langSwitchBtn) {
            langSwitchBtn.textContent = lang === 'en' ? 'DE' : 'EN';
        }

        // Update LocalStorage
        localStorage.setItem('lang', lang);

        // Update URL State (Use Query Params for robustness on static sites)
        // Always replace state to ensure ?lang=de persists or is removed
        const url = new URL(window.location);
        if (lang === 'de') {
            url.searchParams.set('lang', 'de');
        } else {
            url.searchParams.delete('lang');
        }
        
        // Use pushState if it's a user action (click), replaceState if init
        if (pushState) {
            window.history.pushState({}, '', url);
        } else {
            window.history.replaceState({}, '', url);
        }
        
        // Clean up old /de path if present (migration)
        if (window.location.pathname.includes('/de')) {
             const cleanPath = window.location.pathname.replace('/de', '').replace('//', '/');
             const cleanUrl = new URL(window.location);
             cleanUrl.pathname = cleanPath;
             if (lang === 'de') cleanUrl.searchParams.set('lang', 'de');
             window.history.replaceState({}, '', cleanUrl);
        }
    }

    // Run globally
    initLanguage();

    if(langSwitchBtn) {
        langSwitchBtn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('lang') || 'en';
            const newLang = currentLang === 'en' ? 'de' : 'en';
            setLanguage(newLang, true);
        });
    }

    // 6. CURSOR HOVER STATE (LINKS)
    const links = document.querySelectorAll('a, button, .work-item');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        link.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // 7. PAGE TRANSITION
    const internalLinks = document.querySelectorAll('a[href^="index.html"], a[href^="work.html"], a[href^="about.html"], a[href^="project-detail.html"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only intercept if it's a normal left click and not opening in new tab
            if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                const targetUrl = link.getAttribute('href');

                // Add exiting class to body to trigger fade out
                document.body.classList.add('exiting');
                
                // Special case: if clicking a menu link, add exiting-menu class too
                if (link.classList.contains('menu-link')) {
                    document.body.classList.add('exiting-menu');
                }

                // Wait for animation to finish before navigating
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500); // Match the CSS transition time (0.5s)
            }
        });
    });

    // 9. COMPONENT INJECTION FUNCTIONS
    function injectCursor() {
        if (document.querySelector('.cursor-dot')) return; 

        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        
        const cursorCircle = document.createElement('div');
        cursorCircle.className = 'cursor-circle';
        
        document.body.prepend(cursorCircle);
        document.body.prepend(cursorDot);
    }

    function injectHeader() {
        if (document.querySelector('.site-header')) return;

        const header = document.createElement('header');
        header.className = 'site-header';
        
        const isDetailPage = document.body.classList.contains('page-detail') || window.location.pathname.includes('project-detail');
        
        if (isDetailPage) {
             header.innerHTML = `
                <div class="logo">
                     <a href="index.html" data-text-en="BACK" data-text-de="ZURÜCK">BACK</a>
                </div>
            `;
        } else {
            header.innerHTML = `
                <div class="logo">
                    <a href="index.html" aria-label="Back to Home">
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

        // Insert before main, or as first child if main not found (fallback)
        const main = document.querySelector('main');
        if (main) {
            main.before(header);
        } else {
            document.body.prepend(header);
        }
    }

    function injectBackgroundBlobs() {
        if (document.querySelector('.background-blobs')) return; // Prevent duplicate injection

        const blobsContainer = document.createElement('div');
        blobsContainer.className = 'background-blobs';
        
        blobsContainer.innerHTML = `
            <div class="blob-wrapper blob-wrapper-1"><div class="blob blob-inner-1"></div></div>
            <div class="blob-wrapper blob-wrapper-2"><div class="blob blob-inner-2"></div></div>
            <div class="blob-wrapper blob-wrapper-3"><div class="blob blob-inner-3"></div></div>
            <div class="blob-wrapper blob-wrapper-4"><div class="blob blob-inner-4"></div></div>
        `;

        // Insert as first child of body to stay behind content
        document.body.prepend(blobsContainer);
    }

    function injectMenuOverlay() {
        if (document.querySelector('.menu-overlay')) return; // Prevent duplicate injection

        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-overlay';

        menuContainer.innerHTML = `
            <nav class="menu-nav">
                <ul>
                    <li><a href="index.html" class="menu-link" data-text-en="HOME" data-text-de="START">HOME</a><span class="menu-number">01</span></li>
                    <li><a href="work.html" class="menu-link" data-text-en="WORK" data-text-de="PROJEKTE">WORK</a><span class="menu-number">02</span></li>
                    <li><a href="about.html" class="menu-link" data-text-en="ABOUT" data-text-de="ÜBER MICH">ABOUT</a><span class="menu-number">03</span></li>
                    <li><a href="mailto:contact@moritzbednorz.com" class="menu-link" data-text-en="CONTACT" data-text-de="KONTAKT">CONTACT</a><span class="menu-number">04</span></li>
                </ul>
            </nav>
            <div class="menu-footer">
                <a href="https://www.linkedin.com/in/moritz-bednorz/" target="_blank">↗ LinkedIn</a>
                <a href="https://orcid.org/0000-0002-4981-5732" target="_blank">↗ ORCID</a>
            </div>
        `;

        // Insert after blobs, before main content usually, but order in body matters less with z-index
        const blobs = document.querySelector('.background-blobs');
        if (blobs) {
            blobs.after(menuContainer);
        } else {
            document.body.prepend(menuContainer);
        }
    }

});
