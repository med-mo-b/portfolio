/**
 * Home page content
 * Split layout: Text left, Image right (bottom aligned)
 */

// Stelle sicher, dass dein Bild hier korrekt benannt ist (z.B. portrait.png)
const PORTRAIT_IMAGE = '/images/portrait.png'; 

export const template: string = `
    <section class="hero-split">
        <div class="hero-text-side">
            
            <h1 class="hero-headline">
                <span class="line">
                    <span class="outline-text" data-text-en="HEY, I'M" data-text-de="HEY, ICH BIN">HEY, I'M</span> 
                    <span class="filled-text">MORITZ</span>
                </span>
                <span class="line">
                    <span class="outline-text" data-text-en="AND I'M A" data-text-de="UND ICH BIN EIN">AND I'M A</span>
                </span>
                <span class="line">
                    <span class="filled-text">TECH ENTHUSIAST</span>
                </span>
            </h1>

            <div class="hero-bio">
                <!-- DESKTOP VERSION (Detailed) -->
                <p class="bio-desktop" 
                data-text-en="Think of me as a Swiss Army knife — I dive deep into any technology or domain, eager to learn new things daily. Whether it's building AI-driven systems, developing medical sensor systems, or solving complex technical challenges." 
                data-text-de="Stell dir mich als Schweizer Taschenmesser vor — ich tauche tief in jede Technologie oder Domäne ein, täglich motiviert, neue Dinge zu lernen. Ob es darum geht, KI-gestützte Systeme zu realisieren, medizinische Sensorsysteme zu entwickeln oder komplexe technische Herausforderungen zu lösen.">
                    Think of me as a Swiss Army knife — I dive deep into any technology or domain, eager to learn new things daily. Whether it's building AI-driven systems, developing medical sensor systems, or solving complex technical challenges.
                </p>

                <!-- MOBILE VERSION (Short & Punchy) -->
                <p class="bio-mobile" 
                data-text-en="A technical Swiss Army Knife for complex challenges. I adapt to any domain, from hardware to AI, to engineer solutions where others see obstacles." 
                data-text-de="Ein technisches Schweizer Taschenmesser für komplexe Herausforderungen. Ich adaptiere jede Domäne, von Hardware bis KI, um Lösungen zu finden, wo andere Hindernisse sehen.">
                    A technical Swiss Army Knife for complex challenges. I adapt to any domain, from hardware to AI, to engineer solutions where others see obstacles.
                </p>
            </div>

            <div class="hero-cta">
                 <a href="/work" class="btn-primary" data-text-en="View Work" data-text-de="Projekte">View Work</a>
                 <a href="/about" class="btn-secondary" data-text-en="About Me" data-text-de="Über mich">About Me</a>
            </div>
        </div>

        <div class="hero-image-side">
            <img src="${PORTRAIT_IMAGE}" alt="Moritz Bednorz" class="portrait-img">
        </div>
    </section>
`;

export function mount(): void {
    // Animationen beim Laden
    requestAnimationFrame(() => {
        const textSide = document.querySelector('.hero-text-side');
        const imgSide = document.querySelector('.hero-image-side');
        
        if (textSide) textSide.classList.add('animate-in');
        if (imgSide) imgSide.classList.add('animate-in');
    });
}

export function unmount(): void {
    // Cleanup falls nötig
}
