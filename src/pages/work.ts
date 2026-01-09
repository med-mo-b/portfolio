/**
 * Work page content
 * Featured projects with detailed cards
 */

import { initWorkPage } from '../scripts/pages/work.js';
import { PROJECTS } from '../scripts/data/projects.js';

/**
 * Get color for tech stack item
 * @param tech - Technology name
 * @returns Hex color code
 */
function getTechColor(tech: string): string {
    const colorMap: Record<string, string> = {
        'TypeScript': '#3178c6',
        'Python': '#3776ab',
        'React': '#61dafb',
        'Docker': '#2496ed',
        'JavaScript': '#f7df1e',
        'Vite': '#646cff',
        'CSS': '#1572b6',
        'Bun': '#000000',
        'PyTorch': '#ee4c2c',
        'RAG': '#5a5a70',
        'LLMs': '#5a5a70',
        'ML': '#5a5a70',
        'Sensors': '#5a5a70',
        'Signal Processing': '#5a5a70',
        'Federated Learning': '#5a5a70',
        'Transformers': '#5a5a70'
    };
    return colorMap[tech] || '#5a5a70';
}

/**
 * Get primary link for project (prefer external, then paper, then github)
 * @param project - Project object
 * @returns URL string or null
 */
function getPrimaryLink(project: typeof PROJECTS[0]): string | null {
    return project.links?.external || project.links?.paper || project.links?.github || null;
}

/**
 * Generate project cards HTML
 */
function generateProjectCards(): string {
    return PROJECTS.map((project) => {
        // Generate tech stack items with colored dots
        const techItems = project.tech.map(tech => {
            const color = getTechColor(tech);
            return `
                <span class="tech-item">
                    <span class="tech-dot" style="background-color: ${color}"></span>
                    <span class="tech-name">${tech}</span>
                </span>
            `;
        }).join('');
        
        // Generate link buttons for expanded view
        const linkButtons: string[] = [];
        if (project.links?.github) {
            linkButtons.push(
                `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="detail-link detail-link-github" data-text-en="GitHub" data-text-de="GitHub">GitHub</a>`
            );
        }
        if (project.links?.paper) {
            linkButtons.push(
                `<a href="${project.links.paper}" target="_blank" rel="noopener noreferrer" class="detail-link detail-link-paper" data-text-en="Paper" data-text-de="Paper">Paper</a>`
            );
        }
        if (project.links?.external) {
            linkButtons.push(
                `<a href="${project.links.external}" target="_blank" rel="noopener noreferrer" class="detail-link detail-link-external" data-text-en="Website" data-text-de="Webseite">Website</a>`
            );
        }
        const linksHtml = linkButtons.length > 0 
            ? `<div class="links-stack">${linkButtons.join('')}</div>` 
            : '';
        
        // Variable heights based on project - can be adjusted per project
        const heightClass = project.size === 'tall' ? ' tall' : project.size === 'short' ? ' short' : '';
        return `
            <article class="project-card${heightClass}" data-project-id="${project.id}" data-category="${project.category}">
                <div class="card-preview">
                    <img src="${project.image}" alt="${project.title}" data-project-id="${project.id}">
                    <div class="card-hover-info">
                        <h3 data-text-en="${project.title}" data-text-de="${project.titleDe}">${project.title}</h3>
                        <p data-text-en="${project.description}" data-text-de="${project.descriptionDe}">${project.description}</p>
                    </div>
                </div>
                <div class="card-expanded-details">
                    <div class="expanded-image">
                        <img src="${project.image}" alt="${project.title}">
                    </div>
                    <div class="expanded-content">
                        <div class="detail-section">
                            <h4 data-text-en="About" data-text-de="Über">About</h4>
                            <p data-text-en="${project.details}" data-text-de="${project.detailsDe}">${project.details}</p>
                        </div>
                        <div class="detail-section">
                            <h4 data-text-en="Technologies" data-text-de="Technologien">Technologies</h4>
                            <div class="tech-stack">
                                ${techItems}
                            </div>
                        </div>
                        <div class="detail-section">
                            <h4 data-text-en="Links" data-text-de="Links">Links</h4>
                            ${linksHtml}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

export const template: string = `
    <div class="work-container">
        <h1 class="work-title">PROJECTS.</h1>
        <nav class="filter-menu">
            <button class="filter-btn active" data-filter="all" data-text-en="All" data-text-de="Alle">All</button>
            <button class="filter-btn" data-filter="project" data-text-en="Projects" data-text-de="Projekte">Projects</button>
            <button class="filter-btn" data-filter="publication" data-text-en="Publications" data-text-de="Publikationen">Publications</button>
            <button class="filter-btn" data-filter="experiment" data-text-en="Experiments" data-text-de="Experimente">Experiments</button>
        </nav>
        <div class="projects-grid">
            ${generateProjectCards()}
        </div>
    </div>
`;

interface WorkPageListener {
    element: HTMLElement;
    event: string;
    handler: EventListener;
}

let workPageListeners: WorkPageListener[] = [];

export function mount(): void {
    // Initialize work page functionality
    initWorkPage();
    
    // Store any event listeners for cleanup
    // The initWorkPage function handles its own listeners, but we track them here if needed
}

export function unmount(): void {
    // Cleanup work page event listeners
    // Remove any listeners that were added in mount()
    workPageListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    workPageListeners = [];
}




