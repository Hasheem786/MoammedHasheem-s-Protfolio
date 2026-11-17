/**
 * Mohammed Hasheem - Main Application Logic & Interactivity
 * Architecture Inspector, Terminal Emulator, Skills Filter, Audio FX & Modals
 */

(function () {
  'use strict';

  /* -------------------------------------------------------------
   * 1. AUDIO SYNTHESIZER (Web Audio API - No external mp3 files needed)
   * ------------------------------------------------------------- */
  let audioCtx = null;
  let isSoundEnabled = false;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio error ignored safely
    }
  }

  const sfx = {
    hover: () => playTone(650, 'sine', 0.04, 0.02),
    click: () => playTone(880, 'triangle', 0.07, 0.05),
    terminal: () => playTone(520, 'square', 0.05, 0.02),
    success: () => {
      playTone(587.33, 'sine', 0.08, 0.04);
      setTimeout(() => playTone(880, 'sine', 0.12, 0.05), 80);
    }
  };

  /* -------------------------------------------------------------
   * 2. ARCHITECTURE INSPECTOR DATA & SWITCHER
   * ------------------------------------------------------------- */
    const ARCHITECTURES = {
    'smart-examiner': {
      title: 'Smart Examiner & Institutional Progress Tracker',
      description: 'Educational portal and desktop question-paper creation application engineered to help educators generate customized assessments and track longitudinal institutional performance metrics.',
      nodes: [
        { icon: '📝', title: 'Template Engine', tech: 'Custom Question Rules' },
        { icon: '🖥️', title: 'Desktop Creator', tech: 'C# WinForms / WPF' },
        { icon: '🌐', title: 'Web Portal', tech: 'ASP.NET Core Razor Pages' },
        { icon: '🗄️', title: 'Database Core', tech: 'PostgreSQL Relational' },
        { icon: '📊', title: 'Analytics Engine', tech: 'Reporting Dashboards' }
      ],
      highlights: [
        'Built an ASP.NET Core Razor Pages interface for generating customized question papers using weighted templates.',
        'Designed a high-concurrency PostgreSQL backend storing student-performance data and driving reporting dashboards.',
        'Implemented robust C# input validation, real-time score processing, and cohort progress reporting.',
        'Dual-module architecture serving classroom teachers and institutional administrators simultaneously.'
      ],
      metric: '📊 Institutional Scale'
    },
    'ocr-pipeline': {
      title: 'Automated Document Processing Solution',
      description: 'Enterprise document-capture solution extracting text from invoices, receipts, and financial statements with C#/.NET, Google Cloud OCR API, Tesseract, and React.',
      nodes: [
        { icon: '📄', title: 'Input Documents', tech: 'Invoices / Receipts / Scans' },
        { icon: '⚡', title: 'AI OCR Engines', tech: 'Google Cloud OCR + Tesseract' },
        { icon: '⚙️', title: 'C# Pipeline Service', tech: '.NET Core & Text Extraction' },
        { icon: '🔒', title: 'Encryption Vault', tech: 'Client Data Protection' },
        { icon: '💻', title: 'React Management UI', tech: 'Document Management Portal' }
      ],
      highlights: [
        'Integrated Google Cloud OCR API and Tesseract with C#/.NET for high-accuracy text extraction.',
        'Developed a React document-management interface backed by a high-throughput C# processing pipeline.',
        'Implemented rigorous encryption measures for sensitive client documents and financial statements.',
        'Reduced manual document-processing effort by over 40% in enterprise production.'
      ],
      metric: '⚡ 40%+ Effort Reduction'
    },
    'occ-migration': {
      title: 'Automated Migration Framework (OCC to Intelligent Capture)',
      description: 'Enterprise desktop utility engineered with C# and WPF to support automated migration from OpenText Capture Center (OCC) to Intelligent Capture systems.',
      nodes: [
        { icon: '📦', title: 'Legacy OCC Configs', tech: 'Batch Classes & Rules' },
        { icon: '🔄', title: 'Conversion Engine', tech: 'C# Parser & Transformer' },
        { icon: '🖥️', title: 'WPF Migration GUI', tech: 'Visual Mapping Studio' },
        { icon: '🧪', title: 'Schema Validator', tech: 'Automated Integrity Check' },
        { icon: '🚀', title: 'Intelligent Capture', tech: 'Production Ready' }
      ],
      highlights: [
        'Created a utility to support migration from OpenText Capture Center (OCC) to Intelligent Capture systems.',
        'Used C# and WPF to automate configuration and reduce migration work from several hours to minutes.',
        'Automated conversion of complex extraction scripts, schema mappings, and routing profiles.',
        'Eliminated configuration defects and human translation errors during deployment.'
      ],
      metric: '⏱️ Hours → Minutes Speedup'
    },
    'label-extractor': {
      title: 'Label-Based Extraction Tool',
      description: 'Advanced field-extraction application identifying targeted form values using contextual labels rather than fixed layout coordinates, with an interactive WPF workspace.',
      nodes: [
        { icon: '📑', title: 'Dynamic Documents', tech: 'Variable Layouts' },
        { icon: '🏷️', title: 'Label Detector', tech: 'Contextual Semantic Logic' },
        { icon: '📐', title: 'Spatial Resolver', tech: 'Coordinate-Agnostic Binding' },
        { icon: '🎨', title: 'WPF Workspace', tech: 'Form Registration Studio' },
        { icon: '💾', title: 'Extracted Output', tech: 'Clean Structured Data' }
      ],
      highlights: [
        'Developed a field-extraction tool that identifies values using contextual labels rather than fixed layout coordinates.',
        'Used C# and WPF to build an interactive workspace for form registration and template setup.',
        'Maintains high extraction accuracy even with paper stretching, scanning skews, and margin shifts.',
        'Extensible C# architecture built with SOLID principles for custom document templates.'
      ],
      metric: '🧠 Contextual Field Extraction'
    }
  };

  function setupArchitectureInspector() {
    const tabButtons = document.querySelectorAll('.arch-tab-btn');
    const titleEl = document.getElementById('arch-title');
    const descEl = document.getElementById('arch-desc');
    const metricEl = document.getElementById('arch-metric');
    const diagramEl = document.getElementById('arch-diagram');
    const highlightsEl = document.getElementById('arch-highlights');

    if (!tabButtons.length || !diagramEl) return;

    function renderArch(key) {
      const data = ARCHITECTURES[key];
      if (!data) return;

      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.description;
      if (metricEl) metricEl.textContent = data.metric;

      // Render Nodes
      diagramEl.innerHTML = data.nodes.map(n => `
        <div class="diagram-node">
          <div class="node-icon">${n.icon}</div>
          <div class="node-title">${n.title}</div>
          <div class="node-tech">${n.tech}</div>
        </div>
      `).join('');

      // Render Highlights
      if (highlightsEl) {
        highlightsEl.innerHTML = data.highlights.map(h => `
          <div class="project-bullet-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${h}</span>
          </div>
        `).join('');
      }

      sfx.click();
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.getAttribute('data-arch');
        renderArch(key);
      });
      btn.addEventListener('mouseenter', sfx.hover);
    });

    // Inspect Architecture buttons in project cards
    document.querySelectorAll('.btn-inspect-arch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const archKey = btn.getAttribute('data-target-arch');
        if (archKey) {
          const targetTab = document.querySelector(`.arch-tab-btn[data-arch="${archKey}"]`);
          if (targetTab) {
            targetTab.click();
            document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Initial render
    renderArch('smart-examiner');
  }

  /* -------------------------------------------------------------
   * 3. HASHEEM.CLI INTERACTIVE TERMINAL EMULATOR
   * ------------------------------------------------------------- */
  function setupTerminal() {
    const input = document.getElementById('cli-input');
    const body = document.getElementById('terminal-body');
    const chips = document.querySelectorAll('.cli-chip-btn');
    if (!input || !body) return;

    const commandHistory = [];
    let historyIndex = -1;

        const COMMANDS = {
      help: () => `
<span class="cli-output-line system">Available Commands in Hasheem.CLI:</span>
  <span class="cli-output-line highlight">bio</span>         - Summary of Mohammed Hasheem's background & experience
  <span class="cli-output-line highlight">skills</span>      - Comprehensive breakdown of technical proficiencies
  <span class="cli-output-line highlight">projects</span>    - 4 production engineering projects & achievements
  <span class="cli-output-line highlight">experience</span>  - Stellaris Technologies Pvt Ltd experience & focus areas
  <span class="cli-output-line highlight">cert</span>        - AI-First Software Engineering (Core Java) certification
  <span class="cli-output-line highlight">linkedin</span>    - Open LinkedIn profile (mohammedhasheem-dotnet)
  <span class="cli-output-line highlight">github</span>      - Open GitHub profile (Hasheem786)
  <span class="cli-output-line highlight">resume</span>      - Open and download Hasheem's updated resume
  <span class="cli-output-line highlight">contact</span>     - Direct contact channels (Email, Phone, Location)
  <span class="cli-output-line highlight">matrix</span>      - Trigger visual cyber matrix sequence
  <span class="cli-output-line highlight">clear</span>       - Clear terminal output
`,
      bio: () => `
<span class="cli-output-line highlight">MOHAMMED HASHEEM</span> | Software Engineer | .NET Developer | Web & Desktop Applications
Based in Mysore, Karnataka, India | +91-6361846692 | hasheem7860@gmail.com
4.5+ years of experience developing and modernizing web and desktop applications using C# and the .NET ecosystem.
Hands-on experience with ASP.NET Core, Razor Pages, MVC, WPF, Windows Forms, PostgreSQL, and Microsoft SQL Server.
Delivered automation solutions for document processing and legacy-system migration alongside education & healthcare applications.
`,
      skills: () => `
<span class="cli-output-line system">TECHNICAL SKILLS MATRIX (UPDATED RESUME):</span>
  [Programming & .NET] C#, Java (Core Java), .NET Core, ASP.NET Core, MVC, Razor Pages, WPF, Windows Forms
  [Web & UI]           HTML5, CSS3, React, XML, JSON, REST APIs
  [Databases]          PostgreSQL, Microsoft SQL Server, Stored Procedures, Query Optimization
  [Testing & Quality]  Unit Testing, Manual Integration Testing, System Performance Testing, Debugging
  [Tools & Practices]  Visual Studio, Git, GitHub, Agile/Scrum, SOLID Principles
  [AI & Automation]    Google Cloud OCR API, Tesseract OCR, Contextual Label Extraction, Airtribe Certified
`,
      projects: () => `
<span class="cli-output-line system">SELECTED ENGINEERING PROJECTS:</span>
  1. <span class="cli-output-line highlight">Smart Examiner & Institutional Progress Tracker</span> | Education
     • Built an ASP.NET Core Razor Pages interface for generating customized question papers using templates.
     • Designed a PostgreSQL backend for student-performance data and reporting dashboards.
     • Implemented C# input validation, score processing and progress reporting.
  2. <span class="cli-output-line highlight">Automated Document Processing Solution</span>
     • Integrated Google Cloud OCR API and Tesseract with C#/.NET for text extraction.
     • Developed a React document-management interface backed by a C# processing pipeline.
     • Implemented encryption measures for sensitive client documents; <span class="cli-output-line success">reduced manual processing effort by 40%+.</span>
  3. <span class="cli-output-line highlight">Automated Migration Framework</span>
     • Created a utility to support migration from OpenText Capture Center (OCC) to Intelligent Capture systems.
     • <span class="cli-output-line success">Used C# and WPF to automate configuration and reduce migration work from several hours to minutes.</span>
  4. <span class="cli-output-line highlight">Label-Based Extraction Tool</span>
     • Developed a field-extraction tool that identifies values using contextual labels rather than fixed layout coordinates.
     • Used C# and WPF to build an interactive workspace for form registration and template setup.
`,
      experience: () => `
<span class="cli-output-line system">PROFESSIONAL EXPERIENCE:</span>
  <span class="cli-output-line highlight">STELLARIS TECHNOLOGIES PVT LTD</span> | Software Engineer | Jan 2022 – Present (4.5+ Years)
  • <span style="color:#ffffff;font-weight:700">Automated document processing:</span> Integrated Google Cloud OCR API and Tesseract into a C#/.NET processing pipeline with React interface (cut effort by 40%+).
  • <span style="color:#ffffff;font-weight:700">Legacy-system migration:</span> Developed C# and WPF utility for OpenText Capture Center (OCC) to Intelligent Capture (reduced hours to minutes).
  • <span style="color:#ffffff;font-weight:700">Context-aware extraction:</span> Built label-based field-extraction tool identifying values through contextual labels; interactive WPF workspace.
  • <span style="color:#ffffff;font-weight:700">Web and desktop delivery:</span> Developed and maintained ASP.NET Core Razor Pages & MVC, alongside WPF and Windows Forms desktop apps.
  • <span style="color:#ffffff;font-weight:700">Database engineering:</span> Designed relational structures in PostgreSQL & SQL Server; developed stored procedures & optimized queries.
  • <span style="color:#ffffff;font-weight:700">End-to-end engineering:</span> Translated stakeholder requirements, applied SOLID principles, contributed to unit testing, integration testing, and performance validation.
`,
      cert: () => `
<span class="cli-output-line success">CERTIFICATION & PROFESSIONAL DEVELOPMENT:</span>
  <span class="cli-output-line highlight">AI-First Software Engineering (Core Java)</span>
  Issuer: Airtribe | Credential: Certificate of Completion | Issued: 14 October 2026
  Core Areas: Agentic AI workflows, LLM prompt engineering, automated testing generation, AI-accelerated backend engineering.
`,
      contact: () => `
<span class="cli-output-line system">CONTACT & PROFILES:</span>
  Email:    <a href="mailto:hasheem7860@gmail.com" style="color:#38bdf8;text-decoration:underline;">hasheem7860@gmail.com</a>
  Phone:    +91-6361846692
  LinkedIn: <a href="http://www.linkedin.com/in/mohammedhasheem-dotnet" target="_blank" style="color:#38bdf8;text-decoration:underline;">linkedin.com/in/mohammedhasheem-dotnet</a>
  GitHub:   <a href="https://github.com/Hasheem786" target="_blank" style="color:#38bdf8;text-decoration:underline;">github.com/Hasheem786</a>
  Location: Mysore, Karnataka, India
  Degree:   Bachelor of Engineering (B.E.), BGS Institute of Technology (2021)
`,
      linkedin: () => {
        window.open('http://www.linkedin.com/in/mohammedhasheem-dotnet', '_blank');
        return '<span class="cli-output-line success">Opening LinkedIn profile in new tab... (linkedin.com/in/mohammedhasheem-dotnet)</span>';
      },
      github: () => {
        window.open('https://github.com/Hasheem786', '_blank');
        return '<span class="cli-output-line success">Opening GitHub profile in new tab... (github.com/Hasheem786)</span>';
      },
      resume: () => {
        window.open('Hasheem_Resume.pdf', '_blank');
        return '<span class="cli-output-line success">Opening Hasheem_Resume.pdf in new tab...</span>';
      },
      matrix: () => `
<span class="cli-output-line system">01001000 01000001 01010011 01001000 01000101 01000101 01001101</span>
<span class="cli-output-line success">Executing neural stream... 100% C# .NET CORE & AI MATRIX ONLINE.</span>
`,
      clear: () => {
        body.innerHTML = '';
        return '';
      }
    };

    function appendOutput(html) {
      if (!html) return;
      const div = document.createElement('div');
      div.className = 'cli-output-block';
      div.innerHTML = html;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function executeCommand(raw) {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;

      commandHistory.push(cmd);
      historyIndex = commandHistory.length;

      // Echo input
      const echo = document.createElement('div');
      echo.className = 'cli-output-line';
      echo.innerHTML = `<span style="color:var(--accent-cyan)">visitor@stellaris:~$</span> <span style="color:#ffffff">${escapeHtml(cmd)}</span>`;
      body.appendChild(echo);

      sfx.terminal();

      if (COMMANDS[cmd]) {
        const result = COMMANDS[cmd]();
        appendOutput(result);
      } else {
        appendOutput(`<span class="cli-output-line" style="color:#f87171">Command not recognized: "${escapeHtml(cmd)}". Type <span class="highlight">help</span> for list.</span>`);
      }
      body.scrollTop = body.scrollHeight;
    }

    input.addEventListener('keydown', (e) => {
      initAudio();
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        executeCommand(val);
      } else if (e.key === 'ArrowUp') {
        if (historyIndex > 0) {
          historyIndex--;
          input.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          input.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          input.value = '';
        }
      }
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        initAudio();
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) executeCommand(cmd);
      });
      chip.addEventListener('mouseenter', sfx.hover);
    });
  }

  /* -------------------------------------------------------------
   * 4. SKILLS FILTERING INTERACTION
   * ------------------------------------------------------------- */
  function setupSkillsFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-category-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.click();
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.getAttribute('data-category');

        skillCards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          } else {
            card.style.display = 'none';
          }
        });
      });
      btn.addEventListener('mouseenter', sfx.hover);
    });
  }

  /* -------------------------------------------------------------
   * 5. RESUME MODAL VIEWER
   * ------------------------------------------------------------- */
  function setupResumeModal() {
    const openBtns = document.querySelectorAll('.btn-open-resume-modal');
    const modal = document.getElementById('resume-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!modal) return;

    function openModal() {
      sfx.click();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      sfx.click();
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    openBtns.forEach(b => b.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* -------------------------------------------------------------
   * 6. FLOATING HUD (Audio Toggle & Quick Actions)
   * ------------------------------------------------------------- */
  function setupFloatingHUD() {
    const soundToggle = document.getElementById('sound-toggle-btn');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        initAudio();
        isSoundEnabled = !isSoundEnabled;
        soundToggle.classList.toggle('active', isSoundEnabled);
        const label = soundToggle.querySelector('span');
        if (label) label.textContent = isSoundEnabled ? 'Audio: ON' : 'Audio: OFF';
        if (isSoundEnabled) sfx.success();
      });
    }

    // Interactive button hovers with SFX
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-resume, .btn-icon').forEach(btn => {
      btn.addEventListener('mouseenter', sfx.hover);
      btn.addEventListener('click', () => {
        initAudio();
        sfx.click();
      });
    });
  }

  /* -------------------------------------------------------------
   * 7. LIVE MYSORE (IST) CLOCK
   * ------------------------------------------------------------- */
  function setupLocalClock() {
    const clockEl = document.getElementById('live-mysore-time');
    if (!clockEl) return;

    function updateTime() {
      try {
        const now = new Date();
        const options = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        clockEl.textContent = new Intl.DateTimeFormat('en-US', options).format(now) + ' IST';
      } catch (err) {
        clockEl.textContent = new Date().toLocaleTimeString();
      }
    }
    updateTime();
    setInterval(updateTime, 1000);
  }

  /* -------------------------------------------------------------
   * 8. CONTACT FORM & QUICK COPY
   * ------------------------------------------------------------- */
  function setupContactUtilities() {
    const toast = document.getElementById('toast-notice');

    function showToast(msg) {
      if (!toast) return;
      toast.querySelector('span').textContent = msg;
      toast.classList.add('show');
      sfx.success();
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }

    // Copy Email & Phone buttons
    document.querySelectorAll('.btn-copy-info').forEach(btn => {
      btn.addEventListener('click', () => {
        initAudio();
        const textToCopy = btn.getAttribute('data-copy');
        if (navigator.clipboard && textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`Copied "${textToCopy}" to clipboard!`);
          });
        }
      });
    });

    // Contact utilities initialized
  }

  /* -------------------------------------------------------------
   * 9. SCROLL ACTIVE LINK SPY
   * ------------------------------------------------------------- */
  function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // DOMContentLoaded bootstrap
  window.addEventListener('DOMContentLoaded', () => {
    setupArchitectureInspector();
    setupTerminal();
    setupSkillsFilter();
    setupResumeModal();
    setupFloatingHUD();
    setupLocalClock();
    setupContactUtilities();
    setupScrollSpy();
  });

})();
