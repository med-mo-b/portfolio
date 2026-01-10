/**
 * About page content
 * Bio, stats, and interactive git-style timeline
 */

import type { Page, TimelineEvent, BranchConfig } from '../types.js';
import { BRANCHES, TIMELINE_DATA, getSortedEvents, getBranchById } from '../data/timeline.js';

// State
let selectedEvent: TimelineEvent | null = null;
let activeBranchFilter: string | null = null;

/**
 * Generate the stats cards HTML
 */
function generateStatsHtml(): string {
    return `
        <div class="stats-grid">
            <div class="stat-card stat-blue">
                <span class="stat-value">5+</span>
                <span class="stat-label" data-text-en="Years @ Fraunhofer" data-text-de="Jahre @ Fraunhofer">Years @ Fraunhofer</span>
            </div>
            <div class="stat-card stat-green">
                <span class="stat-value">1.2</span>
                <span class="stat-label" data-text-en="Master Grade" data-text-de="Masterabschluss">Master Grade</span>
            </div>
            <div class="stat-card stat-purple">
                <span class="stat-value">AI</span>
                <span class="stat-label" data-text-en="MedTech Focus" data-text-de="MedTech Fokus">MedTech Focus</span>
            </div>
        </div>
    `;
}

/**
 * Generate the branch legend HTML (static container)
 */
function generateLegendHtml(): string {
    return `
        <div class="timeline-legend">
            <h3 data-text-en="Journey Paths" data-text-de="Wegstrecken">Journey Paths</h3>
            <div class="legend-items" id="legend-items">
                <!-- Legend items will be rendered dynamically -->
            </div>
        </div>
    `;
}

/**
 * Render the legend items dynamically
 */
function renderLegend(): void {
    const legendContainer = document.getElementById('legend-items');
    if (!legendContainer) return;

    const legendItems = BRANCHES.map(branch => {
        const isActive = activeBranchFilter === branch.id;
        return `
        <div class="legend-item ${isActive ? 'active' : ''}" data-branch-id="${branch.id}">
            <span class="legend-dot" style="background-color: ${branch.color}"></span>
            <span class="legend-label" data-text-en="${branch.label}" data-text-de="${branch.labelDe}">${branch.label}</span>
        </div>
    `;
    }).join('');

    legendContainer.innerHTML = legendItems;
    
    // Re-apply language after rendering
    if (window.initLanguage) {
        window.initLanguage();
    }
}

/**
 * Generate the event card placeholder HTML
 */
function generateEventCardHtml(): string {
    return `
        <div class="event-card" id="event-card">
            <div class="event-card-empty">
                <span class="terminal-icon">&gt;_</span>
                <p data-text-en="Select a commit node to view details..." data-text-de="Wähle einen Commit-Node für Details...">Select a commit node to view details...</p>
            </div>
        </div>
    `;
}

export const template: string = `
    <div class="about-container">
        <section class="about-header">
            <div class="about-bio">
                <h1 data-text-en="RESEARCHER" data-text-de="FORSCHER">RESEARCHER</h1>
                <h1 class="accent">&</h1>
                <h1 data-text-en="ENGINEER" data-text-de="INGENIEUR">ENGINEER</h1>
                <div class="bio-text">
                    <p data-text-en="I'm a tech enthusiast at heart with a background in Medical Informatics. Currently, I work as a Research Engineer at Fraunhofer IPA. I love figuring out how to use the latest tech—whether it's contactless sensors or AI—to solve actual problems in healthcare." data-text-de="Ich bin ein Tech-Enthusiast mit einem Hintergrund in Medizinischer Informatik. Derzeit arbeite ich als Forschungsingenieur bei Fraunhofer IPA. Ich liebe es herauszufinden, wie man die neuesten Technologien nutzt—ob kontaktlose Sensoren oder KI—um echte Probleme im Gesundheitswesen zu lösen.">
                        I'm a tech enthusiast at heart with a background in Medical Informatics. Currently, I work as a Research Engineer at Fraunhofer IPA. I love figuring out how to use the latest tech—whether it's contactless sensors or AI—to solve actual problems in healthcare.
                    </p>
                    <p data-text-en="For me, research isn't just about writing papers; it's about building solutions that work in the real world and help people." data-text-de="Für mich ist Forschung nicht nur Paper schreiben; es geht darum, Lösungen zu entwickeln, die in der realen Welt funktionieren und Menschen helfen.">
                        For me, research isn't just about writing papers; it's about building solutions that work in the real world and help people.
                    </p>
                </div>
            </div>
            ${generateStatsHtml()}
        </section>

        <section class="timeline-section">
            <h2 data-text-en="MY JOURNEY" data-text-de="MEINE JOURNEY">MY JOURNEY</h2>
            ${generateLegendHtml()}
            
            <div class="timeline-content-wrapper">
                <div class="timeline-wrapper">
                    <div class="timeline-container" id="timeline-container">
                        <!-- SVG will be rendered here -->
                    </div>
                </div>
                
                ${generateEventCardHtml()}
            </div>
        </section>
    </div>
`;

