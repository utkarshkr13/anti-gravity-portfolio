import { useEffect, useRef } from "react";
import * as THREE from "three";

export function WebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 800 : 1800;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    
    // Add atmospheric fog matching latte/espresso backgrounds
    scene.fog = new THREE.FogExp2(0x110e0d, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 10;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    const baseColor = new THREE.Color("#94eb6c"); 
    const secondaryColor = new THREE.Color("#eeeae4"); 

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 12; 
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -Math.random() * 80; 

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const mixedColor = baseColor.clone().lerp(secondaryColor, Math.random() * 0.6);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      velocities[i] = 0.15 + Math.random() * 0.35;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouse.targetY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      scene.fog = new THREE.FogExp2(isDark ? 0x110e0d : 0xf8f6f2, 0.015);
    };

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    updateColors();

    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 2.8;
      camera.position.y = -mouse.y * 2.8;
      camera.lookAt(0, 0, -40);

      camera.rotation.z = mouse.x * -0.15;

      const positionAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = positionAttr.array as Float32Array;

      const mouseDist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
      const warpSpeedMultiplier = 1.0 + mouseDist * 3.5;

      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 2] += velocities[i] * warpSpeedMultiplier;

        if (arr[i * 3 + 2] > 12) {
          arr[i * 3 + 2] = -80; 
          const angle = Math.random() * Math.PI * 2;
          const radius = 2.5 + Math.random() * 12;
          arr[i * 3] = Math.cos(angle) * radius;
          arr[i * 3 + 1] = Math.sin(angle) * radius;
        }
      }

      positionAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      cancelAnimationFrame(animFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
