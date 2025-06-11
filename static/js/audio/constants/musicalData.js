// Musical data constants for the Cosmic Explorer music engine

export const CHORD_PROGRESSIONS = Object.freeze({
    peaceful: [
        [0, 4, 7, 11, 14],      // Cmaj9
        [5, 9, 12, 16, 19],     // Fmaj9
        [7, 11, 14, 17, 21],    // Gmaj9
        [2, 5, 9, 12, 17],      // Dm11
        [9, 12, 16, 19, 23],    // Am9
        [4, 7, 11, 14, 19],     // Em11
        [5, 9, 12, 16, 20],     // Fmaj7#11
        [0, 4, 7, 11, 14]       // Back to Cmaj9
    ],
    mysterious: [
        [0, 3, 7, 10, 14],      // Cm9
        [5, 8, 12, 15, 20],     // Fm(maj7)
        [7, 10, 14, 17, 22],    // Gm11
        [3, 7, 10, 14, 18],     // Ebmaj9
        [8, 11, 15, 18, 22],    // Abmaj7
        [1, 5, 8, 11, 15],      // Db maj9
        [10, 13, 17, 20, 24],   // Bbm9
        [0, 3, 7, 10, 15]       // Cm(maj7)
    ],
    tense: [
        [0, 3, 6, 9, 12],       // Cdim7 + octave
        [2, 5, 8, 11, 13],      // Ddim7 + b9
        [7, 10, 13, 16, 19],    // Gdim7 + tension
        [1, 4, 7, 10, 13],      // C#dim7 + b9
        [8, 11, 14, 17, 20],    // G#dim7
        [3, 6, 9, 12, 15],      // Ebdim7
        [5, 8, 11, 14, 17],     // Fdim7
        [0, 3, 6, 9, 11]        // Cdim7 + maj7
    ],
    epic: [
        [0, 7, 12, 16, 19],     // C5 add9
        [-2, 5, 10, 14, 17],    // Bb5 add9
        [5, 12, 17, 21, 24],    // F5 add9
        [3, 10, 15, 19, 22],    // Eb5 add9
        [7, 14, 19, 23, 26],    // G5 add9
        [2, 9, 14, 18, 21],     // D5 add9
        [-5, 2, 7, 11, 14],     // G5/B
        [0, 7, 12, 16, 19]      // C5 add9
    ]
});

export const BASS_PATTERNS = Object.freeze({
    peaceful: [0, 0, 5, 5, 7, 7, 5, 5],
    mysterious: [0, 0, -2, 0, 3, 3, 5, 3],
    tense: [0, 1, 0, -1, 0, 1, 3, 1],
    epic: [0, 0, 0, 0, -2, -2, 5, 5]
});

export const ARPEGGIO_PATTERNS = Object.freeze({
    peaceful: [0, 4, 7, 11, 14, 11, 7, 4],
    mysterious: [0, 3, 7, 10, 14, 10, 7, 3],
    tense: [0, 3, 6, 9, 6, 3, 0, -3],
    epic: [0, 7, 12, 16, 19, 16, 12, 7]
});

export const SCALES = Object.freeze({
    peaceful: [0, 2, 4, 5, 7, 9, 11],      // Major scale
    mysterious: [0, 2, 3, 5, 7, 8, 10],    // Natural minor
    tense: [0, 1, 3, 4, 6, 7, 9, 10],      // Diminished scale
    epic: [0, 2, 3, 5, 7, 8, 11]           // Harmonic minor
});

export const PERCUSSION_PATTERNS = Object.freeze({
    combat: [1, 0, 0, 1, 0, 1, 0, 0],
    epic: [1, 0, 1, 0, 1, 0, 1, 0]
});

// Timing constants
export const TIMING = Object.freeze({
    CHORD_CHANGE_INTERVAL: 8000,  // 8 seconds
    DEFAULT_CROSSFADE: 3,         // 3 seconds
    BPM: 60
});