/**
 * Render the SVG timeline
 */
function renderTimeline(): void {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const sortedEvents = getSortedEvents();
    
    // Filter events based on active branch filter
    const visibleEvents = activeBranchFilter !== null 
        ? sortedEvents.filter(e => e.branch === activeBranchFilter)
        : sortedEvents;
    
    const ROW_HEIGHT = 90;
    const COLUMN_WIDTH = 60;
    const LEFT_MARGIN = 50;
    const RIGHT_MARGIN = 200;
    const TOP_MARGIN = 30;
    
    // Adjust SVG width based on filter
    const visibleBranches = activeBranchFilter !== null ? 1 : BRANCHES.length;
    const svgWidth = visibleBranches * COLUMN_WIDTH + LEFT_MARGIN + RIGHT_MARGIN;
    const svgHeight = visibleEvents.length * ROW_HEIGHT + TOP_MARGIN + 50;

    // Generate branch paths - hide filtered branches
    const branchPaths = BRANCHES.map((branch) => {
        // Hide branch if filtered out
        if (activeBranchFilter !== null && branch.id !== activeBranchFilter) {
            return '';
        }

        const branchEvents = sortedEvents.filter(e => e.branch === branch.id);
        if (branchEvents.length === 0) return '';

        // Get all indices where this branch has events
        const branchIndices: number[] = [];
        sortedEvents.forEach((e, idx) => {
            if (e.branch === branch.id) {
                branchIndices.push(idx);
            }
        });

        const firstIndex = branchIndices[0];
        const lastIndex = branchIndices[branchIndices.length - 1];
        
        // If filtered, move selected branch to main position (order 0)
        let displayOrder = branch.order;
        if (activeBranchFilter === branch.id) {
            displayOrder = 0;
        }
        
        const x = displayOrder * COLUMN_WIDTH + LEFT_MARGIN;
        const startY = firstIndex * ROW_HEIGHT + TOP_MARGIN;
        const endY = lastIndex * ROW_HEIGHT + TOP_MARGIN;

        let pathData: string;
        
        if (branch.id === 'main' || activeBranchFilter === branch.id) {
            // Main branch: straight line through all events
            pathData = `M ${x} ${TOP_MARGIN - 20} L ${x} ${endY + 30}`;
        } else if (branch.id === 'homelabbing' || branch.id === 'research') {
            // Homelabbing & Research: fork from main, connect all events, stays OPEN
            const mainX = LEFT_MARGIN;
            // Fork from main
            pathData = `M ${mainX} ${startY - 35} Q ${x} ${startY - 35}, ${x} ${startY}`;
            // Connect all events and extend past last node (stays open)
            pathData += ` L ${x} ${endY + 30}`;
        } else {
            // Other branches: fork from main, connect all events, merge back
            const mainX = LEFT_MARGIN;
            // Fork from main
            pathData = `M ${mainX} ${startY - 35} Q ${x} ${startY - 35}, ${x} ${startY}`;
            // Connect all events on this branch
            pathData += ` L ${x} ${endY}`;
            // Merge back to main
            pathData += ` Q ${x} ${endY + 35}, ${mainX} ${endY + 35}`;
        }

        return `<path 
            d="${pathData}" 
            stroke="${branch.color}" 
            stroke-width="3" 
            fill="none" 
            stroke-linecap="round" 
            class="branch-line ${activeBranchFilter === branch.id ? 'filtered-main' : ''}"
        />`;
    }).join('');

    // Generate grid lines
    const gridLines = sortedEvents.map((_, i) => `
        <line
            x1="0"
            y1="${i * ROW_HEIGHT + TOP_MARGIN}"
            x2="${svgWidth}"
            y2="${i * ROW_HEIGHT + TOP_MARGIN}"
            class="grid-line"
        />
    `).join('');

    // Generate commit nodes - filter and reposition
    const commitNodes = visibleEvents.map((event, index) => {
        const branch = getBranchById(event.branch);
        if (!branch) return '';
        
        // If filtered, move to main position (order 0)
        let displayOrder = branch.order;
        if (activeBranchFilter === branch.id) {
            displayOrder = 0;
        }
        
        const x = displayOrder * COLUMN_WIDTH + LEFT_MARGIN;
        const y = index * ROW_HEIGHT + TOP_MARGIN;
        const isSelected = selectedEvent?.id === event.id;

        // Truncate title for display
        const displayTitle = event.title.length > 28 
            ? event.title.substring(0, 25) + '...' 
            : event.title;

        return `
            <g class="commit-node ${isSelected ? 'selected' : ''} ${activeBranchFilter === branch.id ? 'filtered-main' : ''}" data-event-id="${event.id}" data-branch-id="${event.branch}">
                <text
                    x="${x - 15}"
                    y="${y}"
                    text-anchor="end"
                    dominant-baseline="middle"
                    class="year-label"
                >${event.year}</text>
                
                <circle
                    cx="${x}"
                    cy="${y}"
                    r="${isSelected ? 10 : 8}"
                    class="commit-outer"
                    stroke="${branch.color}"
                />
                
                <circle
                    cx="${x}"
                    cy="${y}"
                    r="${isSelected ? 5 : 4}"
                    fill="${branch.color}"
                    class="commit-inner"
                />
                
                <text
                    x="${x + 20}"
                    y="${y + 4}"
                    class="commit-title"
                    data-text-en="${displayTitle}"
                    data-text-de="${event.titleDe.length > 28 ? event.titleDe.substring(0, 25) + '...' : event.titleDe}"
                >${displayTitle}</text>
                
                <rect
                    x="${x - 15}"
                    y="${y - 15}"
                    width="${RIGHT_MARGIN + 30}"
                    height="30"
                    fill="transparent"
                    class="hit-area"
                />
            </g>
        `;
    }).join('');

    const svg = `
        <svg
            width="${svgWidth}"
            height="${svgHeight}"
            viewBox="0 0 ${svgWidth} ${svgHeight}"
            class="timeline-svg"
        >
            ${gridLines}
            ${branchPaths}
            ${commitNodes}
        </svg>
    `;

    container.innerHTML = svg;
    
    // Re-apply language after rendering
    if (window.initLanguage) {
        window.initLanguage();
    }
}

