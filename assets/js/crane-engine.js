/**
 * SRI NEYA CRANE SERVICES (SNC) - Interactive Crane Kinematics & Physics Engine
 * Exact Vector recreation of the heavy crawler crane with steel I-beam lifting automation.
 * Supports:
 * - Real-time Forward Kinematics (Boom Angle, Hydraulic Cylinder Telescoping, Boom Extension)
 * - Cable & Hook Hoisting with Pendulum Physics Sway
 * - Crawler Track Drive Animation with Ground Dust
 * - Procedural Audio Synchronization (Chain Clinks, Winch Whine, Diesel RPM)
 * - Interactive Video-Movable Camera & Manual Control
 */

class SncCraneSimulation {
  constructor(svgContainerId, options = {}) {
    this.container = typeof svgContainerId === 'string' ? document.getElementById(svgContainerId) : svgContainerId;
    this.options = Object.assign({
      mode: 'auto', // 'auto' | 'manual' | 'interactive'
      autoCycle: true,
      soundEnabled: true,
      showHUD: true,
      loadType: 'steel_beams', // 'steel_beams' | 'transformer' | 'generator'
      onProgress: null,
      onComplete: null
    }, options);

    // Crane Physical State
    this.state = {
      // Kinematic angles & extensions
      boomAngle: 38,       // degrees (20° to 70°)
      boomLengthRatio: 1.0,// 1.0 to 1.7 (telescoping extension)
      cableLength: 260,    // pixels (80 to 360)
      trackX: 0,           // horizontal traverse (-150 to 150)
      
      // Physics & Dynamics
      targetBoomAngle: 38,
      targetCableLength: 260,
      targetBoomLengthRatio: 1.0,
      targetTrackX: 0,
      
      swayAngle: 0,        // pendulum angle
      swayVelocity: 0,     // pendulum angular velocity
      
      // Load and Telemetry
      loadWeightTons: 45.0,
      isLoadAttached: true,
      loadElevation: 0,    // 0 = resting on ground, >0 in air
      
      // Camera / Video Viewport Transform
      cameraZoom: 1.0,
      cameraPanX: 0,
      cameraPanY: 0,
      
      // Automation Cycle State
      cycleProgress: 0,    // 0 to 100%
      cyclePhase: 'init',  // 'init', 'lift', 'swing', 'lower', 'complete'
      cycleSpeed: 1.0,
      isPaused: false
    };

    // Crane Dimensions & Anchor Constants
    this.GEOMETRY = {
      viewBoxWidth: 1000,
      viewBoxHeight: 700,
      groundY: 620,
      boomPivot: { x: 580, y: 440 },       // Main hinge pin
      cylinderBase: { x: 540, y: 520 },    // Hydraulic base pin
      cylinderBoomPinDist: 110,            // Distance along boom to piston mount
      baseBoomLen: 340,                    // Base boom segment length
      teleBoomLen: 220,                    // Telescopic inner boom segment length
      loadGroundY: 575                     // Ground rest position for beams
    };

    this.audio = window.sncCraneAudio || null;
    this.lastTime = performance.now();
    this.animFrameId = null;
    this.exhaustParticles = [];

    this.initSVG();
    this.initInteraction();
    this.startAnimationLoop();
  }

