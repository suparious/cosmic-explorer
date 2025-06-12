// Lead layer - creates melodic lead lines

import { BaseLayer } from '../BaseLayer.js';
import { SCALES } from '../../constants/musicalData.js';

export class LeadLayer extends BaseLayer {
    static get TYPE() {
        return 'lead';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.scale = SCALES[mood] || SCALES.peaceful;
        this.noteIndex = 0;
    }
    
    createNodes() {
        // Start melodic sequence
        this.scheduleNextNote();
    }
    
    scheduleNextNote() {
        const playNote = () => {
            if (!this.isPlaying) return;
            
            const osc = this.context.createOscillator();
            osc.type = 'sine';
            
            // Generate melodic movement
            const note = this.scale[this.noteIndex % this.scale.length];
            const octave = Math.floor(this.noteIndex / this.scale.length);
            const freq = this.config.frequencies[0] * Math.pow(2, (note + octave * 12) / 12);
            
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            
            // Add slight vibrato
            const vibrato = this.context.createOscillator();
            const vibratoGain = this.context.createGain();
            vibrato.frequency.setValueAtTime(5, this.context.currentTime);
            vibratoGain.gain.setValueAtTime(freq * 0.01, this.context.currentTime);
            
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            
            // Envelope
            const envelope = this.context.createGain();
            const now = this.context.currentTime;
            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(0.2, now + 0.1);
            envelope.gain.exponentialRampToValueAtTime(0.001, now + 1);
            
            // Filter for tone shaping
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.Q.setValueAtTime(1, now);
            
            // Connect audio path
            osc.connect(filter);
            filter.connect(envelope);
            envelope.connect(this.gainNode);
            
            // Start and stop
            osc.start(now);
            vibrato.start(now);
            osc.stop(now + 1);
            vibrato.stop(now + 1);
            
            // Update note index with some variation
            this.noteIndex = (this.noteIndex + 1 + Math.floor(Math.random() * 3)) % (this.scale.length * 2);
            
            // Schedule next note
            const delay = 2000 + Math.random() * 2000;
            this.leadTimeout = setTimeout(() => this.scheduleNextNote(), delay);
        };
        
        // Start with random delay
        const initialDelay = Math.random() * 4000;
        this.leadTimeout = setTimeout(playNote, initialDelay);
    }
    
    stop(fadeTime = 2) {
        if (this.leadTimeout) {
            clearTimeout(this.leadTimeout);
        }
        super.stop(fadeTime);
    }
    
    update(params) {
        if (params.chordIndex !== undefined) {
            // Could adjust scale or transpose based on chord
        }
    }
}