/**
 * Update the event card with selected event details
 */
function updateEventCard(event: TimelineEvent | null): void {
    const cardContainer = document.getElementById('event-card');
    if (!cardContainer) return;

    // On mobile, hide card if no event selected
    if (window.innerWidth <= 1023 && !event) {
        cardContainer.classList.remove('visible');
    } else if (window.innerWidth <= 1023 && event) {
        cardContainer.classList.add('visible');
    }

    if (!event) {
        cardContainer.innerHTML = `
            <div class="event-card-empty">
                <span class="terminal-icon">&gt;_</span>
                <p data-text-en="Select a commit node to view details..." data-text-de="Wähle einen Commit-Node für Details...">Select a commit node to view details...</p>
            </div>
        `;
        setupEventCardListeners();
        return;
    }

    const branch = getBranchById(event.branch);
    if (!branch) return;

    const tagsHtml = event.tags ? event.tags.map(tag => 
        `<span class="event-tag">#${tag}</span>`
    ).join('') : '';

    cardContainer.innerHTML = `
        <div class="event-card-content">
            <div class="event-header">
                <div class="event-meta">
                    <span class="event-branch" style="background-color: ${branch.color}" data-text-en="${branch.label}" data-text-de="${branch.labelDe}">${branch.label}</span>
                    <span class="event-date" data-text-en="${event.date}" data-text-de="${event.dateDe}">${event.date}</span>
                </div>
                <button class="event-card-close" aria-label="Close">✕</button>
            </div>
            
            <h3 class="event-title" data-text-en="${event.title}" data-text-de="${event.titleDe}">${event.title}</h3>
            ${event.company ? `<p class="event-company">${event.company}</p>` : ''}
            
            <p class="event-description" data-text-en="${event.description}" data-text-de="${event.descriptionDe}">${event.description}</p>
            
            ${tagsHtml ? `<div class="event-tags">${tagsHtml}</div>` : ''}
            
            <div class="event-footer">
                <span class="event-sha">SHA: ${event.id.substring(0, 7)}</span>
            </div>
        </div>
    `;

    setupEventCardListeners();

    // Re-apply language after rendering
    if (window.initLanguage) {
        window.initLanguage();
    }
}

