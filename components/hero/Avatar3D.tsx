'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * A real-time 3D bust built from a photo + a depth map.
 * The head turns toward the cursor, breathes, and blinks.
 * mode: 'plain' (natural lit photo, floats gently: used everywhere by default),
 *       'design' (comic-lit), 'tech' (blue hologram + wireframe),
 *       'split' (design left of the screen centre, tech right of it).
 */
type Props = {
  color: string;
  colorBlink?: string | null;
  depth: string;
  mode: 'plain' | 'design' | 'tech' | 'split';
  closed?: boolean;
  className?: string;
  alt: string;
};

const vert = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform vec2 uRot;      // x = yaw, y = pitch
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uFloat;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vDepth;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
  vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c*p.y - s*p.z, s*p.y + c*p.z); }

  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    float dl = texture2D(uDepth, uv - vec2(uTexel.x, 0.0)).r;
    float dr = texture2D(uDepth, uv + vec2(uTexel.x, 0.0)).r;
    float dd = texture2D(uDepth, uv - vec2(0.0, uTexel.y)).r;
    float du = texture2D(uDepth, uv + vec2(0.0, uTexel.y)).r;
    vec3 n = normalize(vec3((dl - dr) * uDepthScale * 90.0, (dd - du) * uDepthScale * 90.0, 1.0));

    vec3 p = position;
    p.z += d * uDepthScale;
    vDepth = d;

    // the head turns more than the shoulders (neck twist)
    float head = smoothstep(0.52, 0.78, uv.y);
    float yaw = uRot.x * mix(0.35, 1.0, head);
    float pitch = uRot.y * head;
    vec3 pivot = vec3(0.0, 0.42, 0.18);
    p = rotX(rotY(p - pivot, yaw), pitch) + pivot;
    n = rotX(rotY(n, yaw), pitch);

    // breathing
    p.y += sin(uTime * 1.6) * 0.006 * (1.0 - head);
    p.xz *= 1.0 + sin(uTime * 1.6) * 0.004 * (1.0 - head);

    // hover
    p.y += sin(uTime * 1.1) * 0.025 * uFloat;

    vNormal = normalize(normalMatrix * n);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uColor;
  uniform sampler2D uBlink;
  uniform float uBlinkMix;
  uniform float uSeam;     // drawing-buffer x of the split; huge = all design, negative = all tech
  uniform float uTime;
  uniform vec3 uLight;
  uniform float uPx;       // device pixel ratio
  uniform float uComic;    // 1 = comic shading on the design side, 0 = natural photo
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vDepth;

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  void main() {
    vec4 a = texture2D(uColor, vUv);
    vec4 b = texture2D(uBlink, vUv);
    vec4 tex = mix(a, b, uBlinkMix);
    if (tex.a < 0.35) discard;
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vPos);
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.2);
    float lum = luma(tex.rgb);
    vec3 col;
    float alpha = smoothstep(0.35, 0.75, tex.a);

    if (gl_FragCoord.x < uSeam) {
      // ---------- DESIGN: lit photo with comic flavour ----------
      vec3 L = normalize(uLight);
      float diff = clamp(dot(N, L), 0.0, 1.0);
      vec3 base = tex.rgb;
      if (uComic < 0.5) {
        // natural: soft key light + cool rim, keeps true colours
        col = base * (0.8 + 0.32 * diff);
        col += vec3(0.75, 0.85, 1.0) * smoothstep(0.6, 0.95, fres) * 0.25;
        col = mix(col, col * 0.7, 1.0 - smoothstep(0.35, 0.7, tex.a));
        gl_FragColor = vec4(col, alpha);
        return;
      }
      // gentle saturation + contrast lift
      base = mix(vec3(lum), base, 1.18);
      base = (base - 0.5) * 1.08 + 0.5;
      col = base * (0.62 + 0.55 * diff);
      // warm key, pink fill
      col += vec3(1.0, 0.82, 0.25) * pow(diff, 6.0) * 0.18;
      // halftone dots in the shadows
      vec2 g = gl_FragCoord.xy / (5.5 * uPx);
      vec2 cell = fract(g) - 0.5;
      float shade = 1.0 - smoothstep(0.15, 0.55, diff * 0.6 + lum * 0.7);
      float dotR = 0.42 * shade;
      float dots = 1.0 - smoothstep(dotR - 0.06, dotR + 0.06, length(cell));
      col = mix(col, col * 0.55, dots * 0.55);
      // yellow rim + black ink silhouette
      col += vec3(1.0, 0.82, 0.25) * smoothstep(0.55, 0.9, fres) * 0.35;
      float ink = smoothstep(0.86, 0.97, fres) + (1.0 - smoothstep(0.35, 0.6, tex.a));
      col = mix(col, vec3(0.04), clamp(ink, 0.0, 1.0) * 0.9);
    } else {
      // ---------- TECH: hologram ----------
      vec3 deep = vec3(0.02, 0.06, 0.16);
      vec3 blue = vec3(0.23, 0.51, 0.96);
      vec3 ice = vec3(0.62, 0.84, 1.0);
      float l = pow(clamp(lum * 1.35, 0.0, 1.0), 0.85);
      col = mix(deep, blue, l);
      col = mix(col, ice, smoothstep(0.55, 1.0, l) * 0.6);
      // feature edges from the photo
      float e = clamp(fwidth(lum) * 9.0, 0.0, 1.0);
      col += ice * e * 0.9;
      // wireframe grid on the surface
      vec2 gg = vUv * vec2(70.0, 84.0);
      vec2 w = abs(fract(gg - 0.5) - 0.5) / fwidth(gg);
      float line = 1.0 - min(min(w.x, w.y), 1.0);
      col += blue * line * 0.45;
      // scanlines + travelling scan band
      col *= 0.86 + 0.14 * sin(gl_FragCoord.y * 1.4 / uPx);
      float band = smoothstep(0.06, 0.0, abs(fract(vUv.y * 0.6 - uTime * 0.18) - 0.5));
      col += ice * band * 0.35;
      // fresnel glow
      col += ice * fres * 0.9;
      alpha *= 0.92;
    }
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function Avatar3D({ color, colorBlink, depth, mode, closed = false, className = '', alt }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const blinkRef = useRef(closed);
  const [failed, setFailed] = useState(false);
  blinkRef.current = closed;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
    const loader = new THREE.TextureLoader();
    const load = (u: string) =>
      new Promise<THREE.Texture>((res, rej) =>
        loader.load(
          u,
          (t) => {
            t.colorSpace = THREE.NoColorSpace;
            t.minFilter = THREE.LinearMipmapLinearFilter;
            t.anisotropy = 4;
            res(t);
          },
          undefined,
          rej
        )
      );

    let disposed = false;
    let raf = 0;
    let mesh: THREE.Mesh | null = null;
    let mat: THREE.ShaderMaterial | null = null;
    let visible = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let tx = 0,
      ty = 0,
      rx = 0,
      ry = 0,
      blink = 0;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    addEventListener('pointermove', onMove, { passive: true });

    const size = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, r.width),
        h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // fit the 2-unit-tall bust to the canvas height, anchored to the bottom
      const fit = 1 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      const plateAspect = mesh ? (mesh.geometry as THREE.PlaneGeometry).parameters.width / 2 : 0.83;
      const needW = (plateAspect * 2) / camera.aspect; // height that would make width fit
      const H = Math.max(2.04, needW * 1.02);
      camera.position.set(0, 0, H * fit + 0.25);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      if (mat) {
        // seam = centre of the viewport, in this canvas' drawing-buffer pixels
        const seamCss = mode === 'split' ? innerWidth / 2 - r.left : mode === 'tech' ? -1e6 : 1e6;
        mat.uniforms.uSeam.value = seamCss * dpr;
      }
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const onScroll = () => mode === 'split' && size();
    addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    Promise.all([load(color), load(colorBlink || color), load(depth)])
      .then(([c, b, d]) => {
        if (disposed) return;
        const img = c.image as HTMLImageElement;
        const aspect = img.width / img.height;
        const geo = new THREE.PlaneGeometry(2 * aspect, 2, 220, Math.round(220 / aspect));
        mat = new THREE.ShaderMaterial({
          vertexShader: vert,
          fragmentShader: frag,
          transparent: true,
          uniforms: {
            uColor: { value: c },
            uBlink: { value: b },
            uBlinkMix: { value: 0 },
            uDepth: { value: d },
            uDepthScale: { value: 0.42 },
            uTexel: { value: new THREE.Vector2(2 / img.width, 2 / img.height) },
            uRot: { value: new THREE.Vector2() },
            uTime: { value: 0 },
            uSeam: { value: 0 },
            uLight: { value: new THREE.Vector3(-0.4, 0.5, 0.9) },
            uPx: { value: dpr },
            uComic: { value: mode === 'plain' ? 0 : 1 },
            uFloat: { value: mode === 'plain' ? 1 : 0 },
          },
        });
        mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        size();
        const clock = new THREE.Clock();
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (!visible || document.hidden || !mat) return;
          const t = clock.getElapsedTime();
          const autoX = touch || reduce ? Math.sin(t * 0.45) * 0.55 : 0;
          const autoY = touch || reduce ? Math.sin(t * 0.3) * 0.2 : 0;
          const goalX = touch ? autoX : tx;
          const goalY = touch ? autoY : ty;
          rx += (goalX * 0.42 - rx) * 0.06;
          ry += (goalY * 0.16 - ry) * 0.06;
          blink += ((blinkRef.current ? 1 : 0) - blink) * 0.55;
          mat.uniforms.uRot.value.set(rx, ry);
          mat.uniforms.uTime.value = reduce ? 0 : t;
          mat.uniforms.uBlinkMix.value = blink;
          mat.uniforms.uLight.value.set(-0.35 + rx * 0.9, 0.45 - ry, 0.9);
          renderer.render(scene, camera);
        };
        loop();
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('scroll', onScroll);
      ro.disconnect();
      io.disconnect();
      mesh?.geometry.dispose();
      mat?.dispose();
      Object.values(mat?.uniforms ?? {}).forEach((u: any) => u.value?.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [color, colorBlink, depth, mode]);

  return (
    <div
      ref={wrap}
      className={`relative ${className}`}
      role="img"
      aria-label={alt}
      style={mode === 'plain' ? { filter: 'drop-shadow(0 28px 40px rgba(0,0,0,.45)) drop-shadow(0 0 1px rgba(0,0,0,.6))' } : undefined}
    >
      {failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={color} alt="" className="absolute inset-0 h-full w-full object-contain object-bottom" />
      )}
    </div>
  );
}
