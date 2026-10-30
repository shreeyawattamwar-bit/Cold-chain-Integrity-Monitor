/**
 * Web Audio API synthesizer to emulate the physical ESP32 buzzer
 * when in a COMPROMISED state (optional user toggle).
 */
class BuzzerSoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private intervalId: number | null = null;

  constructor() {
    // Check localStorage preference
    const saved = localStorage.getItem('coldchain_buzzer_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public beep(frequency: number = 2400, durationMs: number = 200) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square'; // Buzzer sound is typical square wave
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio playback not permitted or supported yet:', e);
    }
  }

  public startAlertBuzzer() {
    if (this.intervalId !== null) return;
    // Initial beep
    this.beep(2400, 250);
    // Recurring beeps every 1.2s like the ESP32 alarm
    this.intervalId = window.setInterval(() => {
      this.beep(2400, 250);
    }, 1200);
  }

  public stopAlertBuzzer() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('coldchain_buzzer_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopAlertBuzzer();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const buzzerSound = new BuzzerSoundService();
