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
                    <span class="filled-text" data-text-en="TECH ENTHUSIAST" data-text-de="TECH ENTHUSIAST">TECH ENTHUSIAST</span>
                </span>
            </h1>

            <div class="hero-description">
                <p data-text-en="Research Engineer @ Fraunhofer IPA" data-text-de="Forschungsingenieur @ Fraunhofer IPA">Research Engineer @ Fraunhofer IPA</p>
            </div>

            <div class="hero-links">
                <a href="/work" class="pretty-arrow">
                    <span class="arrow-icon">→</span>
                    <span class="arrow-text" data-text-en="research & projects" data-text-de="forschung & projekte">research & projects</span>
                </a>
                <a href="/about" class="pretty-arrow">
                    <span class="arrow-icon">→</span>
                    <span class="arrow-text" data-text-en="about me" data-text-de="über mich">about me</span>
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
