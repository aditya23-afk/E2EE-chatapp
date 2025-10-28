// Sound effects for premium experience
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = false;
    this.initSounds();
  }

  initSounds() {
    // Create audio contexts for different sound effects
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Generate sound effects programmatically
    this.sounds = {
      message: this.createTone(800, 0.1, 'sine'),
      notification: this.createTone(1000, 0.15, 'triangle'),
      join: this.createTone(600, 0.2, 'sawtooth'),
      leave: this.createTone(400, 0.2, 'square'),
      click: this.createTone(1200, 0.05, 'sine'),
      success: this.createChord([523, 659, 784], 0.3), // C major chord
      error: this.createTone(200, 0.4, 'sawtooth'),
    };
  }

  createTone(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  createChord(frequencies, duration) {
    return () => {
      if (!this.enabled) return;
      
      frequencies.forEach(freq => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      });
    };
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  play(soundName) {
    if (this.sounds[soundName] && this.enabled) {
      try {
        this.sounds[soundName]();
      } catch (error) {
        console.warn('Could not play sound:', error);
      }
    }
  }
}

export const soundManager = new SoundManager();