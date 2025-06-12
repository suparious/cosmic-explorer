// Arpeggio layer - creates melodic arpeggiated patterns

import { BaseLayer } from '../BaseLayer.js';
import { ARPEGGIO_PATTERNS } from '../../constants/musicalData.js';

export class ArpeggioLayer extends BaseLayer {
    static get TYPE() {
        return 'arpeggio';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.noteIndex = 0;
        this.octave = 0;
        this.pattern = ARPEGGIO_PATTERNS[config.pattern] || ARPEGGIO_PATTERNS.peaceful;
    }
    
    createNodes() {
        // Start the arpeggio pattern
        this.scheduleNextNote();
    }
    
    scheduleNextNote() {
        if (!this.isPlaying) return;
        
        const playNote = () => {
            if (!this.isPlaying) return;
            
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            
            // Calculate frequency based on pattern
            const semitone = this.pattern[this.noteIndex % this.pattern.length];
            const freq = this.config.baseFreq * Math.pow(2, (semitone + this.octave * 12) / 12);
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Create envelope for note
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.3, now + 0.02);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            // Add filter sweep for movement
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.frequency.exponentialRampToValueAtTime(500, now + 0.3);
            
            // Connect audio path
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(this.gainNode);
            
            // Play note
            osc.start(now);
            osc.stop(now + 0.3);
            
            // Update indices
            this.noteIndex++;
            if (this.noteIndex % this.pattern.length === 0) {
                this.octave = (this.octave + 1) % 2;
            }
            
            // Schedule next note with slight randomization
            const delay = 250 + Math.random() * 100;
            this.arpeggioTimeout = setTimeout(() => this.scheduleNextNote(), delay);
        };
        
        // Start with random delay
        const initialDelay = Math.random() * 1000;
        this.arpeggioTimeout = setTimeout(playNote, initialDelay);
    }
    
    stop(fadeTime = 2) {
        if (this.arpeggioTimeout) {
            clearTimeout(this.arpeggioTimeout);
        }
        super.stop(fadeTime);
    }
    
    update(params) {
        if (params.chordIndex !== undefined) {
            // Could modulate the pattern based on chord changes
        }
    }
}