/**
 * Get icon symbol for event type
 */
function getIconSymbol(icon?: string): string {
    const icons: Record<string, string> = {
        'robot': '🤖',
        'graduation': '🎓',
        'microscope': '🔬',
        'heart': '❤️',
        'server': '🖥️',
        'image': '🖼️',
        'flask': '🧪',
        'university': '🏛️',
        'book': '📖',
        'plane': '✈️',
        'cogs': '⚙️',
        'drafting': '📐',
        'award': '🏆',
        'school': '🏫',
        'tools': '🔧'
    };
    return icons[icon || ''] || '💻';
}

/**
 * Handle click on commit node
 */
function handleNodeClick(eventId: string, nodeElement?: Element): void {
    const event = TIMELINE_DATA.find(e => e.id === eventId);
    if (event) {
        selectedEvent = event;
        renderTimeline();
        updateEventCard(event);
        
        // Mobile overlay positioning
        if (window.innerWidth <= 1023 && nodeElement) {
            positionEventCardOverlay(nodeElement);
        }
    }
}

/**
 * Show event card overlay on mobile
 */
function positionEventCardOverlay(_nodeElement: Element): void {
    const cardContainer = document.getElementById('event-card');
    if (!cardContainer) return;
    
    // CSS handles positioning (fixed, centered)
    cardContainer.classList.add('visible');
}

/**
 * Close event card overlay
 */
function closeEventCard(): void {
    const cardContainer = document.getElementById('event-card');
    if (cardContainer) {
        cardContainer.classList.remove('visible');
        selectedEvent = null;
    }
}

/**
 * Setup event card listeners (close button only)
 */
function setupEventCardListeners(): void {
    const closeButton = document.querySelector('.event-card-close');
    if (closeButton) {
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            closeEventCard();
        });
    }
}

/**
 * Handle legend item click for filtering (toggle)
 */
function handleLegendClick(branchId: string): void {
    // Toggle filter: if same branch clicked, deselect; otherwise select
    if (activeBranchFilter === branchId) {
        activeBranchFilter = null;  // Deselect
    } else {
        activeBranchFilter = branchId;  // Select
    }
    
    // Clear selection when filtering changes
    selectedEvent = null;
    
    // Re-render legend and timeline
    renderLegend();
    renderTimeline();
    updateEventCard(null);
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners(): void {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    // Commit node clicks
    container.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const node = target.closest('.commit-node');
        if (node && !node.classList.contains('filtered-out')) {
            const eventId = node.getAttribute('data-event-id');
            if (eventId) {
                handleNodeClick(eventId, node);
            }
        }
    });

    // Add hover effect
    container.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        const node = target.closest('.commit-node');
        if (node && !node.classList.contains('filtered-out')) {
            node.classList.add('hover');
        }
    });

    container.addEventListener('mouseout', (e) => {
        const target = e.target as HTMLElement;
        const node = target.closest('.commit-node');
        if (node) {
            node.classList.remove('hover');
        }
    });
    
    // Legend item clicks for filtering (toggle)
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const branchId = item.getAttribute('data-branch-id');
            if (branchId) {
                handleLegendClick(branchId);
            }
        });
    });
}

export function mount(): void {
    // Reset state
    selectedEvent = null;
    activeBranchFilter = null;
    
    // Render legend and timeline
    renderLegend();
    renderTimeline();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup event card listeners (for close button)
    setupEventCardListeners();
}

export function unmount(): void {
    // Cleanup
    selectedEvent = null;
    activeBranchFilter = null;
}