  /* -------------------------------------------------------------
     1. Build the High-Resolution Vector SVG Mechanical Crane
     ------------------------------------------------------------- */
  initSVG() {
    if (!this.container) return;

    this.container.innerHTML = `
      <svg class="crane-svg-canvas" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradients for Industrial Caterpillar Finishes -->
          <linearGradient id="catYellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFE040" />
            <stop offset="50%" stop-color="#FFCD11" />
            <stop offset="100%" stop-color="#D49E00" />
          </linearGradient>

          <linearGradient id="catYellowLightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFEB7A" />
            <stop offset="100%" stop-color="#FFCD11" />
          </linearGradient>

          <linearGradient id="chromePistonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="35%" stop-color="#c8cdd4" />
            <stop offset="70%" stop-color="#8a94a0" />
            <stop offset="100%" stop-color="#e8ecf2" />
          </linearGradient>

          <linearGradient id="chassisDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3c434d" />
            <stop offset="100%" stop-color="#1f2329" />
          </linearGradient>

          <linearGradient id="steelBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#8d99a8" />
            <stop offset="50%" stop-color="#677382" />
            <stop offset="100%" stop-color="#464e58" />
          </linearGradient>

          <linearGradient id="glassCabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#607274" />
            <stop offset="100%" stop-color="#2d3748" />
          </linearGradient>

          <!-- Drop Shadows and Filters -->
          <filter id="craneShadow" x="-10%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#000000" flood-opacity="0.75" />
          </filter>

          <filter id="beamBlurShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
        </defs>

        <!-- World Transform Group for Camera Pan/Zoom -->
        <g id="cameraViewportGroup" transform="translate(0, 0) scale(1)">

          <!-- Ground Contact & Construction Grid Baseline -->
          <g id="groundGroup">
            <!-- Horizon Base Line -->
            <line x1="20" y1="620" x2="980" y2="620" stroke="#FFCD11" stroke-width="3" stroke-dasharray="16, 8" opacity="0.35" />
            <line x1="400" y1="620" x2="920" y2="620" stroke="#111111" stroke-width="5" stroke-linecap="round" />
            <line x1="80" y1="620" x2="430" y2="620" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round" />
            
            <!-- Ground Contact Shadows -->
            <ellipse id="chassisGroundShadow" cx="680" cy="624" rx="220" ry="10" fill="#000000" opacity="0.85" filter="url(#beamBlurShadow)" />
            <ellipse id="beamGroundShadow" cx="240" cy="622" rx="140" ry="12" fill="#000000" opacity="0.7" filter="url(#beamBlurShadow)" />
          </g>

          <!-- DYNAMIC CRANE ASSEMBLY GROUP -->
          <g id="craneAssemblyGroup" transform="translate(0, 0)">

            <!-- 1. CRAWLER UNDERCARRIAGE CHASSIS (Fixed to tracks) -->
            <g id="crawlerChassisGroup">
              <!-- Track Housing Outer Frame -->
              <rect x="460" y="540" width="440" height="74" rx="36" fill="url(#chassisDarkGrad)" stroke="#111" stroke-width="6" />
              <rect x="475" y="552" width="410" height="50" rx="24" fill="#23272e" stroke="#111" stroke-width="3" />

              <!-- Crawler Track Links Detail (Treads) -->
              <path id="treadLinksPath" d="M 490 543 L 870 543 M 490 611 L 870 611" stroke="#111" stroke-width="8" stroke-dasharray="10, 10" />

              <!-- Left & Right Main Drive Sprocket Wheels -->
              <circle cx="500" cy="577" r="32" fill="#3c434d" stroke="#111" stroke-width="5" />
              <circle cx="500" cy="577" r="14" fill="#111" />
              <circle cx="500" cy="577" r="6" fill="#FFCD11" />

              <circle cx="860" cy="577" r="32" fill="#3c434d" stroke="#111" stroke-width="5" />
              <circle cx="860" cy="577" r="14" fill="#111" />
              <circle cx="860" cy="577" r="6" fill="#FFCD11" />

              <!-- 5 Bottom Road Rollers -->
              <g id="roadRollersGroup">
                <circle cx="560" cy="582" r="17" fill="#2b313a" stroke="#111" stroke-width="4" />
                <circle cx="620" cy="582" r="17" fill="#2b313a" stroke="#111" stroke-width="4" />
                <circle cx="680" cy="582" r="17" fill="#2b313a" stroke="#111" stroke-width="4" />
                <circle cx="740" cy="582" r="17" fill="#2b313a" stroke="#111" stroke-width="4" />
                <circle cx="800" cy="582" r="17" fill="#2b313a" stroke="#111" stroke-width="4" />
              </g>

              <!-- Track Body Accents & Inspection Hatches -->
              <rect x="605" y="562" width="40" height="26" rx="4" fill="#1f2329" stroke="#111" stroke-width="3" />
              <rect x="725" y="562" width="46" height="26" rx="4" fill="#1f2329" stroke="#111" stroke-width="3" />
            </g>

            <!-- 2. REVOLVING UPPERSTRUCTURE & CABIN (Caterpillar Yellow Body) -->
            <g id="superstructureGroup">
              <!-- Turntable Base Slew Ring -->
              <rect x="590" y="526" width="220" height="16" rx="3" fill="#181b20" stroke="#111" stroke-width="4" />

              <!-- Main Yellow Machinery Body Hood -->
              <path d="M 535 530 L 845 530 L 845 440 L 725 440 L 725 410 L 610 410 L 535 480 Z" 
                    fill="url(#catYellowGrad)" stroke="#111" stroke-width="6" stroke-linejoin="round" />

              <!-- Engine Louver Grille & Air Vents -->
              <g id="engineVents" stroke="#111" stroke-width="4" stroke-linecap="round">
                <line x1="795" y1="465" x2="830" y2="465" />
                <line x1="795" y1="478" x2="830" y2="478" />
                <line x1="795" y1="491" x2="830" y2="491" />
                <line x1="795" y1="504" x2="830" y2="504" />
              </g>

              <!-- Rear Counterweight Ballast Plates (3 Slabs) -->
              <g id="counterweightsGroup">
                <rect x="845" y="442" width="55" height="24" rx="3" fill="url(#catYellowGrad)" stroke="#111" stroke-width="4" />
                <rect x="845" y="468" width="55" height="28" rx="3" fill="url(#catYellowGrad)" stroke="#111" stroke-width="4" />
                <rect x="845" y="498" width="55" height="32" rx="3" fill="url(#catYellowGrad)" stroke="#111" stroke-width="4" />
                <line x1="872" y1="442" x2="872" y2="530" stroke="#111" stroke-width="3" />
              </g>

              <!-- Operator Cabin (Modern Angled Glass) -->
              <g id="operatorCabinGroup">
                <!-- Cabin Frame Structure -->
                <path d="M 538 528 L 595 528 L 600 412 L 542 485 Z" fill="url(#catYellowGrad)" stroke="#111" stroke-width="5" />
                
                <!-- Front Windshield & Side Windows -->
                <polygon points="545,482 575,422 615,422 615,495 575,518 548,518" fill="url(#glassCabGrad)" stroke="#111" stroke-width="4" />
                
                <!-- Window Mullion Dividing Bars -->
                <line x1="575" y1="422" x2="575" y2="518" stroke="#111" stroke-width="4" />
                <line x1="615" y1="422" x2="615" y2="495" stroke="#111" stroke-width="4" />

                <!-- Operator Silhouette / Seat -->
                <circle cx="592" cy="452" r="7" fill="#181818" opacity="0.6" />
                <path d="M 584 480 Q 592 462 602 480 Z" fill="#181818" opacity="0.6" />
              </g>

              <!-- Diesel Exhaust Pipe & Particle Emitter Anchor -->
              <rect x="760" y="396" width="10" height="20" rx="2" fill="#2d3748" stroke="#111" stroke-width="3" />
              <g id="exhaustParticleContainer"></g>

              <!-- Main Boom Pivot Hinge Pin -->
              <circle cx="580" cy="440" r="14" fill="#1f242d" stroke="#111" stroke-width="4" />
              <circle cx="580" cy="440" r="5" fill="#FFCD11" />
            </g>

            <!-- 3. HYDRAULIC LIFT CYLINDER (Piston dynamically pivots & telescopes) -->
            <g id="hydraulicCylinderGroup">
              <!-- Base Cylinder Barrel (Dark Metal) -->
              <line id="cylinderBarrel" x1="540" y1="520" x2="560" y2="480" stroke="#222831" stroke-width="20" stroke-linecap="round" />
              
              <!-- Chrome Piston Rod (Polished Steel) -->
              <line id="pistonRod" x1="550" y1="500" x2="570" y2="460" stroke="url(#chromePistonGrad)" stroke-width="12" stroke-linecap="round" />

              <!-- Base Pin Anchor -->
              <circle cx="540" cy="520" r="9" fill="#111" stroke="#FFCD11" stroke-width="2.5" />
            </g>

            <!-- 4. ARTICULATED TELESCOPIC BOOM ASSEMBLY (Rotates around Pivot 580, 440) -->
            <g id="craneBoomMasterGroup" transform="rotate(38, 580, 440)">
              
              <!-- Base Boom Segment (Heavy yellow box section with slots) -->
              <g id="baseBoomSegment">
                <!-- Main Yellow Boom Casing -->
                <path d="M 560 460 L 595 425 L 340 235 L 310 270 Z" fill="url(#catYellowGrad)" stroke="#111" stroke-width="6" stroke-linejoin="round" />
                
                <!-- Black Safety Weight-Relief Slots -->
                <g stroke="#111" stroke-width="4" fill="#1a1d24">
                  <rect x="400" y="305" width="28" height="8" rx="2" transform="rotate(-38, 414, 309)" />
                  <rect x="425" y="325" width="28" height="8" rx="2" transform="rotate(-38, 439, 329)" />
                  <rect x="450" y="345" width="28" height="8" rx="2" transform="rotate(-38, 464, 349)" />
                  <rect x="475" y="365" width="28" height="8" rx="2" transform="rotate(-38, 489, 369)" />
                </g>

                <!-- Boom Reinforcement Ribs & Angle Gussets -->
                <path d="M 480 400 L 515 425 L 470 435 Z" fill="url(#catYellowGrad)" stroke="#111" stroke-width="4" />
                
                <!-- Hydraulic Ram Attachment Pin on Boom -->
                <circle cx="490" cy="405" r="7" fill="#111" stroke="#FFCD11" stroke-width="2" />
              </g>

              <!-- Inner Telescopic Boom Segment (Extends out smoothly) -->
              <g id="teleBoomSegment" transform="translate(0, 0)">
                <!-- Dark Metallic Inner Section -->
                <path d="M 330 242 L 305 262 L 235 208 L 260 188 Z" fill="url(#chassisDarkGrad)" stroke="#111" stroke-width="5" />
                
                <!-- Yellow Boom Head Tip & Sheaves / Pulleys -->
                <path d="M 262 188 L 235 208 L 225 150 L 255 132 Z" fill="url(#catYellowGrad)" stroke="#111" stroke-width="5" stroke-linejoin="round" />
                <circle cx="242" cy="148" r="9" fill="#111" stroke="#FFCD11" stroke-width="3" />

                <!-- Sheave / Winch Pulley -->
                <circle cx="242" cy="148" r="4" fill="#fff" />
              </g>

            </g> <!-- End Boom Master Group -->

          </g> <!-- End Crane Assembly Group -->

          <!-- 5. DYNAMIC HOIST LINE, HOOK BLOCK & RIGGING SLINGS -->
          <g id="riggingMasterGroup">
            <!-- Winch Line (Chain/Cable hanging vertically to hook) -->
            <line id="hoistCableLine" x1="242" y1="148" x2="242" y2="400" stroke="#222" stroke-width="4.5" />
            <line id="hoistCableCore" x1="242" y1="148" x2="242" y2="400" class="crane-chain-link" />

            <!-- Heavy Crane Hook Block Group -->
            <g id="hookBlockGroup" transform="translate(242, 400)">
              <!-- Hook Casing (Yellow Diamond/Hexagon shape from image) -->
              <polygon points="0,-18 16,-6 16,14 0,26 -16,14 -16,-6" fill="url(#catYellowGrad)" stroke="#111" stroke-width="4" />
              <circle cx="0" cy="4" r="5" fill="#111" />
              
              <!-- Heavy Forged Steel Swivel Hook -->
              <path d="M 0 24 C 0 38 18 42 18 54 C 18 66 2 72 -8 68 C -18 64 -18 48 -6 44" 
                    fill="none" stroke="#181b20" stroke-width="7" stroke-linecap="round" />
              <!-- Hook Point Safety Latch -->
              <line x1="-3" y1="44" x2="10" y2="52" stroke="#FFCD11" stroke-width="3" />

              <!-- Slings Attachment Ring -->
              <circle cx="-4" cy="62" r="5" fill="none" stroke="#111" stroke-width="4" />
            </g>

            <!-- 4-Leg Rigging Chain Slings (Connecting Hook to Steel Beams) -->
            <g id="riggingSlingsGroup">
              <line id="slingLine1" x1="238" y1="462" x2="110" y2="540" stroke="#333" stroke-width="3.5" class="crane-chain-link" />
              <line id="slingLine2" x1="238" y1="462" x2="160" y2="540" stroke="#444" stroke-width="3.5" class="crane-chain-link" />
              <line id="slingLine3" x1="238" y1="462" x2="260" y2="540" stroke="#333" stroke-width="3.5" class="crane-chain-link" />
              <line id="slingLine4" x1="238" y1="462" x2="370" y2="540" stroke="#444" stroke-width="3.5" class="crane-chain-link" />
            </g>
          </g>

          <!-- 6. LOAD: STACK OF 3 HEAVY STEEL I-BEAMS (Matching User Image) -->
          <g id="loadAssemblyGroup" transform="translate(240, 575)">
            
            <!-- Top Steel Beam #1 -->
            <g id="beamTop" transform="translate(0, -55)">
              <!-- Top Flange -->
              <rect x="-140" y="-8" width="280" height="9" rx="1.5" fill="url(#steelBeamGrad)" stroke="#111" stroke-width="3" />
              <!-- Vertical Web -->
              <rect x="-136" y="1" width="272" height="18" fill="#525c68" stroke="#111" stroke-width="2.5" />
              <!-- Bottom Flange -->
              <rect x="-140" y="19" width="280" height="9" rx="1.5" fill="url(#steelBeamGrad)" stroke="#111" stroke-width="3" />
              
              <!-- Left Profile Cross Section (I-Profile 3D View) -->
              <path d="M -140 -8 L -158 -8 L -158 1 L -150 1 L -150 19 L -158 19 L -158 28 L -140 28 Z" fill="#3c434d" stroke="#111" stroke-width="3.5" />
              <line x1="-158" y1="-8" x2="-140" y2="-8" stroke="#8d99a8" stroke-width="2" />
            </g>

            <!-- Middle Steel Beam #2 -->
            <g id="beamMiddle" transform="translate(0, -22)">
              <!-- Top Flange -->
              <rect x="-150" y="-8" width="300" height="9" rx="1.5" fill="url(#steelBeamGrad)" stroke="#111" stroke-width="3" />
              <!-- Vertical Web -->
              <rect x="-146" y="1" width="292" height="18" fill="#525c68" stroke="#111" stroke-width="2.5" />
              <!-- Bottom Flange -->
              <rect x="-150" y="19" width="300" height="9" rx="1.5" fill="url(#steelBeamGrad)" stroke="#111" stroke-width="3" />
              
              <!-- Left Profile Cross Section (I-Profile 3D View) -->
              <path d="M -150 -8 L -168 -8 L -168 1 L -160 1 L -160 19 L -168 19 L -168 28 L -150 28 Z" fill="#3c434d" stroke="#111" stroke-width="3.5" />
            </g>

            <!-- Bottom Steel Beam #3 -->
            <g id="beamBottom" transform="translate(0, 12)">
              <!-- Top Flange -->
              <rect x="-135" y="-8" width="290" height="9" rx="1.5" fill="url(#steelBeamGrad)" stroke="#111" stroke-width="3" />
              <!-- Vertical Web -->
              <rect x="-131" y="1" width="282" height="18" fill="#525c68" stroke="#111" stroke-width="2.5" />
              <!-- Bottom Flange -->
              <rect x="-135" y="19" width="290" height="9" rx="1.5" fill="url(#steelBeamGrad)" stroke="#111" stroke-width="3" />
              
              <!-- Left Profile Cross Section (I-Profile 3D View) -->
              <path d="M -135 -8 L -153 -8 L -153 1 L -145 1 L -145 19 L -153 19 L -153 28 L -135 28 Z" fill="#3c434d" stroke="#111" stroke-width="3.5" />
            </g>

            <!-- Heavy Duty Rigging Clamps / Shackles on Beams -->
            <circle cx="-130" cy="-62" r="5" fill="#111" stroke="#FFCD11" stroke-width="2" />
            <circle cx="-80" cy="-62" r="5" fill="#111" stroke="#FFCD11" stroke-width="2" />
            <circle cx="20" cy="-62" r="5" fill="#111" stroke="#FFCD11" stroke-width="2" />
            <circle cx="130" cy="-62" r="5" fill="#111" stroke="#FFCD11" stroke-width="2" />

            <!-- Weight Plate Specs Badge -->
            <rect x="-30" y="-12" width="60" height="14" rx="2" fill="#FFCD11" stroke="#111" stroke-width="1.5" />
            <text x="0" y="-2" text-anchor="middle" font-family="'Inter', monospace" font-size="8" font-weight="900" fill="#000">45 TONNES</text>
          </g>

        </g> <!-- End Camera Viewport Group -->
      </svg>
    `;

    // Cache DOM Elements for Fast 60FPS Kinematics Updates
    this.dom = {
      viewport: this.container.querySelector('#cameraViewportGroup'),
      craneAssembly: this.container.querySelector('#craneAssemblyGroup'),
      treadLinks: this.container.querySelector('#treadLinksPath'),
      roadRollers: this.container.querySelector('#roadRollersGroup'),
      boomMaster: this.container.querySelector('#craneBoomMasterGroup'),
      teleBoom: this.container.querySelector('#teleBoomSegment'),
      cylinderBarrel: this.container.querySelector('#cylinderBarrel'),
      pistonRod: this.container.querySelector('#pistonRod'),
      hoistCableLine: this.container.querySelector('#hoistCableLine'),
      hoistCableCore: this.container.querySelector('#hoistCableCore'),
      hookBlock: this.container.querySelector('#hookBlockGroup'),
      slings: [
        this.container.querySelector('#slingLine1'),
        this.container.querySelector('#slingLine2'),
        this.container.querySelector('#slingLine3'),
        this.container.querySelector('#slingLine4')
      ],
      loadAssembly: this.container.querySelector('#loadAssemblyGroup'),
      beamShadow: this.container.querySelector('#beamGroundShadow'),
      chassisShadow: this.container.querySelector('#chassisGroundShadow'),
      exhaustContainer: this.container.querySelector('#exhaustParticleContainer')
    };
  }

