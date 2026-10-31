/**
 * Custom cursor: a copy of the itssharl.ee cursor.
 * A 4 px dot and a 24 px ring follow the pointer with spring physics
 * (stiffness 200, damping 10, mass 0.15 for the dot and 0.25 for the ring).
 * The system cursor stays visible, as on itssharl.ee.
 *
 * Ring states:
 * - visible: empty ring, border 2 px (1.5 px below 992 px viewport width), scale 1
 * - selected (pointer on a link or button): filled, scale 2, opacity 0.5 in light mode
 * - click: empty ring, border 1.5 px (1 px), scale 2
 * - clickSelected: filled, scale 4
 * - invisible: the pointer is outside the window
 * The dot is hidden in the selected states.
 *
 * The ring changes its real width and height, not transform: scale().
 * A scaled transform stretches a small raster and makes a pixelated circle.
 * The border width scales with it, so the result looks the same as on itssharl.ee.
 */

type Values = Record<string, number>;

const STIFFNESS = 200;
const DAMPING = 10;
const RING_SIZE = 24;

export class Spring {
    value: Values;
    velocity: Values;
    target: Values;

    constructor(start: Values, private mass: number) {
        this.value = { ...start };
        this.target = { ...start };
        this.velocity = Object.fromEntries(Object.keys(start).map(k => [k, 0]));
    }

    /** Advances by dt seconds. Returns true while the spring still moves. */
    step(dt: number): boolean {
        let moving = false;
        // Fixed 2 ms substeps keep the integration stable at low frame rates.
        for (let t = 0; t < dt; t += 0.002) {
            const h = Math.min(0.002, dt - t);
            for (const k in this.value) {
                const force = -STIFFNESS * (this.value[k]! - this.target[k]!) - DAMPING * this.velocity[k]!;
                this.velocity[k]! += (force / this.mass) * h;
                this.value[k]! += this.velocity[k]! * h;
            }
        }
        for (const k in this.value) {
            if (Math.abs(this.velocity[k]!) > 0.01 || Math.abs(this.value[k]! - this.target[k]!) > 0.01) moving = true;
            else this.value[k] = this.target[k]!;
        }
        return moving;
    }
}

export function initCursor(): void {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);

    const dotSpring = new Spring({ x: 0, y: 0, opacity: 0 }, 0.15);
    const ringSpring = new Spring({ x: 0, y: 0, opacity: 0, scale: 1, border: 0, fill: 0 }, 0.25);

    let inside = false;
    let overTarget = false;
    let pressed = false;
    let started = false;
    let running = false;
    let last = 0;

    function setTargets(): void {
        const dark = document.documentElement.dataset.theme === 'dark';
        const thin = window.innerWidth < 992;
        const r = ringSpring.target;
        const d = dotSpring.target;
        if (!inside) Object.assign(r, { opacity: 0, scale: 1, border: 0, fill: 0 });
        else if (overTarget) Object.assign(r, { opacity: dark ? 1 : 0.5, scale: pressed ? 4 : 2, border: 0, fill: 1 });
        else if (pressed) Object.assign(r, { opacity: 1, scale: 2, border: thin ? 1 : 1.5, fill: 0 });
        else Object.assign(r, { opacity: 1, scale: 1, border: thin ? 1.5 : 2, fill: 0 });
        d.opacity = inside && !overTarget ? 1 : 0;
        if (!running) {
            running = true;
            last = performance.now();
            requestAnimationFrame(frame);
        }
    }

    function frame(now: number): void {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        const moving = [dotSpring.step(dt), ringSpring.step(dt)].some(Boolean);
        const d = dotSpring.value;
        const r = ringSpring.value;
        dot.style.transform = `translate3d(${d.x! - 2}px, ${d.y! - 2}px, 0)`;
        dot.style.opacity = String(d.opacity);
        const size = RING_SIZE * r.scale!;
        ring.style.width = ring.style.height = `${size}px`;
        ring.style.transform = `translate3d(${r.x! - size / 2}px, ${r.y! - size / 2}px, 0)`;
        ring.style.borderWidth = `${Math.max(0, r.border! * r.scale!)}px`;
        ring.style.opacity = String(Math.max(0, r.opacity!));
        ring.style.setProperty('--fill', String(Math.min(1, Math.max(0, r.fill!))));
        running = moving;
        if (running) requestAnimationFrame(frame);
    }

    document.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        for (const spring of [dotSpring, ringSpring]) {
            spring.target.x = event.clientX;
            spring.target.y = event.clientY;
            // The first position appears at the pointer, without a flight from the corner.
            if (!started) {
                spring.value.x = event.clientX;
                spring.value.y = event.clientY;
            }
        }
        started = true;
        inside = true;
        overTarget = !!(event.target as Element | null)?.closest?.('a, button');
        setTargets();
    });
    document.documentElement.addEventListener('mouseleave', () => {
        inside = false;
        setTargets();
    });
    document.addEventListener('pointerdown', () => {
        pressed = true;
        setTargets();
    });
    document.addEventListener('pointerup', () => {
        pressed = false;
        setTargets();
    });
    new MutationObserver(setTargets).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
