/**
 * The one-page site: header, home, journey, work, contact, footer, and the project dialog.
 * render() makes the full page for the current language. A language change renders the page again.
 */

import { PROJECTS, type Project } from './data/projects.js';
import { BRANCHES, TIMELINE_DATA } from './data/timeline.js';
import type { TimelineEvent } from './types.js';
import { applyLanguage, detectLanguage, type Language } from './lib/language.js';

let lang: Language = 'en';
let selected: string | null = 'osapiens-aipe';
let filter = 'all';

const t = (en: string, de: string) => (lang === 'de' ? de : en);
const esc = (value: unknown) =>
    String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const branchColor: Record<string, string> = {
    main: 'var(--professional)',
    education: 'var(--academic)',
    research: 'var(--research)',
    homelabbing: 'var(--personal)',
};
const branchName = (id: string) => {
    const branch = BRANCHES.find(b => b.id === id)!;
    return t(branch.label, branch.labelDe);
};

const projectOrder = ['thoraxmonitor', 'tedias-ahead', 'respiratory-flow-reconstruction', 'federated-cardiac-ct', 'patent-measuring-process', 'homelab-cm3588', 'local-assistant', 'home-automation', 'private-photo-library', 'portfolio-website'];
const projects = projectOrder.map(id => PROJECTS.find(p => p.id === id)!);
const shortTitle: Record<string, [string, string]> = {
    'tedias-ahead': ['DARIAN', 'DARIAN'],
    'patent-measuring-process': ['Process measurement', 'Prozessvermessung'],
    'federated-cardiac-ct': ['Federated cardiac CT', 'Föderierte Herz-CT'],
};
const category = (p: Project) =>
    ({ project: t('Project', 'Projekt'), publication: t('Publication', 'Publikation'), sidequest: t('Side quest', 'Nebenprojekt') })[p.category];
const role = (p: Project) => (p.role ? ' / ' + (lang === 'de' && p.roleDe ? p.roleDe : p.role) : '');

// The site logo from public/images/black_logo.svg. The fill uses currentColor, so one mark works in both themes.
const logo = `<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><path id="mo-path" d="M50 160 C 40 90, 90 90, 100 140 C 110 180, 140 180, 150 140 C 160 80, 210 90, 200 130 C 210 185, 270 170, 260 120 C 250 80, 195 95, 205 135"/><mask id="mo-mask"><use href="#mo-path" stroke="white" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><use href="#mo-path" stroke="black" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></mask></defs><rect width="300" height="220" fill="currentColor" mask="url(#mo-mask)"/></svg>`;

// The German version is hidden for now. Set to true to show the EN/DE switch again.
const GERMAN = false;

const langSwitch = () => !GERMAN ? '' : `<div class="lang-switch" role="group" aria-label="${t('Language', 'Sprache')}">
${(['en', 'de'] as const)
    .map(code => `<a href="${code === 'de' ? '/?lang=de' : '/'}" hreflang="${code}" lang="${code}" data-lang="${code}"${code === lang ? ' aria-current="true"' : ''} aria-label="${code === 'de' ? 'Deutsch' : 'English'}">${code.toUpperCase()}</a>`)
    .join('<span aria-hidden="true">/</span>')}</div>`;

function header(): string {
    const dark = document.documentElement.dataset.theme === 'dark';
    return `<a class="skip" href="#main">${t('Skip to content', 'Zum Inhalt springen')}</a>
<header><a class="identity" href="#home" aria-label="${t('Moritz Bednorz, start of page', 'Moritz Bednorz, Seitenanfang')}">${logo}<span>Moritz Bednorz<span class="identity-sub">${t('Engineer & tech enthusiast', 'Ingenieur & Tech-Enthusiast')}</span></span></a>
<nav aria-label="${t('Main navigation', 'Hauptnavigation')}"><a href="#journey">${t('Journey', 'Werdegang')}</a><a href="#work">${t('Work', 'Projekte')}</a><a href="#contact">${t('Contact', 'Kontakt')}</a>${langSwitch()}<button id="theme-toggle" aria-label="${dark ? t('Use light mode', 'Hellen Modus verwenden') : t('Use dark mode', 'Dunklen Modus verwenden')}">${dark ? t('Light mode', 'Hell') : t('Dark mode', 'Dunkel')}</button><button id="menu-toggle" aria-expanded="false" aria-controls="menu">${t('Menu', 'Menü')} <span aria-hidden="true">☷</span></button>
<div id="menu" hidden><a href="#home">${t('Introduction', 'Einleitung')}</a><a href="#journey">${t('Career & branches', 'Werdegang & Zweige')}</a><a href="#work">${t('All projects', 'Alle Projekte')}</a><a href="#contact">${t('Contact', 'Kontakt')}</a></div></nav></header>`;
}

