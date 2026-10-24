/**
 * Retro Chiptune Web Audio Synthesizer for "Nadia's Birthday Adventure"
 * Generates rich 8-bit / 16-bit sound effects and melodic background tunes.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: string | null = null;
  private isMusicPlaying = false;
  private loopTimeoutId: number | null = null;
  private isMuted = false;
  private musicVolume = 0.45;
  private sfxVolume = 0.6;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);

      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx && !this.isMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx && !this.isMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // --- Sound Effects ---

  public playBlip(pitch = 440) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.15, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playStep() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.05 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  public playInteract() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.14); // G5

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(now + 0.25);
    } catch {}
  }

  public playDoorKnock() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      [0, 0.12, 0.24].forEach(delay => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + delay;
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);

        gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(t);
        osc.stop(t + 0.06);
      });
    } catch {}
  }

  public playDoorOpen() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.35);

      gain.gain.setValueAtTime(0.1 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  public playBell() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      [1200, 1500].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.09;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch {}
  }

  public playPanic() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.1);
      osc.frequency.linearRampToValueAtTime(700, now + 0.2);

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playSuccessChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + i * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {}
  }

  public playConfetti() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.2);
    } catch {}
  }

  public playBlowCandle() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(200, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.35);
    } catch {}
  }

  // --- Background Melodic Chiptune Music ---

  public playTheme(themeName: string) {
    if (this.currentTrack === themeName && this.isMusicPlaying) return;
    this.stopMusic();
    this.currentTrack = themeName;
    this.isMusicPlaying = true;
    this.loopMusicPattern(themeName);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    this.currentTrack = null;
    if (this.loopTimeoutId !== null) {
      clearTimeout(this.loopTimeoutId);
      this.loopTimeoutId = null;
    }
  }

  private loopMusicPattern(theme: string) {
    if (!this.isMusicPlaying || this.currentTrack !== theme) return;

    try {
      this.initContext();
      if (!this.ctx || !this.musicGain) return;

      const bpm = 120;
      const beat = 60 / bpm;
      const now = this.ctx.currentTime + 0.05;

      let notes: { f: number; dur: number; time: number; type?: OscillatorType; vol?: number }[] = [];
      let totalDuration = 4; // in seconds

      // Tone helper
      const noteFreq = (n: number) => 440 * Math.pow(2, (n - 69) / 12); // MIDI to frequency

      switch (theme) {
        case 'title':
        case 'birthday': {
          // Warm celebratory / adventurous retro progression (C - G - Am - F)
          // 4 bars of 4/4
          totalDuration = 8 * beat;
          const lead = [
            // Bar 1 (C)
            { m: 60, d: 0.5, t: 0 }, { m: 64, d: 0.5, t: 0.5 }, { m: 67, d: 1, t: 1.0 }, { m: 72, d: 1, t: 2.0 }, { m: 71, d: 1, t: 3.0 },
            // Bar 2 (G)
            { m: 67, d: 1, t: 4.0 }, { m: 69, d: 0.5, t: 5.0 }, { m: 71, d: 0.5, t: 5.5 }, { m: 72, d: 2, t: 6.0 },
          ];
          const bass = [
            { m: 48, d: 2, t: 0 }, { m: 52, d: 2, t: 2 },
            { m: 43, d: 2, t: 4 }, { m: 47, d: 2, t: 6 }
          ];

          lead.forEach(n => notes.push({ f: noteFreq(n.m), dur: n.d * beat, time: n.t * beat, type: 'square', vol: 0.06 }));
          bass.forEach(b => notes.push({ f: noteFreq(b.m), dur: b.d * beat, time: b.t * beat, type: 'triangle', vol: 0.09 }));
          break;
        }

        case 'campus': {
          // Calm university classroom morning vibe (F - G - Em - Am)
          totalDuration = 8 * beat;
          const lead = [
            { m: 65, d: 1, t: 0 }, { m: 69, d: 1, t: 1 }, { m: 72, d: 1.5, t: 2 }, { m: 71, d: 0.5, t: 3.5 },
            { m: 67, d: 1, t: 4 }, { m: 64, d: 1, t: 5 }, { m: 60, d: 2, t: 6 }
          ];
          const arps = [
            { m: 53, d: 0.4, t: 0 }, { m: 57, d: 0.4, t: 0.5 }, { m: 60, d: 0.4, t: 1.0 }, { m: 64, d: 0.4, t: 1.5 },
            { m: 55, d: 0.4, t: 2 }, { m: 59, d: 0.4, t: 2.5 }, { m: 62, d: 0.4, t: 3.0 }, { m: 67, d: 0.4, t: 3.5 },
            { m: 52, d: 0.4, t: 4 }, { m: 55, d: 0.4, t: 4.5 }, { m: 59, d: 0.4, t: 5.0 }, { m: 64, d: 0.4, t: 5.5 },
            { m: 57, d: 0.4, t: 6 }, { m: 60, d: 0.4, t: 6.5 }, { m: 64, d: 0.4, t: 7.0 }, { m: 69, d: 0.4, t: 7.5 }
          ];
          lead.forEach(n => notes.push({ f: noteFreq(n.m), dur: n.d * beat, time: n.t * beat, type: 'sine', vol: 0.06 }));
          arps.forEach(a => notes.push({ f: noteFreq(a.m), dur: a.d * beat, time: a.t * beat, type: 'triangle', vol: 0.05 }));
          break;
        }

        case 'stealth': {
          // Sneaky delivery mission vibe: playful staccato
          totalDuration = 6 * beat;
          const pattern = [
            { m: 50, d: 0.25, t: 0 }, { m: 53, d: 0.25, t: 0.5 }, { m: 50, d: 0.25, t: 1.0 }, { m: 55, d: 0.25, t: 1.5 },
            { m: 56, d: 0.4, t: 2.0 }, { m: 55, d: 0.25, t: 2.5 }, { m: 53, d: 0.25, t: 3.0 }, { m: 50, d: 0.4, t: 3.5 },
            { m: 62, d: 0.2, t: 4.0 }, { m: 60, d: 0.2, t: 4.5 }, { m: 58, d: 0.3, t: 5.0 }
          ];
          pattern.forEach(n => notes.push({ f: noteFreq(n.m), dur: n.d * beat, time: n.t * beat, type: 'square', vol: 0.05 }));
          break;
        }

        case 'rush': {
          // Bus stop and flyover panic: fast, lively tempo
          totalDuration = 4 * beat;
          const fastRun = [
            { m: 57, d: 0.2, t: 0 }, { m: 60, d: 0.2, t: 0.3 }, { m: 64, d: 0.2, t: 0.6 }, { m: 67, d: 0.3, t: 0.9 },
            { m: 65, d: 0.2, t: 1.3 }, { m: 64, d: 0.2, t: 1.6 }, { m: 62, d: 0.2, t: 1.9 }, { m: 60, d: 0.3, t: 2.2 },
            { m: 59, d: 0.2, t: 2.6 }, { m: 62, d: 0.2, t: 2.9 }, { m: 65, d: 0.2, t: 3.2 }, { m: 69, d: 0.4, t: 3.5 }
          ];
          fastRun.forEach(n => notes.push({ f: noteFreq(n.m), dur: n.d * beat, time: n.t * beat, type: 'sawtooth', vol: 0.04 }));
          break;
        }

        case 'hatirjheel': {
          // Breezy lakeside evening synth arpeggio
          totalDuration = 8 * beat;
          const chords = [
            { m: 60, d: 2, t: 0 }, { m: 64, d: 2, t: 2 }, { m: 67, d: 2, t: 4 }, { m: 71, d: 2, t: 6 }
          ];
          const bells = [
            { m: 72, d: 0.8, t: 0.5 }, { m: 76, d: 0.8, t: 1.5 }, { m: 79, d: 1.2, t: 2.5 },
            { m: 83, d: 0.8, t: 4.5 }, { m: 79, d: 0.8, t: 5.5 }, { m: 76, d: 1.5, t: 6.5 }
          ];
          chords.forEach(c => notes.push({ f: noteFreq(c.m - 12), dur: c.d * beat, time: c.t * beat, type: 'sine', vol: 0.07 }));
          bells.forEach(b => notes.push({ f: noteFreq(b.m), dur: b.d * beat, time: b.t * beat, type: 'triangle', vol: 0.05 }));
          break;
        }

        case 'restaurant': {
          // Playful comedy / dining ragtime feel
          totalDuration = 6 * beat;
          const bounce = [
            { m: 60, d: 0.3, t: 0 }, { m: 62, d: 0.2, t: 0.4 }, { m: 64, d: 0.4, t: 0.8 }, { m: 67, d: 0.3, t: 1.4 },
            { m: 65, d: 0.3, t: 2.0 }, { m: 64, d: 0.2, t: 2.4 }, { m: 62, d: 0.4, t: 2.8 }, { m: 59, d: 0.3, t: 3.4 },
            { m: 60, d: 0.5, t: 4.0 }, { m: 64, d: 0.5, t: 4.6 }, { m: 67, d: 0.7, t: 5.2 }
          ];
          bounce.forEach(b => notes.push({ f: noteFreq(b.m), dur: b.d * beat, time: b.t * beat, type: 'square', vol: 0.05 }));
          break;
        }

        case 'graduation': {
          // Uplifting, proud academic fanfare & emotional growth
          totalDuration = 8 * beat;
          const grand = [
            { m: 52, d: 0.8, t: 0 }, { m: 56, d: 0.8, t: 0.8 }, { m: 59, d: 1.2, t: 1.6 }, { m: 64, d: 1.8, t: 2.8 },
            { m: 63, d: 0.8, t: 4.6 }, { m: 64, d: 0.8, t: 5.4 }, { m: 68, d: 1.6, t: 6.2 }
          ];
          grand.forEach(g => notes.push({ f: noteFreq(g.m), dur: g.d * beat, time: g.t * beat, type: 'triangle', vol: 0.08 }));
          break;
        }

        default:
          totalDuration = 4;
      }

      // Schedule the notes
      notes.forEach(n => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + n.time;
        const endTime = startTime + n.dur;

        osc.type = n.type || 'square';
        osc.frequency.setValueAtTime(n.f, startTime);

        const peak = (n.vol || 0.05) * this.musicVolume;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(peak, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(startTime);
        osc.stop(endTime);
      });

      // Loop after totalDuration
      const delayMs = Math.max(500, totalDuration * 1000 - 50);
      this.loopTimeoutId = window.setTimeout(() => {
        this.loopMusicPattern(theme);
      }, delayMs);
    } catch {
      // Audio fallback
    }
  }
}

export const soundSystem = new SoundSystem();
