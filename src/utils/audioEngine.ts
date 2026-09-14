class AudioEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private noiseBuffer: AudioBuffer | null = null;

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Play a silent sound to unlock audio context on mobile/browsers that require user interaction
    if (!this.unlocked && this.ctx.state === 'suspended') {
      this.ctx.resume();
      const osc = this.ctx.createOscillator();
      osc.connect(this.ctx.destination);
      osc.start(0);
      osc.stop(0.001);
      this.unlocked = true;
    }
    
    // Initialize noise buffer for rim click
    if (this.ctx && !this.noiseBuffer) {
      const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
  }

  public play10SecondTap() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    // Play 3 taps: at 0, 0.3, 0.6
    this.playRimClick(now);
    this.playRimClick(now + 0.33);
    this.playRimClick(now + 0.66);
  }

  public playRoundEndBell() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    this.playBell(now);
    // Double bell
    this.playBell(now + 0.3);
  }

  public playRoundStartBell() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    this.playBell(now);
  }

  public playCountdownBeep() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 1000;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + 0.01);
    gain.gain.setValueAtTime(1, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playStartBeep() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 1000;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + 0.01);
    gain.gain.setValueAtTime(1, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.6);
  }

  private playRimClick(time: number) {
    if (!this.ctx) return;
    
    // Rim click has a sharp transient and a bit of body
    // Body: high pitched sine/triangle that decays very fast
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(1, time + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    // Noise for the "snap"
    let noise: AudioBufferSourceNode | null = null;
    if (this.noiseBuffer) {
      noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;
      const noiseGain = this.ctx.createGain();
      
      noiseGain.gain.setValueAtTime(1, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
    }
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
    if (noise) {
      noise.start(time);
    }
  }

  private playBell(time: number) {
    if (!this.ctx) return;
    
    // A boxing bell is a complex metallic sound. 
    // We can simulate this using multiple inharmonic sine waves.
    const frequencies = [
      { f: 550, amp: 1, decay: 2.5 },
      { f: 880, amp: 0.8, decay: 2.0 },
      { f: 1220, amp: 0.5, decay: 1.5 },
      { f: 1550, amp: 0.3, decay: 1.0 },
      { f: 2300, amp: 0.2, decay: 0.5 },
    ];

    frequencies.forEach(({ f, amp, decay }) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = f;

      // Fast attack
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(amp, time + 0.01);
      
      // Exponential decay
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);

      osc.connect(gainNode);
      gainNode.connect(this.ctx!.destination);

      osc.start(time);
      osc.stop(time + decay);
    });
  }
}

export const audioEngine = new AudioEngine();