  /* -------------------------------------------------------------
     2. Kinematics Math & Mechanical Solvers
     ------------------------------------------------------------- */
  updateKinematics(dt) {
    // Smooth interpolation to target setpoints
    const lerpRate = dt * 2.5;
    this.state.boomAngle += (this.state.targetBoomAngle - this.state.boomAngle) * Math.min(lerpRate, 1);
    this.state.boomLengthRatio += (this.state.targetBoomLengthRatio - this.state.boomLengthRatio) * Math.min(lerpRate, 1);
    this.state.cableLength += (this.state.targetCableLength - this.state.cableLength) * Math.min(lerpRate * 1.5, 1);
    this.state.trackX += (this.state.targetTrackX - this.state.trackX) * Math.min(lerpRate * 0.8, 1);

    // Audio triggers based on velocity
    const cableDelta = Math.abs(this.state.targetCableLength - this.state.cableLength);
    const boomDelta = Math.abs(this.state.targetBoomAngle - this.state.boomAngle);
    if (cableDelta > 0.5 || boomDelta > 0.1) {
      if (this.audio) {
        this.audio.playChainClink(Math.min(cableDelta / 10, 1.0));
        this.audio.startHydraulicWinch(Math.min(cableDelta / 8, 1.2));
        this.audio.setEngineRPM(0.7);
      }
    } else {
      if (this.audio) {
        this.audio.stopHydraulicWinch();
        this.audio.setEngineRPM(0.1);
      }
    }

    // 1. Calculate Main Boom Pivot and Angle
    const pivotX = this.GEOMETRY.boomPivot.x + this.state.trackX;
    const pivotY = this.GEOMETRY.boomPivot.y;
    const boomAngleDeg = this.state.boomAngle;
    const boomAngleRad = (boomAngleDeg * Math.PI) / 180;

    // Apply Boom Rotation
    if (this.dom.boomMaster) {
      // Rotation angle is relative to standard right vector (pointing up-left)
      this.dom.boomMaster.setAttribute('transform', `rotate(${boomAngleDeg - 38}, ${this.GEOMETRY.boomPivot.x}, ${this.GEOMETRY.boomPivot.y})`);
    }

    // 2. Telescopic Extension along boom vector
    const extOffset = (this.state.boomLengthRatio - 1.0) * 120;
    if (this.dom.teleBoom) {
      const extX = -extOffset * Math.cos(38 * Math.PI / 180);
      const extY = -extOffset * Math.sin(38 * Math.PI / 180);
      this.dom.teleBoom.setAttribute('transform', `translate(${extX}, ${extY})`);
    }

    // 3. Hydraulic Piston Trigonometry Solver
    // Calculate attachment point on boom in world coordinates
    const pinDist = this.GEOMETRY.cylinderBoomPinDist;
    const boomDirRad = (180 - boomAngleDeg) * (Math.PI / 180);
    const boomPinX = pivotX - Math.cos(boomAngleRad) * 120 + Math.sin(boomAngleRad) * 20;
    const boomPinY = pivotY - Math.sin(boomAngleRad) * 120 - Math.cos(boomAngleRad) * 20;

    const basePinX = this.GEOMETRY.cylinderBase.x + this.state.trackX;
    const basePinY = this.GEOMETRY.cylinderBase.y;

    if (this.dom.cylinderBarrel && this.dom.pistonRod) {
      const midPinX = basePinX + (boomPinX - basePinX) * 0.55;
      const midPinY = basePinY + (boomPinY - basePinY) * 0.55;

      this.dom.cylinderBarrel.setAttribute('x1', basePinX - this.state.trackX);
      this.dom.cylinderBarrel.setAttribute('y1', basePinY);
      this.dom.cylinderBarrel.setAttribute('x2', midPinX - this.state.trackX);
      this.dom.cylinderBarrel.setAttribute('y2', midPinY);

      this.dom.pistonRod.setAttribute('x1', midPinX - this.state.trackX);
      this.dom.pistonRod.setAttribute('y1', midPinY);
      this.dom.pistonRod.setAttribute('x2', boomPinX - this.state.trackX);
      this.dom.pistonRod.setAttribute('y2', boomPinY);
    }

    // 4. Boom Tip Calculation (World Position)
    const totalBoomLen = (this.GEOMETRY.baseBoomLen + (this.state.boomLengthRatio - 1.0) * 120);
    const tipX = pivotX - Math.cos(boomAngleRad) * (totalBoomLen * 1.35) + 20;
    const tipY = pivotY - Math.sin(boomAngleRad) * (totalBoomLen * 1.35) - 30;

    // 5. Cable, Hook & Pendulum Sway Physics
    // Damped harmonic oscillator for cable load sway
    const gravity = 9.8;
    const lengthMeters = Math.max(this.state.cableLength / 30, 1.5);
    const accelSway = (-gravity / lengthMeters) * Math.sin(this.state.swayAngle) - (0.05 * this.state.swayVelocity);
    this.state.swayVelocity += accelSway * dt;
    this.state.swayAngle += this.state.swayVelocity * dt;

    const hookX = tipX + Math.sin(this.state.swayAngle) * (this.state.cableLength * 0.2);
    const hookY = tipY + this.state.cableLength;

    if (this.dom.hoistCableLine && this.dom.hoistCableCore) {
      this.dom.hoistCableLine.setAttribute('x1', tipX);
      this.dom.hoistCableLine.setAttribute('y1', tipY);
      this.dom.hoistCableLine.setAttribute('x2', hookX);
      this.dom.hoistCableLine.setAttribute('y2', hookY);

      this.dom.hoistCableCore.setAttribute('x1', tipX);
      this.dom.hoistCableCore.setAttribute('y1', tipY);
      this.dom.hoistCableCore.setAttribute('x2', hookX);
      this.dom.hoistCableCore.setAttribute('y2', hookY);
    }

    if (this.dom.hookBlock) {
      this.dom.hookBlock.setAttribute('transform', `translate(${hookX}, ${hookY}) rotate(${this.state.swayAngle * 15})`);
    }

    // 6. Suspended Steel I-Beams Position & Rigging Slings
    const hookEyeX = hookX - 4;
    const hookEyeY = hookY + 62;

    const loadTargetY = hookEyeY + 80;
    const loadX = hookEyeX;
    const groundLimitY = this.GEOMETRY.loadGroundY;
    const actualLoadY = Math.min(loadTargetY, groundLimitY);
    const heightAboveGround = Math.max(0, groundLimitY - actualLoadY);
    this.state.loadElevation = heightAboveGround;

    if (this.dom.loadAssembly) {
      this.dom.loadAssembly.setAttribute('transform', `translate(${loadX}, ${actualLoadY}) rotate(${this.state.swayAngle * 8})`);
    }

    // Slings connects Hook Eye to Beams
    if (this.dom.slings.length === 4) {
      const beamOffsetLeft1 = loadX - 130;
      const beamOffsetLeft2 = loadX - 80;
      const beamOffsetRight1 = loadX + 20;
      const beamOffsetRight2 = loadX + 130;
      const slingAttachY = actualLoadY - 55;

      this.dom.slings[0].setAttribute('x1', hookEyeX);
      this.dom.slings[0].setAttribute('y1', hookEyeY);
      this.dom.slings[0].setAttribute('x2', beamOffsetLeft1);
      this.dom.slings[0].setAttribute('y2', slingAttachY);

      this.dom.slings[1].setAttribute('x1', hookEyeX);
      this.dom.slings[1].setAttribute('y1', hookEyeY);
      this.dom.slings[1].setAttribute('x2', beamOffsetLeft2);
      this.dom.slings[1].setAttribute('y2', slingAttachY);

      this.dom.slings[2].setAttribute('x1', hookEyeX);
      this.dom.slings[2].setAttribute('y1', hookEyeY);
      this.dom.slings[2].setAttribute('x2', beamOffsetRight1);
      this.dom.slings[2].setAttribute('y2', slingAttachY);

      this.dom.slings[3].setAttribute('x1', hookEyeX);
      this.dom.slings[3].setAttribute('y1', hookEyeY);
      this.dom.slings[3].setAttribute('x2', beamOffsetRight2);
      this.dom.slings[3].setAttribute('y2', slingAttachY);
    }

    // 7. Ground Shadows Scaling
    if (this.dom.beamShadow) {
      const shadowScale = Math.max(0.3, 1 - (heightAboveGround / 400));
      const shadowOpacity = Math.max(0.15, 0.75 - (heightAboveGround / 350));
      this.dom.beamShadow.setAttribute('cx', loadX);
      this.dom.beamShadow.setAttribute('rx', 140 * shadowScale);
      this.dom.beamShadow.setAttribute('opacity', shadowOpacity);
    }

    // 8. Crawler Track Traverse and Wheel Rotation
    if (this.dom.craneAssembly) {
      this.dom.craneAssembly.setAttribute('transform', `translate(${this.state.trackX}, 0)`);
    }
    if (this.dom.chassisShadow) {
      this.dom.chassisShadow.setAttribute('cx', 680 + this.state.trackX);
    }
    if (this.dom.treadLinks) {
      this.dom.treadLinks.setAttribute('stroke-dashoffset', -this.state.trackX * 1.5);
    }

    // 9. Camera Viewport Matrix Update
    if (this.dom.viewport) {
      this.dom.viewport.setAttribute('transform', 
        `translate(${this.state.cameraPanX}, ${this.state.cameraPanY}) scale(${this.state.cameraZoom})`
      );
    }

    // Update Telemetry Callbacks
    this.updateTelemetryHUD(boomAngleDeg, totalBoomLen, tipX, heightAboveGround);
  }

