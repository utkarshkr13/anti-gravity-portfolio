/** Dependency-free metallic surface. CSS remains visible when WebGL is unavailable. */
(() => {
  'use strict';
  const canvas = document.getElementById('liquidTitanium');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance' });
  if (!gl) return;
  const vertexSource = 'attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}';
  const fragmentSource = `
    precision mediump float;
    uniform vec2 resolution;
    uniform vec2 pointer;
    uniform float time;
    uniform float lightTheme;
    float surface(vec2 p) {
      float t=time*.22;
      p+=vec2(sin(p.y*2.1+t),cos(p.x*1.7-t))*.32;
      float d=length(p-pointer);
      return sin(p.x*2.4+p.y*1.3+t)*.45
        +sin(p.y*3.1-p.x*.8-t*.7)*.26
        +sin(p.x*4.2+p.y*2.8+t*.5)*.10
        +cos(d*5.-t*2.)*exp(-d*d*2.)*.10;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;
      vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.)*3.;
      float h=surface(p);
      vec3 n=normalize(vec3((surface(p+vec2(.008,0.))-h)/.008,
        (surface(p+vec2(0.,.008))-h)/.008, .75));
      vec3 r=reflect(vec3(0.,0.,-1.),n);
      // Tight reflections keep the metal legible rather than foggy.
      float band=pow(max(0.,1.-abs(r.x*.6+r.y*.8-.18)),42.);
      float edge=pow(max(0.,1.-abs(r.x*.85-r.y*.3+.35)),68.);
      float sheen=pow(max(dot(n,normalize(vec3(-.6,.8,1.))),0.),18.);
      vec3 metal=vec3(.018,.035,.075)+vec3(.48,.72,1.)*band
        +vec3(.12,.35,.85)*edge+vec3(.07,.16,.34)*sheen;
      float quiet=smoothstep(.10,.60,length((uv-.5)*vec2(1.25,1.8)));
      metal*=mix(.17,.85,quiet);
      vec3 dark=metal+vec3(.012,.020,.045);
      // Separate light palette: subtracting blue metal would turn reflections yellow.
      vec3 pale=vec3(.93,.96,1.)
        -vec3(.38,.25,.09)*band*mix(.18,.7,quiet)
        -vec3(.26,.14,.03)*edge*mix(.18,.65,quiet);
      gl_FragColor=vec4(mix(dark,pale,lightTheme),1.);
    }`;
  let program, buffer, uniforms;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Liquid Titanium shader compilation failed');
    }
    return shader;
  }
  function initialize() {
    const shaders = [];
    try {
      shaders.push(compile(gl.VERTEX_SHADER, vertexSource));
      shaders.push(compile(gl.FRAGMENT_SHADER, fragmentSource));
      program = gl.createProgram();
      shaders.forEach(shader => gl.attachShader(program, shader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      uniforms = Object.fromEntries(['resolution','pointer','time','lightTheme'].map(name => [name, gl.getUniformLocation(program,name)]));
      canvas.style.visibility = 'visible';
      return true;
    } catch (error) {
      if (program) gl.deleteProgram(program);
      canvas.style.visibility = 'hidden';
      return false;
    } finally {
      shaders.forEach(shader => gl.deleteShader(shader));
    }
  }
  if (!initialize()) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, last = 0, elapsed = 0, visible = true, lost = false;
  // Adapt pixel count, never skip animation frames. Hysteresis prevents quality oscillation.
  let quality = 1, sampleTime = 0, sampleCount = 0, slowFrames = 0, stableWindows = 0;
  let fastestFrame = 1000 / 60;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  function draw() {
    if (lost) return;
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.pointer, x, y);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.lightTheme, document.documentElement.dataset.theme === 'light' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function resize() {
    // Bound fragment cost even on high-DPI, ultrawide displays.
    const scale = quality * Math.min(devicePixelRatio || 1, 1.5, 1600 / Math.max(hero.clientWidth, hero.clientHeight));
    const width = Math.max(1, Math.round(hero.clientWidth * scale));
    const height = Math.max(1, Math.round(hero.clientHeight * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  }
  function tick(now) {
    frame = 0;
    if (lost || !visible || document.hidden || reduced.matches) return;
    const delta = Math.max(0, now - last);
    last = now;
    const seconds = Math.min(delta / 1000, .1);
    elapsed += seconds;
    // Preserve the same interaction speed on 60, 120 and 144 Hz displays.
    const smoothing = 1 - Math.exp(-3 * seconds);
    x += (targetX - x) * smoothing;
    y += (targetY - y) * smoothing;
    draw();
    // Exclude long interruptions (debugger, tab switches) from performance feedback.
    if (delta > 4 && delta < 100) {
      fastestFrame = Math.min(fastestFrame, delta);
      sampleTime += delta;
      sampleCount++;
      if (delta > fastestFrame * 1.45) slowFrames++;
      if (sampleTime >= 1500) {
        if (slowFrames / sampleCount > .12 && quality > .45) {
          quality = Math.max(.45, quality * .82);
          stableWindows = 0;
          resize();
        } else if (slowFrames === 0 && ++stableWindows >= 6 && quality < 1) {
          quality = Math.min(1, quality + .05);
          stableWindows = 0;
          resize();
        } else if (slowFrames > 0) {
          stableWindows = 0;
        }
        sampleTime = sampleCount = slowFrames = 0;
      }
    }
    frame=requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame);
    frame=0; last=performance.now();
    sampleTime = sampleCount = slowFrames = stableWindows = 0;
    draw();
    if (!lost && visible && !document.hidden && !reduced.matches) frame=requestAnimationFrame(tick);
  }
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries => { visible=entries[0].isIntersecting; resume(); }).observe(hero);
  new MutationObserver(draw).observe(document.documentElement, {attributes:true,attributeFilter:['data-theme']});
  hero.addEventListener('pointermove', event => {
    const rect=hero.getBoundingClientRect();
    targetX=((event.clientX-rect.left)/rect.width-.5)*3*rect.width/rect.height;
    targetY=(.5-(event.clientY-rect.top)/rect.height)*3;
  }, {passive:true});
  hero.addEventListener('pointerleave', () => { targetX=targetY=0; });
  document.addEventListener('visibilitychange',resume);
  reduced.addEventListener('change',resume);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost=true; cancelAnimationFrame(frame); canvas.style.visibility='hidden';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost=!initialize(); if (!lost) { resize(); resume(); }
  });
  resize(); resume();
})();
