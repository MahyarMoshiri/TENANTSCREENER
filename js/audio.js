/**
 * Audio capture and processing module for Real-Time AI Tenant Screening Assistant
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.recorder = null;
        this.analyser = null;
        this.isRecording = false;
        this.audioChunks = [];
        this.volumeCallback = null;
        this.audioDataCallback = null;
        this.processingInterval = null;
        this.volumeDataArray = null;
    }

    /**
     * Initialize audio context and request microphone access
     */
    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: CONFIG.audio.sampleRate
            });
            
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Set up audio analyser for volume visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.volumeDataArray = new Uint8Array(bufferLength);
            
            // Create source from microphone stream
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);
            
            // Set up recorder
            this.recorder = new MediaRecorder(this.mediaStream);
            this.recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                    
                    // Convert to base64 for API transmission
                    this.processAudioChunk(event.data);
                }
            };
            
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }

    /**
     * Start recording audio
     */
    startRecording() {
        if (!this.audioContext || !this.recorder) {
            console.error('Audio not initialized');
            return false;
        }
        
        this.audioChunks = [];
        this.isRecording = true;
        
        // Start recording with small time slices for real-time processing
        this.recorder.start(1000); // 1 second chunks
        
        // Start volume meter updates
        this.startVolumeUpdates();
        
        return true;
    }

    /**
     * Stop recording audio
     */
    stopRecording() {
        if (!this.isRecording) return false;
        
        this.isRecording = false;
        if (this.recorder && this.recorder.state !== 'inactive') {
            this.recorder.stop();
        }
        
        // Stop volume meter updates
        this.stopVolumeUpdates();
        
        // Stop microphone access
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        
        return true;
    }

    /**
     * Process audio chunk and send to callback
     */
    async processAudioChunk(audioBlob) {
        if (!this.audioDataCallback) return;
        
        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64Audio = reader.result.split(',')[1]; // Remove data URL prefix
                
                // Send to callback for API processing
                if (this.audioDataCallback) {
                    this.audioDataCallback(base64Audio);
                }
            };
        } catch (error) {
            console.error('Error processing audio chunk:', error);
        }
    }

    /**
     * Start updating volume meter
     */
    startVolumeUpdates() {
        this.stopVolumeUpdates(); // Clear any existing interval
        
        this.processingInterval = setInterval(() => {
            if (!this.analyser || !this.volumeDataArray) return;
            
            // Get volume data
            this.analyser.getByteFrequencyData(this.volumeDataArray);
            
            // Calculate average volume
            const average = this.volumeDataArray.reduce((sum, value) => sum + value, 0) / 
                            this.volumeDataArray.length;
            
            // Normalize to 0-100 range
            const volume = Math.min(100, Math.max(0, average * 100 / 255));
            
            // Send to callback
            if (this.volumeCallback) {
                this.volumeCallback(volume);
            }
        }, 100); // Update every 100ms
    }

    /**
     * Stop volume meter updates
     */
    stopVolumeUpdates() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }

    /**
     * Set callback for volume updates
     */
    onVolumeUpdate(callback) {
        this.volumeCallback = callback;
    }

    /**
     * Set callback for audio data
     */
    onAudioData(callback) {
        this.audioDataCallback = callback;
    }
}

// Create singleton instance
const audioManager = new AudioManager();