  /* -------------------------------------------------------------
     3. Telemetry HUD and Safety Calculations
     ------------------------------------------------------------- */
  updateTelemetryHUD(boomAngleDeg, totalBoomLen, tipX, heightAboveGround) {
    const workingRadiusMeters = (Math.abs(580 - tipX) * 0.08).toFixed(1);
    const boomLenMeters = (totalBoomLen * 0.08).toFixed(1);
    const heightMeters = (heightAboveGround * 0.07).toFixed(1);
    const safeWorkingLoadPct = Math.min(96, Math.round(45 / (120 / Math.max(1, workingRadiusMeters)) * 100));

    // Update any external HUD elements if available in DOM
    const hudAngle = document.getElementById('sncHudAngle');
    const hudRadius = document.getElementById('sncHudRadius');
    const hudHeight = document.getElementById('sncHudHeight');
    const hudSWL = document.getElementById('sncHudSWL');
    const hudWeight = document.getElementById('sncHudWeight');

    if (hudAngle) hudAngle.textContent = `${boomAngleDeg.toFixed(1)}°`;
    if (hudRadius) hudRadius.textContent = `${workingRadiusMeters} m`;
    if (hudHeight) hudHeight.textContent = `${heightMeters} m`;
    if (hudSWL) hudSWL.textContent = `${safeWorkingLoadPct}%`;
    if (hudWeight) hudWeight.textContent = `${this.state.loadWeightTons.toFixed(1)} T`;
  }

