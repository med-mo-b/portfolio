/**
 * Work page content
 * Project list with image preview
 */

import { initWorkPage } from '../scripts/pages/work.js';

export const template = `
    <div class="split-view">
        <!-- LEFT SIDE: IMAGE PREVIEW -->
        <div class="preview-container">
            <div class="preview-image-wrapper">
                <img id="preview-img" src="https://placehold.co/800x600/2a2a2a/FFF?text=Select+Project" alt="Project Preview">
            </div>
        </div>

        <!-- RIGHT SIDE: PROJECT LIST -->
        <div class="list-container">
            
            <div class="work-header-group">
                <h1 class="work-main-title">WORK</h1>
                <span class="work-count">5</span>
            </div>

            <ul class="work-list">
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="images/thoraxmonitor.png" data-link="https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/thoraxmonitor.html">
                        <span class="work-title">Thoraxmonitor</span>
                        <span class="work-cat" data-text-en="Medical Tech" data-text-de="Medizintechnik">Medical Tech</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="images/TEDIAS.jpg" data-link="https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/rag-chatbot.html">
                        <span class="work-title">TEDIAS & AHEAD</span>
                        <span class="work-cat" data-text-en="Medical Tech" data-text-de="Medizintechnik">Medical Tech</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="images/reconstruction_paper.png" data-link="https://www.mdpi.com/1424-8220/25/23/7114">
                        <span class="work-title" data-text-en="Respiration Flow Reconstruction" data-text-de="Rekonstruktion des Atemflusses">Respiration Flow Reconstruction</span>
                        <span class="work-cat" data-text-en="Publication" data-text-de="Publikation">Publication</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="images/federated_paper.webp" data-link="https://www.nature.com/articles/s41746-025-01434-3">
                        <span class="work-title" data-text-en="Cardiac CT Federated Learning" data-text-de="Föderiertes Lernen für Kardio-CT">Cardiac CT Federated Learning</span>
                        <span class="work-cat" data-text-en="Publication" data-text-de="Publikation">Publication</span>
                    </a>
                </li>
                <li class="work-item">
                    <a href="#" class="disabled-link" data-img="images/homelab.png">
                        <span class="work-title" data-text-en="Home Server Setup" data-text-de="Home Server Setup">Home Server Setup</span>
                        <span class="work-cat" data-text-en="Development" data-text-de="Entwicklung">Development</span>
                    </a>
                </li>
            </ul>

        </div>
    </div>
`;

let workPageListeners = [];

export function mount() {
    // Initialize work page functionality
    initWorkPage();
    
    // Store any event listeners for cleanup
    // The initWorkPage function handles its own listeners, but we track them here if needed
}

export function unmount() {
    // Cleanup work page event listeners
    // Remove any listeners that were added in mount()
    workPageListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    workPageListeners = [];
}