function hero(): string {
    return `<section id="home" class="hero">
<div class="hero-copy"><p class="eyebrow">${t('Mannheim, Germany / AI & medical technology', 'Mannheim, Deutschland / KI & Medizintechnik')}</p>
<h1>${t('Curiosity.', 'Neugier.')}<br><em>${t('Put to work.', 'In die Praxis gebracht.')}</em></h1>
<p class="intro">${t('Hey, I’m Moritz Bednorz.', 'Hey, ich bin Moritz Bednorz.')}<br>${t('I build AI systems and explore what’s next.', 'Ich baue KI-Systeme und erkunde, was als Nächstes kommt.')}</p>
<p class="hero-description">${t('From contactless sensors to AI infrastructure. I connect research, software, and the real world.', 'Von kontaktlosen Sensoren bis zur KI-Infrastruktur. Ich verbinde Forschung, Software und die reale Welt.')}</p>
<div class="hero-links"><a href="#journey">${t('My journey', 'Mein Werdegang')} <span>↘</span></a><a href="#work">${t('Explore my work', 'Meine Projekte')} <span>↘</span></a></div></div>
<figure class="portrait"><img src="/images/portrait.webp" alt="${t('Illustrated portrait of Moritz Bednorz', 'Illustriertes Porträt von Moritz Bednorz')}" width="1024" height="1024" fetchpriority="high"><figcaption>${t('A technical Swiss Army knife.', 'Ein technisches Schweizer Taschenmesser.')}</figcaption></figure>
<div class="current-role"><span class="eyebrow">${t('Currently / since July 2026', 'Aktuell / seit Juli 2026')}</span><p>AI Platform Engineer <span>${t('at osapiens', 'bei osapiens')}</span></p><a href="#journey" data-select="osapiens-aipe">${t('Follow the branch', 'Zum Zweig')} ↗</a></div>
</section>`;
}

