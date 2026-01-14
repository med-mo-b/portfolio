/**
 * Work page content
 * Featured projects with detailed cards
 */

import { PROJECTS } from '../data/projects.js';

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
 * Get external link for project based on current language
 * @param project - Project object
 * @returns URL string or null
 */
function getExternalLink(project: typeof PROJECTS[0]): string | null {
    const currentLang = (localStorage.getItem('lang') as 'en' | 'de') || 'en';
    if (currentLang === 'de' && project.links?.externalDe) {
        return project.links.externalDe;
    }
    return project.links?.external || null;
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
        const externalLink = getExternalLink(project);
        if (externalLink) {
            linkButtons.push(
                `<a href="${externalLink}" target="_blank" rel="noopener noreferrer" class="detail-link detail-link-external" data-text-en="Website" data-text-de="Webseite" data-link-en="${project.links?.external || ''}" data-link-de="${project.links?.externalDe || ''}">Website</a>`
            );
        }
        const linksHtml = linkButtons.length > 0 
            ? `<div class="links-stack">${linkButtons.join('')}</div>` 
            : '';
        
        // Video vs Image Preview
        const mediaPreview = project.video 
            ? `<video src="${project.video}" autoplay ${project.audio !== true ? 'muted' : ''} loop playsinline preload="none" class="card-media-video" style="width: 100%; height: 100%; object-fit: cover;"></video>`
            : `<img src="${project.image}" alt="${project.title}" data-project-id="${project.id}">`;

        // Video vs Image Expanded
        // Use inline style for object-fit on video to ensure it's not overridden before CSS loads, 
        // though our new CSS will enforce 'contain'
        const mediaExpanded = project.video
            ? `<video src="${project.video}" autoplay ${project.audio !== true ? 'muted' : ''} loop playsinline preload="metadata" ${project.audio !== false ? 'controls' : ''} style="width: 100%; height: 100%; object-fit: contain;"></video>`
            : `<img src="${project.image}" alt="${project.title}">`;

        // Prepare background image for ambient effect
        const bgImage = project.image ? `url('${project.image}')` : 'none';

        // Variable heights based on project
        const heightClass = project.size === 'tall' ? ' tall' : project.size === 'short' ? ' short' : '';
        
        // Orientation class for landscape layout
        const orientationClass = project.orientation === 'landscape' ? ' layout-landscape' : '';
        
        return `
            <article class="project-card${heightClass}" data-project-id="${project.id}" data-category="${project.category}">
                <div class="card-preview">
                    ${mediaPreview}
                    <div class="card-hover-info">
                        <h3 data-text-en="${project.title}" data-text-de="${project.titleDe}">${project.title}</h3>
                        <p data-text-en="${project.description}" data-text-de="${project.descriptionDe}">${project.description}</p>
                    </div>
                </div>
                <div class="card-expanded-details${orientationClass}">
                    <div class="expanded-image" style="--bg-image: ${bgImage}">
                        ${mediaExpanded}
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
    // Setup filter functionality
    const filterButtons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
    const projectCards = document.querySelectorAll<HTMLElement>('.project-card');
    const projectsGrid = document.querySelector<HTMLElement>('.projects-grid');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!projectsGrid) return;
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Collapse any expanded cards before filtering
            projectCards.forEach(card => {
                if (card.classList.contains('expanded')) {
                    card.classList.remove('expanded');
                }
            });
            
            // Start fade-out animation
            projectsGrid.classList.remove('grid-fade-in');
            projectsGrid.classList.add('grid-fade-out');
            
            // Wait for fade-out, then update DOM
            setTimeout(() => {
                // Filter cards
                projectCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    
                    if (filterValue === 'all') {
                        card.classList.remove('hidden');
                    } else {
                        if (cardCategory === filterValue) {
                            card.classList.remove('hidden');
                        } else {
                            card.classList.add('hidden');
                        }
                    }
                });
                
                // Start fade-in animation
                projectsGrid.classList.remove('grid-fade-out');
                projectsGrid.classList.add('grid-fade-in');
                
                // Clean up after fade-in completes
                setTimeout(() => {
                    projectsGrid.classList.remove('grid-fade-in');
                }, 300);
            }, 300);
        });
    });
    
    // Setup expansion logic (Piggment effect)
    projectCards.forEach(card => {
        card.addEventListener('click', (e: Event) => {
            // Prevent expansion if clicking on links
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' || target.closest('a')) {
                return;
            }
            
            // Check if card is already expanded
            if (card.classList.contains('expanded')) {
                // Collapse
                card.classList.remove('expanded');
            } else {
                // Collapse all other cards first
                projectCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('expanded');
                    }
                });
                
                // Expand clicked card
                card.classList.add('expanded');
                
                // Force reflow to ensure column-span works
                void card.offsetHeight;
                
                // Scroll into view smoothly
                setTimeout(() => {
                    card.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 150);
            }
        });
    });
    
    // --- NEW: Check URL Params for Auto-Expansion ---
    const urlParams = new URLSearchParams(window.location.search);
    const targetProjectId = urlParams.get('project');

    if (targetProjectId) {
        const targetCard = document.querySelector<HTMLElement>(`.project-card[data-project-id="${targetProjectId}"]`);
        
        if (targetCard) {
            // Wait a moment for page transition to finish
            setTimeout(() => {
                // Collapse others
                projectCards.forEach(c => c.classList.remove('expanded'));
                
                // Expand target
                targetCard.classList.add('expanded');
                
                // Force reflow to ensure column-span works
                void targetCard.offsetHeight;
                
                // Scroll to it
                setTimeout(() => {
                    targetCard.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 150);
            }, 500);
        }
    }
    
    // Re-apply language after rendering
    if (window.initLanguage) {
        window.initLanguage();
    }
}

export function unmount(): void {
    // Cleanup work page event listeners
    // Remove any listeners that were added in mount()
    workPageListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    workPageListeners = [];
}
