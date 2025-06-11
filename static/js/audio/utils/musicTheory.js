// Music theory utilities for the Cosmic Explorer music engine

import { SCALES, CHORD_PROGRESSIONS } from '../constants/musicalData.js';

/**
 * Gets the scale for a given mood
 * @param {string} mood - The mood (peaceful, mysterious, tense, epic)
 * @returns {number[]} Array of scale degrees
 */
export function getScale(mood) {
    return SCALES[mood] || SCALES.peaceful;
}

/**
 * Gets the current chord offset for a note
 * @param {string} mood - The mood
 * @param {number} chordIndex - Current chord index
 * @param {number} noteIndex - Note index within the chord
 * @returns {number} Semitone offset
 */
export function getChordOffset(mood, chordIndex, noteIndex) {
    const progression = CHORD_PROGRESSIONS[mood];
    if (!progression) return 0;
    
    const currentChord = progression[chordIndex % progression.length];
    return currentChord[noteIndex % currentChord.length];
}

/**
 * Converts a frequency to the nearest MIDI note number
 * @param {number} frequency - Frequency in Hz
 * @returns {number} MIDI note number
 */
export function frequencyToMidi(frequency) {
    return Math.round(69 + 12 * Math.log2(frequency / 440));
}

/**
 * Converts a MIDI note number to frequency
 * @param {number} midi - MIDI note number
 * @returns {number} Frequency in Hz
 */
export function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Gets a frequency with a semitone offset
 * @param {number} baseFreq - Base frequency
 * @param {number} semitones - Number of semitones to offset
 * @returns {number} New frequency
 */
export function getFrequencyWithOffset(baseFreq, semitones) {
    return baseFreq * Math.pow(2, semitones / 12);
}

/**
 * Generates a chord based on a root frequency and intervals
 * @param {number} rootFreq - Root frequency
 * @param {number[]} intervals - Array of semitone intervals
 * @returns {number[]} Array of frequencies
 */
export function generateChord(rootFreq, intervals) {
    return intervals.map(interval => getFrequencyWithOffset(rootFreq, interval));
}

/**
 * Gets the tempo in milliseconds for a given BPM
 * @param {number} bpm - Beats per minute
 * @param {number} subdivision - Beat subdivision (1 = quarter, 2 = eighth, etc.)
 * @returns {number} Duration in milliseconds
 */
export function bpmToMs(bpm, subdivision = 1) {
    return (60000 / bpm) / subdivision;
}

/**
 * Quantizes a time value to the nearest beat
 * @param {number} time - Time in seconds
 * @param {number} bpm - Beats per minute
 * @param {number} subdivision - Beat subdivision
 * @returns {number} Quantized time in seconds
 */
export function quantizeTime(time, bpm, subdivision = 1) {
    const beatDuration = 60 / bpm / subdivision;
    return Math.round(time / beatDuration) * beatDuration;
}