function eventDetail(event: TimelineEvent): string {
    const highlights = (lang === 'de' ? event.highlightsDe : event.highlights) ?? [];
    const projectLink = event.projectId && PROJECTS.some(p => p.id === event.projectId)
        ? `<button class="text-link" data-project="${event.projectId}">${t('Explore project', 'Projekt ansehen')} ↗</button>`
        : '';
    return `<p>${esc(t(event.description, event.descriptionDe))}</p>${highlights.length ? `<ul>${highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}<p class="technology">${(event.tags ?? []).map(esc).join(' · ')}</p>${projectLink}`;
}

// Newest first. The data file is not strictly sorted.
const EVENTS = [...TIMELINE_DATA].sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month));

function commits(): string {
    return EVENTS.filter(event => filter === 'all' || event.branch === filter)
        .map(event => {
            const lane = BRANCHES.findIndex(b => b.id === event.branch);
            const open = selected === event.id;
            return `<div class="commit-row${open ? ' selected' : ''}" style="--branch:${branchColor[event.branch]}"><button class="commit" data-event="${event.id}" aria-expanded="${open}" aria-controls="panel-${event.id}"><span class="tracks" aria-hidden="true"><b style="left:${6 + lane * 19}px"></b></span><span class="commit-label"><span class="commit-date">${esc(t(event.date, event.dateDe))} <span>${branchName(event.branch)}</span></span><strong>${esc(t(event.title, event.titleDe))}</strong>${event.company ? `<span class="commit-company">${esc(event.company)}</span>` : ''}</span><span class="commit-arrow" aria-hidden="true">${open ? '−' : '+'}</span></button><div id="panel-${event.id}" class="inline-event"${open ? '' : ' hidden'}>${eventDetail(event)}</div></div>`;
        })
        .join('');
}

function journey(): string {
    return `<section id="journey" class="journey"><div class="section-heading"><div><p class="eyebrow">${t('About / a history with branches', 'Über mich / ein Werdegang mit Zweigen')}</p><h2>${t('One curious mind.', 'Ein neugieriger Kopf.')}<br><em>${t('Many branches.', 'Viele Zweige.')}</em></h2></div><p>${t('A background in Medical Informatics.', 'Ein Hintergrund in Medizinischer Informatik.')}<br>${t('A habit of following interesting problems.', 'Und die Gewohnheit, interessanten Problemen zu folgen.')}</p></div>
<div class="journey-intro"><p>${t('I’m a tech enthusiast with a background in Medical Informatics. My work spans medical sensors, machine learning, and AI platforms.', 'Ich bin Tech-Enthusiast mit einem Hintergrund in Medizinischer Informatik. Meine Arbeit umfasst medizinische Sensoren, Machine Learning und KI-Plattformen.')}</p><p>${t('For me, research isn’t just about writing papers. It’s about building solutions that work in the real world and help people.', 'Für mich ist Forschung mehr als Paper schreiben. Es geht darum, Lösungen zu bauen, die in der realen Welt funktionieren und Menschen helfen.')}</p></div>
<div class="branch-legend" role="group" aria-label="${t('Filter by branch', 'Nach Zweig filtern')}">${BRANCHES.map(b => `<button data-branch="${b.id}" aria-pressed="${filter === b.id}" style="--branch:${branchColor[b.id]}"><i></i>${branchName(b.id)}</button>`).join('')}<button data-branch="all" aria-pressed="${filter === 'all'}">${t('All branches', 'Alle Zweige')}</button></div>
<p class="timeline-help">${t('Select an event to read its details. Select a branch to filter events.', 'Wähle einen Eintrag, um die Details zu lesen. Wähle einen Zweig, um Einträge zu filtern.')}</p>
<div class="timeline-layout"><div id="commits" class="commits">${commits()}</div></div></section>`;
}

function work(): string {
    return `<section id="work" class="work"><div class="section-heading"><div><p class="eyebrow">${t('Selected work / projects, publications & side quests', 'Ausgewählte Arbeiten / Projekte, Publikationen & Nebenprojekte')}</p><h2>${t('Ideas meet', 'Ideen treffen')}<br><em>${t('the real world.', 'auf die reale Welt.')}</em></h2></div><p>${t('Medical sensing. Applied AI.', 'Medizinische Sensorik. Angewandte KI.')}<br>${t('And a few things built for the joy of it.', 'Und ein paar Dinge, gebaut aus Freude daran.')}</p></div>
<div class="projects">${projects
        .map((p, i) => {
            const title = t(p.title, p.titleDe);
            const short = shortTitle[p.id] ? t(...shortTitle[p.id]!) : title;
            return `<article class="project project-${i}"><button class="project-image" data-project="${p.id}" aria-label="${esc(t('Open details: ', 'Details öffnen: ') + title)}"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"><span class="open-image" aria-hidden="true">↗</span></button><div class="project-copy"><p class="eyebrow">${esc(category(p) + role(p))}</p><h3><button data-project="${p.id}">${esc(short)} <span aria-hidden="true">↗</span></button></h3><p>${esc(t(p.description, p.descriptionDe))}</p><p class="technology">${p.tech.map(esc).join(' · ')}</p></div></article>`;
        })
        .join('')}</div></section>`;
}

function contact(): string {
    return `<section id="contact" class="contact"><div class="section-heading"><div><p class="eyebrow">${t('Contact / email, LinkedIn & GitHub', 'Kontakt / E-Mail, LinkedIn & GitHub')}</p><h2>${t('Questions or ideas?', 'Fragen oder Ideen?')}<br><em>${t('Write to me.', 'Schreib mir.')}</em></h2></div><p>${t('You can contact me by email or on LinkedIn.', 'Du erreichst mich per E-Mail oder auf LinkedIn.')}</p></div>
<a class="contact-mail" href="mailto:contact@moritzbednorz.com">contact@moritzbednorz.com <span aria-hidden="true">↗</span></a>
<div class="contact-links"><a href="https://www.linkedin.com/in/moritz-bednorz/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/med-mo-b" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></section>`;
}

function footer(): string {
    return `<footer><p>Moritz Bednorz <span>${t('Engineer. Researcher. Tech enthusiast.', 'Ingenieur. Forscher. Tech-Enthusiast.')}</span></p><a href="https://github.com/med-mo-b" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="#home">${t('Back to top', 'Nach oben')} ↑</a></footer>`;
}

const dialog = () => `<dialog aria-labelledby="project-title"><div class="dialog-bar"><span class="eyebrow">${t('Project notes', 'Projektnotizen')}</span><button id="close-dialog">${t('Close', 'Schließen')} ×</button></div><div id="project-detail"></div></dialog>`;

function projectDetail(p: Project): string {
    const label: Record<string, string> = {
        github: t('Source on GitHub', 'Quellcode auf GitHub'),
        paper: p.id.startsWith('patent') ? t('Read the patent', 'Zum Patent') : t('Read the paper', 'Zum Paper'),
        external: t('Project website', 'Projektseite'),
    };
    const links = p.links ?? {};
    const external = lang === 'de' && links.externalDe ? links.externalDe : links.external;
    const entries = Object.entries({ github: links.github, paper: links.paper, external }).filter(([, url]) => url);
    return `<img class="detail-image" src="${esc(p.image)}" alt=""><div class="detail-copy"><p class="eyebrow">${esc(category(p) + role(p))}</p><h2 id="project-title">${esc(t(p.title, p.titleDe))}</h2><p>${esc(t(p.details, p.detailsDe))}</p><p class="technology">${p.tech.map(esc).join(' · ')}</p><div class="detail-links">${entries.map(([key, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label[key]} ↗</a>`).join('')}</div></div>`;
}

/** The git tree from the Atlas mockup: one main line and one curved branch per lane. */
function drawGitTree(): void {
    const list = document.querySelector<HTMLElement>('#commits');
    if (!list) return;
    list.querySelector('.git-lines')?.remove();
    const top0 = list.getBoundingClientRect().top;
    const height = list.scrollHeight;
    const rows = [...list.querySelectorAll<HTMLElement>('[data-event]')];
    const paths = BRANCHES.map((branch, lane) => {
        if (lane === 0) return `<path d="M12.5 0V${height}" stroke="${branchColor.main}"/>`;
        const nodes = rows.filter(r => TIMELINE_DATA.find(e => e.id === r.dataset.event)!.branch === branch.id);
        if (!nodes.length) return '';
        const top = nodes[0]!.getBoundingClientRect().top - top0 + 44.5;
        const bottom = nodes.at(-1)!.getBoundingClientRect().top - top0 + 44.5;
        const x = 12.5 + lane * 19;
        return `<path d="M12.5 ${bottom + 35} C12.5 ${bottom + 15},${x} ${bottom + 20},${x} ${bottom} V${top} C${x} ${top - 20},12.5 ${top - 15},12.5 ${top - 35}" stroke="${branchColor[branch.id]}"/>`;
    }).join('');
    list.insertAdjacentHTML('afterbegin', `<svg class="git-lines" width="88" height="${height}" aria-hidden="true"><g fill="none" stroke-width="1.2">${paths}</g></svg>`);
}

function renderCommits(): void {
    document.querySelector('#commits')!.innerHTML = commits();
    drawGitTree();
}

function setMeta(): void {
    document.title = t('Moritz Bednorz | AI Platform Engineer & Tech Enthusiast', 'Moritz Bednorz | AI Platform Engineer & Tech-Enthusiast');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t(
        'Moritz Bednorz - AI Platform Engineer at osapiens, with a background in Medical Informatics and healthcare research.',
        'Moritz Bednorz - AI Platform Engineer bei osapiens, mit Hintergrund in Medizinischer Informatik und Gesundheitsforschung.',
    ));
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://moritzbednorz.com/${lang === 'de' ? '?lang=de' : ''}`);
}

const SECTIONS: [string, string, string][] = [
    ['home', 'Home', 'Start'],
    ['journey', 'Journey', 'Werdegang'],
    ['work', 'Work', 'Projekte'],
    ['contact', 'Contact', 'Kontakt'],
];

/** Fixed section index on wide screens. A section button with a short list replaces it on narrow screens. */
function sectionIndex(): string {
    const links = SECTIONS.map(([id, en, de], i) => `<a href="#${id}" data-index="${id}"><em>${t(en, de)}</em><span>0${i + 1}</span></a>`).join('');
    return `<nav class="section-index" aria-label="${t('Sections', 'Abschnitte')}">${links}</nav><div class="section-pill"><div id="section-list" hidden><a href="#home">↑ ${t('Top', 'Nach oben')}</a>${SECTIONS.slice(1).map(([id, en, de], i) => `<a href="#${id}" data-index="${id}"><span>0${i + 2}</span> ${t(en, de)}</a>`).join('')}</div><button id="section-toggle" aria-expanded="false" aria-controls="section-list"><span class="pill-current"></span> <span aria-hidden="true">▴</span></button></div>`;
}

/** Marks the section that is in the upper part of the viewport. */
function updateIndex(): void {
    let active = 'home';
    for (const [id] of SECTIONS) {
        if (document.getElementById(id)!.getBoundingClientRect().top <= innerHeight * 0.35) active = id;
    }
    // The contact section is short and can not reach the upper part of the viewport.
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) active = 'contact';
    document.querySelectorAll('[data-index]').forEach(a => a.setAttribute('aria-current', String(a.getAttribute('data-index') === active)));
    const pill = document.querySelector('.section-pill');
    pill?.classList.toggle('show', scrollY > innerHeight * 0.6);
    const [, en, de] = SECTIONS.find(([id]) => id === active)!;
    const label = pill?.querySelector('.pill-current');
    if (label) label.textContent = `0${SECTIONS.findIndex(([id]) => id === active) + 1} ${t(en, de)}`;
}

function render(): void {
    document.querySelector('#app')!.innerHTML = `${header()}<main id="main">${hero()}${journey()}${work()}${contact()}${footer()}</main>${sectionIndex()}${dialog()}`;
    setMeta();
    drawGitTree();
    updateIndex();
}

function setTheme(theme: 'light' | 'dark', save: boolean): void {
    document.documentElement.dataset.theme = theme;
    if (save) {
        try {
            localStorage.setItem('theme', theme);
        } catch {
            // Storage unavailable: the choice applies to this visit only.
        }
    }
    const button = document.querySelector('#theme-toggle');
    if (button) {
        const dark = theme === 'dark';
        button.textContent = dark ? t('Light mode', 'Hell') : t('Dark mode', 'Dunkel');
        button.setAttribute('aria-label', dark ? t('Use light mode', 'Hellen Modus verwenden') : t('Use dark mode', 'Dunklen Modus verwenden'));
    }
}

function closeMenu(): void {
    document.querySelector<HTMLElement>('#menu')!.hidden = true;
    document.querySelector('#menu-toggle')!.setAttribute('aria-expanded', 'false');
}

/** Moves the custom cursor into the open dialog. A modal dialog is in the top layer and covers the page. */
function moveCursor(parent: Element): void {
    parent.append(...document.querySelectorAll('.cursor-dot, .cursor'));
}

export function initSite(): void {
    lang = GERMAN ? detectLanguage() : 'en';
    applyLanguage(lang, false);
    if (!document.documentElement.dataset.theme) document.documentElement.dataset.theme = 'light';
    render();
    // Content is rendered after load, so the browser cannot scroll to the hash itself.
    // Scroll again after the fonts load, because the fonts change the layout.
    const toHash = () => {
        if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'instant' });
    };
    toHash();
    document.fonts.ready.then(() => {
        drawGitTree();
        toHash();
    });
    window.addEventListener('resize', drawGitTree);
    window.addEventListener('scroll', updateIndex, { passive: true });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        let saved: string | null = null;
        try {
            saved = localStorage.getItem('theme');
        } catch {}
        if (saved !== 'light' && saved !== 'dark') setTheme(e.matches ? 'dark' : 'light', false);
    });

    document.addEventListener('click', event => {
        const target = event.target as Element;
        const langLink = target.closest<HTMLElement>('[data-lang]');
        if (langLink) {
            event.preventDefault();
            lang = langLink.dataset.lang as Language;
            applyLanguage(lang, true);
            render();
            document.querySelector<HTMLElement>(`[data-lang="${lang}"]`)?.focus({ preventScroll: true });
            return;
        }
        // The header is above #home, so "#home" links go to the very top of the page.
        if (target.closest('a[href="#home"]')) {
            event.preventDefault();
            scrollTo({ top: 0 });
            history.replaceState(null, '', location.pathname + location.search);
        }
        if (target.closest('#theme-toggle')) {
            setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
        }
        if (target.closest('#menu-toggle')) {
            const menu = document.querySelector<HTMLElement>('#menu')!;
            menu.hidden = !menu.hidden;
            document.querySelector('#menu-toggle')!.setAttribute('aria-expanded', String(!menu.hidden));
        } else if (!target.closest('#menu') || target.closest('#menu a')) {
            closeMenu();
        }
        const list = document.querySelector<HTMLElement>('#section-list');
        if (list && target.closest('#section-toggle')) {
            list.hidden = !list.hidden;
            document.querySelector('#section-toggle')!.setAttribute('aria-expanded', String(!list.hidden));
        } else if (list && (!target.closest('#section-list') || target.closest('#section-list a'))) {
            list.hidden = true;
            document.querySelector('#section-toggle')!.setAttribute('aria-expanded', 'false');
        }
        const select = target.closest<HTMLElement>('[data-select]');
        if (select) {
            filter = 'all';
            selected = select.dataset.select!;
            document.querySelectorAll('[data-branch]').forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-branch') === 'all')));
            renderCommits();
        }
        const project = target.closest<HTMLElement>('[data-project]');
        if (project) {
            const p = PROJECTS.find(p => p.id === project.dataset.project)!;
            const dialogEl = document.querySelector('dialog')!;
            document.querySelector('#project-detail')!.innerHTML = projectDetail(p);
            dialogEl.showModal();
            moveCursor(dialogEl);
            document.body.classList.add('modal-open');
        }
        const commit = target.closest<HTMLElement>('[data-event]');
        if (commit) {
            const id = commit.dataset.event!;
            selected = selected === id ? null : id;
            renderCommits();
            document.querySelector<HTMLElement>(`[data-event="${id}"]`)?.focus({ preventScroll: true });
        }
        const branch = target.closest<HTMLElement>('[data-branch]');
        if (branch) {
            filter = branch.dataset.branch!;
            selected = EVENTS.find(e => filter === 'all' || e.branch === filter)?.id ?? null;
            document.querySelectorAll('[data-branch]').forEach(b => b.setAttribute('aria-pressed', String(b === branch)));
            renderCommits();
        }
        const dialogEl = document.querySelector('dialog');
        if (dialogEl?.open && (target.closest('#close-dialog') || target === dialogEl)) dialogEl.close();
    });

    // The dialog is rendered again on a language change, so listen on the document.
    document.addEventListener('close', event => {
        if ((event.target as Element).tagName === 'DIALOG') {
            document.body.classList.remove('modal-open');
            moveCursor(document.body);
        }
    }, true);

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || document.querySelector('dialog')?.open) return;
        const menu = document.querySelector<HTMLElement>('#menu')!;
        if (!menu.hidden) {
            closeMenu();
            document.querySelector<HTMLElement>('#menu-toggle')!.focus();
        } else if (selected) {
            const prior = selected;
            selected = null;
            renderCommits();
            document.querySelector<HTMLElement>(`[data-event="${prior}"]`)?.focus({ preventScroll: true });
        }
    });
}
