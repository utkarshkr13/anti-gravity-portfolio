import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 6;

    const noiseGLSL = `
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0)
        );
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAccent: { value: new THREE.Color("#9dff6b") },
      uBase: { value: new THREE.Color("#050607") },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      wireframe: true,
      transparent: true,
      vertexShader:
        noiseGLSL +
        `
        uniform float uTime;
        uniform vec2 uMouse;
        varying float vN;
        void main() {
          float n = snoise(normal * 1.4 + uTime * 0.25);
          float m = (uMouse.x + uMouse.y) * 0.35;
          float disp = n * (0.55 + m * 0.4);
          vN = n;
          vec3 pos = position + normal * disp;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uAccent;
        uniform vec3 uBase;
        varying float vN;
        void main() {
          vec3 base = mix(uBase, uAccent, smoothstep(-0.2, 0.9, vN));
          gl_FragColor = vec4(base, 0.55 + vN * 0.3);
        }
      `,
    });

    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 24), mat);
    blob.position.x = 2.4;
    blob.position.y = 0.3;
    scene.add(blob);

    const N = 520;
    const pg = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const pm = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    const pts = new THREE.Points(pg, pm);
    scene.add(pts);

    // Watch and update theme colors dynamically
    const updateThemeColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        uniforms.uAccent.value.set("#9dff6b");
        uniforms.uBase.value.set("#050607");
        pm.color.set(0xffffff);
      } else {
        uniforms.uAccent.value.set("#1e7e34");
        uniforms.uBase.value.set("#d4d5d2");
        pm.color.set(0x000000);
      }
    };
    updateThemeColors();

    const themeObserver = new MutationObserver(() => {
      updateThemeColors();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let tmx = 0,
      tmy = 0,
      mxs = 0,
      mys = 0,
      scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animFrameId: number;

    const render = () => {
      const t = clock.getElapsedTime();
      mxs += (tmx - mxs) * 0.05;
      mys += (tmy - mys) * 0.05;

      uniforms.uTime.value = reduceMotion ? 0 : t;
      uniforms.uMouse.value.set(mxs, mys);

      blob.rotation.y = t * 0.15 + mxs * 0.4;
      blob.rotation.x = mys * 0.3;

      const sp = scrollY / window.innerHeight;
      blob.position.y = 0.3 + sp * 2.2;
      blob.scale.setScalar(1 - Math.min(sp * 0.12, 0.5));

      pts.rotation.y = t * 0.02;
      pts.position.y = sp * 0.6;

      canvas.style.opacity = String(Math.max(0.12, 1 - sp * 0.95));

      camera.position.x += (mxs * 0.4 - camera.position.x) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      themeObserver.disconnect();
      renderer.dispose();
      mat.dispose();
      pm.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
