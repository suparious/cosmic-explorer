// Pad layer - creates rich, harmonic pad sounds

import { BaseLayer } from '../BaseLayer.js';
import { getChordOffset } from '../../utils/musicTheory.js';

export class PadLayer extends BaseLayer {
    static get TYPE() {
        return 'pad';
    }
    
    constructor(context, config, mood) {
        super(context, config, mood);
        this.currentChordIndex = 0;
    }
    
    createNodes() {
        this.config.frequencies.forEach((freq, i) => {
            // Create oscillator
            const osc = this.context.createOscillator();
            osc.type = 'sawtooth';
            
            // Apply chord progression
            const chordOffset = getChordOffset(this.mood, this.currentChordIndex, i);
            osc.frequency.setValueAtTime(
                freq * Math.pow(2, chordOffset / 12), 
                this.context.currentTime
            );
            
            // Individual oscillator gain for mixing
            const oscGain = this.context.createGain();
            oscGain.gain.setValueAtTime(0.3, this.context.currentTime);
            
            // Filter for warmth
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000 + i * 200, this.context.currentTime);
            filter.Q.setValueAtTime(2, this.context.currentTime);
            
            // LFO for filter movement
            const filterLfo = this.context.createOscillator();
            const filterLfoGain = this.context.createGain();
            filterLfo.frequency.setValueAtTime(0.2 + i * 0.1, this.context.currentTime);
            filterLfoGain.gain.setValueAtTime(300, this.context.currentTime);
            
            // Connect LFO to filter
            filterLfo.connect(filterLfoGain);
            filterLfoGain.connect(filter.frequency);
            
            // Connect audio path
            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(this.gainNode);
            
            // Start oscillators
            osc.start();
            filterLfo.start();
            
            // Register nodes
            this.registerNode(osc);
            this.registerNode(filterLfo);
        });
    }
    
    update(params) {
        if (params.chordIndex !== undefined) {
            this.currentChordIndex = params.chordIndex;
        }
    }
}