  /* -------------------------------------------------------------
     4. Automated Loading Sequence & Cycle Manager
     ------------------------------------------------------------- */
  updateAutoSequence(dt) {
    if (this.options.mode !== 'auto' || this.state.isPaused) return;

    this.state.cycleProgress += dt * 14 * this.state.cycleSpeed; // ~7 seconds total cycle

    if (this.state.cycleProgress >= 100) {
      if (this.options.autoCycle) {
        this.state.cycleProgress = 0;
      } else {
        this.state.cycleProgress = 100;
        if (typeof this.options.onComplete === 'function') {
          this.options.onComplete();
        }
        return;
      }
    }

    const p = this.state.cycleProgress;

    // Phase 1: 0% - 25% | Lower hook, connect chain slings, idle engine
    if (p < 25) {
      const sub = p / 25;
      this.state.targetBoomAngle = 35 + sub * 2;
      this.state.targetBoomLengthRatio = 1.0;
      this.state.targetCableLength = 265 - sub * 10;
      this.state.targetTrackX = 0;
      this.state.cyclePhase = 'rigging';
    }
    // Phase 2: 25% - 60% | Engage hydraulics, boom up to 58°, hoist 45T beams into mid-air!
    else if (p < 60) {
      const sub = (p - 25) / 35;
      this.state.targetBoomAngle = 37 + sub * 22; // 37° to 59°
      this.state.targetBoomLengthRatio = 1.0 + sub * 0.45; // Telescope boom!
      this.state.targetCableLength = 255 - sub * 140; // Winch up cable!
      this.state.targetTrackX = sub * 25; // Slight forward track roll
      this.state.cyclePhase = 'lifting';
    }
    // Phase 3: 60% - 85% | Swing & Traverse heavy load smoothly across site
    else if (p < 85) {
      const sub = (p - 60) / 25;
      this.state.targetBoomAngle = 59 - sub * 8;
      this.state.targetBoomLengthRatio = 1.45 - sub * 0.15;
      this.state.targetCableLength = 115 + sub * 40;
      this.state.targetTrackX = 25 - sub * 60; // Track moves backward
      this.state.cyclePhase = 'swingshift';
    }
    // Phase 4: 85% - 100% | Soft landing / placement & system ready
    else {
      const sub = (p - 85) / 15;
      this.state.targetBoomAngle = 51 - sub * 16;
      this.state.targetBoomLengthRatio = 1.3 - sub * 0.3;
      this.state.targetCableLength = 155 + sub * 105;
      this.state.targetTrackX = -35 + sub * 35;
      this.state.cyclePhase = 'landing';
    }

    if (typeof this.options.onProgress === 'function') {
      this.options.onProgress(this.state.cycleProgress, this.state.cyclePhase);
    }
  }

