/**
 * Type definitions for the timeline data
 */

/**
 * Timeline branch configuration
 */
export interface BranchConfig {
    id: string;
    label: string;
    labelDe: string;
    color: string;
    order: number;
}

/**
 * Timeline event for the About page
 */
export interface TimelineEvent {
    id: string;
    date: string;
    dateDe: string;
    year: number;
    month: number;
    branch: string;
    title: string;
    titleDe: string;
    company?: string;
    description: string;
    descriptionDe: string;
    highlights?: string[];
    highlightsDe?: string[];
    tags?: string[];
    icon?: string;
    projectId?: string;
}
