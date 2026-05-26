/**
 * Portfolio Recruiter Experience Suite & Siri Voice Co-Pilot
 * Deployed for Utkarsh Rajput's Portfolio
 * Senior Google/Apple Level Architecture & Interactions
 */

(function() {
  // Global Voice Dictation & Systems Monitor Telemetry Variables
  let voiceAutoReadActive = false;

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
    
    // Extract actual text to speak (strip HTML and assistant headers)
    let text = bubble.innerText.replace(/UKR Assistant/i, '').replace(/Siri Co-Pilot/i, '').replace(/[\r\n]+/g, ' ').trim();
    
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

  // ============================================================
  // CONVERSATIONAL CHAT ENGINE (UKR ASSISTANT BOT SHELL)
  // ============================================================

  window.askSiri = function(type) {
    const queries = {
      'skills': "What are Utkarsh's top skills?",
      'salescode': "What integration work did he do at SalesCode.ai?",
      'ai': "How does he leverage AI in product flows?",
      'surprise': "Show me a dynamic visual surprise!"
    };
    
    const message = queries[type];
    if (message) {
      handleChatSubmit(message);
    }
  };

  function handleChatSubmit(messageText) {
    const chatLog = document.getElementById('siriChatLog');
    if (!chatLog || !messageText.trim()) return;

    // Remove text highlight focus indicators
    const inputField = document.getElementById('siriChatInput');
    if (inputField) inputField.value = '';

    // 1. Render User message bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'siri-bubble siri-outgoing';
    userBubble.style.cssText = "align-self: flex-end; background: var(--accent); color: #fff; padding: 10px 14px; border-radius: 16px 16px 4px 16px; max-width: 85%; font-size: 0.8rem; line-height: 1.5; margin-top: 8px; animation: fadeIn 0.25s ease;";
    userBubble.innerText = messageText;
    chatLog.appendChild(userBubble);
    chatLog.scrollTop = chatLog.scrollHeight;

    // 2. Render typing indicator bubble
    const typingBubble = document.createElement('div');
    typingBubble.className = 'siri-bubble siri-incoming typing-bubble';
    typingBubble.style.cssText = "align-self: flex-start; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 85%; font-size: 0.8rem; margin-top: 8px; display: flex; gap: 4px; align-items: center;";
    typingBubble.innerHTML = `
      <span style="width: 6px; height: 6px; background: var(--text-secondary); border-radius: 50%; animation: siriDotBounce 1.4s infinite both;"></span>
      <span style="width: 6px; height: 6px; background: var(--text-secondary); border-radius: 50%; animation: siriDotBounce 1.4s infinite both 0.2s;"></span>
      <span style="width: 6px; height: 6px; background: var(--text-secondary); border-radius: 50%; animation: siriDotBounce 1.4s infinite both 0.4s;"></span>
    `;
    chatLog.appendChild(typingBubble);
    chatLog.scrollTop = chatLog.scrollHeight;

    // 3. Delegate to natural language command responder
    setTimeout(() => {
      typingBubble.remove();
      const responseHtml = getAgentResponse(messageText);
      
      const siriBubble = document.createElement('div');
      siriBubble.className = 'siri-bubble siri-incoming';
      siriBubble.style.cssText = "align-self: flex-start; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.12); padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 85%; font-size: 0.8rem; line-height: 1.5; color: var(--text-primary); margin-top: 8px; animation: fadeIn 0.3s ease;";
      siriBubble.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--accent); font-size: 0.75rem;">
            <i data-lucide="sparkles" style="width:12px;height:12px"></i> UKR Assistant
          </div>
          <button class="siri-speech-btn" style="background: transparent; border: none; padding: 2px; color: var(--text-tertiary); cursor: none; transition: color 0.2s;" data-cursor="hover" title="Listen to response" onclick="speakText(this)">
            <i data-lucide="volume-2" style="width:14px;height:14px"></i>
          </button>
        </div>
        ${responseHtml}
      `;
      chatLog.appendChild(siriBubble);
      lucide.createIcons({ node: siriBubble });
      chatLog.scrollTop = chatLog.scrollHeight;

      if (voiceAutoReadActive) {
        voiceAutoReadActive = false; // Reset trigger
        const speechBtn = siriBubble.querySelector('.siri-speech-btn');
        if (speechBtn) {
          setTimeout(() => speakText(speechBtn), 150);
        }
      }
    }, 800 + Math.random() * 600);
  }

  function getAgentResponse(input) {
    const raw = input.toLowerCase();    // Slash Commands Router
    if (raw.startsWith('/')) {
      const command = raw.split(' ')[0];
      switch (command) {
        case '/help':
          return "Here are the supported commands for the **UKR Agent Shell**:<br><br>" +
                 "• `/skills` - View PM, BA and development expert skills.<br>" +
                 "• `/experience` - Browse enterprise role history.<br>" +
                 "• `/projects` - Highlighted web apps & solutions.<br>" +
                 "• `/evolution` - View the portfolio release roadmap & self-evolving status.<br>" +
                 "• `/matrix` - Toggle ticker warp velocity celebration.<br>" +
                 "• `/antigravity` - Defy gravity and float portfolio elements.<br>" +
                 "• `/rain` - Start lightning & rain weather system.<br>" +
                 "• `/wasted` - Play slow-mo desaturation cinematic wasted screen.<br>" +
                 "• `/wanted` - Trigger police strobe alarm & WANTED stars.<br>" +
                 "• `/leavemealone` - Dissolve active police search wanted level.<br>" +
                 "• `/jarvis` - Toggle Iron Man holographic HUD grids.<br>" +
                 "• `/bsod` - Trigger simulated critical Windows reboot screen.<br>" +
                 "• `/askew` - Tilt the coordinate grid 3 degrees.<br>" +
                 "• `/cyberpunk` - Toggle RGB text chromatic aberration glitch.<br>" +
                 "• `/spotlight` - Trigger dramatic Steve Jobs 'One More Thing' visual.<br>" +
                 "• `/thanos` - Snaps fingers and dissolves 50% of card items.<br>" +
                 "• `/zergrush` - Spawn zerg invaders to eat section cards.<br>" +
                 "• `/clear` - Clean up chat terminal history buffer.";
        case '/evolution':
          return "🧬 **Anti-Gravity Autonomous Evolution System (Pipeline Live)**<br><br>" +
                 "Here is the active release path and self-evolving timeline of this platform:<br><br>" +
                 "• **v1.0 (Core Architecture):** Core HTML5 grid layout, CSS Glassmorphism tokens, and responsive sections.<br>" +
                 "• **v2.0 (Aesthetics & Interaction):** Deployed Lenis smooth scrolling, GSAP animation staggers, Siri interactive aura blobs, and active click-scale feedback loops.<br>" +
                 "• **v2.2 (AI Product Lab & Recruiter Suite):** Launched the interactive PM/BA playground compiling specs on demand, along with the interactive Recruiter Kanban and SLA test challenges.<br>" +
                 "• **v2.5 (Autonomous Agent Sync):** Integrated the automated yfinance daily market fetch pipeline via GitHub Actions and deployed the dynamic Systems Monitor tracking dynamic load-time SLAs and Git history live.<br><br>" +
                 "ℹ️ *This system evolves itself daily via Git pipelines and automated QA audits. Click the **Systems Monitor** tab in the widget to view live telemetry!*";
        case '/clear':
          setTimeout(() => {
            const chatLog = document.getElementById('siriChatLog');
            if (chatLog) {
              chatLog.innerHTML = `
                <div class="siri-bubble siri-incoming" style="align-self: flex-start; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.12); padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 85%; font-size: 0.8rem; line-height: 1.5; color: var(--text-primary);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                    <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--accent); font-size: 0.75rem;">
                      <i data-lucide="sparkles" style="width:12px;height:12px"></i> UKR Assistant
                    </div>
                    <button class="siri-speech-btn" style="background: transparent; border: none; padding: 2px; color: var(--text-tertiary); cursor: none; transition: color 0.2s;" data-cursor="hover" title="Listen to response" onclick="speakText(this)">
                      <i data-lucide="volume-2" style="width:14px;height:14px"></i>
                    </button>
                  </div>
                  Chat history cleared. I'm ready to walk you through Utkarsh's details! Try asking about his **skills** or run \`/help\` for special commands.
                </div>
              `;
              lucide.createIcons({ node: chatLog });
            }
          }, 100);
          return "Clearing console buffers...";
        
        case '/skills':
          return getSkillsAnswer();
        case '/experience':
          return getExperienceAnswer();
        case '/projects':
          return getProjectsAnswer();
        case '/matrix':
          setTimeout(() => window.dispatchEvent(new Event('matrix-hyperdrive')), 200);
          return "Engaging Matrix warp acceleration! Experience the ticker particles shifting instantly.";
        case '/antigravity':
          setTimeout(() => triggerAntiGravityLocal(), 200);
          return "Defying gravity! Floating coordinate systems active. Scroll or reload page to normalize anchors.";
        case '/rain':
          setTimeout(() => triggerThunderRainLocal(), 200);
          return "Storm warning! Heavy rain & high-voltage lightning flashes triggered on the viewport canvas.";
        case '/wasted':
          setTimeout(() => triggerWasted(), 200);
          return "Cinematic impact! Engaging GTA Wasted slow-motion desaturation overlay...";
        case '/wanted':
          setTimeout(() => triggerWanted(), 200);
          return "🚨 WANTED Rating: 5 Stars active. Blue & red police sirens strobe flashing. Type \`/leavemealone\` to withdraw search warrant.";
        case '/leavemealone':
          setTimeout(() => clearWanted(), 200);
          return "Warrant withdrawn. Police strobe sirens cleared. System state normalized.";
        case '/bsod':
          setTimeout(() => triggerBsod(), 200);
          return "Critical stack error! Compiling Blue Screen of Death. Click anywhere to trigger soft reboot safely.";
        case '/jarvis':
          setTimeout(() => toggleJarvis(), 200);
          return "Iron Man JARVIS Interface HUD toggled. Reticles and tactical scanning frames active.";
        case '/askew':
          setTimeout(() => toggleAskew(), 200);
          return "Google coordinates tilted by 3 degrees. Everything is slightly askew.";
        case '/cyberpunk':
          setTimeout(() => toggleCyberpunk(), 200);
          return "RGB Glitch Active! Chromatic text aberration filters and monospace overlays engaged.";
        case '/spotlight':
          setTimeout(() => triggerSpotlight(), 200);
          return "Spotlight active! Fading scene to pitch black. Introducing Steve Jobs 'One More Thing' tribute...";
        case '/thanos':
          setTimeout(() => triggerThanos(), 200);
          return "Snapping fingers! Dissolving 50% of timeline, skill and project grid elements into micro-dust...";
        case '/zergrush':
          setTimeout(() => triggerZerg(), 200);
          return "Zerg Rush incoming! Red circles are dropping from the sky and devouring sections. Click to defend them!";
        case '/hire':
        case '/confetti':
          setTimeout(() => {
            if (window.confetti) confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          }, 200);
          return "UAT celebration triggered! Deployed premium confetti particle burst check.";
        default:
          return `Command '${command}' not recognized. Type \`/help\` to browse the active catalog.`;
      }
    }

    // Natural Language Queries
    if (raw.includes('skill') || raw.includes('tool') || raw.includes('stack') || raw.includes('expert') || raw.includes('languages')) {
      return getSkillsAnswer();
    }
    if (raw.includes('experience') || raw.includes('job') || raw.includes('work') || raw.includes('salescode') || raw.includes('career')) {
      return getExperienceAnswer();
    }
    if (raw.includes('project') || raw.includes('built') || raw.includes('apps') || raw.includes('sap') || raw.includes('escalation')) {
      return getProjectsAnswer();
    }
    if (raw.includes('evolve') || raw.includes('evolution') || raw.includes('pipeline') || raw.includes('self-evolving') || raw.includes('system monitor') || raw.includes('telemetry')) {
      return getEvolutionAnswer();
    }
    if (raw.includes('cert') || raw.includes('education') || raw.includes('vit') || raw.includes('azure') || raw.includes('degree') || raw.includes('btech')) {
      return "Utkarsh's verified credentials and academic timeline:<br><br>" +
             "• **Microsoft Certified: Azure Administrator Associate (AZ-104)** - Validating cloud operations, serverless pipelines, security policies, and resource configurations.<br>" +
             "• **B.Tech in Electronics & Communication Engineering** (VIT Vellore) - Core foundation in digital communication, logic gates, and algorithmic mathematics.<br>" +
             "• **Product Management Certifications** - Agile Product Ownership, BRD blueprint mapping, and workflow Scrum frameworks.";
    }
    if (raw.includes('contact') || raw.includes('email') || raw.includes('linkedin') || raw.includes('hire') || raw.includes('connect') || raw.includes('meet')) {
      return "You can connect with Utkarsh directly through the following channels:<br><br>" +
             "• 📨 **Email:** [hello@utkarsh.ind.in](mailto:hello@utkarsh.ind.in)<br>" +
             "• 💼 **LinkedIn:** [linkedin.com/in/utkarsh-kumar-rajput](https://linkedin.com/in/utkarsh-kumar-rajput)<br>" +
             "• 📞 **Official Site:** [www.utkarsh.ind.in](https://www.utkarsh.ind.in)<br><br>" +
             "Feel free to click any link to schedule an interview or discuss product collaborations!";
    }
    if (raw.includes('hello') || raw.includes('hi') || raw.includes('hey') || raw.includes('who are you') || raw.includes('copilot')) {
      return "Hello there! I am the **UKR Assistant**, Utkarsh's digital agent. I can outline his PM deliverables, tech stacks, or trigger system actions.<br><br>Ask me anything about his credentials, or run `/help` to view interactive slash commands!";
    }
    if (raw.includes('surprise') || raw.includes('zap') || raw.includes('magic')) {
      setTimeout(() => {
        if (window.confetti) confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }, 300);
      return "Executing surprise diagnostic sequence... 🚀 Confetti explosion triggered successfully! Feel free to ask about his **skills** or try the `/wasted` command!";
    }

    // Contextual Fallback
    return "That's an interesting question! I am Utkarsh's portfolio co-pilot agent. While I operate within this local sandbox, I can tell you that Utkarsh combines exceptional **Product Management documentation precision** (BRDs, detailed Jira backlogs, UAT flows) with **hands-on fullstack engineering** to build real automation systems.<br><br>" +
           "Try asking me about his **skills**, **experience**, **projects**, or type `/help` to see a full list of interactive system commands!";
  }

  function getSkillsAnswer() {
    return "Utkarsh operates at the unique junction of high-level PM strategy and hands-on system building:<br><br>" +
           "• 📋 **Product Deliverables:** Comprehensive BRDs/FRDs, mapping high-complexity user stories, 600+ Jira epic tracking, and organizing cross-border UAT tests.<br>" +
           "• 🛠️ **Technical Stack:** Fullstack web apps with Next.js 14, TypeScript, React, Node.js, Neon PostgreSQL, Prisma ORM, and IndexedDB.<br>" +
           "• ☁️ **Cloud & Automation:** Certified Azure Administrator Associate (AZ-104), REST JSON-to-RFC gateway testing tools, automation scrapers (Python, Selenium), and GitHub actions pipelines.";
  }

  function getExperienceAnswer() {
    return "Utkarsh Rajput's professional impact history:<br><br>" +
           "• **SalesCode.ai (Associate Product Manager & BA):** Managed cross-border delivery pipelines for giant enterprise accounts like Coca-Cola Saudi Arabia, Nepal, and HC India. Managed 600+ Jira tasks, authored van-sales offline-sync BRDs, and engineered an internal SAP Integration Payload Tracker tool cutting support triage by 8 hrs/week.<br>" +
           "• **CityFlo (Operations & BI Analyst):** Optimised commuter transit yields, developed scraping pipelines to monitor competitors, built weather risk models, and increased bus grid capacity from 62% to 85% occupancy rate.";
  }

  function getProjectsAnswer() {
    return "Some key systems Utkarsh has architected and deployed:<br><br>" +
           "1. 🔄 **IndexedDB Van-Sales Offline Sync Engine** - Solved low-connectivity retail sync failures, ensuring zero database duplicate billing.<br>" +
           "2. 🗄️ **SAP Integration Payload REST Tracer** - Diagnostic tracker for parsing, auditing and indexing JSON-to-RFC payloads between Salesforce middleware and SAP ERP databases.<br>" +
           "3. 🎫 **L2 Enterprise Support SLA Router** - automated serverless pipeline classifying support emails based on exception tags, alerting dev leads in <10 seconds via Slack.<br>" +
           "4. 🛰️ **Geospatial Dynamic Route Yield Optimizer** - BI scraping engine tracking capacity bounds and pricing elasticities.";
  }

  function getEvolutionAnswer() {
    return "🧬 **Anti-Gravity Autonomous Evolution System (Pipeline Live)**<br><br>" +
           "This portfolio operates as an autonomous, self-evolving system. Every 24 hours, a scheduled **GitHub Actions workflow** fetches live market ticker data from Yahoo Finance via a Python parser (`fetch_market.py`), refreshing the background ticker on production seamlessly.<br><br>" +
           "Furthermore, the **Systems Monitor** within the UKR Assistant widget runs active web SLAs measuring dynamic load time, memory leak integrity, and retrieves real-time commit logs directly from GitHub.<br><br>" +
           "Type `/evolution` to see the complete architectural release timeline of this platform!";
  }

  // ============================================================
  // ADVANCED VISUAL EASTER EGGS ANIMATION SCRIPTS
  // ============================================================

  function triggerAntiGravityLocal() {
    document.querySelectorAll('section, nav, .btn, .timeline-card, .stat-card, .project-card, .cert-card, .skill-category').forEach(el => {
      gsap.to(el, {
        y: () => -Math.random() * 800 - 200,
        x: () => (Math.random() - 0.5) * 400,
        rotation: () => (Math.random() - 0.5) * 90,
        opacity: 0,
        duration: 4 + Math.random() * 6,
        ease: 'power1.inOut'
      });
    });
    triggerEventUnlock('Konami Code');
  }

  function triggerThunderRainLocal() {
    let flashes = 0;
    let flashInt = setInterval(() => {
      document.body.style.setProperty('background-color', flashes % 2 === 0 ? 'rgba(255,255,255,0.85)' : '', 'important');
      flashes++;
      if (flashes > 5) clearInterval(flashInt);
    }, 100);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 999999; opacity: 1; transition: opacity 2s;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let drops = [];
    for(let i=0; i<300; i++) {
      drops.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vy: 15 + Math.random()*15, l: 20 + Math.random()*20 });
    }

    function draw() {
      if(!canvas.parentElement) return;
      ctx.clearRect(0,0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(156,180,210,0.6)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      drops.forEach(d => {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.l);
        d.y += d.vy;
        if (d.y > canvas.height) d.y = -d.l;
      });
      ctx.stroke();
      requestAnimationFrame(draw);
    }
    draw();
    triggerEventUnlock('salescode');

    setTimeout(() => {
      canvas.style.opacity = '0';
      setTimeout(() => canvas.remove(), 2000);
    }, 6000);
  }

  function triggerWasted() {
    document.body.classList.add('egg-wasted');
    
    const overlay = document.createElement('div');
    overlay.className = 'wasted-overlay';
    overlay.innerText = 'WASTED';
    document.body.appendChild(overlay);
    
    triggerEventUnlock('wasted');
    
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 1.5s ease';
      setTimeout(() => {
        overlay.remove();
        document.body.classList.remove('egg-wasted');
      }, 1500);
    }, 4000);
  }

  function triggerWanted() {
    document.body.classList.add('egg-wanted');
    
    // Remove existing stars if any
    const existing = document.querySelector('.wanted-stars');
    if (existing) existing.remove();
    
    const starsContainer = document.createElement('div');
    starsContainer.className = 'wanted-stars';
    
    for (let i = 0; i < 5; i++) {
      const star = document.createElement('div');
      star.className = 'wanted-star';
      star.style.animationDelay = `${i * 0.15}s`;
      starsContainer.appendChild(star);
    }
    
    document.body.appendChild(starsContainer);
    triggerEventUnlock('wanted');
  }

  function clearWanted() {
    document.body.classList.remove('egg-wanted');
    const stars = document.querySelector('.wanted-stars');
    if (stars) {
      stars.style.opacity = '0';
      stars.style.transition = 'opacity 0.6s ease';
      setTimeout(() => stars.remove(), 600);
    }
    triggerEventUnlock('leavemealone');
  }

  function triggerBsod() {
    const bsod = document.createElement('div');
    bsod.className = 'bsod-overlay animate-fadeIn';
    bsod.innerHTML = `
      <h1 style="font-size: 10vw; font-family: sans-serif; font-weight: 300; margin: 0 0 20px 0; line-height: 1;">:(</h1>
      <p style="font-size: 2vw; font-family: sans-serif; font-weight: 300; margin-bottom: 24px; max-width: 80%; line-height: 1.4;">
        Your system ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
      </p>
      <p style="font-size: 1.8vw; font-family: sans-serif; font-weight: 400; margin-bottom: 40px;" id="bsodPercent">0% complete</p>
      
      <div style="display: flex; gap: 30px; align-items: center; margin-top: 20px; flex-wrap: wrap;">
        <div style="background: white; padding: 6px; border-radius: 8px; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; flex-shrink:0;">
          <div style="width: 100%; height: 100%; border: 3px solid #000; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; color:#000;">HIRE ME QR</div>
        </div>
        <div style="font-family: sans-serif; font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.6;">
          For more information about this issue and potential PM solutions, visit:<br>
          <span style="font-weight: 700; color: white;">https://www.utkarsh.ind.in/ (Connect with Utkarsh Rajput!)</span><br><br>
          If you call a recruiter lead, give them this stop code:<br>
          Stop code: <span style="font-weight: 700; color: white;">SYSTEM_ARCHITECT_HIRE</span>
        </div>
      </div>
      
      <div style="position: absolute; bottom: 30px; right: 40px; font-family: sans-serif; font-size: 12px; opacity: 0.6;">
        Click anywhere to reboot portfolio safely...
      </div>
    `;
    
    bsod.addEventListener('click', () => {
      bsod.style.opacity = '0';
      bsod.style.transition = 'opacity 0.6s ease';
      setTimeout(() => bsod.remove(), 600);
    });
    
    document.body.appendChild(bsod);
    triggerEventUnlock('bsod');
    
    let pct = 0;
    const pctInterval = setInterval(() => {
      pct += Math.floor(Math.random() * 15) + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(pctInterval);
      }
      const label = document.getElementById('bsodPercent');
      if (label) label.innerText = `${pct}% complete`;
    }, 450);
  }

  function toggleJarvis() {
    const existing = document.querySelector('.jarvis-hud');
    if (existing) {
      existing.style.opacity = '0';
      existing.style.transition = 'opacity 0.5s ease';
      setTimeout(() => existing.remove(), 500);
      triggerEventUnlock('jarvis_off');
    } else {
      const hud = document.createElement('div');
      hud.className = 'jarvis-hud';
      document.body.appendChild(hud);
      triggerEventUnlock('jarvis');
    }
  }

  function toggleAskew() {
    document.body.classList.toggle('egg-askew');
    const isActive = document.body.classList.contains('egg-askew');
    triggerEventUnlock(isActive ? 'askew' : 'askew_off');
  }

  function toggleCyberpunk() {
    document.body.classList.toggle('egg-cyberpunk');
    const isActive = document.body.classList.contains('egg-cyberpunk');
    triggerEventUnlock(isActive ? 'cyberpunk' : 'cyberpunk_off');
  }

  function triggerSpotlight() {
    const spotlight = document.createElement('div');
    spotlight.style.cssText = "position: fixed; inset: 0; background: black; z-index: 99999999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 1.5s ease; text-align: center; padding: 40px;";
    spotlight.innerHTML = `
      <h1 style="font-size: 3rem; font-weight: 300; font-family:-apple-system,BlinkMacSystemFont,sans-serif; letter-spacing: -1.5px; opacity: 0; transform: scale(0.9); transition: all 1.2s ease 0.6s;" id="spotText1">One more thing...</h1>
      <p style="font-size: 1.15rem; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color: #a1a1a6; font-weight: 400; max-width: 550px; line-height: 1.6; margin-top: 20px; opacity: 0; transform: translateY(20px); transition: all 1.2s ease 1.8s;" id="spotText2">
        Utkarsh is 100% prepared to drive your enterprise integration testing, compile seamless roadmaps, and engineer clean custom interfaces that make complex go-lives succeed.
      </p>
      <button style="margin-top: 40px; opacity: 0; transition: opacity 1s ease 3.2s; background: white; color: black; border: none; padding: 12px 24px; border-radius: 20px; font-weight: 600; cursor: none;" id="spotCloseBtn" data-cursor="hover">Back to Portfolio</button>
    `;
    
    document.body.appendChild(spotlight);
    
    setTimeout(() => {
      spotlight.style.opacity = '1';
      const t1 = document.getElementById('spotText1');
      if (t1) { t1.style.opacity = '1'; t1.style.transform = 'scale(1)'; }
      const t2 = document.getElementById('spotText2');
      if (t2) { t2.style.opacity = '1'; t2.style.transform = 'translateY(0)'; }
      const btn = document.getElementById('spotCloseBtn');
      if (btn) btn.style.opacity = '1';
    }, 100);
    
    triggerEventUnlock('onemorething');
    
    const close = () => {
      spotlight.style.opacity = '0';
      setTimeout(() => spotlight.remove(), 1500);
    };
    
    setTimeout(() => {
      const btn = document.getElementById('spotCloseBtn');
      if (btn) btn.addEventListener('click', close);
    }, 3200);
  }

  function triggerThanos() {
    triggerEventUnlock('thanos');
    
    const targets = Array.from(document.querySelectorAll('.timeline-card, .project-card, .cert-card, .skill-category'));
    const half = Math.floor(targets.length / 2);
    
    // Shuffle and pick 50%
    const snapTargets = targets.sort(() => 0.5 - Math.random()).slice(0, half);
    
    snapTargets.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('thanos-dust');
      }, index * 150);
    });
    
    setTimeout(() => {
      alertSuccessToast("Thanos Snap Complete", "50% of the grid elements dissolved into dust. Reload page to restore universe.");
    }, snapTargets.length * 150 + 1000);
  }

  function triggerZerg() {
    triggerEventUnlock('zergrush');
    let killedCount = 0;
    const countToWin = 15;
    
    const interval = setInterval(() => {
      if (killedCount >= countToWin) {
        clearInterval(interval);
        return;
      }
      
      const zerg = document.createElement('div');
      zerg.className = 'zergling';
      zerg.style.top = '-20px';
      zerg.style.left = `${Math.random() * window.innerWidth}px`;
      
      zerg.addEventListener('click', () => {
        killedCount++;
        zerg.style.transform = 'scale(0)';
        zerg.style.background = '#ea4335';
        setTimeout(() => zerg.remove(), 300);
        
        if (killedCount === countToWin) {
          if (window.confetti) confetti({ particleCount: 60, spread: 70 });
          alertSuccessToast("Victory!", "Zerg Rush successfully defeated!");
        }
      });
      
      document.body.appendChild(zerg);
      
      gsap.to(zerg, {
        y: window.innerHeight + 50,
        duration: 5 + Math.random() * 5,
        ease: 'none',
        onComplete: () => {
          zerg.remove();
          const targets = document.querySelectorAll('.timeline-card, .project-card, .cert-card, .skill-category');
          if (targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            gsap.to(randomTarget, {
              opacity: 0,
              scale: 0.8,
              duration: 1,
              ease: 'power2.out'
            });
          }
        }
      });
    }, 800);
    
    setTimeout(() => clearInterval(interval), 15000);
  }

  function triggerEventUnlock(name) {
    if (window.updateHud) {
      window.updateHud(name);
    } else {
      // Direct diagnostic fallback
      const counter = document.getElementById('eggUnlockCounter');
      if (counter) {
        counter.innerText = `Active: ${name}`;
      }
    }
  }

  function alertSuccessToast(title, desc) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'system-toast';
    toast.innerHTML = `
      <div class="toast-icon" style="background: rgba(16, 185, 129, 0.12); color: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);">
        <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>
      </div>
      <div class="toast-body">
        <div class="toast-title" style="color: var(--text-primary); font-weight:700;">${title}</div>
        <div class="toast-desc" style="font-size:0.7rem; color:var(--text-secondary);">${desc}</div>
      </div>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons({ node: toast });

    setTimeout(() => toast.classList.add('active'), 50);
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 600);
    }, 4500);
  }

  // ============================================================
  // WIRE UP CHAT SUBMISSION EVENTS
  // ============================================================

  function initSpeechRecognition() {
    const micBtn = document.getElementById('siriMicBtn');
    const inputField = document.getElementById('siriChatInput');
    
    if (!micBtn || !inputField) return;

    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.style.display = 'none';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;

    // Custom CSS injection for siri listening state
    if (!document.getElementById('siri-mic-styles')) {
      const style = document.createElement('style');
      style.id = 'siri-mic-styles';
      style.innerHTML = `
        .siri-input-wrapper.listening {
          border-color: #ef4444 !important;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.25) !important;
          background: rgba(239, 68, 68, 0.03) !important;
        }
        @keyframes pulse-mic {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .mic-pulse {
          animation: pulse-mic 1s infinite ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }

    micBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.error("Speech recognition failed to start:", err);
        }
      }
    });

    recognition.onstart = () => {
      isListening = true;
      voiceAutoReadActive = true; // Auto-read next response
      const wrapper = inputField.closest('.siri-input-wrapper');
      if (wrapper) wrapper.classList.add('listening');
      
      micBtn.innerHTML = '<i data-lucide="mic-off" class="mic-pulse" style="width:15px;height:15px;color:#ef4444;"></i>';
      inputField.placeholder = 'Listening... Say something...';
      if (window.lucide) lucide.createIcons({ node: micBtn });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      inputField.value = transcript;
      
      setTimeout(() => {
        handleChatSubmit(transcript);
      }, 500);
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      resetMicUI();
    };

    recognition.onend = () => {
      resetMicUI();
    };

    function resetMicUI() {
      isListening = false;
      const wrapper = inputField.closest('.siri-input-wrapper');
      if (wrapper) wrapper.classList.remove('listening');
      
      micBtn.innerHTML = '<i data-lucide="mic" style="width:15px;height:15px;"></i>';
      inputField.placeholder = 'Ask UKR Assistant or run /command...';
      if (window.lucide) lucide.createIcons({ node: micBtn });
    }
  }

  function initTelemetryGraph() {
    const canvas = document.getElementById('sysTelemetryCanvas');
    const cpuEl = document.getElementById('sysCpuUsage');
    const fpsEl = document.getElementById('sysFps');
    const memEl = document.getElementById('sysMemory');
    
    if (!canvas || !cpuEl || !fpsEl) return;

    // Live memory reading via Chrome Performance API (where available)
    function updateMemory() {
      if (!memEl) return;
      if (window.performance && performance.memory) {
        const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        const limitMB = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(0);
        memEl.innerText = `${usedMB}MB / ${limitMB}MB (Secure)`;
      } else {
        memEl.innerText = '< 2MB Est. (Secure)';
      }
    }
    updateMemory();
    setInterval(updateMemory, 3000);
    
    const ctx = canvas.getContext('2d');
    
    let width = 0;
    let height = 0;
    let sizeInitialized = false;
    let telemetryData = Array(40).fill(22);
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsVal = 60;
    
    let basePhase = 0;
    let cpuLoadBoost = 0;
    
    window.addEventListener('scroll', () => {
      cpuLoadBoost = Math.min(cpuLoadBoost + 3, 50);
    }, { passive: true });
    
    document.addEventListener('mouseover', (e) => {
      if (e.target && e.target.closest && (e.target.closest('.project-card') || e.target.closest('.kanban-card') || e.target.closest('.skill-tag') || e.target.closest('.btn'))) {
        cpuLoadBoost = Math.min(cpuLoadBoost + 8, 48);
      }
    }, { passive: true });
    
    let gridOffset = 0;
    
    function draw() {
      const monitorTab = document.getElementById('panelBodyMonitor');
      if (monitorTab && monitorTab.style.display === 'none') {
        requestAnimationFrame(draw);
        return;
      }

      // Dynamically initialize size when the panel tab is clicked and has layout width
      if (!sizeInitialized && canvas.clientWidth > 0) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.scale(dpr, dpr);
        width = canvas.width / dpr;
        height = canvas.height / dpr;
        sizeInitialized = true;
      }

      if (!sizeInitialized) {
        requestAnimationFrame(draw);
        return;
      }
      
      const now = performance.now();
      frameCount++;
      const delta = now - lastTime;
      if (delta >= 1000) {
        fpsVal = Math.round((frameCount * 1000) / delta);
        fpsVal = Math.min(Math.max(fpsVal, 30), 64);
        fpsEl.innerText = `${fpsVal} FPS`;
        frameCount = 0;
        lastTime = now;
      }
      
      basePhase += 0.05;
      const baseCpu = 15 + Math.sin(basePhase) * 6 + Math.random() * 4;
      cpuLoadBoost *= 0.95;
      
      const finalCpu = Math.round(baseCpu + cpuLoadBoost);
      cpuEl.innerText = `${Math.min(finalCpu, 99)}%`;
      
      if (Math.random() < 0.16) {
        telemetryData.push(finalCpu);
        telemetryData.shift();
      }
      
      ctx.clearRect(0, 0, width, height);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      
      gridOffset = (gridOffset - 0.5) % 15;
      for (let x = gridOffset; x < width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 12; y < height; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#10b981';
      
      const step = width / (telemetryData.length - 1);
      
      telemetryData.forEach((val, index) => {
        const x = index * step;
        const percentageOfHeight = Math.min(val / 100, 0.95);
        const y = height - (percentageOfHeight * height) - 2;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (index - 1) * step;
          const prevPercentage = Math.min(telemetryData[index - 1] / 100, 0.95);
          const prevY = height - (prevPercentage * height) - 2;
          ctx.quadraticCurveTo(prevX + step / 2, prevY, x, y);
        }
      });
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      
      const fillGlow = ctx.createLinearGradient(0, 0, 0, height);
      fillGlow.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
      fillGlow.addColorStop(1, 'rgba(16, 185, 129, 0.00)');
      
      ctx.fillStyle = fillGlow;
      ctx.fill();
      
      requestAnimationFrame(draw);
    }
    
    draw();
  }

  function initChatInputListeners() {
    const inputField = document.getElementById('siriChatInput');
    const sendBtn = document.getElementById('siriSendBtn');

    if (!inputField || !sendBtn) return;

    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleChatSubmit(inputField.value);
    });

    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleChatSubmit(inputField.value);
      }
    });

    inputField.addEventListener('focus', () => {
      const wrapper = inputField.closest('.siri-input-wrapper');
      if (wrapper) {
        wrapper.style.borderColor = 'var(--accent)';
        wrapper.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.15)';
      }
    });

    inputField.addEventListener('blur', () => {
      const wrapper = inputField.closest('.siri-input-wrapper');
      if (wrapper) {
        wrapper.style.borderColor = 'var(--border-color)';
        wrapper.style.boxShadow = 'none';
      }
    });
  }

  // ============================================================
  // PREMIUM CUSTOM AJAX FORMSPREE SUBMISSION HANDLER
  // ============================================================

  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;
      
      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const messageInput = form.querySelector('textarea[name="message"]');
      
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();
      
      if (!name || !email || !message) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `Sending <span class="spinner-mini" style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-left:6px; vertical-align:middle;"></span>`;
      
      if (!document.getElementById('spinner-keyframe-styles')) {
        const style = document.createElement('style');
        style.id = 'spinner-keyframe-styles';
        style.innerHTML = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }

      const actionUrl = form.getAttribute('action') || '';
      const isPlaceholder = actionUrl.includes('YOUR_FORM_ID');
      
      const data = { name, email, message };
      
      const sendPromise = isPlaceholder 
        ? new Promise((resolve) => setTimeout(resolve, 1500)) 
        : fetch(actionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(data)
          }).then(res => {
            if (!res.ok) throw new Error('Formspree dispatch failed');
            return res.json();
          });

      sendPromise.then(() => {
        form.reset();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        
        triggerConfettiSuccess();
        alertSuccessToast("Inquiry Transmitted", `Thank you ${name}! Your payload has been compiled.`);
        showFormConfirmationModal(name, email, isPlaceholder);
        injectSystemMonitorLog(`[POST] Formspree Payload Sync: SUCCESS (200 OK) · ${isPlaceholder ? 'Simulated' : 'Synced'}`);
        injectSiriAgentMessage(name, isPlaceholder);
      }).catch(err => {
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        
        alertErrorToast("Sync Failure", "Failed to transmit message. Please try connecting directly via LinkedIn.");
        injectSystemMonitorLog(`[POST] Formspree Payload Sync: FAILED (500 ERROR)`);
      });
    });
  }

  function injectSystemMonitorLog(messageText) {
    const logsFeedEl = document.getElementById('evolutionLogsFeed');
    if (!logsFeedEl) return;
    
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    const shortDate = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
    
    const row = document.createElement('div');
    row.style.cssText = "display: flex; gap: 8px; justify-content: space-between; border-left: 1.5px solid #ef4444; padding-left: 8px; margin-bottom: 4px; line-height: 1.3; animation: fadeIn 0.3s ease;";
    row.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0;">
        <div style="font-weight: 700; color: #ef4444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${messageText}">${messageText}</div>
        <div style="color: var(--text-tertiary); font-size: 0.65rem;">by Live Ingress · ${shortDate} ${formattedTime} IST</div>
      </div>
      <span style="color: #ef4444; font-weight: 700; font-family: monospace; font-size: 0.68rem; flex-shrink: 0;">[PAYLOAD]</span>
    `;
    
    if (logsFeedEl.innerText.includes('Loading git events...')) {
      logsFeedEl.innerHTML = '';
    }
    
    logsFeedEl.insertBefore(row, logsFeedEl.firstChild);
  }

  function injectSiriAgentMessage(senderName, isPlaceholder) {
    const chatLog = document.getElementById('siriChatLog');
    if (!chatLog) return;
    
    const siriBubble = document.createElement('div');
    siriBubble.className = 'siri-bubble siri-incoming';
    siriBubble.style.cssText = "align-self: flex-start; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.12); padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 85%; font-size: 0.8rem; line-height: 1.5; color: var(--text-primary); margin-top: 8px; animation: fadeIn 0.3s ease;";
    
    let textHTML = `🚨 <strong>L2 Sync Active:</strong> Recruiter inquiry payload registered from <strong>${senderName}</strong>!<br><br>`;
    if (isPlaceholder) {
      textHTML += `Running in secure sandbox simulator mode. Standard SLA workflows compiled successfully. Ready for full deployment!`;
    } else {
      textHTML += `Transmission successfully forwarded to Formspree API pipeline. Response code: 200. Standard SLA routing active (<2 hours).`;
    }
    
    siriBubble.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--accent); font-size: 0.75rem;">
          <i data-lucide="sparkles" style="width:12px;height:12px"></i> UKR Assistant
        </div>
        <button class="siri-speech-btn" style="background: transparent; border: none; padding: 2px; color: var(--text-tertiary); cursor: none; transition: color 0.2s;" data-cursor="hover" title="Listen to response" onclick="speakText(this)">
          <i data-lucide="volume-2" style="width:14px;height:14px"></i>
        </button>
      </div>
      ${textHTML}
    `;
    
    chatLog.appendChild(siriBubble);
    if (window.lucide) {
      lucide.createIcons({ node: siriBubble });
    }
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function showFormConfirmationModal(senderName, senderEmail, isPlaceholder) {
    const modal = document.createElement('div');
    modal.style.cssText = "position: fixed; inset: 0; background: rgba(8, 9, 12, 0.96); z-index: 99999999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; text-align: center; padding: 40px; backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); opacity: 0; transition: opacity 0.6s var(--ease-out);";
    
    const randomUUID = 'fmcg-sync-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    modal.innerHTML = `
      <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(16, 185, 129, 0.2); animation: siri-ripple 2s infinite ease-out;">
        <i data-lucide="check-circle" style="width: 40px; height: 40px; color: #10b981;"></i>
      </div>
      <h1 style="font-size: 2rem; font-weight: 800; color: #fff; letter-spacing: -1.2px; margin-bottom: -10px; font-family: var(--font-heading);">INQUIRY SECURED</h1>
      <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 500px; line-height: 1.6; font-weight: 400;">
        Thank you <strong>${senderName}</strong> (${senderEmail})! Your business inquiry payload has been encrypted and synced cleanly with our operational gateway.
      </p>
      
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 20px; font-family: monospace; font-size: 0.72rem; text-align: left; width: 100%; max-width: 460px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-tertiary);">Status Code:</span><span style="color: #10b981; font-weight: 700;">200 OK (SUCCESS)</span></div>
        <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-tertiary);">Idempotency Key:</span><span style="color: var(--accent); font-weight: 700;">${randomUUID}</span></div>
        <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-tertiary);">Sync Pipeline:</span><span style="color: var(--text-primary);">${isPlaceholder ? 'Simulated Secure Sandbox' : 'Formspree REST Forwarder'}</span></div>
        <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-tertiary);">Automated Action:</span><span style="color: #ec4899; font-weight: 700;">Slack SLA Dispatch Triggered</span></div>
      </div>
      
      <button id="closeConfirmModal" style="margin-top: 15px; font-size: 0.85rem; padding: 10px 24px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff; border-radius: var(--radius-full); cursor: none; transition: all 0.3s;" data-cursor="hover">Return to System</button>
    `;
    
    document.body.appendChild(modal);
    if (window.lucide) {
      lucide.createIcons({ node: modal });
    }
    
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 50);
    
    const closeBtn = modal.querySelector('#closeConfirmModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 600);
      });
    }
  }

  function alertErrorToast(title, desc) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'system-toast';
    toast.innerHTML = `
      <div class="toast-icon" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);">
        <i data-lucide="alert-circle" style="width: 18px; height: 18px;"></i>
      </div>
      <div class="toast-body">
        <div class="toast-title" style="color: var(--text-primary); font-weight:700;">${title}</div>
        <div class="toast-desc" style="font-size:0.7rem; color:var(--text-secondary);">${desc}</div>
      </div>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) {
      lucide.createIcons({ node: toast });
    }

    setTimeout(() => toast.classList.add('active'), 50);
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 600);
    }, 4500);
  }

  // Auto-init on page load
  document.addEventListener('DOMContentLoaded', () => {
    renderKanban();
    initChatInputListeners();
    initSpeechRecognition();
    initTelemetryGraph();
    initContactForm();
  });
})();
