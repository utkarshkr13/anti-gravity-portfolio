(() => {
  'use strict';

  const figure = document.getElementById('deliveryFlow');
  if (!figure) return;

  const controls = document.getElementById('flowControls');
  const replay = document.getElementById('flowReplay');
  const caption = document.getElementById('flowCaption');
  const buttons = [...figure.querySelectorAll('[data-flow-step]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pulses = ['Top', 'Mid', 'Low', 'Out'].map(name => document.getElementById('flowPulse' + name));
  const canAnimate = pulses.every(pulse => typeof pulse?.beginElement === 'function');
  const descriptions = {
    brief: 'Start with the request, the rules, and what could go wrong.',
    test: 'Turn each requirement into a check someone can run and verify.',
    ship: 'Use the test results to see what is ready for sign-off.'
  };

  let sequence = [];
  const stop = () => {
    sequence.forEach(clearTimeout);
    sequence = [];
    if (canAnimate) pulses.forEach(pulse => pulse.endElement());
    delete figure.dataset.phase;
  };

  const play = (step) => {
    if (!canAnimate || reduce.matches) return;
    stop();
    const timing = step === 'ship' ? [null, null, null, 0] :
      step === 'test' ? [0, 100, 200, null] : [0, 150, 320, 1670];
    sequence = timing.flatMap((delay, index) =>
      delay === null ? [] : [setTimeout(() => pulses[index].beginElement(), delay)]
    );

    const showPhase = (phase, delay) => {
      sequence.push(setTimeout(() => { figure.dataset.phase = phase; }, delay));
    };

    if (step !== 'ship') showPhase('verified', step === 'test' ? 1300 : 1500);
    if (step !== 'test') showPhase('released', step === 'ship' ? 650 : 2270);
    sequence.push(setTimeout(() => { delete figure.dataset.phase; }, step === 'brief' ? 3400 : 2250));
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const step = button.dataset.flowStep;
      figure.dataset.stage = step;
      caption.textContent = descriptions[step];
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      play(step);
    });
  });

  replay.addEventListener('click', () => buttons[0].click());
  const updateMotion = () => {
    replay.hidden = !canAnimate || reduce.matches;
    if (reduce.matches) stop();
  };
  reduce.addEventListener('change', updateMotion);
  updateMotion();
  controls.hidden = false;
  caption.setAttribute('aria-live', 'polite');

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    play('brief');
    observer.disconnect();
  }, { threshold: 0.35 });
  observer.observe(figure);
})();
