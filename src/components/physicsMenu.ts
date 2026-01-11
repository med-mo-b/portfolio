/**
 * Physics menu component
 * Handles Matter.js physics simulation for menu overlay background
 */

import Matter from 'matter-js';

// Module references
let engine: Matter.Engine | null = null;
let render: Matter.Render | null = null;
let runner: Matter.Runner | null = null;
let canvasElement: HTMLCanvasElement | null = null;
let resizeObserver: ResizeObserver | null = null;
let containerElement: HTMLElement | null = null;
let resizeHandler: (() => void) | null = null;

// Wall references for resizing
let ground: Matter.Body | null = null;
let leftWall: Matter.Body | null = null;
let rightWall: Matter.Body | null = null;
// topWall removed to allow objects to fall in

// Constants
// Massive walls to prevent tunneling on mobile devices
const WALL_THICKNESS = 1000;

/**
 * Get theme colors from CSS variables
 */
function getThemeColors(): string[] {
    const colors: string[] = [];
    const root = document.documentElement;
    
    for (let i = 1; i <= 8; i++) {
        const color = getComputedStyle(root).getPropertyValue(`--blob-${i}`).trim();
        if (color) {
            colors.push(color);
        }
    }
    
    // Fallback colors if CSS variables not available
    if (colors.length === 0) {
        return ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    }
    
    return colors;
}

/**
 * Get random theme color
 */
function getRandomThemeColor(): string {
    const colors = getThemeColors();
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Handle window/container resize
 */
function handleResize(container: HTMLElement): void {
    if (!render || !engine || !render.canvas) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Use the pixel ratio stored in options or default to 1
    const pixelRatio = render.options.pixelRatio || 1;
    
    // CRITICAL FIX: Changing canvas width/height resets the context scale!
    // We must manually re-apply the scale after resizing.
    
    // 1. Update canvas buffer size (physical pixels)
    render.canvas.width = width * pixelRatio;
    render.canvas.height = height * pixelRatio;
    
    // 2. Restore context scale (Matter.js does this only on creation)
    render.context.scale(pixelRatio, pixelRatio);
    
    // 3. Update display size (CSS pixels)
    render.canvas.style.width = `${width}px`;
    render.canvas.style.height = `${height}px`;
    
    // 4. Update render options (logical pixels)
    render.options.width = width;
    render.options.height = height;
    
    // Update wall positions
    // We use setPosition to move the center of the body
    if (rightWall) {
        Matter.Body.setPosition(rightWall, { 
            x: width + WALL_THICKNESS / 2, 
            y: height / 2 
        });
    }
    
    if (leftWall) {
        Matter.Body.setPosition(leftWall, { 
            x: 0 - WALL_THICKNESS / 2, 
            y: height / 2 
        });
    }
    
    if (ground) {
        Matter.Body.setPosition(ground, { 
            x: width / 2, 
            y: height + WALL_THICKNESS / 2 
        });
    }
}

/**
 * Initialize physics simulation
 */
export function initPhysics(container: HTMLElement): void {
    // Prevent duplicate initialization
    if (engine || render) {
        stopPhysics();
    }
    
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    
    // Create engine
    engine = Engine.create();
    
    // Create canvas element
    canvasElement = document.createElement('canvas');
    canvasElement.className = 'physics-canvas';
    
    // Explicitly set style to avoid layout shifts
    canvasElement.style.position = 'absolute';
    canvasElement.style.top = '0';
    canvasElement.style.left = '0';
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    canvasElement.style.pointerEvents = 'auto'; // Essential for mouse interaction
    
    // Note: z-index is handled in CSS (set to 0, behind content but above bg)
    
    container.prepend(canvasElement);
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = window.innerWidth < 768;
    
    // High DPI handling
    // On mobile we cap it at 2 to save battery/performance, desktop gets full res
    const pixelRatio = isMobile 
        ? Math.min(window.devicePixelRatio, 2) 
        : window.devicePixelRatio;
    
    // Create renderer
    render = Render.create({
        element: container,
        canvas: canvasElement,
        engine: engine,
        options: {
            width: width,
            height: height,
            background: 'transparent',
            wireframes: false,
            pixelRatio: pixelRatio
        }
    });
    
    // Create walls (static, invisible)
    const wallOptions = { 
        isStatic: true, 
        render: { visible: false } 
    };
    
    // Create walls with massive thickness
    // Width * 10 ensures that even on rapid width resize, there's a floor
    ground = Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width * 10, WALL_THICKNESS, wallOptions);
    leftWall = Bodies.rectangle(0 - WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height * 10, wallOptions);
    rightWall = Bodies.rectangle(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height * 10, wallOptions);
    // topWall removed so objects don't spawn inside it
    
    Composite.add(engine.world, [ground, leftWall, rightWall]);
    
    // Create physics objects
    // Reduce count slightly on mobile for better performance
    const objectCount = isMobile ? 15 : 40;
    
    for (let i = 0; i < objectCount; i++) {
        // Spawn x with safe margin from walls
        const x = Math.random() * (width - 60) + 30;
        
        // Spawn y: Lower part of screen so objects don't fall as long
        // Spawn in the lower 50-80% of the screen
        const y = height * 0.5 + Math.random() * (height * 0.3);
        
        const color = getRandomThemeColor();
        const isCircle = Math.random() > 0.5;
        
        // Slightly larger objects on mobile are easier to grab
        const scale = isMobile ? 1.2 : 1;
        
        const body = isCircle
            ? Bodies.circle(x, y, (20 + Math.random() * 20) * scale, {
                render: { fillStyle: color },
                restitution: 0.9,
                friction: 0.005,
                density: 0.04
            })
            : Bodies.rectangle(x, y, 40 * scale, 40 * scale, {
                render: { fillStyle: color },
                restitution: 0.9,
                friction: 0.005,
                density: 0.04,
                chamfer: { radius: 0 }
            });
        
        Composite.add(engine.world, body);
    }
    
    // Add mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    
    // Remove scroll interference
    const mouseElement = mouseConstraint.mouse.element as HTMLElement;
    if (mouseElement) {
        mouseElement.removeEventListener('mousewheel', (mouse as any).mousewheel);
        mouseElement.removeEventListener('DOMMouseScroll', (mouse as any).mousewheel);
    }
    
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;
    
    // Start runner and render
    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    
    // Store container reference
    containerElement = container;
    
    // Setup resize observer
    resizeObserver = new ResizeObserver(() => {
        if (containerElement) {
            // Request animation frame for smoother resize handling
            requestAnimationFrame(() => {
                if (containerElement) handleResize(containerElement);
            });
        }
    });
    resizeObserver.observe(container);
    
    // Window resize fallback
    resizeHandler = () => {
        if (containerElement) {
            handleResize(containerElement);
        }
    };
    window.addEventListener('resize', resizeHandler);
}

/**
 * Stop physics simulation and cleanup
 */
export function stopPhysics(): void {
    // Stop render
    if (render) {
        Matter.Render.stop(render);
        if (render.canvas && render.canvas.parentNode) {
            render.canvas.remove();
        }
    }
    
    // Stop runner
    if (runner) {
        Matter.Runner.stop(runner);
    }
    
    // Clear engine
    if (engine) {
        Matter.Engine.clear(engine);
    }
    
    // Cleanup resize observer
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    
    // Remove window resize listener
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
    }
    
    // Reset references to free memory
    engine = null;
    render = null;
    runner = null;
    canvasElement = null;
    resizeObserver = null;
    containerElement = null;
    resizeHandler = null;
    ground = null;
    leftWall = null;
    rightWall = null;
    // topWall removed
}
