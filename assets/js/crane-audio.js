/**
 * SRI NEYA CRANE SERVICES (SNC) - Industrial Crane Acoustic & Chain Engine
 * Ultra-Realistic Physical Modal Synthesis for Heavy Alloy Steel Lifting Chains,
 * Hydraulic Winch Sheaves, Tension Snaps, Caterpillar Diesel Engine & Air Brakes.
 */

class CraneAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.engineGain = null;
    this.engineOsc = null;
    this.engineNoise = null;
    
    // Continuous Chain Hoist Noise/Rattle Bus
    this.chainLoopGain = null;
    this.chainLoopFilter = null;
    this.chainLoopSource = null;
    this.chainNoiseBuffer = null;
    
    this.winchOsc = null;
    this.winchGain = null;
    this.isInitialized = false;
    this.lastChainTime = 0;
    this.lastTensionSnapTime = 0;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Output Bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Pre-generate authentic metallic chain friction/scrape noise buffer
      this.generateChainAudioBuffers();

      this.isInitialized = true;
      this.startEngineSound();
      this.startContinuousChainHoistLoop();
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.isInitialized) {
      this.init();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.04);
    }
    return this.isMuted;
  }

  /* -------------------------------------------------------------------------
     1. PRE-RENDERED METALLIC FRICTION & SCRAPING BUFFER (Real Iron Texture)
     ------------------------------------------------------------------------- */
  generateChainAudioBuffers() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 1.5; // 1.5s loopable metallic scrape
    this.chainNoiseBuffer = this.ctx.createBuffer(2, length, sampleRate);

    const left = this.chainNoiseBuffer.getChannelData(0);
    const right = this.chainNoiseBuffer.getChannelData(1);

    // Multi-link physical friction noise generator
    for (let i = 0; i < length; i++) {
      // Periodic micro-clicks mimicking individual links passing over sheave teeth
      const linkPulse = Math.sin(i * 0.08) > 0.96 ? (Math.random() * 2 - 1) * 2.5 : 0;
      const grain = (Math.random() * 2 - 1) * 0.35 + linkPulse;
      left[i] = grain;
      right[i] = (Math.random() * 2 - 1) * 0.35 + linkPulse * 0.8;
    }
  }

  /* -------------------------------------------------------------------------
     2. CONTINUOUS CHAIN HOIST LOOP (Runs smoothly during cable movement)
     ------------------------------------------------------------------------- */
  startContinuousChainHoistLoop() {
    if (!this.ctx || !this.chainNoiseBuffer) return;

    this.chainLoopSource = this.ctx.createBufferSource();
    this.chainLoopSource.buffer = this.chainNoiseBuffer;
    this.chainLoopSource.loop = true;

    // High-Q Metallic Bandpass Filter bank
    this.chainLoopFilter = this.ctx.createBiquadFilter();
    this.chainLoopFilter.type = 'bandpass';
    this.chainLoopFilter.frequency.setValueAtTime(2800, this.ctx.currentTime);
    this.chainLoopFilter.Q.setValueAtTime(4.5, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(1100, this.ctx.currentTime);

    this.chainLoopGain = this.ctx.createGain();
    this.chainLoopGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    this.chainLoopSource.connect(this.chainLoopFilter);
    this.chainLoopFilter.connect(highpass);
    highpass.connect(this.chainLoopGain);
    this.chainLoopGain.connect(this.masterGain);

    this.chainLoopSource.start();
  }

  setChainHoistSpeed(speed) {
    if (!this.chainLoopGain || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    if (speed > 0.05) {
      const targetGain = Math.min(0.25, 0.04 + speed * 0.15);
      const targetFreq = 2200 + speed * 1600;
      this.chainLoopGain.gain.setTargetAtTime(targetGain, now, 0.08);
      this.chainLoopFilter.frequency.setTargetAtTime(targetFreq, now, 0.08);
    } else {
      this.chainLoopGain.gain.setTargetAtTime(0.0001, now, 0.12);
    }
  }

  /* -------------------------------------------------------------------------
     3. EXACT MULTI-LINK METALLIC CHAIN CLINK & JINGLE (Physical Modal Clatter)
     ------------------------------------------------------------------------- */
  playChainClink(intensity = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    if (now - this.lastChainTime < 0.035) return; // Prevent audio engine choke
    this.lastChainTime = now;

    // When a chain moves, it produces a cascade of 3-5 rapid micro-impacts
    const numMicroImpacts = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numMicroImpacts; i++) {
      const offset = (i * 0.012) + (Math.random() * 0.008);
      this.triggerSingleLinkImpact(now + offset, intensity * (1.0 - i * 0.15));
    }
  }

  triggerSingleLinkImpact(time, intensity) {
    // Physical modal frequencies of Grade 80 forged alloy steel links
    const modalFrequencies = [
      1350 + Math.random() * 200,   // Fundamental in-plane flexural mode
      2450 + Math.random() * 300,   // First overtone
      3800 + Math.random() * 400,   // Torsional link resonance
      5900 + Math.random() * 600,   // High metal ping
      8200 + Math.random() * 800    // Steel strike shimmer
    ];

    // 1. Low mass body impulse (Heavy iron thud)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(140 + Math.random() * 40, time);
    thudOsc.frequency.exponentialRampToValueAtTime(50, time + 0.04);
    thudGain.gain.setValueAtTime(0.28 * intensity, time);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start(time);
    thudOsc.stop(time + 0.06);

    // 2. Multi-pole Resonant Metallic Ringing (Real link clinking)
    modalFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const bpass = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Sharp metallic square/sawtooth impulse
      osc.type = idx % 2 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      bpass.type = 'bandpass';
      bpass.frequency.setValueAtTime(freq, time);
      bpass.Q.setValueAtTime(14.0 + idx * 3.0, time); // High resonant metallic ring

      const decayTime = 0.04 + (0.05 / (idx + 1)) + (Math.random() * 0.02);
      const amp = (0.16 / (idx + 1.2)) * intensity;

      gain.gain.setValueAtTime(amp, time);
      gain.gain.exponentialRampToValueAtTime(0.00001, time + decayTime);

      osc.connect(bpass);
      bpass.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + decayTime + 0.01);
    });
  }

  /* -------------------------------------------------------------------------
     4. HEAVY CHAIN TENSION SNAP / SLACK TAKEUP (When load lifts off ground)
     ------------------------------------------------------------------------- */
  playChainTensionSnap() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    if (now - this.lastTensionSnapTime < 0.4) return;
    this.lastTensionSnapTime = now;

    // A loud, massive triple metal clash with long ringdown
    this.triggerSingleLinkImpact(now, 2.2);
    this.triggerSingleLinkImpact(now + 0.02, 1.8);
    this.triggerSingleLinkImpact(now + 0.05, 2.5);

    // Deep metallic boom resonance
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    subGain.gain.setValueAtTime(0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.35);
  }

  /* -------------------------------------------------------------------------
     5. HYDRAULIC WINCH MOTOR HOIST SOUND
     ------------------------------------------------------------------------- */
  startHydraulicWinch(speed = 1.0) {
    if (!this.ctx || this.isMuted) return;
    this.setChainHoistSpeed(speed);

    if (this.winchOsc) return;

    this.winchOsc = this.ctx.createOscillator();
    const winchHarmonic = this.ctx.createOscillator();
    this.winchGain = this.ctx.createGain();

    const baseFreq = 220 + (speed * 110);
    this.winchOsc.type = 'sawtooth';
    this.winchOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    winchHarmonic.type = 'sine';
    winchHarmonic.frequency.setValueAtTime(baseFreq * 2.02, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.2, this.ctx.currentTime);

    this.winchGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.winchGain.gain.linearRampToValueAtTime(0.11, this.ctx.currentTime + 0.12);

    this.winchOsc.connect(filter);
    winchHarmonic.connect(filter);
    filter.connect(this.winchGain);
    this.winchGain.connect(this.masterGain);

    this.winchOsc.start();
    winchHarmonic.start();
    this.winchHarmonic = winchHarmonic;
  }

  stopHydraulicWinch() {
    this.setChainHoistSpeed(0);
    if (!this.winchGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.winchGain.gain.linearRampToValueAtTime(0.0001, now + 0.1);
    setTimeout(() => {
      if (this.winchOsc) {
        try { this.winchOsc.stop(); this.winchHarmonic.stop(); } catch(e){}
        this.winchOsc = null;
        this.winchHarmonic = null;
      }
    }, 120);
  }

  /* -------------------------------------------------------------------------
     6. CATERPILLAR DIESEL ENGINE SIMULATOR
     ------------------------------------------------------------------------- */
  startEngineSound() {
    if (!this.ctx) return;

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(42, this.ctx.currentTime); // 42Hz ~ 800 RPM

    const engineFilter = this.ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(110, this.ctx.currentTime);

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    this.engineNoise = this.ctx.createBufferSource();
    this.engineNoise.buffer = noiseBuffer;
    this.engineNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(85, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.14, this.ctx.currentTime);

    this.engineNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.engineOsc.connect(engineFilter);
    engineFilter.connect(this.engineGain);
    noiseGain.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
    this.engineNoise.start();
  }

  setEngineRPM(loadFactor) {
    if (!this.ctx || !this.engineOsc || this.isMuted) return;
    const targetFreq = 42 + (loadFactor * 32);
    const targetVol = 0.12 + (loadFactor * 0.14);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
  }

  /* -------------------------------------------------------------------------
     7. AIR BRAKE RELEASE & WARNING SOUNDS
     ------------------------------------------------------------------------- */
  playAirRelease() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start(now);
  }

  playWarningBeep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playIndustrialHorn() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(277.18, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.setValueAtTime(0.2, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }
}

// Global Singleton
window.sncCraneAudio = new CraneAudioEngine();