  /* -------------------------------------------------------------
     5. Main 60 FPS Render Loop
     ------------------------------------------------------------- */
  startAnimationLoop() {
    const loop = (timestamp) => {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.updateAutoSequence(dt);
      this.updateKinematics(dt);

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /* -------------------------------------------------------------
     6. Video & Movable Camera Viewport Controls
     ------------------------------------------------------------- */
  setCamera(zoom, panX, panY) {
    this.state.cameraZoom = Math.max(0.5, Math.min(zoom, 2.5));
    this.state.cameraPanX = panX;
    this.state.cameraPanY = panY;
  }

  setManualControls(boomAngle, cableLength, boomExtension, trackX) {
    this.options.mode = 'manual';
    if (boomAngle !== undefined) this.state.targetBoomAngle = boomAngle;
    if (cableLength !== undefined) this.state.targetCableLength = cableLength;
    if (boomExtension !== undefined) this.state.targetBoomLengthRatio = boomExtension;
    if (trackX !== undefined) this.state.targetTrackX = trackX;
  }

  /* -------------------------------------------------------------
     7. Mouse / Touch Drag to Pan & Move Viewport (Video Movable)
     ------------------------------------------------------------- */
  initInteraction() {
    if (!this.container) return;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialPanX = 0;
    let initialPanY = 0;

    const onPointerDown = (e) => {
      // Allow audio initialization on first gesture
      if (this.audio) this.audio.resume();
      
      // If clicking directly on controls, ignore drag
      if (e.target.closest('.crane-btn-pill, .crane-slider, button, input')) return;

      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
      initialPanX = this.state.cameraPanX;
      initialPanY = this.state.cameraPanY;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX);
      const currentY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      this.state.cameraPanX = initialPanX + deltaX;
      this.state.cameraPanY = initialPanY + deltaY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    this.container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Zoom on wheel scroll
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.state.cameraZoom = Math.max(0.6, Math.min(this.state.cameraZoom * zoomFactor, 2.2));
    }, { passive: false });
  }
}

// Global Class Export
window.SncCraneSimulation = SncCraneSimulation;
