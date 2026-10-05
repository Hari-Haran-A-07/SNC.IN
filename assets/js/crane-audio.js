/**
 * SRI NEYA CRANE SERVICES (SNC) - Procedural Crane Audio Engine
 * High-Fidelity Web Audio API Synthesizer for Heavy Industrial Lifting Mechanics
 * Features: Metallic Chain Clinking, Hydraulic Winch Whine, Caterpillar Diesel Engine,
 * Air Brake Release, Tension Groan & Backup Safety Beepers.
 */

class CraneAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.engineGain = null;
    this.engineOsc = null;
    this.engineNoise = null;
    this.winchOsc = null;
    this.winchGain = null;
    this.isInitialized = false;
    this.lastChainTime = 0;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Output Bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
      this.startEngineSound();
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
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /* -------------------------------------------------------------
     1. Caterpillar Diesel Engine Idle & Throttle Rev Simulator
     ------------------------------------------------------------- */
  startEngineSound() {
    if (!this.ctx) return;

    // Diesel low-rpm engine rumble (Sub-harmonic pulse)
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(42, this.ctx.currentTime); // 42Hz ~ 800 RPM

    // Engine Filter (Lowpass diesel thrum)
    const engineFilter = this.ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(110, this.ctx.currentTime);

    // Brown Noise for Exhaust and Turbo whoosh
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
    noiseFilter.frequency.setValueAtTime(90, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.engineNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // Engine Main Gain Bus
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    this.engineOsc.connect(engineFilter);
    engineFilter.connect(this.engineGain);
    noiseGain.connect(this.engineGain);

    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
    this.engineNoise.start();
  }

  setEngineRPM(loadFactor) {
    if (!this.ctx || !this.engineOsc || this.isMuted) return;
    const targetFreq = 42 + (loadFactor * 32); // 42Hz to 74Hz (up to 1800 RPM)
    const targetVol = 0.15 + (loadFactor * 0.15);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
  }

  /* -------------------------------------------------------------
     2. Realistic Metallic Lifting Chain Clink & Rattle
     ------------------------------------------------------------- */
  playChainClink(intensity = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    if (now - this.lastChainTime < 0.06) return; // Throttle to prevent audio clipping
    this.lastChainTime = now;

    // Metallic ring frequencies (inharmonic modal frequencies of heavy steel links)
    const baseFreq = 1600 + Math.random() * 900;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const bandpass = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(baseFreq * 1.58, now);

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(baseFreq * 1.2, now);
    bandpass.Q.setValueAtTime(8.0, now); // high metallic ring resonance

    const duration = 0.08 + Math.random() * 0.07;
    gain.gain.setValueAtTime(0.22 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(bandpass);
    osc2.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration);
    osc2.stop(now + duration);
  }

  /* -------------------------------------------------------------
     3. Hydraulic Winch Motor Whine & Hoist Sound
     ------------------------------------------------------------- */
  startHydraulicWinch(speed = 1.0) {
    if (!this.ctx || this.isMuted) return;
    if (this.winchOsc) return;

    this.winchOsc = this.ctx.createOscillator();
    const winchHarmonic = this.ctx.createOscillator();
    this.winchGain = this.ctx.createGain();

    const baseFreq = 260 + (speed * 120);
    this.winchOsc.type = 'sawtooth';
    this.winchOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    winchHarmonic.type = 'sine';
    winchHarmonic.frequency.setValueAtTime(baseFreq * 2.05, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.winchGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.winchGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.15);

    this.winchOsc.connect(filter);
    winchHarmonic.connect(filter);
    filter.connect(this.winchGain);
    this.winchGain.connect(this.masterGain);

    this.winchOsc.start();
    winchHarmonic.start();
    this.winchHarmonic = winchHarmonic;
  }

  stopHydraulicWinch() {
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

  /* -------------------------------------------------------------
     4. Heavy Steel Tension Strain / Creak
     ------------------------------------------------------------- */
  playTensionCreak() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(380, now);
    filter.Q.setValueAtTime(10, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /* -------------------------------------------------------------
     5. Pneumatic Air Brake / Pressure Release
     ------------------------------------------------------------- */
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

  /* -------------------------------------------------------------
     6. Crane Backup Safety Beep & Heavy Horn
     ------------------------------------------------------------- */
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
    osc1.frequency.setValueAtTime(220, now); // A3
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(277.18, now); // C#4 (Heavy dual air-horn major 3rd)

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

// Global Singleton for easy cross-script access
window.sncCraneAudio = new CraneAudioEngine();
