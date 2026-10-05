/**
 * SRI NEYA CRANE SERVICES (SNC) - Loading Page Integration
 * Seamless automated preloader featuring movable crane lifting steel beams,
 * synchronized chain sound, real-time loading percentage, and industrial shutter transition.
 */

(function () {
  let craneSimInstance = null;
  let preloaderEl = null;
  let isLoaderActive = true;

  const statusMessages = [
    { at: 0, title: "SYSTEM BOOT & DIESEL ENGINE START", sub: "Caterpillar Hydraulic Transmission Online" },
    { at: 20, title: "RIGGING 4-POINT CHAIN SLINGS", sub: "Connecting 45-Tonne Heavy Steel I-Beams" },
    { at: 45, title: "HYDRAULIC ELEVATION & TENSION HOIST", sub: "Boom Cylinder 285 Bar Pressure Engaged" },
    { at: 75, title: "SWING RADIUS & TONNAGE CALIBRATION", sub: "Safe Working Load (SWL) Nominal 76%" },
    { at: 95, title: "DISPATCH FLEET READY", sub: "Sri Neya Crane Services - 24/7 Operations Authorized" }
  ];

  function createPreloaderHTML() {
    const preloader = document.createElement('div');
    preloader.id = 'snc-crane-preloader';
    preloader.innerHTML = `
      <div class="crane-blueprint-grid"></div>

      <!-- TOP BRAND & CONTROLS BAR -->
      <div class="crane-loader-header">
        <div class="crane-loader-brand">
          <div class="crane-badge-triangle"></div>
          <div class="crane-brand-text">
            <h1>SRI NEYA <span>CRANE</span></h1>
            <p>Heavy Industrial Lifting Solutions</p>
          </div>
        </div>

        <div class="crane-loader-controls">
          <!-- Audio Toggle Button -->
          <button id="loaderSoundBtn" class="crane-btn-pill" title="Toggle Chain & Engine Audio">
            <i class="fa-solid fa-volume-high" id="loaderSoundIcon"></i>
            <span id="loaderSoundText">SOUND ON</span>
            <div class="equalizer-wave playing" id="loaderEqualizer">
              <span></span><span></span><span></span><span></span>
            </div>
          </button>

          <!-- Interactive Mode Toggle -->
          <button id="loaderModeToggleBtn" class="crane-btn-pill" title="Toggle Manual Crane Control">
            <i class="fa-solid fa-gamepad"></i>
            <span id="loaderModeText">DRIVE CRANE</span>
          </button>

          <!-- Standalone Sim Link -->
          <a href="crane-automation.html" class="crane-btn-pill hidden sm:flex" title="Open 3D Automation Lab">
            <i class="fa-solid fa-sliders"></i>
            <span>FULL LAB</span>
          </a>
        </div>
      </div>

      <!-- CENTER VIDEO-MOVABLE CRANE STAGE -->
      <div class="crane-stage-viewport" id="craneViewport">
        <!-- Industrial HUD Telemetry -->
        <div class="crane-hud-telemetry">
          <div class="hud-item"><span>BOOM ANGLE:</span> <span class="hud-val" id="sncHudAngle">38.0°</span></div>
          <div class="hud-item"><span>WORKING RADIUS:</span> <span class="hud-val" id="sncHudRadius">18.4 m</span></div>
          <div class="hud-item"><span>LIFT HEIGHT:</span> <span class="hud-val" id="sncHudHeight">0.0 m</span></div>
          <div class="hud-item"><span>PAYLOAD:</span> <span class="hud-val" id="sncHudWeight">45.0 T</span></div>
          <div class="hud-item"><span>SWL RATING:</span> <span class="hud-badge-safe" id="sncHudSWL">76% OK</span></div>
        </div>

        <!-- Movable Camera Toolbar -->
        <div class="crane-camera-toolbar">
          <button class="crane-tool-icon-btn" id="camZoomInBtn" title="Zoom In"><i class="fa-solid fa-plus"></i></button>
          <button class="crane-tool-icon-btn" id="camZoomOutBtn" title="Zoom Out"><i class="fa-solid fa-minus"></i></button>
          <button class="crane-tool-icon-btn" id="camResetBtn" title="Reset View"><i class="fa-solid fa-arrows-rotate"></i></button>
        </div>

        <!-- SVG Crane Animation Canvas Wrap -->
        <div class="crane-stage-canvas-wrap" id="craneStageWrap">
          <div id="craneSvgMount" style="width:100%; height:100%; display:flex; justify-content:center; align-items:center;"></div>
        </div>

        <!-- Manual Joystick / Sliders Panel (Appears when Drive Mode is active) -->
        <div class="crane-manual-controls-panel" id="manualControlsPanel" style="display: none;">
          <div class="control-slider-group">
            <label>Boom Pitch: <span id="valBoomAngle">38°</span></label>
            <input type="range" min="20" max="68" value="38" class="crane-slider" id="sliderBoomAngle">
          </div>
          <div class="control-slider-group">
            <label>Hoist Winch: <span id="valWinch">260px</span></label>
            <input type="range" min="100" max="320" value="260" class="crane-slider" id="sliderWinch">
          </div>
          <div class="control-slider-group">
            <label>Boom Telescoping: <span id="valTelescope">1.0x</span></label>
            <input type="range" min="1.0" max="1.65" step="0.05" value="1.0" class="crane-slider" id="sliderTelescope">
          </div>
          <div class="control-slider-group">
            <label>Crawler Drive: <span id="valTrack">0px</span></label>
            <input type="range" min="-120" max="120" value="0" class="crane-slider" id="sliderTrack">
          </div>
        </div>
      </div>

      <!-- BOTTOM LOADING PROGRESS & ACTION BAR -->
      <div class="crane-loader-bottom">
        <div class="crane-progress-info">
          <div>
            <div class="crane-status-title">
              <span class="pulse-dot"></span>
              <span id="loaderStatusTitle">INITIALIZING HYDRAULIC PRESSURE...</span>
            </div>
            <div class="crane-status-sub" id="loaderStatusSub">Connecting to SNC Live Fleet Network</div>
          </div>
          <div class="crane-percentage-display" id="loaderPercent">0%</div>
        </div>

        <!-- Progress Bar -->
        <div class="crane-progress-track">
          <div class="crane-progress-fill" id="loaderProgressBar"></div>
        </div>

        <!-- Action Buttons -->
        <div class="crane-bottom-actions">
          <button id="skipLoaderBtn" class="crane-action-btn">
            <span>ENTER SITE</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button id="replayLiftBtn" class="crane-ghost-btn">
            <i class="fa-solid fa-rotate-right"></i>
            <span>REPLAY LIFT</span>
          </button>
        </div>
      </div>
    `;

    document.body.prepend(preloader);
    return preloader;
  }

  function initPreloader() {
    // Only init if not already present
    if (document.getElementById('snc-crane-preloader')) return;

    preloaderEl = createPreloaderHTML();

    // Instantiate Crane Simulation
    const mountEl = document.getElementById('craneSvgMount');
    if (mountEl) {
      craneSimInstance = new SncCraneSimulation(mountEl, {
        mode: 'auto',
        autoCycle: true,
        soundEnabled: true
      });
    }

    // Bind Event Listeners
    setupControls();

    // Start Real or Simulated Loading Progression
    startLoadingProgress();
  }

  function setupControls() {
    // 1. Audio Toggle
    const soundBtn = document.getElementById('loaderSoundBtn');
    const soundIcon = document.getElementById('loaderSoundIcon');
    const soundText = document.getElementById('loaderSoundText');
    const equalizer = document.getElementById('loaderEqualizer');

    if (soundBtn && window.sncCraneAudio) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.sncCraneAudio.resume();
        const isMuted = window.sncCraneAudio.toggleMute();
        
        if (isMuted) {
          soundIcon.className = 'fa-solid fa-volume-xmark text-zinc-500';
          soundText.textContent = 'MUTED';
          equalizer.classList.remove('playing');
        } else {
          soundIcon.className = 'fa-solid fa-volume-high text-cat-yellow';
          soundText.textContent = 'SOUND ON';
          equalizer.classList.add('playing');
        }
      });
    }

    // 2. Manual Drive Toggle
    const modeBtn = document.getElementById('loaderModeToggleBtn');
    const modeText = document.getElementById('loaderModeText');
    const manualPanel = document.getElementById('manualControlsPanel');

    if (modeBtn && manualPanel) {
      modeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCurrentlyManual = craneSimInstance && craneSimInstance.options.mode === 'manual';
        
        if (isCurrentlyManual) {
          craneSimInstance.options.mode = 'auto';
          modeBtn.classList.remove('active');
          modeText.textContent = 'DRIVE CRANE';
          manualPanel.style.display = 'none';
        } else {
          craneSimInstance.options.mode = 'manual';
          modeBtn.classList.add('active');
          modeText.textContent = 'AUTO LIFT';
          manualPanel.style.display = 'flex';
        }
      });
    }

    // 3. Manual Sliders Binding
    const sliderBoom = document.getElementById('sliderBoomAngle');
    const sliderWinch = document.getElementById('sliderWinch');
    const sliderTele = document.getElementById('sliderTelescope');
    const sliderTrack = document.getElementById('sliderTrack');

    if (sliderBoom && sliderWinch && sliderTele && sliderTrack) {
      const updateManualValues = () => {
        if (!craneSimInstance) return;
        const b = parseFloat(sliderBoom.value);
        const w = parseFloat(sliderWinch.value);
        const t = parseFloat(sliderTele.value);
        const k = parseFloat(sliderTrack.value);

        document.getElementById('valBoomAngle').textContent = `${b}°`;
        document.getElementById('valWinch').textContent = `${w}px`;
        document.getElementById('valTelescope').textContent = `${t.toFixed(1)}x`;
        document.getElementById('valTrack').textContent = `${k}px`;

        craneSimInstance.setManualControls(b, w, t, k);
      };

      sliderBoom.addEventListener('input', updateManualValues);
      sliderWinch.addEventListener('input', updateManualValues);
      sliderTele.addEventListener('input', updateManualValues);
      sliderTrack.addEventListener('input', updateManualValues);
    }

    // 4. Camera Tools
    const zoomIn = document.getElementById('camZoomInBtn');
    const zoomOut = document.getElementById('camZoomOutBtn');
    const zoomReset = document.getElementById('camResetBtn');

    if (zoomIn && craneSimInstance) {
      zoomIn.addEventListener('click', () => {
        craneSimInstance.setCamera(craneSimInstance.state.cameraZoom * 1.25, craneSimInstance.state.cameraPanX, craneSimInstance.state.cameraPanY);
      });
    }
    if (zoomOut && craneSimInstance) {
      zoomOut.addEventListener('click', () => {
        craneSimInstance.setCamera(craneSimInstance.state.cameraZoom * 0.8, craneSimInstance.state.cameraPanX, craneSimInstance.state.cameraPanY);
      });
    }
    if (zoomReset && craneSimInstance) {
      zoomReset.addEventListener('click', () => {
        craneSimInstance.setCamera(1.0, 0, 0);
      });
    }

    // 5. Skip / Enter Site Button
    const skipBtn = document.getElementById('skipLoaderBtn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        dismissPreloader();
      });
    }

    // 6. Replay Lift Button
    const replayBtn = document.getElementById('replayLiftBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (craneSimInstance) {
          craneSimInstance.options.mode = 'auto';
          craneSimInstance.state.cycleProgress = 0;
          if (window.sncCraneAudio) window.sncCraneAudio.playWarningBeep();
        }
      });
    }

    // Enable sound on first interaction
    document.addEventListener('click', () => {
      if (window.sncCraneAudio) window.sncCraneAudio.resume();
    }, { once: true });
  }

  function startLoadingProgress() {
    let progress = 0;
    const bar = document.getElementById('loaderProgressBar');
    const text = document.getElementById('loaderPercent');
    const title = document.getElementById('loaderStatusTitle');
    const sub = document.getElementById('loaderStatusSub');

    const progressTimer = setInterval(() => {
      // Smooth loading curve
      const step = Math.max(1, (100 - progress) * 0.08 + Math.random() * 2);
      progress = Math.min(100, progress + step);

      if (bar) bar.style.width = `${progress}%`;
      if (text) text.textContent = `${Math.round(progress)}%`;

      // Update status message
      for (let i = statusMessages.length - 1; i >= 0; i--) {
        if (progress >= statusMessages[i].at) {
          if (title) title.textContent = statusMessages[i].title;
          if (sub) sub.textContent = statusMessages[i].sub;
          break;
        }
      }

      // Completed loading
      if (progress >= 100) {
        clearInterval(progressTimer);
        setTimeout(() => {
          if (isLoaderActive) {
            dismissPreloader();
          }
        }, 800);
      }
    }, 50);

    // Also auto-dismiss once window is fully loaded if progress finished
    window.addEventListener('load', () => {
      progress = Math.max(progress, 90);
    });
  }

  function dismissPreloader() {
    isLoaderActive = false;
    if (preloaderEl) {
      if (window.sncCraneAudio) {
        window.sncCraneAudio.playAirRelease();
        window.sncCraneAudio.playIndustrialHorn();
      }

      preloaderEl.classList.add('preloader-hidden');
      setTimeout(() => {
        preloaderEl.style.display = 'none';
      }, 850);
    }
  }

  // Global helper to reopen loader or trigger simulation anytime
  window.openSncCraneLoader = function () {
    if (!preloaderEl) {
      initPreloader();
    } else {
      isLoaderActive = true;
      preloaderEl.style.display = 'flex';
      preloaderEl.classList.remove('preloader-hidden');
      if (craneSimInstance) {
        craneSimInstance.state.cycleProgress = 0;
        craneSimInstance.options.mode = 'auto';
      }
      if (window.sncCraneAudio) {
        window.sncCraneAudio.resume();
        window.sncCraneAudio.playWarningBeep();
      }
      startLoadingProgress();
    }
  };

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader);
  } else {
    initPreloader();
  }
})();
