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
let topWall: Matter.Body | null = null;

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
    if (!render || !engine) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const wallThick = 60;
    
    // Update canvas and renderer size
    render.canvas.width = width;
    render.canvas.height = height;
    render.options.width = width;
    render.options.height = height;
    
    // Update wall positions
    if (rightWall) {
        Matter.Body.setPosition(rightWall, { 
            x: width + wallThick / 2, 
            y: height / 2 
        });
    }
    
    if (leftWall) {
        Matter.Body.setPosition(leftWall, { 
            x: 0 - wallThick / 2, 
            y: height / 2 
        });
    }
    
    if (topWall) {
        Matter.Body.setPosition(topWall, { 
            x: width / 2, 
            y: 0 - wallThick / 2 
        });
        // Top wall is already very wide (width * 2), so it should handle most resizes
    }
    
    if (ground) {
        Matter.Body.setPosition(ground, { 
            x: width / 2, 
            y: height + wallThick / 2 
        });
        // Ground is already very wide (width * 2), so it should handle most resizes
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
    const Body = Matter.Body;
    
    // Create engine
    engine = Engine.create();
    
    // Create canvas element
    canvasElement = document.createElement('canvas');
    canvasElement.className = 'physics-canvas';
    container.prepend(canvasElement);
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = window.innerWidth < 768;
    const pixelRatio = isMobile 
        ? Math.min(window.devicePixelRatio, 1.5) 
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
    const wallThick = 60;
    
    ground = Bodies.rectangle(width / 2, height + wallThick / 2, width * 2, wallThick, wallOptions);
    leftWall = Bodies.rectangle(0 - wallThick / 2, height / 2, wallThick, height, wallOptions);
    rightWall = Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height, wallOptions);
    topWall = Bodies.rectangle(width / 2, 0 - wallThick / 2, width * 2, wallThick, wallOptions);
    
    Composite.add(engine.world, [ground, leftWall, rightWall, topWall]);
    
    // Create physics objects
    const objectCount = isMobile ? 20 : 40;
    
    // Spawn objects within the viewport, distributed vertically
    for (let i = 0; i < objectCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height; // Spawn anywhere in viewport
        
        const color = getRandomThemeColor();
        const isCircle = Math.random() > 0.5;
        
        const body = isCircle
            ? Bodies.circle(x, y, 20 + Math.random() * 20, {
                render: { fillStyle: color },
                restitution: 0.9
            })
            : Bodies.rectangle(x, y, 40, 40, {
                render: { fillStyle: color },
                restitution: 0.9,
                chamfer: { radius: 0 } // Pixel-look for rectangles
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
    
    // Prevent scroll interference
    // Remove default mousewheel handlers that Matter.js adds
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
            handleResize(containerElement);
        }
    });
    resizeObserver.observe(container);
    
    // Also listen to window resize as fallback
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
    
    // Reset references
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
    topWall = null;
}
