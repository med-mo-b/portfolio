/**
 * Motion clips for the eight approved project cards.
 * A muted, looping clip plays automatically as soon as its media box enters the
 * viewport: the clip element is only created at that moment, so no clip bytes
 * are requested before the intersection (the observer uses zero rootMargin).
 * A clip pauses and unloads when it leaves the viewport, when the tab hides,
 * and when the modal dialog covers the page cards; it starts again on return
 * unless the visitor paused it. Reduced-motion and save-data visitors get the
 * matching static poster by default, and an explicit press of the Play control
 * opts in. A policy-blocked automatic play (NotAllowedError) is not a failure:
 * it keeps the Play control so a visitor gesture can retry, while a real media
 * failure hides the control. Clip state lives in this module, keyed by project
 * id, so a manual pause survives a language re-render. A removed clip is paused
 * and unloaded, so no detached element keeps playing or downloading.
 */

const MOTION_IDS = new Set([
    'federated-cardiac-ct',
    'homelab-cm3588',
    'local-assistant',
    'patent-measuring-process',
    'portfolio-website',
    'respiratory-flow-reconstruction',
    'tedias-ahead',
    'thoraxmonitor',
]);

export interface MotionClip {
    video: string;
    poster: string;
}

/** Local clip pair for a project id, or null when a project has no approved clip. */
export const motionClip = (id: string): MotionClip | null => {
    if (!MOTION_IDS.has(id)) return null;
    // The replaced clip and poster share a content revision to bypass older cached renders.
    const revision = id === 'respiratory-flow-reconstruction' ? '?v=mc-2d244ce64be6' : '';
    return { video: `/motion/${id}.mp4${revision}`, poster: `/motion/${id}.jpg${revision}` };
};

/** The site renders play controls only when the browser can decode the clips. */
export const supportsClips = (): boolean =>
    typeof document !== 'undefined' && !!document.createElement('video').canPlayType('video/mp4');

export const clipEnabled = (id: string): boolean => !!motionClip(id) && supportsClips();

const saveData = (): boolean =>
    !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

/** Autoplay default: off for reduced-motion and save-data visitors; an explicit Play press can still opt in. */
const motionAllowed = (): boolean =>
    !matchMedia('(prefers-reduced-motion: reduce)').matches && !saveData();

interface ClipState {
    /** The visitor pressed pause: no autoplay restart until they press Play again. */
    userPaused: boolean;
    /** The visitor pressed Play: opts in even where reduced-motion or save-data keeps autoplays off. */
    explicitPlay: boolean;
    failed: boolean;
}

const states = new Map<string, ClipState>();

const stateFor = (id: string): ClipState => {
    let state = states.get(id);
    if (!state) {
        state = { userPaused: false, explicitPlay: false, failed: false };
        states.set(id, state);
    }
    return state;
};

let observer: IntersectionObserver | null = null;
const visible = new Map<Element, boolean>();
const observed = new Set<Element>();
let modalOpen = false;

/** Creates the clip element in the media box. Only the wanted (visible) path calls it, so no source fetch starts before the intersection. */
function createVideo(root: HTMLElement, clip: MotionClip): HTMLVideoElement {
    const img = root.querySelector('img');
    const video = document.createElement('video');
    video.className = img?.className ?? '';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    // The attributes mirror the properties for engines that read markup only.
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.poster = clip.poster;
    video.src = clip.video;
    video.addEventListener('error', () => {
        // unloadVideo() removes the source, and load() then reports that as an error; only a real failure of the active clip counts.
        if (!video.isConnected || !video.hasAttribute('src')) return;
        fail(root.dataset.media!);
    });
    img?.before(video);
    return video;
}

/** Stops a clip for good: a detached media element would otherwise keep playing or downloading. */
function unloadVideo(video: HTMLVideoElement): void {
    video.pause();
    video.removeAttribute('src');
    video.load();
}

function setControl(root: HTMLElement, playing: boolean, failed: boolean): void {
    const button = root.querySelector<HTMLButtonElement>('[data-media-toggle]');
    if (!button) return;
    button.hidden = failed;
    button.setAttribute('aria-pressed', String(playing));
    button.querySelector('.when-play')?.toggleAttribute('hidden', playing);
    button.querySelector('.when-pause')?.toggleAttribute('hidden', !playing);
}

