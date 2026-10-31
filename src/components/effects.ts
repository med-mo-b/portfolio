/**
 * Background effects: film grain and the WebGL bubbles.
 * The grain uses the itssharl.ee method: one large fixed layer that moves in ten steps.
 * The tile is made at load time. A large random tile hides the repeat.
 * The bubbles use the old blob shader with soft colors from the CSS variables --blob-1 to --blob-8.
 */

export function initGrain(): void {
    const layer = document.createElement('div');
    layer.className = 'noise';
    layer.setAttribute('aria-hidden', 'true');
    document.body.append(layer);
    const size = 768;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(size, size);
    const d = image.data;
    for (let i = 0; i < d.length; i += 4) {
        d[i] = d[i + 1] = d[i + 2] = Math.random() * 256;
        d[i + 3] = Math.random() ** 1.6 * 256;
    }
    ctx.putImageData(image, 0, 0);
    canvas.toBlob(blob => {
        if (blob) layer.style.backgroundImage = `url(${URL.createObjectURL(blob)})`;
    });
}

const FRAGMENT = `precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_cursor;uniform float u_interaction;
uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform vec3 u_color4;
uniform vec3 u_color5;uniform vec3 u_color6;uniform vec3 u_color7;uniform vec3 u_color8;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
void main(){vec2 st=gl_FragCoord.xy/u_resolution.xy;
if(u_interaction>.5){float dist=distance(st,u_cursor);st+=(u_cursor-st)*smoothstep(.8,0.,dist)*.3;}
float time=u_time*.1;
float n1=snoise(vec2(st.x*1.2+time,st.y*.8-time));float n2=snoise(vec2(st.x*.8-time,st.y*1.2+time));
float n3=snoise(vec2(st.x*1.5-time*.5,st.y*1.5+time*.5));
vec3 a=mix(u_color1,u_color2,st.x+n1*.3);vec3 b=mix(u_color3,u_color4,st.y+n2*.3);
vec3 c=mix(u_color5,u_color6,n3);vec3 d=mix(u_color7,u_color8,n1+n2);
vec3 color=mix(a,b,.5+n3*.2);color=mix(color,c,.3);color=mix(color,d,.2);gl_FragColor=vec4(color,1.);}`;

export function initBubbles(): void {
    const canvas = document.createElement('canvas');
    canvas.id = 'bubbles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const gl = canvas.getContext('webgl');
    if (!gl) return canvas.remove();

    const shader = (type: number, source: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, source);
        gl.compileShader(s);
        return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function setColors(): void {
        const style = getComputedStyle(document.documentElement);
        for (let i = 1; i <= 8; i++) gl!.uniform3fv(u(`u_color${i}`), rgb(style.getPropertyValue(`--blob-${i}`).trim()));
    }

    function frame(time: number): void {
        const dpr = Math.min(window.devicePixelRatio, 1.5);
        const w = (window.innerWidth * dpr) | 0;
        const h = (window.innerHeight * dpr) | 0;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl!.viewport(0, 0, w, h);
        }
        gl!.uniform2f(u('u_resolution'), w, h);
        gl!.uniform1f(u('u_time'), still ? 0 : time / 1000);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
        if (!still) requestAnimationFrame(frame);
    }

    gl.uniform1f(u('u_interaction'), fine ? 1 : 0);
    gl.uniform2f(u('u_cursor'), 0.5, 0.5);
    window.addEventListener('pointermove', e => gl.uniform2f(u('u_cursor'), e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight));
    new MutationObserver(() => {
        setColors();
        if (still) requestAnimationFrame(frame);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setColors();
    requestAnimationFrame(frame);
}
