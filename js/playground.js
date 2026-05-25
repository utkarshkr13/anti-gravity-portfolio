/* ============================================================
   AI-FIRST PRODUCT LAB — Dynamic PM & BA Specification Workspace
   ============================================================ */

(function () {
  'use strict';

  // Product specification database filled with authentic PM and BA artifacts
  const specsData = {
    fmcg: {
      title: "FMCG Offline-First Van Sales & Inventory Triage",
      metrics: "Goal: 99.9% Sync Reliability · Redundancy Factor: 0% duplicate submissions",
      brief: `# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## 1. Executive Summary
Field distribution agents selling products directly from vans face frequent connectivity drops in rural and high-density zones. This leads to duplicate order submissions, cart value calculation discrepancies, and inventory desynchronization.

## 2. Product Objectives
* **Idempotent Ordering**: Guarantee that click-spamming or duplicate offline payloads do not create redundant invoices.
* **Smart Offline Caching**: Securely track real-time stock levels inside a client-side IndexedDB database.
* **Reconciliation Engine**: Re-sync with SAP ERP backend seamlessly as soon as connection is restored.

## 3. Core Success Metrics
* **Inventory Accuracy**: 100% agreement between physical van stock and digital database registers.
* **Sync Latency**: Zero-loss background sync in less than 3 seconds post-recovery.`,
      backlog: `# JIRA BACKLOG & USER STORIES
## Epic: VAN-SYNC-01: Offline-First Merchandising & Dual-Database Sync
### User Story VAN-101: Offline stock receipt generation
**As a** Van Merchandiser
**I want to** scan stock inventory and submit invoices offline
**So that** I can close transactions without network disruption.

### Acceptance Criteria (Given-When-Then)
* **Scenario: Internet connection is unavailable**
  * **Given** the merchandiser has no network connectivity
  * **When** they submit a stock receipt invoice
  * **Then** the application must cache the receipt with a unique transaction UUID in local IndexedDB.
  * **And** show a translucent amber status indicating "Order Cached Offline".

* **Scenario: Network recovery auto-sync**
  * **Given** the application has cached offline receipts
  * **When** internet connectivity is re-established (detected via window.online)
  * **Then** initiate a background POST request with an Idempotency Key in the header.
  * **And** transition status to "Synchronized" upon 200 OK.`,
      qa: `# TEST CASES & EDGE CASE VALIDATIONS
## 1. Boundary & Precision Validations
* **TC-VAN-201 (Decimal Precision)**: Verify that dynamic discounts on bulk orders do not cause floating-point rounding errors (e.g. 0.1 + 0.2 = 0.30000000004). Force rounding to exactly 2 decimal places in client-side calculator.
* **TC-VAN-202 (Negative Quantities)**: Confirm that field agents cannot manually input negative numbers or overflow values (>99,999 units) to manipulate inventory records.

## 2. Integration Contract & QA Scenarios
* **Idempotency Verification**: Trigger parallel submissions (rapid double-clicking) of the same Invoice UUID under high latency. Confirm the backend returns a cached response for the second request, preserving resource integrity.
* **Dual-Database Discrepancy Audit**: Simulate a client-side database wipe during active transaction sync. Validate that system rolls back transaction, restores local inventory counts, and prompts agent safely.`,
      flow: `
<div class="flow-chart-wrapper" style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; min-height:220px; overflow:hidden;">
  <svg viewBox="0 0 500 240" width="100%" height="100%" style="font-family: var(--font-heading);">
    <defs>
      <filter id="glow-fmcg" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <!-- Connection Lines -->
    <path d="M100 120 H250 M250 120 H400" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="6,6" />
    <!-- Request dot path -->
    <circle r="6" fill="#3b82f6" filter="url(#glow-fmcg)">
      <animateMotion dur="2.5s" repeatCount="indefinite" path="M100 120 H250 H400" />
    </circle>
    <!-- Actor 1: Field Client App -->
    <g transform="translate(30, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(59, 130, 246, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(59, 130, 246, 0.08)" stroke="#3b82f6" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">📱 PWA Client</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">IndexedDB Cache</text>
      <text x="55" y="76" font-size="7" fill="#f59e0b" font-weight="600" text-anchor="middle">Offline Mode</text>
    </g>
    <!-- Actor 2: Idempotent Gateway -->
    <g transform="translate(195, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(168, 85, 247, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">⚡ API Gateway</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">Idempotence filter</text>
      <text x="55" y="76" font-size="7" fill="#10b981" font-weight="600" text-anchor="middle">UUID Checked</text>
    </g>
    <!-- Actor 3: SAP ERP Backend -->
    <g transform="translate(360, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(16, 185, 129, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">🗄️ SAP Database</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">ERP Reconciliation</text>
      <text x="55" y="76" font-size="7" fill="#3b82f6" font-weight="600" text-anchor="middle">Invoices Sync</text>
    </g>
  </svg>
</div>`
    },
    escalation: {
      title: "Enterprise L2 Support Escalation SaaS",
      metrics: "Goal: <2hr SLA Triage · Resolution Efficiency: +35% SLA compliance",
      brief: `# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## 1. Executive Summary
High-volume enterprise SaaS support teams struggle with email-based triage. The absence of automated category classification, priority weighing, and transparent internal triaging leads to delayed response times and frequent SLA breaches.

## 2. Product Objectives
* **Intelligent Auto-Routing**: Automatically parse email bodies to assign L2 tickets to domain specialists (e.g., database, auth, UI).
* **Dual-Layer Comments**: Keep private business analyst notes isolated from external customer communications.
* **SLA Priority Tracker**: Real-time countdowns tracking remaining response windows with visual warnings.

## 3. Core Success Metrics
* **Triage Speed**: Average ticket routing time reduced from 45 minutes to less than 10 seconds.
* **SLA Compliance**: Maintain >98% compliance on all critical tier-1 support tickets.`,
      backlog: `# JIRA BACKLOG & USER STORIES
## Epic: ESC-ROUTE-02: Automated SLA Routing & Secure Internal Triaging
### User Story ESC-201: Dynamic Routing Engine
**As an** L2 Support Lead
**I want** incoming escalations to auto-assign based on domain keywords and ownership rules
**So that** L2 BAs can resolve blockers within their 2-hour SLA.

### Acceptance Criteria (Given-When-Then)
* **Scenario: High priority integration error**
  * **Given** an incoming email contains key phrases like "API timeout" or "SAP Sync Failure"
  * **When** parsed by the escalation engine
  * **Then** set ticket category to "Integration", priority to "CRITICAL", and assign to the Integration Lead.
  * **And** trigger an instant high-priority Slack notification.

* **Scenario: Non-technical request**
  * **Given** an incoming email contains keywords "invoice" or "pricing query"
  * **When** parsed by the escalation engine
  * **Then** route the ticket to the Finance Billing queue instead of L2 engineers.`,
      qa: `# TEST CASES & EDGE CASE VALIDATIONS
## 1. Boundary & Precision Validations
* **TC-ESC-301 (SLA Clock Expiry)**: Verify that the countdown clock correctly accounts for international time zone offsets (UTC, IST, AST). Test clock alerts at 30 minutes, 15 minutes, and 0 minutes.
* **TC-ESC-302 (Infinite Auto-Responders)**: Validate that the system filters out auto-replies (e.g., "Out of office" or "Thank you for contacting us") to avoid recursive ticketing loops.

## 2. Integration Contract & QA Scenarios
* **Dual-Layer Notes Leak Test**: Attempt to fetch a ticket payload using an unauthenticated public API call. Verify that private internal BA comments are completely stripped, leaking zero operational details.
* **API Timeout Resilience**: Simulate an L2 Portal outage during a high-volume sync cycle. Confirm that standard client inquiries are safely queue-buffered in Firebase and re-processed sequentially on recovery.`,
      flow: `
<div class="flow-chart-wrapper" style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; min-height:220px; overflow:hidden;">
  <svg viewBox="0 0 500 240" width="100%" height="100%" style="font-family: var(--font-heading);">
    <defs>
      <filter id="glow-esc" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <!-- Connection Lines -->
    <path d="M100 120 H250 M250 120 H400" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="6,6" />
    <!-- Request dot path -->
    <circle r="6" fill="#a855f7" filter="url(#glow-esc)">
      <animateMotion dur="2.5s" repeatCount="indefinite" path="M100 120 H250 H400" />
    </circle>
    <!-- Actor 1: Gmail Webhook -->
    <g transform="translate(30, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(236, 72, 153, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(236, 72, 153, 0.08)" stroke="#ec4899" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">📨 Mail Webhook</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">Gmail Sync API</text>
      <text x="55" y="76" font-size="7" fill="#10b981" font-weight="600" text-anchor="middle">Secure Ingest</text>
    </g>
    <!-- Actor 2: AI Classifier Pipeline -->
    <g transform="translate(195, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(59, 130, 246, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(59, 130, 246, 0.08)" stroke="#3b82f6" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">🤖 AI Classifier</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">NLP Tagging Engine</text>
      <text x="55" y="76" font-size="7" fill="#a855f7" font-weight="600" text-anchor="middle">Weight Assigned</text>
    </g>
    <!-- Actor 3: SLA Router (Jira) -->
    <g transform="translate(360, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(16, 185, 129, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">🎫 SLA Router</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">Automated Queue</text>
      <text x="55" y="76" font-size="7" fill="#ec4899" font-weight="600" text-anchor="middle">Slack Alert Trigger</text>
    </g>
  </svg>
</div>`
    },
    geospatial: {
      title: "Geospatial Route & Pricing Optimizer",
      metrics: "Goal: Route Capacity Optimization · Operational Costs: -18% fuel burn",
      brief: `# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## 1. Executive Summary
Commuter transportation grids operate under highly fluctuating demand. Static routing and fixed pricing lead to empty buses during off-peak hours and severe overcrowding during peak rush hours, limiting profitability.

## 2. Product Objectives
* **Dynamic Grid Scheduling**: Leverage geospatial scraping and weather data to predict ride demand patterns.
* **Corridor Yield Pricing**: Dynamically scale prices based on real-time vehicle load and competitor availability.
* **Optimized Routing**: Auto-adjust stops and paths to optimize passenger throughput and fuel consumption.

## 3. Core Success Metrics
* **Seat Allocation**: Increase average commuter occupancy rate from 62% to over 85%.
* **Fuel Efficiency**: Decrease idle time and detour waste by 18%.`,
      backlog: `# JIRA BACKLOG & USER STORIES
## Epic: ROUTE-GEO-03: Real-Time Dynamic Commuter Scheduling & Pricing
### User Story GEO-301: Dynamic pricing updates
**As a** Transit Route Analyst
**I want** ride prices to scale dynamically based on capacity and demand heatmaps
**So that** we optimize route yields.

### Acceptance Criteria (Given-When-Then)
* **Scenario: High Peak Demand Peak Dynamic Price**
  * **Given** vehicle capacity is above 80%
  * **When** competitor supply drops by 20% in the same geohash zone
  * **Then** automatically raise ticket pricing by 15% in the commuter booking app.

* **Scenario: Low Demand Off-Peak Discount**
  * **Given** vehicle capacity is below 40% with 10 minutes left before departure
  * **When** a passenger queries the route
  * **Then** offer an instant 20% "Early Bird" discount to fill remaining seats.`,
      qa: `# TEST CASES & EDGE CASE VALIDATIONS
## 1. Boundary & Precision Validations
* **TC-GEO-401 (Geohash Bounds)**: Validate that passengers situated precisely on geohash boundary lines do not get double-charged or mapped to incorrect transit corridors.
* **TC-GEO-402 (GPS Sanitization)**: Confirm that invalid GPS coordinates (e.g., null, 0,0, or ocean coordinates) are rejected and default to nearest hub station coordinates.

## 2. Integration Contract & QA Scenarios
* **Dynamic pricing stress test**: Simulate 5,000 parallel pricing requests within a single transit corridor during a weather anomaly. Verify that pricing calculations finish in <150ms without gridlock.
* **Fallback Routing Audit**: Simulate GPS telemetry signal loss for a bus. Verify that the scheduling app falls back seamlessly to dead-reckoning estimations and maintains safety alarms.`,
      flow: `
<div class="flow-chart-wrapper" style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; min-height:220px; overflow:hidden;">
  <svg viewBox="0 0 500 240" width="100%" height="100%" style="font-family: var(--font-heading);">
    <defs>
      <filter id="glow-geo" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <!-- Connection Lines -->
    <path d="M100 120 H250 M250 120 H400" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="6,6" />
    <!-- Request dot path -->
    <circle r="6" fill="#10b981" filter="url(#glow-geo)">
      <animateMotion dur="2.5s" repeatCount="indefinite" path="M100 120 H250 H400" />
    </circle>
    <!-- Actor 1: Geohash Scraper -->
    <g transform="translate(30, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(16, 185, 129, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">📡 Grid Scraper</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">Competitor API</text>
      <text x="55" y="76" font-size="7" fill="#3b82f6" font-weight="600" text-anchor="middle">Live Heatmap</text>
    </g>
    <!-- Actor 2: Price Yield Engine -->
    <g transform="translate(195, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(168, 85, 247, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">📈 Yield Engine</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">Corridor Pricing</text>
      <text x="55" y="76" font-size="7" fill="#ec4899" font-weight="600" text-anchor="middle">Yield Calculation</text>
    </g>
    <!-- Actor 3: Passenger App -->
    <g transform="translate(360, 70)">
      <rect width="110" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
      <rect width="110" height="90" rx="12" fill="rgba(59, 130, 246, 0.02)" />
      <circle cx="55" cy="30" r="14" fill="rgba(59, 130, 246, 0.08)" stroke="#3b82f6" stroke-width="1.5" />
      <text x="55" y="34" font-size="9" font-weight="700" fill="var(--text-primary)" text-anchor="middle">📱 Commuter UI</text>
      <text x="55" y="66" font-size="7.5" fill="var(--text-secondary)" text-anchor="middle">Booking PWA</text>
      <text x="55" y="76" font-size="7" fill="#10b981" font-weight="600" text-anchor="middle">Price Sync Complete</text>
    </g>
  </svg>
</div>`
    }
  };

  let activeDomain = 'fmcg';
  let activeTab = 'brief';
  let isTyping = false;

  function updateDomainGlow(domain) {
    const wrapper = document.getElementById('playgroundWrapper');
    if (!wrapper) return;

    const glowColors = {
      fmcg: {
        bg: 'rgba(16, 185, 129, 0.04)', // Emerald
        border: 'rgba(16, 185, 129, 0.2)'
      },
      escalation: {
        bg: 'rgba(59, 130, 246, 0.04)', // Electric Blue
        border: 'rgba(59, 130, 246, 0.2)'
      },
      geospatial: {
        bg: 'rgba(168, 85, 247, 0.04)', // Amethyst
        border: 'rgba(168, 85, 247, 0.2)'
      }
    };

    const activeColor = glowColors[domain] || glowColors.fmcg;
    wrapper.style.setProperty('--lab-glow-color', activeColor.bg);
    wrapper.style.setProperty('--lab-active-border', activeColor.border);
  }

  function initPlayground() {
    const domainSelects = document.querySelectorAll('.playground-domain-btn');
    const paramChannel = document.getElementById('playgroundParamChannel');
    const paramMode = document.getElementById('playgroundParamMode');
    const generateBtn = document.getElementById('playgroundGenerateBtn');
    const workspaceEmpty = document.getElementById('playgroundWorkspaceEmpty');
    const workspaceLoader = document.getElementById('playgroundWorkspaceLoader');
    const workspaceContent = document.getElementById('playgroundWorkspaceContent');
    const loaderStepText = document.getElementById('playgroundLoaderStepText');
    const loaderBarInner = document.getElementById('playgroundLoaderBarInner');

    const tabBrief = document.getElementById('tabBtnBrief');
    const tabBacklog = document.getElementById('tabBtnBacklog');
    const tabQA = document.getElementById('tabBtnQA');
    const tabFlow = document.getElementById('tabBtnFlow');
    const tabROI = document.getElementById('tabBtnROI');

    const specTextContainer = document.getElementById('playgroundSpecText');
    const specTitle = document.getElementById('playgroundSpecTitle');
    const specMeta = document.getElementById('playgroundSpecMeta');
    const workspaceTitle = document.getElementById('playgroundWorkspaceTitle');

    const copyBtn = document.getElementById('playgroundCopyBtn');
    const exportBtn = document.getElementById('playgroundExportBtn');

    if (!generateBtn || !workspaceEmpty || !workspaceLoader || !workspaceContent) return;

    // Apply initial dynamic glow based on default FMCG selection
    updateDomainGlow(activeDomain);

    // Domain Selection
    domainSelects.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isTyping) return;
        domainSelects.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeDomain = btn.dataset.domain;
        
        // Update dynamic ambient glows
        updateDomainGlow(activeDomain);

        // Reset workspace to empty state when domain changes
        workspaceContent.classList.remove('active');
        workspaceLoader.classList.remove('active');
        workspaceEmpty.classList.add('active');
        if (workspaceTitle) workspaceTitle.innerText = "specs_compiler.log";
      });
    });

    // Tab Selection
    const tabs = [
      { element: tabBrief, name: 'brief' },
      { element: tabBacklog, name: 'backlog' },
      { element: tabQA, name: 'qa' },
      { element: tabFlow, name: 'flow' },
      { element: tabROI, name: 'roi' }
    ];

    tabs.forEach(t => {
      if (t.element) {
        t.element.addEventListener('click', (e) => {
          e.preventDefault();
          if (isTyping) return;
          tabs.forEach(item => { if (item.element) item.element.classList.remove('active'); });
          t.element.classList.add('active');
          activeTab = t.name;
          renderActiveTab();
        });
      }
    });

    // Copy to clipboard
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (activeTab === 'flow' || activeTab === 'roi') {
          alertSuccessToast("Info", "This visual panel can be experienced interactively, switch to another tab to copy markdown specs.");
          return;
        }
        const text = specsData[activeDomain][activeTab];
        navigator.clipboard.writeText(text).then(() => {
          if (window.showSystemToast) {
            window.showSystemToast('hire'); // Celebration ripple toast
          }
          alertSuccessToast("Copied to Clipboard!", "The specification markdown has been saved to your clipboard.");
        }).catch(err => {
          console.error('Failed to copy text: ', err);
        });
      });
    }

    // Export as file
    if (exportBtn) {
      exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (activeTab === 'flow' || activeTab === 'roi') {
          alertSuccessToast("Info", "This visual panel can be experienced interactively, switch to another tab to export markdown specs.");
          return;
        }
        const text = specsData[activeDomain][activeTab];
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
        const link = document.createElement('a');
        const filename = `Utkarsh_Rajput_PM_Spec_${activeDomain}_${activeTab}.md`;
        
        if (navigator.msSaveBlob) { // IE 10+
          navigator.msSaveBlob(blob, filename);
        } else {
          link.href = URL.createObjectURL(blob);
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        alertSuccessToast("Markdown File Exported!", `${filename} has been compiled and downloaded.`);
      });
    }

    // Generate specifications trigger
    generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isTyping) return;

      const channel = paramChannel ? paramChannel.value : 'Web SaaS';
      const mode = paramMode ? paramMode.value : 'Agile Scrum';

      workspaceEmpty.classList.remove('active');
      workspaceContent.classList.remove('active');
      workspaceLoader.classList.add('active');
      
      if (workspaceTitle) workspaceTitle.innerText = "compilation_terminal.sh";

      runHighTechSimulation(channel, mode);
    });

    function runHighTechSimulation(channel, mode) {
      const logger = document.getElementById('playgroundTerminalLogger');
      if (logger) logger.innerHTML = ''; // Reset logging rows

      const steps = [
        { text: "PM_COMPILER_V3: Booting integration compiler core...", type: 'info' },
        { text: `[CONFIG] target_channel  = [${channel}]`, type: 'info' },
        { text: `[CONFIG] agile_framework = [${mode}]`, type: 'info' },
        { text: `[CONFIG] target_domain    = [${activeDomain.toUpperCase()}]`, type: 'info' },
        { text: "--------------------------------------------------------", type: 'info' },
        { text: "> Fetching workflow repositories & requirements variables...", type: 'process' },
        { text: "> Analyzing operational loops and integration bottlenecks...", type: 'process' },
        { text: "> Auditing edge-case boundary parameters...", type: 'process' },
        { text: "> Validating data calculator floating-point safety...", type: 'process' },
        { text: "> Generating Gherkin Given-When-Then backlog stories...", type: 'process' },
        { text: "> Assembling dynamic SVG sequence interaction flows...", type: 'process' },
        { text: "--------------------------------------------------------", type: 'info' },
        { text: "COMPILER_SUCCESS: Specifications compiled successfully in 3200ms.", type: 'success' }
      ];

      let currentStep = 0;
      loaderBarInner.style.width = '0%';
      
      const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
          const logData = steps[currentStep];
          loaderStepText.innerText = logData.text;
          loaderBarInner.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
          
          if (logger) {
            const line = document.createElement('div');
            line.className = 'terminal-log-line';
            line.style.cssText = "margin-bottom: 5px; line-height: 1.4; font-family: monospace; font-size: 0.72rem;";
            
            if (logData.type === 'success') {
              line.style.color = '#10b981'; // Emerald Green
              line.innerHTML = `<strong>${logData.text}</strong>`;
            } else if (logData.type === 'info') {
              line.style.color = '#3b82f6'; // Blue
              line.innerText = logData.text;
            } else {
              line.style.color = '#9aa0a6'; // Gray
              line.innerText = logData.text;
            }
            logger.appendChild(line);
            logger.scrollTop = logger.scrollHeight;
          }
          
          currentStep++;
        } else {
          clearInterval(stepInterval);
          workspaceLoader.classList.remove('active');
          workspaceContent.classList.add('active');
          if (workspaceTitle) workspaceTitle.innerText = `specs_${activeDomain}_output.md`;
          streamActiveTab(channel, mode);
        }
      }, 350); // Fast log stream rate
    }

    function parseMarkdownToHTML(text) {
      if (!text) return '';
      
      // Standardize line endings and escape HTML
      let html = text.replace(/\r\n/g, '\n')
                     .replace(/&/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;');
      
      // Headers
      html = html.replace(/^# (.*?)$/gm, '<h1 class="spec-h1">$1</h1>');
      html = html.replace(/^## (.*?)$/gm, '<h2 class="spec-h2">$1</h2>');
      html = html.replace(/^### (.*?)$/gm, '<h3 class="spec-h3">$1</h3>');
      
      // Bold: **text**
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Inline Code: `code`
      html = html.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
      
      // Bullet lists
      const lines = html.split('\n');
      let inList = false;
      const parsedLines = [];
      
      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          if (!inList) {
            parsedLines.push('<ul>');
            inList = true;
          }
          parsedLines.push(`<li>${trimmed.substring(2)}</li>`);
        } else {
          if (inList) {
            parsedLines.push('</ul>');
            inList = false;
          }
          parsedLines.push(line);
        }
      }
      if (inList) {
        parsedLines.push('</ul>');
      }
      
      // Wrap paragraphs
      const finalLines = [];
      for (let line of parsedLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('</ul') || trimmed.startsWith('<li')) {
          finalLines.push(trimmed);
        } else {
          finalLines.push(`<p class="spec-p">${trimmed}</p>`);
        }
      }
      
      return finalLines.join('\n');
    }

    function streamActiveTab(channel, mode) {
      const data = specsData[activeDomain];
      
      specTitle.innerText = data.title;
      specMeta.innerHTML = `<i data-lucide="cog" style="width:14px;height:14px;opacity:0.6;"></i> Environment: <strong>${channel}</strong> · Workflow: <strong>${mode}</strong> · ${data.metrics}`;
      lucide.createIcons({ node: specMeta });

      if (activeTab === 'flow') {
        isTyping = false;
        specTextContainer.innerHTML = data.flow;
        return;
      }

      if (activeTab === 'roi') {
        isTyping = false;
        renderROICalculator();
        return;
      }

      isTyping = true;
      const rawText = data[activeTab];
      specTextContainer.innerHTML = '';
      
      // Fast typewriter speed
      let index = 0;
      const charsPerTick = 20; // Highly responsive chunk typing
      
      function type() {
        if (index < rawText.length) {
          const chunk = rawText.substring(index, index + charsPerTick);
          specTextContainer.innerText += chunk;
          index += charsPerTick;
          
          // Auto-scroll inside document view
          const docView = specTextContainer.closest('.playground-doc-view');
          if (docView) {
            docView.scrollTop = docView.scrollHeight;
          }
          
          requestAnimationFrame(type);
        } else {
          isTyping = false;
          specTextContainer.innerHTML = parseMarkdownToHTML(rawText);
          const docView = specTextContainer.closest('.playground-doc-view');
          if (docView) {
            docView.scrollTop = 0;
          }
        }
      }
      type();
    }

    function renderActiveTab() {
      const data = specsData[activeDomain];
      if (activeTab === 'flow') {
        specTextContainer.innerHTML = data.flow;
      } else if (activeTab === 'roi') {
        renderROICalculator();
      } else {
        const rawText = data[activeTab];
        specTextContainer.innerHTML = parseMarkdownToHTML(rawText);
      }
      
      const docView = specTextContainer.closest('.playground-doc-view');
      if (docView) {
        docView.scrollTop = 0;
      }
    }

    function renderROICalculator() {
      specTextContainer.innerHTML = `
        <div class="roi-calculator-container" style="display: flex; flex-direction: column; gap: var(--space-xs); animation: fadeIn 0.4s ease;">
          <div class="roi-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 6px; text-align: left;">
            <span class="roi-badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">BA Automation Business Case</span>
            <p style="font-size: 0.76rem; color: var(--text-secondary); margin: 6px 0 0 0; line-height: 1.5;">Recruiter ROI Simulator: Calculate the operational efficiency & annualized cost savings generated by hiring Utkarsh (with AI-driven ticket routing, automations, and integration tools).</p>
          </div>
          
          <!-- Sliders Grid -->
          <div class="roi-sliders-grid" style="display: flex; flex-direction: column; gap: 14px; margin: 6px 0;">
            <div class="roi-slider-group" style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <span style="font-weight: 600; color: var(--text-primary);">Weekly Support Escalations</span>
                <span style="color: var(--accent); font-family: monospace; font-weight: 700;" id="valTickets">150 tickets</span>
              </div>
              <input type="range" id="sliderTickets" min="20" max="500" value="150" class="roi-range-slider" style="width: 100%; height: 6px; border-radius: var(--radius-full); background: var(--border-color); outline: none; cursor: none;">
            </div>
            
            <div class="roi-slider-group" style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <span style="font-weight: 600; color: var(--text-primary);">BA / Support Team Size</span>
                <span style="color: var(--accent); font-family: monospace; font-weight: 700;" id="valTeam">4 members</span>
              </div>
              <input type="range" id="sliderTeam" min="1" max="15" value="4" class="roi-range-slider" style="width: 100%; height: 6px; border-radius: var(--radius-full); background: var(--border-color); outline: none; cursor: none;">
            </div>
            
            <div class="roi-slider-group" style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <span style="font-weight: 600; color: var(--text-primary);">Average BA Hourly Rate</span>
                <span style="color: var(--accent); font-family: monospace; font-weight: 700;" id="valRate">$45 / hr</span>
              </div>
              <input type="range" id="sliderRate" min="20" max="120" value="45" class="roi-range-slider" style="width: 100%; height: 6px; border-radius: var(--radius-full); background: var(--border-color); outline: none; cursor: none;">
            </div>
          </div>
          
          <!-- Results Grid -->
          <div class="roi-results-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
            <div class="roi-result-card" style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; text-align: left;">
              <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase;">Hours Saved / Month</span>
              <span style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); font-family: monospace;" id="resHours">161 hrs</span>
              <span style="font-size: 0.64rem; color: #10b981; font-weight: 600;">⚡ Equivalent to +1.1 Full-Time BAs</span>
            </div>
            <div class="roi-result-card" style="background: rgba(255,255,255,0.015); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; text-align: left;">
              <span style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase;">SLA Breach Index</span>
              <span style="font-size: 1.2rem; font-weight: 800; color: #ec4899; font-family: monospace;" id="resSLA">18.5% → 1.2%</span>
              <span style="font-size: 0.64rem; color: #ec4899; font-weight: 600;">📉 -93% SLA Breach Risk</span>
            </div>
            <div class="roi-result-card" style="grid-column: span 2; background: rgba(16, 185, 129, 0.02); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: var(--radius-md); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.03); text-align: left;">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="font-size: 0.68rem; color: #10b981; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Annualized Team Cost Savings</span>
                <span style="font-size: 1.4rem; font-weight: 900; color: #10b981; font-family: monospace; line-height: 1;" id="resSavings">$86,940 / yr</span>
              </div>
              <div class="roi-badge" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; font-size: 0.7rem; font-weight: 700; padding: 6px 12px; border-radius: var(--radius-full);">5.4x ROI</div>
            </div>
          </div>
          
          <!-- Efficiency Bar Comparison -->
          <div class="roi-efficiency-compare" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; text-align: left;">
            <span style="font-size: 0.74rem; font-weight: 600; color: var(--text-primary);">Triaging Time Allocation Comparison</span>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.68rem; color: var(--text-secondary);">
              <div style="display: flex; justify-content: space-between;">
                <span>Traditional Manual Triage</span>
                <span style="font-weight: 600; color: var(--text-primary);">45 mins / ticket</span>
              </div>
              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: var(--radius-full); overflow: hidden;">
                <div style="width: 100%; height: 100%; background: var(--text-tertiary); border-radius: var(--radius-full);"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 2px;">
                <span style="color: var(--accent-light); font-weight: 600;">Utkarsh AI Automation Engine</span>
                <span style="font-weight: 700; color: #10b981;">&lt; 10 secs / ticket</span>
              </div>
              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: var(--radius-full); overflow: hidden;">
                <div style="width: 10%; height: 100%; background: #10b981; border-radius: var(--radius-full); box-shadow: 0 0 10px #10b981;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Wire up input sliders logic
      const sliderTickets = document.getElementById('sliderTickets');
      const sliderTeam = document.getElementById('sliderTeam');
      const sliderRate = document.getElementById('sliderRate');
      
      const valTickets = document.getElementById('valTickets');
      const valTeam = document.getElementById('valTeam');
      const valRate = document.getElementById('valRate');
      
      const resHours = document.getElementById('resHours');
      const resSLA = document.getElementById('resSLA');
      const resSavings = document.getElementById('resSavings');
      
      function calculate() {
        const tickets = parseInt(sliderTickets.value);
        const team = parseInt(sliderTeam.value);
        const rate = parseInt(sliderRate.value);
        
        valTickets.innerText = `${tickets} tickets`;
        valTeam.innerText = `${team} ${team === 1 ? 'member' : 'members'}`;
        valRate.innerText = `$${rate} / hr`;
        
        // Manual hours: 45 mins (0.75 hrs) per ticket
        // With automation, 75% of tickets are auto-routed in <10 seconds.
        // Time savings factor: 0.75 * 0.75 = 0.5625 hrs saved per ticket.
        const hoursSavedPerMonth = Math.round(tickets * 4.3 * 0.5625);
        const moneySavedPerMonth = hoursSavedPerMonth * rate;
        const moneySavedPerYear = moneySavedPerMonth * 12;
        
        // SLA breach reduction
        const initialSLA = (12 + (tickets / 20)).toFixed(1);
        const postSLA = (initialSLA * 0.08).toFixed(1); // 92% reduction
        
        resHours.innerText = `${hoursSavedPerMonth} hrs`;
        resSLA.innerText = `${initialSLA}% → ${postSLA}%`;
        resSavings.innerText = `$${moneySavedPerYear.toLocaleString()} / yr`;
      }
      
      [sliderTickets, sliderTeam, sliderRate].forEach(slider => {
        slider.addEventListener('input', calculate);
      });
      
      calculate(); // Initial run
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
          <div class="toast-title" style="color: var(--text-primary);">${title}</div>
          <div class="toast-desc">${desc}</div>
        </div>
      `;

      toastContainer.appendChild(toast);
      lucide.createIcons({ node: toast });

      setTimeout(() => {
        toast.classList.add('active');
      }, 50);

      setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
          toast.remove();
        }, 600);
      }, 4000);
    }

    // Bulletproof scroll containment stop propagation fallback
    const scrollContainers = [
      specTextContainer ? specTextContainer.closest('.playground-doc-view') : null,
      document.getElementById('playgroundTerminalLogger'),
      document.getElementById('panelBodyEggs'),
      document.getElementById('panelBodySiri'),
      document.getElementById('siriChatLog')
    ];

    scrollContainers.forEach(container => {
      if (!container) return;
      
      // Prevent Lenis smooth scroll from hijacking the scroll inside containers
      container.addEventListener('wheel', (e) => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const height = container.clientHeight;
        const delta = e.deltaY;

        // Contain scrolling inside boundaries
        if ((delta < 0 && scrollTop > 0) || (delta > 0 && scrollTop + height < scrollHeight)) {
          e.stopPropagation();
        }
      }, { passive: true });

      container.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayground);
  } else {
    initPlayground();
  }

})();
