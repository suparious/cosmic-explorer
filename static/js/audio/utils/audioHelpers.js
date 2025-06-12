// Audio utility functions for the Cosmic Explorer music engine

/**
 * Creates a filtered noise source
 * @param {AudioContext} context - The audio context
 * @param {string} filterType - Type of filter (lowpass, highpass, bandpass)
 * @param {number} frequency - Filter frequency
 * @param {number} Q - Filter Q value
 * @returns {Object} Object containing the filter output and source node reference
 */
export function createFilteredNoise(context, filterType, frequency, Q) {
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = context.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, context.currentTime);
    filter.Q.setValueAtTime(Q, context.currentTime);
    
    noise.connect(filter);
    noise.start();
    
    // Return filter as the audio node, but attach source reference
    filter.sourceNode = noise;
    return filter;
}

/**
 * Creates a reverb impulse response
 * @param {AudioContext} context - The audio context
 * @param {number} duration - Reverb duration in seconds
 * @param {number} decay - Decay rate
 * @param {boolean} reverse - Whether to reverse the impulse
 * @returns {AudioBuffer} The impulse response buffer
 */
export function createReverbImpulse(context, duration, decay, reverse) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            let sample = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            if (reverse) sample *= i / length;
            channelData[i] = sample;
        }
    }
    
    return impulse;
}

/**
 * Creates an advanced reverb impulse with early reflections
 * @param {AudioContext} context - The audio context
 * @param {number} duration - Reverb duration in seconds
 * @param {number} decay - Decay rate
 * @param {boolean} reverse - Whether to reverse the impulse
 * @returns {AudioBuffer} The impulse response buffer
 */
export function createAdvancedReverbImpulse(context, duration, decay, reverse) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            let sample;
            
            if (i < sampleRate * 0.1) {
                // Early reflections
                sample = (Math.random() * 2 - 1) * Math.pow(1 - i / (sampleRate * 0.1), 0.5);
            } else {
                // Diffuse reverb tail
                sample = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
            
            // Add slight stereo difference
            if (channel === 1) {
                sample *= 0.95;
            }
            
            if (reverse) sample *= i / length;
            channelData[i] = sample;
        }
    }
    
    return impulse;
}

/**
 * Creates a distortion curve for waveshaping
 * @param {number} amount - Distortion amount (0-100)
 * @returns {Float32Array} The distortion curve
 */
export function makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
}

/**
 * Creates a stereo widener effect
 * @param {AudioContext} context - The audio context
 * @returns {Object} Object with input and output nodes
 */
export function createStereoWidener(context) {
    const splitter = context.createChannelSplitter(2);
    const merger = context.createChannelMerger(2);
    
    // Delay one channel slightly for width
    const delayL = context.createDelay(0.03);
    const delayR = context.createDelay(0.03);
    delayL.delayTime.setValueAtTime(0.01, context.currentTime);
    delayR.delayTime.setValueAtTime(0.015, context.currentTime);
    
    // Connect
    splitter.connect(delayL, 0);
    splitter.connect(delayR, 1);
    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    
    return {
        input: splitter,
        output: merger
    };
}

/**
 * Safely stops an audio node
 * @param {AudioNode} node - The node to stop
 */
export function stopAudioNode(node) {
    if (node && node.stop) {
        try {
            node.stop();
        } catch (e) {
            // Node might already be stopped
        }
    }
}

/**
 * Creates a fade in/out envelope
 * @param {AudioContext} context - The audio context
 * @param {GainNode} gainNode - The gain node to control
 * @param {number} fadeInTime - Fade in duration
 * @param {number} sustainTime - Sustain duration
 * @param {number} fadeOutTime - Fade out duration
 * @param {number} maxGain - Maximum gain value
 */
export function createEnvelope(context, gainNode, fadeInTime, sustainTime, fadeOutTime, maxGain = 1) {
    const now = context.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(maxGain, now + fadeInTime);
    gainNode.gain.setValueAtTime(maxGain, now + fadeInTime + sustainTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + fadeInTime + sustainTime + fadeOutTime);
}
