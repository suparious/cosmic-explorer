// Bass line layer - creates rhythmic bass patterns

import { BaseLayer } from '../BaseLayer.js';
import { BASS_PATTERNS } from '../../constants/musicalData.js';

export class BassLineLayer extends BaseLayer {
    static get TYPE() {
        return 'bass_line';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.noteIndex = 0;
        this.pattern = BASS_PATTERNS[config.pattern] || BASS_PATTERNS.peaceful;
    }
    
    createNodes() {
        // Start the bass pattern
        this.playBassNote();
    }
    
    playBassNote() {
        if (!this.isPlaying) return;
        
        const osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        
        // Get note from pattern
        const semitone = this.pattern[this.noteIndex % this.pattern.length];
        const freq = this.config.baseFreq * Math.pow(2, semitone / 12);
        osc.frequency.setValueAtTime(freq, this.context.currentTime);
        
        // Add sub oscillator for thickness
        const subOsc = this.context.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq / 2, this.context.currentTime);
        
        // Filter for classic bass sound
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.context.currentTime);
        filter.Q.setValueAtTime(5, this.context.currentTime);
        
        // Envelope
        const envelope = this.context.createGain();
        const now = this.context.currentTime;
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.4, now + 0.05);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        // Connect audio path
        osc.connect(filter);
        subOsc.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.gainNode);
        
        // Play notes
        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.8);
        subOsc.stop(now + 0.8);
        
        // Advance pattern and schedule next note
        this.noteIndex++;
        this.bassTimeout = setTimeout(() => this.playBassNote(), 1000);
    }
    
    stop(fadeTime = 2) {
        if (this.bassTimeout) {
            clearTimeout(this.bassTimeout);
        }
        super.stop(fadeTime);
    }
    
    update(params) {
        if (params.chordIndex !== undefined) {
            // Could shift the pattern based on chord root
        }
    }
}