/** Whether this media box should show the playing clip right now. The toggle decides from the same condition. */
function wantedFor(state: ClipState, root: HTMLElement): boolean {
    const dialog = root.closest('dialog') as HTMLDialogElement | null;
    return !state.userPaused && !state.failed
        && (motionAllowed() || state.explicitPlay)
        && visible.get(root) === true
        && !document.hidden
        && (dialog ? dialog.open : !modalOpen);
}

function fail(id: string): void {
    stateFor(id).failed = true;
    sync(id);
}

/** Applies one clip's state to every rendered media box for it. */
function sync(id: string): void {
    const clip = motionClip(id);
    if (!clip) return;
    const state = stateFor(id);
    for (const root of document.querySelectorAll<HTMLElement>(`[data-media="${id}"]`)) {
        const wanted = wantedFor(state, root);
        const img = root.querySelector('img');
        const badge = root.querySelector<HTMLElement>('.media-badge');
        const video = root.querySelector('video');
        if (wanted) {
            const clipEl = video ?? createVideo(root, clip);
            img?.setAttribute('hidden', '');
            badge?.removeAttribute('hidden');
            if (clipEl.paused) {
                clipEl.play().catch(reason => {
                    // AbortError means this element was unloaded or paused on purpose; a stale element is no longer the active clip.
                    if (reason?.name === 'AbortError' || !clipEl.isConnected) return;
                    if (reason?.name === 'NotAllowedError') {
                        // Policy blocked this automatic play; the media is fine, so keep the control and let a gesture retry.
                        state.userPaused = true;
                        sync(id);
                        return;
                    }
                    fail(id);
                });
            }
        } else {
            // Not wanted: stop and unload the clip, then show the static image, which stays the usable fallback.
            if (video) {
                unloadVideo(video);
                video.remove();
            }
            img?.removeAttribute('hidden');
            badge?.setAttribute('hidden', '');
        }
        setControl(root, wanted, state.failed);
    }
}

function syncAll(): void {
    for (const id of [...states.keys()]) sync(id);
}

function onIntersect(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
        const root = entry.target as HTMLElement;
        visible.set(root, entry.isIntersecting);
        if (root.dataset.media) sync(root.dataset.media);
    }
}

function onToggle(id: string, root: HTMLElement): void {
    const state = stateFor(id);
    if (state.failed || !clipEnabled(id)) return;
    if (wantedFor(state, root)) {
        // An explicit pause keeps the clip off on re-visibility and re-renders, until the visitor presses Play again.
        state.userPaused = true;
        state.explicitPlay = false;
    } else {
        // An explicit play also opts in where reduced-motion or save-data keeps autoplays off.
        state.userPaused = false;
        state.explicitPlay = true;
    }
    sync(id);
}

/** Scans the document after a render or dialog change and reapplies the saved clip states. */
export function mountMedia(): void {
    if (!observer) return;
    for (const root of document.querySelectorAll<HTMLElement>('[data-media]')) {
        if (!observed.has(root)) {
            observed.add(root);
            visible.set(root, false);
            observer.observe(root);
        }
    }
    for (const root of [...observed]) {
        if (!root.isConnected) {
            // A re-render replaced this root; its clip must not keep playing or downloading in the detached tree.
            root.querySelectorAll('video').forEach(unloadVideo);
            observer.unobserve(root);
            observed.delete(root);
            visible.delete(root);
        }
    }
    syncAll();
}

/** Called by the site when the modal dialog opens or closes. Page cards pause behind the modal. */
export function setModalOpen(open: boolean): void {
    modalOpen = open;
    syncAll();
}

/** Installs the shared listeners once. Called from initSite. */
export function initMedia(): void {
    if (observer || !supportsClips()) return;
    observer = new IntersectionObserver(onIntersect, { threshold: 0 });
    document.addEventListener('click', event => {
        const button = (event.target as Element).closest<HTMLElement>('[data-media-toggle]');
        const root = button?.closest<HTMLElement>('[data-media]');
        if (button?.dataset.mediaToggle && root) onToggle(button.dataset.mediaToggle, root);
    });
    document.addEventListener('visibilitychange', syncAll);
    // Preference changes re-evaluate the autoplay default; an explicit opt-in keeps playing.
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', syncAll);
    (navigator as Navigator & { connection?: EventTarget }).connection?.addEventListener('change', syncAll);
    // The site's own dialog close listener owns setModalOpen(false); no second listener here.
    mountMedia();
}
