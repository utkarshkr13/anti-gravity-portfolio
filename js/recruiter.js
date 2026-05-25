/**
 * Portfolio Recruiter Experience Suite & Siri Voice Co-Pilot
 * Deployed for Utkarsh Rajput's Portfolio
 * Senior Google/Apple Level Architecture & Interactions
 */

(function() {
  // ============================================================
  // KANBAN BOARD SYSTEM
  // ============================================================
  
  const kanbanCards = [
    {
      id: 'kb-card-1',
      title: '📝 Write Van Sales BRD (CCBCSA)',
      desc: 'Map offline route-sales requirements and order flows for field agents in low-connectivity rural zones.',
      status: 'Backlog',
      metric: '99% Invoicing Errors Avoided',
      impact: 'Engineered robust local validation protocols using IndexedDB caching to stop dual-billing during network timeouts. Standardized UAT sign-off criteria with cross-border stakeholders.'
    },
    {
      id: 'kb-card-2',
      title: '🔍 Audit Decimal-Rounding QA Bounds',
      desc: 'Audit and repair critical floating-point arithmetic errors in client-side retail inventory discounting calculators.',
      status: 'InDev',
      metric: '$24,000 Annual Savings',
      impact: 'Identified dual-entry rounding leakage in SAP integration ledger. Implemented exact decimal scale boundary enforcement, preventing invoice adjustments and accounting audit overhead.'
    },
    {
      id: 'kb-card-3',
      title: '🚀 Deploy SAP Integration Tracker',
      desc: 'Build internal testing portal to trace and audit JSON-to-RFC gateway payloads between middleware queues and SAP.',
      status: 'UAT',
      metric: '-8 hrs/week QA Effort',
      impact: 'Created a visually dynamic, searchable REST API tracer showing actual mapping discrepancies. Cut down time-to-resolve during integration testing phase by 65%.'
    },
    {
      id: 'kb-card-4',
      title: '🤖 Automate NLP L2 Support Triaging',
      desc: 'Integrate OpenAI / Claude API categorizers to auto-assign incoming L2 support tickets based on stack traces.',
      status: 'Backlog',
      metric: '<10 sec SLA Routing (98% reduction)',
      impact: 'Designed and deployed serverless webhooks to classify ticket severity, extract key error codes, and route immediately to domain leads with dynamic Slack notifications.'
    }
  ];

  let activeCardId = null;

  window.initKanban = function() {
    renderKanban();
  };

  function renderKanban() {
    const listBacklog = document.getElementById('listBacklog');
    const listInDev = document.getElementById('listInDev');
    const listUAT = document.getElementById('listUAT');
    const listLive = document.getElementById('listLive');
    
    if (!listBacklog || !listInDev || !listUAT || !listLive) return;

    // Clear lists
    listBacklog.innerHTML = '';
    listInDev.innerHTML = '';
    listUAT.innerHTML = '';
    listLive.innerHTML = '';

    kanbanCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `kanban-card ${card.status === 'Live' ? 'live-prod' : ''}`;
      cardEl.id = card.id;
      cardEl.draggable = card.status !== 'Live';
      cardEl.setAttribute('data-cursor', card.status === 'Live' ? 'default' : 'grab');
      
      // Drag events
      cardEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
        cardEl.classList.add('dragging');
        activeCardId = card.id;
      });

      cardEl.addEventListener('dragend', () => {
        cardEl.classList.remove('dragging');
        activeCardId = null;
      });

      let footerHTML = '';
      if (card.status !== 'Live') {
        footerHTML = `
          <div class="kanban-card-footer">
            <span class="kanban-card-badge status-${card.status.toLowerCase()}">${card.status}</span>
            <button class="kanban-advance-btn" onclick="advanceCardStatus('${card.id}')" title="Move to next stage" data-cursor="hover">
              <span>Advance</span> <i data-lucide="chevron-right" style="width:12px;height:12px;"></i>
            </button>
          </div>
        `;
      } else {
        footerHTML = `
          <div class="kanban-card-live-success animate-fadeIn">
            <div class="live-success-header">
              <i data-lucide="party-popper" style="width:14px;height:14px;color:#10b981;"></i>
              <span>METRIC: <strong>${card.metric}</strong></span>
            </div>
            <p class="live-success-impact">${card.impact}</p>
          </div>
        `;
      }

      cardEl.innerHTML = `
        <h4 class="kanban-card-title">${card.title}</h4>
        <p class="kanban-card-desc">${card.desc}</p>
        ${footerHTML}
      `;

      if (card.status === 'Backlog') listBacklog.appendChild(cardEl);
      else if (card.status === 'InDev') listInDev.appendChild(cardEl);
      else if (card.status === 'UAT') listUAT.appendChild(cardEl);
      else if (card.status === 'Live') listLive.appendChild(cardEl);
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  window.allowDrop = function(e) {
    e.preventDefault();
  };

  window.dropCard = function(e, targetStatus) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || activeCardId;
    if (!cardId) return;

    const card = kanbanCards.find(c => c.id === cardId);
    if (!card) return;

    if (card.status === 'Live' && targetStatus !== 'Live') {
      return; // Live cards are permanently deployed
    }

    card.status = targetStatus;
    renderKanban();

    if (targetStatus === 'Live') {
      triggerConfettiSuccess();
    }
  };

  window.advanceCardStatus = function(cardId) {
    const card = kanbanCards.find(c => c.id === cardId);
    if (!card) return;

    const stages = ['Backlog', 'InDev', 'UAT', 'Live'];
    const currentIndex = stages.indexOf(card.status);
    if (currentIndex !== -1 && currentIndex < stages.length - 1) {
      card.status = stages[currentIndex + 1];
      renderKanban();

      if (card.status === 'Live') {
        triggerConfettiSuccess();
      }
    }
  };

  function triggerConfettiSuccess() {
    if (window.confetti) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  }

  // ============================================================
  // UAT 2-MINUTE PM CHALLENGE
  // ============================================================

  window.selectChallengeOption = function(option, buttonEl) {
    const optionsList = document.querySelectorAll('.challenge-option');
    optionsList.forEach(opt => {
      opt.classList.remove('selected', 'success', 'error');
      opt.style.pointerEvents = 'none';
    });

    buttonEl.classList.add('selected');
    const resultBox = document.getElementById('challengeResultBox');
    if (!resultBox) return;

    resultBox.style.display = 'block';
    resultBox.className = 'challenge-result animate-fadeIn';

    if (option === 'C') {
      buttonEl.classList.add('success');
      triggerConfettiSuccess();
      
      resultBox.innerHTML = `
        <div class="challenge-result-header success">
          <i data-lucide="check-circle" style="width:20px;height:20px;color:#10b981;"></i>
          <span>UAT SIGN-OFF APPROVED (100% SUCCESS)</span>
        </div>
        <p class="challenge-result-text"><strong>Outstanding!</strong> You solved the issue like a seasoned Product Architect. By storing transactional payloads in an IndexedDB cache first and appending a unique <strong>Idempotency-Key</strong> in the sync headers, duplicate HTTP POSTs are filtered cleanly. If the agent double-taps, the gateway detects the duplicate key and returns the identical cached response of the first order, writing to SAP exactly once. 0 data discrepancy, 100% offline-resilient.</p>
        
        <div class="challenge-stamp-wrapper">
          <div class="uat-stamp">APPROVED</div>
          <a href="#contact" class="btn btn-primary challenge-cta-btn" data-cursor="hover">
            Book a Meeting with Utkarsh <i data-lucide="calendar" style="width:14px;height:14px;margin-left:6px;"></i>
          </a>
        </div>
      `;
    } else {
      buttonEl.classList.add('error');
      
      const reasons = {
        'A': '<strong>UAT Blocked (Incomplete Solution):</strong> Simply disabling the submit button or placing a warning toast is a client-only bandage. In rural areas, high latency triggers multiple Retries on the network stack. If the service worker times out and retries automatically behind the scenes, SAP will still write duplicate orders. It does not resolve the data source discrepancy!',
        'B': '<strong>SLA Breached & High Risk:</strong> Implementing database-level unique key constraint locks on the Orders table is a robust fallback, but raising a raw SQL database exception inside active middleware during SAP RFC ingestion causes transaction failure and breaks sync flows. It leaves the field agent stranded without an offline resolution pathway.'
      };

      resultBox.innerHTML = `
        <div class="challenge-result-header error">
          <i data-lucide="x-circle" style="width:20px;height:20px;color:#ef4444;"></i>
          <span>UAT SIGN-OFF REJECTED</span>
        </div>
        <p class="challenge-result-text">${reasons[option]}</p>
        <button class="btn btn-secondary challenge-retry-btn" onclick="resetChallenge()" data-cursor="hover">
          <i data-lucide="refresh-cw" style="width:14px;height:14px;margin-right:6px;"></i> Try Another Approach
        </button>
      `;
    }

    if (window.lucide) {
      lucide.createIcons({ node: resultBox });
    }
  };

  window.resetChallenge = function() {
    const optionsList = document.querySelectorAll('.challenge-option');
    optionsList.forEach(opt => {
      opt.classList.remove('selected', 'success', 'error');
      opt.style.pointerEvents = 'auto';
    });

    const resultBox = document.getElementById('challengeResultBox');
    if (resultBox) {
      resultBox.style.display = 'none';
      resultBox.innerHTML = '';
    }
  };

  window.switchRecruiterTab = function(tabName) {
    const tabKanban = document.getElementById('btnTabKanban');
    const tabChallenge = document.getElementById('btnTabChallenge');
    const panelKanban = document.getElementById('recruiterPanelKanban');
    const panelChallenge = document.getElementById('recruiterPanelChallenge');

    if (!tabKanban || !tabChallenge || !panelKanban || !panelChallenge) return;

    if (tabName === 'kanban') {
      tabKanban.classList.add('active');
      tabChallenge.classList.remove('active');
      panelKanban.style.display = 'block';
      panelChallenge.style.display = 'none';
      renderKanban();
    } else {
      tabKanban.classList.remove('active');
      tabChallenge.classList.add('active');
      panelKanban.style.display = 'none';
      panelChallenge.style.display = 'block';
    }
  };

  // ============================================================
  // SIRI VOICE TTS & SOUNDWAVE CANVAS ANIMATION
  // ============================================================
  
  let siriWaveActive = false;
  let siriWaveAnimationFrame = null;

  window.speakText = function(buttonElement) {
    const bubble = buttonElement.closest('.siri-bubble');
    if (!bubble) return;
    
    // Extract actual text to speak (strip HTML and Siri title)
    let text = bubble.innerText.replace('Siri Co-Pilot', '').replace(/[\r\n]+/g, ' ').trim();
    
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        updateSiriWaveActive(false);
        buttonElement.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
        lucide.createIcons({ node: buttonElement });
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Grab a premium natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.lang.startsWith('en') && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Apple') || v.name.includes('Microsoft')));
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
      
      utterance.onstart = () => {
        updateSiriWaveActive(true);
        buttonElement.innerHTML = '<i data-lucide="volume-x" style="width:14px;height:14px;color:#ef4444;"></i>';
        lucide.createIcons({ node: buttonElement });
      };
      
      utterance.onend = () => {
        updateSiriWaveActive(false);
        buttonElement.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
        lucide.createIcons({ node: buttonElement });
      };
      
      utterance.onerror = () => {
        updateSiriWaveActive(false);
        buttonElement.innerHTML = '<i data-lucide="volume-2" style="width:14px;height:14px"></i>';
        lucide.createIcons({ node: buttonElement });
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Voice-readout text-to-speech is not supported in this browser. Please try Chrome/Safari.");
    }
  };

  function updateSiriWaveActive(active) {
    siriWaveActive = active;
    const canvas = document.getElementById('siriCanvasWave');
    const bars = document.getElementById('siriStaticBars');
    
    if (!canvas || !bars) return;
    
    if (active) {
      canvas.style.display = 'block';
      bars.style.display = 'none';
      if (!siriWaveAnimationFrame) {
        animateSiriWave();
      }
    } else {
      canvas.style.display = 'none';
      bars.style.display = 'flex';
      if (siriWaveAnimationFrame) {
        cancelAnimationFrame(siriWaveAnimationFrame);
        siriWaveAnimationFrame = null;
      }
    }
  }

  function animateSiriWave() {
    const canvas = document.getElementById('siriCanvasWave');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let phase = 0;
    
    function draw() {
      if (!siriWaveActive) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw 3 layers of sine waves with different frequencies and HSL gradients
      const layers = [
        { amplitude: 7, frequency: 0.08, color: 'rgba(59, 130, 246, 0.65)', speed: 0.12 }, // Royal Blue
        { amplitude: 5, frequency: 0.12, color: 'rgba(168, 85, 247, 0.55)', speed: -0.08 }, // Violet
        { amplitude: 4, frequency: 0.16, color: 'rgba(16, 185, 129, 0.7)', speed: 0.15 }   // Emerald Green
      ];
      
      layers.forEach(layer => {
        ctx.beginPath();
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        
        for (let x = 0; x < canvas.width; x++) {
          // Bell curve envelope so the wave is pinched at the ends (matches Apple's premium voice Siri logo)
          const envelope = Math.sin((x / canvas.width) * Math.PI);
          const y = canvas.height / 2 + Math.sin(x * layer.frequency + phase * layer.speed) * layer.amplitude * envelope;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });
      
      phase += 0.45;
      siriWaveAnimationFrame = requestAnimationFrame(draw);
    }
    
    draw();
  }

  // Pre-load Web Speech voices so there is no lag on initial click
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }

  // Auto-init Kanban on page load
  document.addEventListener('DOMContentLoaded', () => {
    renderKanban();
  });
})();
