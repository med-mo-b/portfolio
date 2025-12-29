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




