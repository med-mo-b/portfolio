// @ts-ignore - glsl-canvas-js may not have complete types
import { Canvas } from 'glsl-canvas-js';

/**
 * WebGL Background Component
 * Renders performant gradients using a Fragment Shader with 8-color mixing
 */

let canvas: HTMLCanvasElement | null = null;
let glslCanvas: any | null = null; // Canvas instance from glsl-canvas-js
let isMobile = false;

// Fragment Shader
const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_cursor;
uniform float u_interaction_enabled;

// Theme Colors
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_color5;
uniform vec3 u_color6;
uniform vec3 u_color7;
uniform vec3 u_color8;

// Simplex noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Mouse Attraction (0.8 = influence radius, 0.3 = pull strength)
    if (u_interaction_enabled > 0.5) {
        float dist = distance(st, u_cursor);
        vec2 dir = u_cursor - st;
        st += dir * smoothstep(0.8, 0.0, dist) * 0.3;
    }

    float time = u_time * 0.1;

    // Noise Layers
    float n1 = snoise(vec2(st.x * 1.2 + time, st.y * 0.8 - time));
    float n2 = snoise(vec2(st.x * 0.8 - time, st.y * 1.2 + time));
    float n3 = snoise(vec2(st.x * 1.5 - time * 0.5, st.y * 1.5 + time * 0.5));

    // Color Mixing
    vec3 mixA = mix(u_color1, u_color2, st.x + n1 * 0.3);
    vec3 mixB = mix(u_color3, u_color4, st.y + n2 * 0.3);
    vec3 mixC = mix(u_color5, u_color6, n3);
    vec3 mixD = mix(u_color7, u_color8, n1 + n2);

    vec3 color = mix(mixA, mixB, 0.5 + n3 * 0.2);
    color = mix(color, mixC, 0.3);
    color = mix(color, mixD, 0.2);

    gl_FragColor = vec4(color, 1.0);
}
`;

function parseColorToRgb(colorStr: string): [number, number, number] {
    const div = document.createElement('div');
    div.style.color = colorStr;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computed.match(/\d+/g);
    if (!match || match.length < 3) return [0, 0, 0];

    return [
        parseInt(match[0]) / 255,
        parseInt(match[1]) / 255,
        parseInt(match[2]) / 255
    ];
}

function updateUniforms() {
    if (!glslCanvas) return;
    
    const style = getComputedStyle(document.documentElement);
    
    for (let i = 1; i <= 8; i++) {
        const colorVar = style.getPropertyValue(`--blob-${i}`).trim();
        if (colorVar) {
            const rgb = parseColorToRgb(colorVar);
            glslCanvas.setUniform(`u_color${i}`, rgb[0], rgb[1], rgb[2]);
        }
    }
    
    glslCanvas.setUniform('u_interaction_enabled', isMobile ? 0.0 : 1.0);
    glslCanvas.setUniform('u_cursor', 0.5, 0.5);
}

export function injectBackgroundBlobs(): void {
    if (document.querySelector('#gradient-canvas')) return;

    isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    canvas = document.createElement('canvas');
    canvas.id = 'gradient-canvas';
    
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '-1',
        pointerEvents: 'none'
    });
    
    document.body.prepend(canvas);

    try {
        // Initialize glsl-canvas-js Canvas
        glslCanvas = new Canvas(canvas, {
            fragmentString: fragmentShader,
            alpha: false,
            antialias: true
        });
        
        updateUniforms();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    setTimeout(updateUniforms, 50);
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        window.addEventListener('resize', () => {
            isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
            updateUniforms();
        });
    } catch (e) {
        console.error('WebGL initialization failed:', e);
    }
}

export function initBlobInteraction(): (x: number, y: number) => void {
    return (x: number, y: number) => {
        if (!glslCanvas || isMobile) return;
        const nX = x / window.innerWidth;
        const nY = 1.0 - (y / window.innerHeight);
        glslCanvas.setUniform('u_cursor', nX, nY);
    };
}
