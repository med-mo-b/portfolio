/**
 * Preloader Component
 * Handles asset preloading and initial loading screen
 */

import gsap from 'gsap';
import { PROJECTS } from '../data/projects.js';

// 5x7 Dot Grid Bitmaps (5 columns × 7 rows = 35 bits per character)
// Each row is represented as a binary string (1 = dot, 0 = empty)
const DIGIT_GRIDS: Record<string, string[]> = {
    '0': ['11111', '10001', '10001', '10001', '10001', '10001', '11111'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['11111', '00001', '00001', '11111', '10000', '10000', '11111'],
    '3': ['11111', '00001', '00001', '11111', '00001', '00001', '11111'],
    '4': ['10001', '10001', '10001', '11111', '00001', '00001', '00001'],
    '5': ['11111', '10000', '10000', '11111', '00001', '00001', '11111'],
    '6': ['11111', '10000', '10000', '11111', '10001', '10001', '11111'],
    '7': ['11111', '00001', '00001', '00001', '00001', '00001', '00001'],
    '8': ['11111', '10001', '10001', '11111', '10001', '10001', '11111'],
    '9': ['11111', '10001', '10001', '11111', '00001', '00001', '11111'],
    '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
    '/': ['00001', '00001', '00010', '00100', '01000', '10000', '10000'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'E': ['11111', '10000', '10000', '11111', '10000', '10000', '11111'],
    'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100']
};

export class Preloader {
    private element: HTMLElement;
    private imagesToLoad: string[] = [];
    private progress: number = 0;
    private intervalId: any = null;

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'preloader';
        
        this.imagesToLoad = PROJECTS
            .map(p => p.image)
            .filter((img): img is string => !!img);

        this.imagesToLoad.push('/images/portfolio_about_screenshot.png');
        this.imagesToLoad.push('/images/federated_paper.webp');
    }

    /**
     * Creates a 5x7 dot grid for a single character
     */
    private createDigitGrid(char: string): string {
        const grid = DIGIT_GRIDS[char];
        if (!grid) return '';

        let html = '<div class="digit-grid">';
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 5; col++) {
                const isActive = grid[row][col] === '1';
                html += `<div class="dot ${isActive ? 'active' : ''}"></div>`;
            }
        }
        html += '</div>';
        return html;
    }

    /**
     * Renders a complete counter string (e.g., "010%") as dot grids
     */
    private renderCounter(value: string): string {
        let html = '<div class="counter-digits">';
        for (let i = 0; i < value.length; i++) {
            html += this.createDigitGrid(value[i]);
        }
        html += '</div>';
        return html;
    }

    /**
     * Renders "/DEV" as dot grids (same format as counter)
     */
    private renderDevText(): string {
        let html = '<div class="counter-digits">';
        html += this.createDigitGrid('/');
        html += this.createDigitGrid('D');
        html += this.createDigitGrid('E');
        html += this.createDigitGrid('V');
        html += '</div>';
        return html;
    }

    // Zeigt den Preloader sofort an (statisch)
    public render(): void {
        const currentYear = new Date().getFullYear();
        const initialCounter = this.renderCounter('000%');
        this.element.innerHTML = `
            <div class="preloader-content">
                <div class="preloader-logo">
                    <svg width="180" height="132" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 160 C 40 90, 90 90, 100 140 C 110 180, 140 180, 150 140 C 160 80, 210 80, 210 130 C 210 185, 270 170, 260 120 C 250 80, 195 95, 205 135" 
                              stroke="var(--text-primary)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
                    </svg>
                </div>
                <div class="counter-wrapper">
                    ${initialCounter}
                </div>
                <div class="preloader-footer">
                    <p>Designed and coded by Mo &copy; ${currentYear}</p>
                </div>
            </div>
        `;
        document.body.prepend(this.element);
    }

    /**
     * Calculates the increment based on current progress (slower near 100%)
     */
    private getIncrement(progress: number): number {
        // MEHR SCHWUNG: Größere Sprünge machen
        if (progress < 50) {
            return Math.floor(Math.random() * 10) + 5; // War 2-6, jetzt 5-15
        } else if (progress < 80) {
            return Math.floor(Math.random() * 5) + 3; // War 1-3, jetzt 3-8
        } else if (progress < 95) {
            return Math.floor(Math.random() * 3) + 2; // War 1-2, jetzt 2-5
        } else {
            return 2; // War 1, jetzt 2 (geht doppelt so schnell am Ende)
        }
    }

    /**
     * Calculates the interval delay based on current progress (longer near 100%)
     */
    private getIntervalDelay(progress: number): number {
        // WENIGER WARTEN: Kürzere Pausen
        if (progress < 50) {
            return 20; // War 50
        } else if (progress < 80) {
            return 30; // War 80
        } else if (progress < 95) {
            return 50; // War 120
        } else {
            return 80; // War 200 (das war der Hauptgrund für die Wartezeit)
        }
    }
    // Lädt Assets und wartet Mindestzeit
    public async load(): Promise<void> {
        const counterWrapper = this.element.querySelector('.counter-wrapper');
        
        // Start the counter animation
        return new Promise<void>((resolve) => {
            const updateCounter = () => {
                // Get dynamic increment and delay based on progress
                const increment = this.getIncrement(this.progress);
                this.progress = Math.min(this.progress + increment, 100);
                
                if (counterWrapper) {
                    // Show /DEV instead of 100%
                    if (this.progress >= 100) {
                        const devText = this.renderDevText();
                        counterWrapper.innerHTML = devText;
                        
                        clearInterval(this.intervalId);
                        // Small delay at 100% before resolving
                        setTimeout(resolve, 500);
                    } else {
                        // Format as "010%", "020%", etc.
                        const formattedValue = this.progress.toString().padStart(3, '0') + '%';
                        counterWrapper.innerHTML = this.renderCounter(formattedValue);
                        
                        // Schedule next update with dynamic delay
                        const delay = this.getIntervalDelay(this.progress);
                        this.intervalId = setTimeout(updateCounter, delay);
                    }
                }
            };

            // Start the counter with initial delay
            this.intervalId = setTimeout(updateCounter, this.getIntervalDelay(this.progress));

            // Load actual images in background (doesn't block the counter, but ensures cache)
            this.loadImages(); 
        });
    }

    // Führt die Exit-Animation aus
    public animateOut(): Promise<void> {
        return new Promise<void>(resolve => {
            const tl = gsap.timeline({
                onComplete: () => {
                    this.element.remove();
                    resolve();
                }
            });

            tl.to('.preloader-content', {
                opacity: 0,
                scale: 0.9,
                y: -30,
                duration: 0.6,
                ease: 'power2.in'
            })
            .to(this.element, {
                opacity: 0,
                scale: 1.1,
                filter: 'blur(10px)',
                duration: 1.2,
                ease: 'power2.inOut'
            }, "-=0.4"); 
        });
    }

    private loadImages(): Promise<void[]> {
        const promises = this.imagesToLoad.map(src => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve();
                img.onerror = () => resolve();
            });
        });
        return Promise.all(promises);
    }
    
    // Hilfsmethode um zu prüfen, ob wir überhaupt preloaden müssen
    // Jetzt immer true, da der Preloader bei jedem Neuladen angezeigt werden soll
    public shouldRun(): boolean {
        return true;
    }
}
