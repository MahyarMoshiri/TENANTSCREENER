/**
 * UI management module for Real-Time AI Tenant Screening Assistant
 */

class UIManager {
    constructor() {
        // UI elements
        this.elements = {
            statusText: document.getElementById('status-text'),
            statusLight: document.getElementById('status-light'),
            apiStatus: document.getElementById('api-status'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            volumeMeter: document.getElementById('volume-meter'),
            transcription: document.getElementById('transcription'),
            suggestions: document.getElementById('suggestions'),
            fileUpload: document.getElementById('file-upload'),
            fileList: document.getElementById('file-list'),
            summarySection: document.getElementById('summary-section'),
            summaryContent: document.getElementById('summary-content'),
            exportBtn: document.getElementById('export-btn'),
            settingsModal: document.getElementById('settings-modal'),
            closeBtn: document.querySelector('.close-btn'),
            apiKey: document.getElementById('api-key'),
            modelSelection: document.getElementById('model-selection'),
            saveSettings: document.getElementById('save-settings')
        };
        
        // State
        this.isRecording = false;
    }

    /**
     * Initialize the UI manager
     */
    initialize() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Update API status
        this.updateApiStatus();
        
        // Initialize UI state
        this.updateUIState();
        
        return true;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Start button
        this.elements.startBtn.addEventListener('click', () => {
            this.startRecording();
        });
        
        // Stop button
        this.elements.stopBtn.addEventListener('click', () => {
            this.stopRecording();
        });
        
        // Settings button
        this.elements.settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });
        
        // Close settings button
        this.elements.closeBtn.addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Save settings button
        this.elements.saveSettings.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // File upload
        this.elements.fileUpload.addEventListener('change', (event) => {
            this.handleFileUpload(event);
        });
        
        // Export button
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportSummary();
        });
        
        // Click outside modal to close
        window.addEventListener('click', (event) => {
            if (event.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });
    }

    /**
     * Start recording
     */
    async startRecording() {
        // Update UI state
        this.isRecording = true;
        this.updateUIState();
        
        // Update status
        this.updateStatus('Initializing...', 'warning');
        
        // Initialize audio
        const audioInitialized = await audioManager.initialize();
        if (!audioInitialized) {
            this.updateStatus('Microphone access denied', 'error');
            this.isRecording = false;
            this.updateUIState();
            return;
        }
        
        // Initialize transcription
        transcriptionManager.initialize();
        
        // Initialize analysis
        analysisManager.initialize();
        
        // Set up callbacks
        audioManager.onVolumeUpdate((volume) => {
            this.updateVolumeMeter(volume);
        });
        
        audioManager.onAudioData((audioData) => {
            transcriptionManager.processAudio(audioData);
        });
        
        transcriptionManager.onTranscriptionUpdate((text) => {
            this.updateTranscription(text);
        });
        
        analysisManager.onAnalysisUpdate((analysis) => {
            this.updateSuggestions(analysis);
        });
        
        // Start recording
        audioManager.startRecording();
        
        // Clear previous transcription and suggestions
        transcriptionManager.clearTranscription();
        this.elements.suggestions.innerHTML = '';
        
        // Hide summary section
        this.elements.summarySection.classList.add('hidden');
        
        // Update status
        this.updateStatus('Recording', 'active');
    }

    /**
     * Stop recording
     */
    async stopRecording() {
        // Update UI state
        this.isRecording = false;
        this.updateUIState();
        
        // Update status
        this.updateStatus('Processing...', 'warning');
        
        // Stop recording
        audioManager.stopRecording();
        
        // Clean up resources
        audioManager.stopVolumeUpdates();
        transcriptionManager.stopProcessingQueue();
        analysisManager.stopAnalysisInterval();
        
        // Generate final summary
        const summary = await analysisManager.generateFinalSummary();
        
        // Display summary
        this.displaySummary(summary);
        
        // Update status
        this.updateStatus('Ready', '');
    }

    /**
     * Update UI state based on recording status
     */
    updateUIState() {
        if (this.isRecording) {
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            this.elements.fileUpload.disabled = true;
        } else {
            this.elements.startBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
            this.elements.fileUpload.disabled = false;
        }
    }

    /**
     * Update status display
     */
    updateStatus(text, state) {
        this.elements.statusText.textContent = text;
        
        // Reset classes
        this.elements.statusLight.classList.remove('active', 'warning', 'error');
        
        // Add appropriate class
        if (state) {
            this.elements.statusLight.classList.add(state);
        }
    }

    /**
     * Update API status display
     */
    updateApiStatus() {
        if (CONFIG.apiKey) {
            this.elements.apiStatus.textContent = 'API: Connected';
            this.elements.apiStatus.style.color = 'var(--success-color)';
        } else {
            this.elements.apiStatus.textContent = 'API: Not Connected';
            this.elements.apiStatus.style.color = 'var(--warning-color)';
        }
    }

    /**
     * Update volume meter
     */
    updateVolumeMeter(volume) {
        this.elements.volumeMeter.style.width = `${volume}%`;
    }

    /**
     * Update transcription display
     */
    updateTranscription(text) {
        // Format text with speaker highlighting
        let formattedText = text;
        
        // Replace "You: " with styled span
        formattedText = formattedText.replace(/You: /g, '<span class="speaker-label user-label">You:</span> ');
        
        // Replace "Tenant: " with styled span
        formattedText = formattedText.replace(/Tenant: /g, '<span class="speaker-label tenant-label">Tenant:</span> ');
        
        // Split by newlines and wrap in appropriate divs
        const lines = formattedText.split('\n').filter(line => line.trim() !== '');
        formattedText = lines.map(line => {
            if (line.includes('<span class="speaker-label user-label">You:</span>')) {
                return `<div class="user-speech">${line}</div>`;
            } else if (line.includes('<span class="speaker-label tenant-label">Tenant:</span>')) {
                return `<div class="tenant-speech">${line}</div>`;
            } else {
                return `<div>${line}</div>`;
            }
        }).join('');
        
        this.elements.transcription.innerHTML = formattedText;
        
        // Scroll to bottom
        this.elements.transcription.scrollTop = this.elements.transcription.scrollHeight;
    }

    /**
     * Update suggestions display
     */
    updateSuggestions(analysis) {
        if (!analysis || !analysis.suggestions) return;
        
        // Clear previous suggestions
        this.elements.suggestions.innerHTML = '';
        
        // Add summary if available
        if (analysis.summary) {
            const summaryElement = document.createElement('div');
            summaryElement.className = 'suggestion-item';
            summaryElement.innerHTML = `<strong>Summary:</strong> ${analysis.summary}`;
            this.elements.suggestions.appendChild(summaryElement);
        }
        
        // Add suggestions
        analysis.suggestions.forEach(suggestion => {
            const element = document.createElement('div');
            element.className = `suggestion-item ${suggestion.priority}-priority`;
            
            // Format based on type
            let icon = '';
            switch (suggestion.type) {
                case 'question':
                    icon = '❓ ';
                    break;
                case 'red_flag':
                    icon = '🚩 ';
                    break;
                case 'missing_info':
                    icon = '📝 ';
                    break;
                default:
                    icon = '';
            }
            
            element.innerHTML = `${icon}${suggestion.text}`;
            this.elements.suggestions.appendChild(element);
        });
        
        // Scroll to bottom
        this.elements.suggestions.scrollTop = this.elements.suggestions.scrollHeight;
    }

    /**
     * Display final summary
     */
    displaySummary(summary) {
        // Show summary section
        this.elements.summarySection.classList.remove('hidden');
        
        // Format summary HTML
        let summaryHtml = `<h3>Tenant Screening Summary</h3>`;
        
        // Add main summary
        summaryHtml += `<p>${summary.summary}</p>`;
        
        // Add key points if available
        if (summary.keyPoints) {
            summaryHtml += `<h4>Key Information</h4><ul>`;
            for (const [key, value] of Object.entries(summary.keyPoints)) {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                summaryHtml += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
            }
            summaryHtml += `</ul>`;
        }
        
        // Add missing information if available
        if (summary.missingInformation && summary.missingInformation.length > 0) {
            summaryHtml += `<h4>Missing Information</h4><ul>`;
            summary.missingInformation.forEach(item => {
                summaryHtml += `<li>${item}</li>`;
            });
            summaryHtml += `</ul>`;
        }
        
        // Add risk assessment
        if (summary.riskAssessment) {
            summaryHtml += `<h4>Risk Assessment</h4><p>${summary.riskAssessment}</p>`;
        }
        
        // Update summary content
        this.elements.summaryContent.innerHTML = summaryHtml;
    }

    /**
     * Open settings modal
     */
    openSettings() {
        // Populate current settings
        this.elements.apiKey.value = CONFIG.apiKey || '';
        this.elements.modelSelection.value = CONFIG.model || 'gpt-4o';
        
        // Set transcription speed radio buttons
        const speedRadios = document.getElementsByName('transcription-speed');
        for (const radio of speedRadios) {
            radio.checked = radio.value === CONFIG.transcriptionSpeed;
        }
        
        // Show modal
        this.elements.settingsModal.style.display = 'block';
    }

    /**
     * Close settings modal
     */
    closeSettings() {
        this.elements.settingsModal.style.display = 'none';
    }

    /**
     * Save settings
     */
    saveSettings() {
        // Get values
        const apiKey = this.elements.apiKey.value.trim();
        const model = this.elements.modelSelection.value;
        
        // Get selected transcription speed
        const speedRadios = document.getElementsByName('transcription-speed');
        let transcriptionSpeed = 'fast';
        for (const radio of speedRadios) {
            if (radio.checked) {
                transcriptionSpeed = radio.value;
                break;
            }
        }
        
        // Save settings
        saveSettings({
            apiKey,
            model,
            transcriptionSpeed
        });
        
        // Update API status
        this.updateApiStatus();
        
        // Close modal
        this.closeSettings();
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        // Process each file
        for (const file of files) {
            await knowledgeManager.processFile(file);
        }
        
        // Update file list
        this.updateFileList();
        
        // Clear file input
        this.elements.fileUpload.value = '';
    }

    /**
     * Update file list display
     */
    updateFileList() {
        const documents = knowledgeManager.getDocuments();
        
        // Clear list
        this.elements.fileList.innerHTML = '';
        
        // Add each document
        documents.forEach(doc => {
            const element = document.createElement('div');
            element.className = 'file-item';
            element.innerHTML = `
                <span>${doc.name}</span>
                <span class="remove-btn" data-id="${doc.id}">×</span>
            `;
            this.elements.fileList.appendChild(element);
            
            // Add remove event listener
            const removeBtn = element.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => {
                knowledgeManager.removeDocument(doc.id);
                this.updateFileList();
            });
        });
    }

    /**
     * Export summary as text
     */
    exportSummary() {
        const summaryText = this.elements.summaryContent.innerText;
        
        // Create blob and download link
        const blob = new Blob([summaryText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tenant_screening_summary_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// Create singleton instance
const uiManager = new UIManager();
