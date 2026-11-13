import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { PROJECTS } from '../src/data/projects';
import { motionClip } from '../src/lib/project-media';

const site = readFileSync('src/site.ts', 'utf8');
const controller = readFileSync('src/lib/project-media.ts', 'utf8');
const css = readFileSync('src/styles/site.css', 'utf8');

describe('project motion clips', () => {
    test('every project has a local clip pair on disk under /motion', () => {
        for (const p of PROJECTS) {
            const clip = motionClip(p.id);
            const video = new URL(clip!.video, 'http://preview.local');
            const poster = new URL(clip!.poster, 'http://preview.local');
            expect(video.pathname).toBe(`/motion/${p.id}.mp4`);
            expect(poster.pathname).toBe(`/motion/${p.id}.jpg`);
            expect(video.search).toBe(poster.search);
            if (p.id === 'respiratory-flow-reconstruction') expect(video.search).toMatch(/^\?v=mc-[a-f0-9]{12}$/);
            expect(existsSync(`public${video.pathname}`)).toBe(true);
            expect(existsSync(`public${poster.pathname}`)).toBe(true);
        }
        expect(motionClip('no-such-project')).toBeNull();
    });

    test('cards and dialog render a media box with a sibling control, never a nested button', () => {
        const card = site.slice(site.indexOf('function work'), site.indexOf('function contact'));
        expect(card).toContain('class="project-media"');
        // The control markup follows the project-image button's closing tag, so the two buttons are siblings.
        expect(card).toMatch(/<\/button>\$\{mediaUi\(p\.id\)\}/);
        const detail = site.slice(site.indexOf('function projectDetail'), site.indexOf('/** The git tree'));
        expect(detail).toContain('class="detail-media"');
        expect(detail).toMatch(/<img class="detail-image"[^>]*>\$\{mediaUi\(p\.id\)\}/);
        // The control itself opens no dialog and carries no data-project of its own.
        const control = site.slice(site.indexOf('const mediaUi'), site.indexOf('function header'));
        expect(control).not.toContain('data-project');
        expect(control).toContain('aria-pressed="false"');
    });

    test('clips autoplay muted, looping, and inline, driven by play() so a blocked play keeps its control', () => {
        expect(controller).toContain('video.muted = true');
        expect(controller).toContain('video.loop = true');
        expect(controller).toContain('video.playsInline = true');
        // No autoplay attribute: the JS-driven play() call keeps a blocked automatic start retryable.
        expect(controller).not.toMatch(/video\.autoplay|setAttribute\('autoplay'/);
        expect(site).not.toMatch(/<video/i);
        // The one source assignment sits in createVideo, which only the wanted (visible) path calls.
        expect(controller.match(/video\.src\s*=/g)).toHaveLength(1);
        expect(controller).toContain('clipEl.play()');
    });

    test('clips start in view with zero rootMargin, and pause offscreen, in background tabs, and behind the modal', () => {
        expect(controller).toContain('IntersectionObserver');
        // The observer options are exactly threshold 0: strictly intersecting, no margin around the viewport.
        expect(controller).toContain('new IntersectionObserver(onIntersect, { threshold: 0 })');
        expect(controller).toContain('visibilitychange');
        expect(controller).toContain('!document.hidden');
        expect(controller).toContain('dialog ? dialog.open : !modalOpen');
        expect(site).toContain('setModalOpen(true)');
        expect(site).toContain('setModalOpen(false)');
    });

    test('reduced-motion and save-data default to the poster, an explicit play opts in, and preference changes re-sync', () => {
        expect(controller).toContain('(motionAllowed() || state.explicitPlay)');
        expect(controller).toContain("matchMedia('(prefers-reduced-motion: reduce)').matches");
        expect(controller).toContain('connection?.saveData');
        expect(controller).toContain(".addEventListener('change', syncAll)");
        expect(controller).toContain('state.userPaused = true');
        expect(controller).toContain('state.explicitPlay = true');
    });

    test('clip state is module-level, so a manual pause survives the language re-render', () => {
        expect(controller).toMatch(/const states = new Map<string, ClipState>/);
        expect(controller).toContain('state.userPaused = true');
        expect(site).toMatch(/setModalOpen\(false\);\n    mountMedia\(\);/);
        expect(controller).toContain('export function mountMedia');
    });

    test('play controls are visible and labeled in English and German', () => {
        for (const label of ['Play clip', 'Pause clip', 'Clip abspielen', 'Clip pausieren', 'Demonstration (muted)', 'Demonstration (stumm)']) {
            expect(site).toContain(label);
        }
        expect(css).toContain('.media-toggle{position:absolute');
        expect(css).toContain('.media-badge{position:absolute');
    });

    test('cards and dialog default to the matching poster; the original image is only for projects without a clip', () => {
        expect(site).toContain('const mediaImage = (p: Project) => motionClip(p.id)?.poster ?? p.image;');
        // Both the card image and the dialog image use the helper.
        expect(site.match(/src="\$\{esc\(mediaImage\(p\)\)\}"/g)).toHaveLength(2);
        for (const p of PROJECTS) {
            const clip = motionClip(p.id)!;
            expect(new URL(clip.poster, 'http://preview.local').pathname).toBe(`/motion/${p.id}.jpg`);
            expect(new URL(clip.video, 'http://preview.local').pathname).toBe(`/motion/${p.id}.mp4`);
        }
    });

    test('poster and video share one contain box, with no cover-crop rules left', () => {
        expect(css).toContain('.project-image>img,.project-image>video{width:100%;height:280px;object-fit:contain');
        expect(css).toContain('.project-0 .project-image img,.project-0 .project-image video{height:360px}');
        expect(css).toContain('.project-image>img,.project-image>video,.project-0 .project-image img,.project-0 .project-image video{height:230px}');
        expect(css).toContain('img,video{max-width:100%;display:block}');
        expect(css).toContain('.media-toggle[hidden],.media-badge[hidden],.project-image>img[hidden],.detail-image[hidden]{display:none}');
        expect(css).not.toContain('object-fit:cover');
        expect(css).not.toContain('.project-2 .project-image img');
    });

    test('no GIFs and no clip fetches outside the wanted (visible) path', () => {
        expect(site + controller + css).not.toMatch(/\.gif/i);
        expect(controller).not.toMatch(/fetch\(|XMLHttpRequest/);
        expect(controller).not.toContain('preload');
    });

    test('removed clips are paused and unloaded, stale rejections cannot poison the active clip, and a policy block keeps its control', () => {
        expect(controller).toContain('function unloadVideo');
        expect(controller).toContain("video.removeAttribute('src')");
        expect(controller).toContain('video.load()');
        expect(controller).toContain('if (video) {\n                unloadVideo(video);\n                video.remove();\n            }');
        // Re-render cleanup stops detached roots before unobserving them.
        expect(controller).toContain("root.querySelectorAll('video').forEach(unloadVideo)");
        // A rejected play falls back for the active clip but ignores AbortError and stale elements.
        expect(controller).toContain("reason?.name === 'AbortError' || !clipEl.isConnected");
        // A policy-blocked automatic play keeps the Play control for a gesture retry; only a real failure hides it.
        expect(controller).toContain("reason?.name === 'NotAllowedError'");
        expect(controller).toContain('fail(id);\n                });');
        // The error listener ignores the sourceless error that load() reports on purpose.
        expect(controller).toContain("!video.isConnected || !video.hasAttribute('src')");
        // The site's close listener owns setModalOpen(false); the controller adds no second one.
        expect(controller).not.toContain("addEventListener('close'");
        expect(site).toContain('setModalOpen(false);');
    });
});


test('the replacement movie and poster URLs carry their actual shared content revision', () => {
    const id = 'respiratory-flow-reconstruction';
    const revision = createHash('sha256').update(readFileSync(`public/motion/${id}.mp4`)).update(readFileSync(`public/motion/${id}.jpg`)).digest('hex').slice(0, 12);
    const clip = motionClip(id)!;
    expect(new URL(clip.video, 'http://preview.local').search).toBe(`?v=mc-${revision}`);
    expect(new URL(clip.poster, 'http://preview.local').search).toBe(`?v=mc-${revision}`);
});
