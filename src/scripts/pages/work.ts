/**
 * Work page specific logic
 * Handles filtering and card expansion interactions
 */

/**
 * Initialize work page functionality
 */
export function initWorkPage(): void {
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
    
    // Re-apply language after rendering
    if (window.initLanguage) {
        window.initLanguage();
    }
}
