/**
 * VibeAudio - Web Audio API Micro-Sound Engine (Milestone 12: secret-sauce)
 *
 * Provides satisfying, synthesized UI sound effects for vibecoders without
 * relying on external MP3/audio files:
 * - taskMove: Smooth soft pop / slide
 * - taskComplete: Sparkling major chord arpeggio
 * - promptCopy: Cybernetic dual-tone shimmer
 * - synthesize: Ethereal futuristic synth sweep
 * - anchorComplete: Triumphant brass-like harmonic triad
 * - toggle: Subtle crisp click
 *
 * Includes mute/unmute management persisted in localStorage.
 */

class VibeAudioManager {
  constructor() {
    this.ctx = null;
    this.storageKey = 'vibetracker.sound_enabled';
    this.enabled = this.loadPreference();
  }

  loadPreference() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.enabled));
    } catch {
      // Ignore quota errors
    }
    if (this.enabled) {
      this.playToggle(true);
    }
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  getAudioContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Subtle smooth pop for dragging / moving tasks between columns
   */
  playTaskMove() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio playback best-effort
    }
  }

  /**
   * Sparkling ascending arpeggio when a task is moved to "Done"
   */
  playTaskComplete() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Cybernetic shimmer when prompt is copied to clipboard
   */
  playPromptCopy() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6

      osc2.frequency.setValueAtTime(1318.51, now); // E6
      osc2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.12); // B6

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  /**
   * Futuristic magical synth sweep when optimizing or synthesizing a prompt
   */
  playSynthesize() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
      filter.Q.setValueAtTime(5, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Ignore
    }
  }

  /**
   * Resonant fanfare triad when an anchor deliverable is completed
   */
  playAnchorComplete() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const chords = [
        { freq: 440.0, time: 0 },    // A4
        { freq: 554.37, time: 0.08 }, // C#5
        { freq: 659.25, time: 0.16 }, // E5
        { freq: 880.0, time: 0.24 },  // A5
      ];
      const now = ctx.currentTime;

      chords.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + time;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.14, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.42);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Soft UI toggle feedback
   */
  playToggle(highPitch = false) {
    if (!this.enabled && !highPitch) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(highPitch ? 700 : 440, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }
}

// Export singleton instance
export const vibeAudio = new VibeAudioManager();
