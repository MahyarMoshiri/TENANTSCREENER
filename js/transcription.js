/**
 * Transcription module for Real-Time AI Tenant Screening Assistant
 */

class TranscriptionManager {
    constructor() {
        this.transcriptionBuffer = '';
        this.isProcessing = false;
        this.transcriptionUpdateCallback = null;
        this.lastTranscriptionTime = 0;
        this.transcriptionQueue = [];
        this.processingInterval = null;
    }

    /**
     * Initialize the transcription manager
     */
    initialize() {
        // Start the processing queue
        this.startProcessingQueue();
        return true;
    }

    /**
     * Start the processing queue interval
     */
    startProcessingQueue() {
        this.processingInterval = setInterval(() => {
            this.processNextInQueue();
        }, CONFIG.ui.transcriptionUpdateInterval);
    }

    /**
     * Stop the processing queue
     */
    stopProcessingQueue() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }

    /**
     * Process audio data for transcription
     * @param {string} audioBase64 - Base64 encoded audio data
     */
    async processAudio(audioBase64) {
        // Add to queue for processing
        this.transcriptionQueue.push(audioBase64);
    }

    /**
     * Process next item in the transcription queue
     */
    async processNextInQueue() {
        // If already processing or queue is empty, skip
        if (this.isProcessing || this.transcriptionQueue.length === 0) {
            return;
        }

        // Get next audio chunk
        const audioBase64 = this.transcriptionQueue.shift();
        this.isProcessing = true;

        try {
            // Check if API key is available
            if (!CONFIG.apiKey) {
                console.error('OpenAI API key not set');
                this.isProcessing = false;
                return;
            }

            // Prepare request to OpenAI Whisper API
            const response = await fetch(CONFIG.openai.transcriptionEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file: audioBase64,
                    model: 'whisper-1',
                    response_format: 'json',
                    temperature: CONFIG.transcriptionSpeed === 'accurate' ? 0 : 0.2,
                    language: 'en'
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Update transcription buffer
            if (data.text) {
                this.updateTranscription(data.text);
            }
        } catch (error) {
            console.error('Transcription error:', error);
            
            // For demo/development without API key
            this.simulateTranscription();
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Update transcription with new text
     * @param {string} text - New transcription text
     */
    updateTranscription(text) {
        // Add timestamp for speaker detection (simplified)
        const now = Date.now();
        const timeDiff = now - this.lastTranscriptionTime;
        this.lastTranscriptionTime = now;
        
        // Simple speaker detection - if gap is large enough, assume speaker change
        // This is a simplified approach; real implementation would need more sophisticated speaker diarization
        let speakerPrefix = '';
        if (timeDiff > 2000) { // 2 second gap suggests speaker change
            // Alternate between user and tenant
            speakerPrefix = this.transcriptionBuffer.endsWith('Tenant: ') ? 'You: ' : 'Tenant: ';
        }
        
        // Add to buffer with speaker prefix if needed
        if (this.transcriptionBuffer === '' || this.transcriptionBuffer.endsWith('\n')) {
            this.transcriptionBuffer += speakerPrefix + text;
        } else {
            this.transcriptionBuffer += ' ' + text;
        }
        
        // Limit buffer size
        if (this.transcriptionBuffer.length > CONFIG.ui.maxTranscriptionLength) {
            this.transcriptionBuffer = this.transcriptionBuffer.slice(-CONFIG.ui.maxTranscriptionLength);
        }
        
        // Notify callback
        if (this.transcriptionUpdateCallback) {
            this.transcriptionUpdateCallback(this.transcriptionBuffer);
        }
    }

    /**
     * For demo/development without API key - simulate transcription
     */
    simulateTranscription() {
        // Demo phrases for simulation
        const demoUserPhrases = [
            "Thanks for your interest in the apartment.",
            "Could you tell me about your current employment?",
            "How long have you been at your current job?",
            "What's your monthly income?",
            "Do you have any pets?",
            "Have you ever been evicted before?",
            "When would you be looking to move in?",
            "How many people would be living in the unit?",
            "Do you have references from previous landlords?"
        ];
        
        const demoTenantPhrases = [
            "I'm really interested in the two-bedroom unit you advertised.",
            "I work as a software developer at Tech Solutions Inc.",
            "I've been there for about three years now.",
            "My monthly income is around $5,500 before taxes.",
            "I have a small cat, she's very well-behaved.",
            "No, I've never been evicted.",
            "I'm hoping to move in by the first of next month.",
            "It would just be me and my partner.",
            "Yes, I can provide references from my last two landlords."
        ];
        
        // Randomly select user or tenant and a phrase
        const isTenant = Math.random() > 0.5;
        const phrases = isTenant ? demoTenantPhrases : demoUserPhrases;
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        
        // Add speaker prefix
        const speakerPrefix = isTenant ? 'Tenant: ' : 'You: ';
        
        // Update with simulated transcription
        this.updateTranscription('\n' + speakerPrefix + phrase);
    }

    /**
     * Get current transcription
     */
    getTranscription() {
        return this.transcriptionBuffer;
    }

    /**
     * Clear transcription buffer
     */
    clearTranscription() {
        this.transcriptionBuffer = '';
        if (this.transcriptionUpdateCallback) {
            this.transcriptionUpdateCallback('');
        }
    }

    /**
     * Set callback for transcription updates
     */
    onTranscriptionUpdate(callback) {
        this.transcriptionUpdateCallback = callback;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.stopProcessingQueue();
        this.transcriptionQueue = [];
    }
}

// Create singleton instance
const transcriptionManager = new TranscriptionManager();
