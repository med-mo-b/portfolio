/**
 * Type definitions for page modules
 */

/**
 * Interface for page modules
 */
export interface Page {
    template: string;
    mount?: () => void;
    unmount?: () => void;
}

/**
 * Type for route handler function
 */
export type RouteHandler = () => Promise<Page>;

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
    tags?: string[];
    icon?: string;
}
