(() => {
  'use strict';

  const demo = document.querySelector('#signoff-demo');
  if (!demo) return;

  const responses = {
    pass: {
      verdict: 'Hold sign-off.',
      reason: 'Passing the test would record a result the system didn’t produce. The acceptance criterion requires Confirmed.',
      owner: 'The QA tester records the mismatch and assigns it to the integration owner.',
      evidence: 'A rerun of the same scenario captures Confirmed as the actual status.'
    },
    block: {
      verdict: 'Block sign-off and record the mismatch.',
      reason: 'The returned status is Pending after the request has finished. That fails the acceptance criterion.',
      owner: 'The integration owner investigates the discrepancy. QA verifies the fix.',
      evidence: 'The same test returns Confirmed and QA captures the result in the test record.'
    },
    retest: {
      verdict: 'Retest after the discrepancy is addressed.',
      reason: 'Retesting can verify a fix or reproduce the mismatch. The current result remains blocked while that evidence is missing.',
      owner: 'The integration owner identifies what changed. The QA tester reruns the scenario.',
      evidence: 'Record the test inputs, the actual status, and the build or environment used. A Confirmed result supports sign-off.'
    }
  };

  const choices = [...demo.querySelectorAll('[data-signoff-choice]')];
  const result = demo.querySelector('#signoff-result');
  const verdict = result.querySelector('.signoff-verdict');
  const reason = result.querySelector('.signoff-reason');
  const next = result.querySelector('.signoff-next');
  const owner = next.querySelector('.signoff-owner');
  const evidence = next.querySelector('.signoff-evidence');

  choices.forEach(choice => {
    choice.addEventListener('click', () => {
      const response = responses[choice.dataset.signoffChoice];
      choices.forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
      verdict.textContent = response.verdict;
      reason.textContent = response.reason;
      owner.textContent = response.owner;
      evidence.textContent = response.evidence;
      next.hidden = false;
    });
  });

  demo.querySelector('.signoff-fallback').hidden = true;
  demo.querySelector('.signoff-interactive').hidden = false;
})();
