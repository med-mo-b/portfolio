/**
 * Home page content
 * Hero section with introduction
 */

export const template: string = `
    <section class="hero">
        <div class="hero-content">
            <h1 class="hero-title">
                <span class="line">
                    <span class="outline-text" data-text-en="HEY, I'M" data-text-de="HEY, ICH BIN">HEY, I'M</span> 
                    <span class="filled-text">MORITZ</span>
                </span>
                <span class="line">
                    <span class="outline-text" data-text-en="AND I'M AN" data-text-de="UND ICH BIN EIN">AND I'M AN</span> 
                    <span class="filled-text break-before" data-text-en="TECH ENTHUSIAST" data-text-de="TECH ENTHUSIAST">TECH ENTHUSIAST</span>
                </span>
            </h1>

            <div class="hero-description">
                <p data-text-en="I'm a research engineer, software developer" data-text-de="Ich bin ein Forschungsingenieur, Softwareentwickler">I'm a research engineer, software developer</p>
                <p data-text-en="& builder of AI-driven systems" data-text-de="& Entwickler KI-gestützter Systeme">& builder of AI-driven systems</p>
            </div>

            <div class="hero-links">
                <a href="/work" class="pretty-arrow">
                    <span class="arrow-icon">→</span>
                    <span class="arrow-text" data-text-en="see my projects" data-text-de="zu meinen Projekten">see my projects</span>
                </a>
                <a href="/about" class="pretty-arrow">
                    <span class="arrow-icon">→</span>
                    <span class="arrow-text" data-text-en="more about me" data-text-de="mehr über mich">more about me</span>
                </a>
            </div>
        </div>
    </section>
`;

export function mount(): void {
    // Home page specific initialization if needed
}

export function unmount(): void {
    // Cleanup if needed
}
