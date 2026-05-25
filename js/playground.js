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
* **Dual-Database Discrepancy Audit**: Simulate a client-side database wipe during active transaction sync. Validate that system rolls back transaction, restores local inventory counts, and prompts agent safely.`
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
* **API Timeout Resilience**: Simulate an L2 Portal outage during a high-volume sync cycle. Confirm that standard client inquiries are safely queue-buffered in Firebase and re-processed sequentially on recovery.`
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
* **Fallback Routing Audit**: Simulate GPS telemetry signal loss for a bus. Verify that the scheduling app falls back seamlessly to dead-reckoning estimations and maintains safety alarms.`
    }
  };

  let activeDomain = 'fmcg';
  let activeTab = 'brief';
  let isTyping = false;

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

    const specTextContainer = document.getElementById('playgroundSpecText');
    const specTitle = document.getElementById('playgroundSpecTitle');
    const specMeta = document.getElementById('playgroundSpecMeta');

    const copyBtn = document.getElementById('playgroundCopyBtn');
    const exportBtn = document.getElementById('playgroundExportBtn');

    if (!generateBtn || !workspaceEmpty || !workspaceLoader || !workspaceContent) return;

    // Domain Selection
    domainSelects.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isTyping) return;
        domainSelects.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeDomain = btn.dataset.domain;

        // Reset workspace to empty state when domain changes
        workspaceContent.classList.remove('active');
        workspaceLoader.classList.remove('active');
        workspaceEmpty.classList.add('active');
      });
    });

    // Tab Selection
    const tabs = [
      { element: tabBrief, name: 'brief' },
      { element: tabBacklog, name: 'backlog' },
      { element: tabQA, name: 'qa' }
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
        const text = specTextContainer.innerText;
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
        const text = specTextContainer.innerText;
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

      runHighTechSimulation(channel, mode);
    });

    function runHighTechSimulation(channel, mode) {
      const steps = [
        "Analyzing operational workflows and process gaps...",
        `Parsing framework variables for [${channel}] target channel...`,
        `Auditing edge case boundary coverage using [${mode}] methodology...`,
        "Injecting dynamic idempotency safeguards & API contracts...",
        "Drafting complete business and technical artifacts..."
      ];

      let currentStep = 0;
      loaderBarInner.style.width = '0%';
      
      const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
          loaderStepText.innerText = steps[currentStep];
          loaderBarInner.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
          currentStep++;
        } else {
          clearInterval(stepInterval);
          workspaceLoader.classList.remove('active');
          workspaceContent.classList.add('active');
          streamActiveTab(channel, mode);
        }
      }, 700);
    }

    function streamActiveTab(channel, mode) {
      isTyping = true;
      const data = specsData[activeDomain];
      
      specTitle.innerText = data.title;
      specMeta.innerHTML = `<i data-lucide="cog" style="width:14px;height:14px;opacity:0.6;"></i> Environment: <strong>${channel}</strong> · Workflow: <strong>${mode}</strong> · ${data.metrics}`;
      lucide.createIcons({ node: specMeta });

      const rawText = data[activeTab];
      specTextContainer.innerHTML = '';
      
      // Fast typewriter speed
      let index = 0;
      const charsPerTick = 12; // Stream blocks of characters for high responsiveness
      
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
          // Clean format highlight markup if needed (we keep clean plain text for copy-paste reliability)
          specTextContainer.innerText = rawText; // set exact text to avoid truncation
        }
      }
      type();
    }

    function renderActiveTab() {
      const data = specsData[activeDomain];
      const rawText = data[activeTab];
      specTextContainer.innerText = rawText;
      
      const docView = specTextContainer.closest('.playground-doc-view');
      if (docView) {
        docView.scrollTop = 0;
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
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayground);
  } else {
    initPlayground();
  }

})();
