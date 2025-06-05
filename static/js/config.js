// Game Configuration
const GameConfig = {
    // Canvas Settings
    canvas: {
        width: window.innerWidth,
        height: window.innerHeight,
        fps: 60
    },
    
    // Game Settings
    game: {
        sessionId: 'default',
        apiUrl: window.location.origin + '/api',
        socketUrl: window.location.origin
    },
    
    // Visual Settings
    visuals: {
        starCount: 200,
        nebulaCount: 3,
        particleCount: 50,
        trailLength: 10
    },
    
    // Ship Settings
    ship: {
        size: 40,
        speed: 2,
        rotationSpeed: 0.05,
        thrustPower: 0.1,
        maxVelocity: 5
    },
    
    // Colors
    colors: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        accent: '#ffff00',
        danger: '#ff3333',
        success: '#33ff33',
        ship: {
            healthy: '#33ff33',
            damaged: '#ffaa33',
            critical: '#ff3333'
        },
        space: {
            deep: '#0a0a0f',
            medium: '#1a1a2e',
            light: '#16213e'
        }
    },
    
    // Audio Settings
    audio: {
        masterVolume: 0.7,
        sfxVolume: 0.8,
        musicVolume: 0.6
    },
    
    // Sprite Paths
    sprites: {
        ship: {
            default: '/static/images/ship.png',
            damaged: '/static/images/ship-damaged.png',
            withPod: '/static/images/ship-pod.png'
        },
        planets: [
            '/static/images/planet-1.png',
            '/static/images/planet-2.png',
            '/static/images/planet-3.png'
        ],
        stations: [
            '/static/images/station-1.png',
            '/static/images/station-2.png'
        ],
        asteroids: [
            '/static/images/asteroid-1.png',
            '/static/images/asteroid-2.png'
        ]
    },
    
    // Animation Settings
    animations: {
        shipIdle: {
            duration: 2000,
            amplitude: 5
        },
        shipThrust: {
            particleCount: 10,
            particleSpeed: 3,
            particleLife: 30
        },
        explosion: {
            particleCount: 30,
            particleSpeed: 5,
            particleLife: 60
        },
        scan: {
            radius: 200,
            duration: 1000,
            color: 'rgba(0, 255, 255, 0.3)'
        }
    }
};

// Make config globally accessible
window.GameConfig = GameConfig;
