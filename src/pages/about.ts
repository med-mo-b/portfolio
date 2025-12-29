/**
 * About page content
 * Bio and experience section
 */

import type { Page } from '../types.js';

export const template: string = `
    <div class="content-container">
        <section class="about-bio-section">
            <h1 data-text-en="ABOUT ME" data-text-de="ÜBER MICH">ABOUT ME</h1>
            <div class="bio-text">
                 <p data-text-en="I'm a tech enthusiast at heart with a background in Medical Informatics. Currently, I work as a Research Engineer at Fraunhofer IPA. I love figuring out how to use the latest tech. Whether it's contactless sensors or AI to solve actual problems in healthcare." data-text-de="Ich bin ein Tech-Enthusiast mit einem Hintergrund in Medical Informatics. Derzeit arbeite ich als Forschungsingenieur bei Fraunhofer IPA. Ich liebe es herauszufinden, wie man die neuesten Technologien nutzt. Ob Kontaktlos-Sensoren oder AI, um echte Probleme in der Gesundheitsversorgung zu lösen.">
                    I'm a tech enthusiast at heart with a background in Medical Informatics. Currently, I work as a Research Engineer at Fraunhofer IPA. I love figuring out how to use the latest tech. Whether it's contactless sensors or AI to solve actual problems in healthcare.
                </p>
                <br>
                <p data-text-en="For me, research isn't just about writing papers; it's about building solutions that work in the real world and help people." data-text-de="Für mich ist Forschung nicht nur darum, Papee zu schreiben; es geht darum, Lösungen zu entwickeln, die in der realen Welt funktionieren und Menschen helfen.">
                    For me, research isn't just about writing papers; it's about building solutions that work in the real world and help people.
                </p>

            </div>
        </section>

        <section class="experience-section">
             <h2 data-text-en="EXPERIENCE" data-text-de="ERFAHRUNG">EXPERIENCE</h2>
             <ul class="experience-list">
                 <li>
                     <span class="role" data-text-en="Research Engineer" data-text-de="Wissenschaftlicher Mitarbeiter">Research Engineer</span>
                     <span class="company">Fraunhofer IPA</span>
                     <span class="year">2024 - Present</span>
                 </li>
                 <li>
                     <span class="role" data-text-en="Student Research Assistant" data-text-de="Wissenschaftliche Hilfskraft">Student Research Assistant</span>
                     <span class="company">University Hospital Heidelberg</span>
                     <span class="year">2023</span>
                 </li>
                 <li>
                     <span class="role" data-text-en="Student Research Assistant" data-text-de="Wissenschaftliche Hilfskraft">Student Research Assistant</span>
                     <span class="company">Fraunhofer IPA</span>
                     <span class="year">2019 - 2024</span>
                 </li>
             </ul>
        </section>
    </div>
`;

export function mount(): void {
    // About page specific initialization if needed
}

export function unmount(): void {
    // Cleanup if needed
}




