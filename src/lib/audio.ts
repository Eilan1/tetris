class AudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;

  private musicActive = false;
  private musicTimeout: number | undefined;
  private beatIndex = 0;

  // Full Korobeiniki (Tetris Theme A) melody
  private readonly melody = [
    // Part A
    { f: 659.25, d: 2 }, // E5
    { f: 493.88, d: 1 }, // B4
    { f: 523.25, d: 1 }, // C5
    { f: 587.33, d: 2 }, // D5
    { f: 523.25, d: 1 }, // C5
    { f: 493.88, d: 1 }, // B4
    { f: 440.00, d: 2 }, // A4
    { f: 440.00, d: 1 }, // A4
    { f: 523.25, d: 1 }, // C5
    { f: 659.25, d: 2 }, // E5
    { f: 587.33, d: 1 }, // D5
    { f: 523.25, d: 1 }, // C5
    { f: 493.88, d: 2 }, // B4
    { f: 493.88, d: 1 }, // B4
    { f: 523.25, d: 1 }, // C5
    { f: 587.33, d: 2 }, // D5
    { f: 659.25, d: 2 }, // E5
    { f: 523.25, d: 2 }, // C5
    { f: 440.00, d: 4 }, // A4
    { f: 0, d: 2 },      // Rest

    // Part A Repeat
    { f: 659.25, d: 2 }, // E5
    { f: 493.88, d: 1 }, // B4
    { f: 523.25, d: 1 }, // C5
    { f: 587.33, d: 2 }, // D5
    { f: 523.25, d: 1 }, // C5
    { f: 493.88, d: 1 }, // B4
    { f: 440.00, d: 2 }, // A4
    { f: 440.00, d: 1 }, // A4
    { f: 523.25, d: 1 }, // C5
    { f: 659.25, d: 2 }, // E5
    { f: 587.33, d: 1 }, // D5
    { f: 523.25, d: 1 }, // C5
    { f: 493.88, d: 2 }, // B4
    { f: 493.88, d: 1 }, // B4
    { f: 523.25, d: 1 }, // C5
    { f: 587.33, d: 2 }, // D5
    { f: 659.25, d: 2 }, // E5
    { f: 523.25, d: 2 }, // C5
    { f: 440.00, d: 4 }, // A4
    { f: 0, d: 2 },      // Rest

    // Part B
    { f: 587.33, d: 3 }, // D5
    { f: 698.46, d: 1 }, // F5
    { f: 880.00, d: 2 }, // A5
    { f: 783.99, d: 1 }, // G5
    { f: 698.46, d: 1 }, // F5
    { f: 659.25, d: 3 }, // E5
    { f: 523.25, d: 1 }, // C5
    { f: 659.25, d: 2 }, // E5
    { f: 587.33, d: 1 }, // D5
    { f: 523.25, d: 1 }, // C5
    { f: 493.88, d: 2 }, // B4
    { f: 493.88, d: 1 }, // B4
    { f: 523.25, d: 1 }, // C5
    { f: 587.33, d: 2 }, // D5
    { f: 659.25, d: 2 }, // E5
    { f: 523.25, d: 2 }, // C5
    { f: 440.00, d: 4 }, // A4
    { f: 0, d: 2 },      // Rest
    
    // Part B Repeat
    { f: 587.33, d: 3 }, // D5
    { f: 698.46, d: 1 }, // F5
    { f: 880.00, d: 2 }, // A5
    { f: 783.99, d: 1 }, // G5
    { f: 698.46, d: 1 }, // F5
    { f: 659.25, d: 3 }, // E5
    { f: 523.25, d: 1 }, // C5
    { f: 659.25, d: 2 }, // E5
    { f: 587.33, d: 1 }, // D5
    { f: 523.25, d: 1 }, // C5
    { f: 493.88, d: 2 }, // B4
    { f: 493.88, d: 1 }, // B4
    { f: 523.25, d: 1 }, // C5
    { f: 587.33, d: 2 }, // D5
    { f: 659.25, d: 2 }, // E5
    { f: 523.25, d: 2 }, // C5
    { f: 440.00, d: 4 }, // A4
    { f: 0, d: 2 },      // Rest
  ];

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.enabled = true;
      } catch (e) {
        console.warn("Web Audio API not supported");
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMusic() {
    this.musicActive = !this.musicActive;
    if (this.musicActive) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.beatIndex = 0;
      this.playNextMusicNote();
    } else {
      clearTimeout(this.musicTimeout);
    }
  }

  private playNextMusicNote() {
    if (!this.musicActive || !this.ctx) return;

    const note = this.melody[this.beatIndex];
    const beatLength = 0.17; // speed of the track

    if (note.f > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, this.ctx.currentTime);
      
      // Volume envelope for the music note
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (note.d * beatLength) - 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + (note.d * beatLength) - 0.02);
    }

    this.beatIndex = (this.beatIndex + 1) % this.melody.length;
    this.musicTimeout = window.setTimeout(() => this.playNextMusicNote(), note.d * beatLength * 1000);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number, slideFreq?: number) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
    }
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playMove() { this.playTone(150, 'square', 0.05, 0.05); }
  playRotate() { this.playTone(250, 'square', 0.05, 0.05); }
  playLock() { this.playTone(100, 'square', 0.1, 0.05, 50); }
  playClear() { this.playTone(400, 'square', 0.15, 0.1, 800); }
  playTetris() { 
      this.playTone(400, 'square', 0.2, 0.1, 800); 
      setTimeout(() => this.playTone(600, 'square', 0.3, 0.1, 1200), 100);
  }
  playGameOver() { this.playTone(200, 'sawtooth', 0.6, 0.1, 50); }
}

export const audio = new AudioEngine();
