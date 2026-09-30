/* Original Mumbai artwork animated as an atmospheric camera scene.
   The image remains visible when WebGL is unavailable or its context is lost. */
(() => {
  'use strict';
  const canvas = document.getElementById('mumbaiHarbour');
  const image = document.getElementById('mumbaiSceneImage');
  const backdrop = document.querySelector('.city-backdrop');
  const toggle = document.getElementById('sceneMotionToggle');
  if (!canvas || !image || !backdrop) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  let paused = false, frame = 0, elapsed = 0, lastPaint = 0;
  let px = 0, py = 0, targetX = 0, targetY = 0, travel = 0;
  let program, texture, uniforms, buffer;
  let ready = false;

  const vertex = 'attribute vec2 position; varying vec2 uv; void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }';
  const fragment = `
    precision mediump float;
    varying vec2 uv;
    uniform sampler2D artwork;
    uniform vec2 resolution;
    uniform vec2 imageSize;
    uniform vec2 pointer;
    uniform float time;
    uniform float progress;
    uniform float moving;
    void main() {
      float viewAspect=resolution.x/resolution.y;
      float imageAspect=imageSize.x/imageSize.y;
      vec2 fit=vec2(min(1.,viewAspect/imageAspect),min(1.,imageAspect/viewAspect));
      vec2 center=vec2(mix(.68,.5,smoothstep(.65,1.3,viewAspect)),.5);
      float cameraZoom=1.035+progress*.11;
      vec2 p=(uv-.5)*fit/cameraZoom+center;
      // Sea distortion stays below the waterfront; architecture stays rigid.
      float sea=1.-smoothstep(.18,.31,p.y);
      float ripple=sin(p.x*84.+time*.7)*sin(p.y*97.-time*.55);
      p.x+=ripple*.0017*sea*moving;
      p.y+=sin(p.x*67.-time*.65)*.0012*sea*moving;
      p+=pointer*vec2(.013,.009)*(0.4+uv.y*.6);
      vec3 color=texture2D(artwork,clamp(p,.001,.999)).rgb;
      float silver=dot(color,vec3(.2126,.7152,.0722));
      color=mix(color,vec3(silver),.27);
      // A slow, low-contrast mist pass gives depth without obscuring the subject.
      float fog=sin(p.x*5.+time*.07+sin(p.y*6.))*.5+.5;
      fog*=smoothstep(.28,.52,p.y)*(1.-smoothstep(.62,.9,p.y));
      color=mix(color,vec3(.65,.71,.75),fog*.065*moving);
      gl_FragColor=vec4(color,1.);
    }`;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Scene shader unavailable'); }
    return shader;
  }

  function initialize() {
    if (!gl || !image.complete || !image.naturalWidth) return;
    try {
      program = gl.createProgram();
      const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
      gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
      gl.deleteShader(vs); gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Scene program unavailable');
      gl.useProgram(program);
      buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const attribute = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      texture = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      uniforms = Object.fromEntries(['resolution','imageSize','pointer','time','progress','moving','artwork'].map(name => [name, gl.getUniformLocation(program, name)]));
      gl.uniform1i(uniforms.artwork, 0);
      gl.uniform2f(uniforms.imageSize, image.naturalWidth, image.naturalHeight);
      ready = true; resize();
      backdrop.classList.add('scene-ready');
    } catch (_) {
      ready = false; backdrop.classList.remove('scene-ready');
    }
  }

  function render(now) {
    frame = 0;
    if (!ready || document.hidden) return;
    const interval = fine.matches ? 1000 / 30 : 1000 / 20;
    if (!reduce.matches && !paused && lastPaint && now - lastPaint < interval) {
      frame = requestAnimationFrame(render); return;
    }
    const dt = lastPaint ? Math.min((now-lastPaint)/1000,.1) : 0;
    lastPaint = now;
    const moving = !reduce.matches && !paused;
    if (moving) { elapsed += dt; px += (targetX-px)*.14; py += (targetY-py)*.14; }
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.pointer, px, py);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.progress, reduce.matches ? 0 : travel);
    gl.uniform1f(uniforms.moving, reduce.matches ? 0 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (moving) frame = requestAnimationFrame(render);
  }

  function wake() { if (ready && !frame && !document.hidden) { lastPaint = 0; frame = requestAnimationFrame(render); } }
  function resize() {
    if (!gl || !ready) return;
    const dpr = Math.min(devicePixelRatio || 1, fine.matches ? 1.25 : 1);
    canvas.width = Math.round(innerWidth*dpr); canvas.height = Math.round(innerHeight*dpr);
    gl.viewport(0,0,canvas.width,canvas.height); wake();
  }
  addEventListener('resize', resize, { passive:true });
  addEventListener('pointermove', event => {
    if (reduce.matches || paused || !fine.matches) return;
    targetX = event.clientX/innerWidth-.5; targetY = event.clientY/innerHeight-.5;
    if (!ready) image.style.transform = `scale(1.035) translate(${targetX*8}px,${targetY*6}px)`;
  }, { passive:true });
  document.addEventListener('pointerleave', () => { targetX=targetY=0; if (!ready) image.style.transform=''; });
  addEventListener('journey-progress', event => { if (!paused && !reduce.matches) travel=event.detail; });
  reduce.addEventListener('change', () => { targetX=targetY=px=py=0; travel=0; image.style.transform=''; wake(); });
  fine.addEventListener('change', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame=0; } else wake();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); ready=false; cancelAnimationFrame(frame); frame=0; backdrop.classList.remove('scene-ready');
  });
  canvas.addEventListener('webglcontextrestored', initialize);
  if (toggle) toggle.addEventListener('click', () => {
    paused=!paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume background animation' : 'Pause background animation');
    toggle.textContent=paused ? 'Resume scene' : 'Pause scene';
    if (paused) { cancelAnimationFrame(frame); frame=0; } else wake();
  });
  if (image.complete) initialize(); else image.addEventListener('load', initialize, { once:true });
})();
