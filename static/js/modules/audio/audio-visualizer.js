/**
 * AudioVisualizer - Handles music visualization in the UI
 */
export class AudioVisualizer {
    constructor() {
        this.visualizerCanvas = document.getElementById('visualizer-canvas');
        this.visualizerCtx = this.visualizerCanvas ? this.visualizerCanvas.getContext('2d') : null;
        this.trackNameEl = document.getElementById('track-name');
        this.musicToggleBtn = document.getElementById('music-toggle');
        
        // Start visualization loop
        if (this.visualizerCtx) {
            this.renderAudioVisualization();
        }
    }
    
    /**
     * Main render loop for audio visualization
     */
    renderAudioVisualization() {
        if (!this.visualizerCtx || !window.audioManager) {
            requestAnimationFrame(() => this.renderAudioVisualization());
            return;
        }
        
        const data = window.audioManager.getVisualizationData();
        const ctx = this.visualizerCtx;
        const width = this.visualizerCanvas.width;
        const height = this.visualizerCanvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        if (data) {
            // Draw frequency bars
            const barWidth = width / data.length * 2;
            const barSpacing = 2;
            
            for (let i = 0; i < data.length; i += 2) {
                const barHeight = (data[i] / 255) * height * 0.8;
                const x = (i / 2) * (barWidth + barSpacing);
                const y = height - barHeight;
                
                // Create gradient
                const gradient = ctx.createLinearGradient(0, y, 0, height);
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0.8)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, barHeight);
            }
        }
        
        // Update music state
        if (this.musicToggleBtn && window.audioManager.musicEngine) {
            if (window.audioManager.musicEngine.isPlaying) {
                this.musicToggleBtn.classList.add('playing');
                this.musicToggleBtn.innerHTML = '♫';
            } else {
                this.musicToggleBtn.classList.remove('playing');
                this.musicToggleBtn.innerHTML = '♪';
            }
        }
        
        // Update track name
        if (this.trackNameEl && window.audioManager.musicEngine) {
            const tracks = window.audioManager.musicEngine.tracks;
            const currentTrack = window.audioManager.musicEngine.currentTrack;
            if (tracks[currentTrack]) {
                this.trackNameEl.textContent = tracks[currentTrack].name;
            }
        }
        
        requestAnimationFrame(() => this.renderAudioVisualization());
    }
}
