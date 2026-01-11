/**
 * Grained.js logic port for TypeScript
 * Generates a noise texture using Canvas API and applies it as a background
 */

interface GrainedOptions {
    patternWidth?: number;
    patternHeight?: number;
    grainOpacity?: number;
    grainDensity?: number;
    grainWidth?: number;
    grainHeight?: number;
}

const defaultOptions: GrainedOptions = {
    patternWidth: 100,
    patternHeight: 100,
    grainOpacity: 0.1,
    grainDensity: 1,
    grainWidth: 1,
    grainHeight: 1
};

/**
 * Initialize the grained noise effect
 */
export function initGrained(options: GrainedOptions = {}): void {
    const opts = { ...defaultOptions, ...options };
    
    // Check if overlay exists, otherwise create it
    let overlay = document.getElementById('grained-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'grained-overlay';
        document.body.prepend(overlay);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        console.error('Grained: Could not get canvas context');
        return;
    }

    canvas.width = opts.patternWidth!;
    canvas.height = opts.patternHeight!;

    // Generate noise
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const buffer = new Uint32Array(imageData.data.buffer);
    const len = buffer.length;

    for (let i = 0; i < len; i++) {
        // Generate random noise value
        // We generate black noise with varying alpha
        // CSS filters will handle the inversion for dark mode
        const val = (Math.random() * 255) | 0;
        
        // Alpha calculation based on density and opacity
        // If random > density, pixel is transparent
        // Otherwise, it has the configured opacity
        const alpha = Math.random() < opts.grainDensity! 
            ? (opts.grainOpacity! * 255) | 0 
            : 0;

        // Little Endian: ABGR (Alpha, Blue, Green, Red)
        // We create grayscale noise (R=G=B=val)
        buffer[i] = (alpha << 24) | (val << 16) | (val << 8) | val;
    }

    ctx.putImageData(imageData, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    
    overlay.style.backgroundImage = `url(${dataUrl})`;
    overlay.style.backgroundSize = `${opts.patternWidth}px ${opts.patternHeight}px`;
}
