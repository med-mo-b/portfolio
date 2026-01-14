/**
 * Preloader Component
 * Handles asset preloading and initial loading screen
 */

import gsap from 'gsap';
import { PROJECTS } from '../data/projects.js';

export class Preloader {
    private element: HTMLElement;
    private imagesToLoad: string[] = [];

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'preloader';
        
        this.imagesToLoad = PROJECTS
            .map(p => p.image)
            .filter((img): img is string => !!img);

        this.imagesToLoad.push('/images/portfolio_about_screenshot.png');
        this.imagesToLoad.push('/images/federated_paper.webp');
    }

    // Zeigt den Preloader sofort an (statisch)
    public render(): void {
        const currentYear = new Date().getFullYear();
        this.element.innerHTML = `
            <div class="preloader-content">
                <div class="preloader-logo">
                    <svg width="120" height="88" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 160 C 40 90, 90 90, 100 140 C 110 180, 140 180, 150 140 C 160 80, 210 80, 210 130 C 210 185, 270 170, 260 120 C 250 80, 195 95, 205 135" 
                              stroke="var(--text-primary)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="preloader-footer">
                    <p>Designed and coded by Mo &copy; ${currentYear}</p>
                </div>
            </div>
        `;
        document.body.prepend(this.element);
    }

    // Lädt Assets und wartet Mindestzeit
    public async load(): Promise<void> {
        const minTimePromise = new Promise(resolve => setTimeout(resolve, 1500));
        const assetsPromise = this.loadImages();

        await Promise.all([assetsPromise, minTimePromise]);
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
