/**
 * Configuration settings for the Real-Time AI Tenant Screening Assistant
 */

const CONFIG = {
    // Default settings
    apiKey: '',
    model: 'gpt-4o',
    transcriptionSpeed: 'fast',
    
    // Audio settings
    audio: {
        sampleRate: 16000,
        bufferSize: 4096,
        channels: 1
    },
    
    // OpenAI API endpoints
    openai: {
        transcriptionEndpoint: 'https://api.openai.com/v1/audio/transcriptions',
        chatEndpoint: 'https://api.openai.com/v1/chat/completions'
    },
    
    // UI settings
    ui: {
        transcriptionUpdateInterval: 500, // ms
        suggestionUpdateInterval: 2000,   // ms
        maxTranscriptionLength: 10000,    // characters
        maxSuggestions: 5
    },
    
    // Storage keys
    storage: {
        apiKey: 'tenant_assistant_api_key',
        model: 'tenant_assistant_model',
        transcriptionSpeed: 'tenant_assistant_transcription_speed',
        knowledgeBase: 'tenant_assistant_knowledge_base'
    }
};

// Load saved settings from localStorage
function loadSavedSettings() {
    if (typeof localStorage !== 'undefined') {
        CONFIG.apiKey = localStorage.getItem(CONFIG.storage.apiKey) || '';
        CONFIG.model = localStorage.getItem(CONFIG.storage.model) || 'gpt-4o';
        CONFIG.transcriptionSpeed = localStorage.getItem(CONFIG.storage.transcriptionSpeed) || 'fast';
    }
}

// Save settings to localStorage
function saveSettings(settings) {
    if (typeof localStorage !== 'undefined') {
        if (settings.apiKey) {
            localStorage.setItem(CONFIG.storage.apiKey, settings.apiKey);
            CONFIG.apiKey = settings.apiKey;
        }
        
        if (settings.model) {
            localStorage.setItem(CONFIG.storage.model, settings.model);
            CONFIG.model = settings.model;
        }
        
        if (settings.transcriptionSpeed) {
            localStorage.setItem(CONFIG.storage.transcriptionSpeed, settings.transcriptionSpeed);
            CONFIG.transcriptionSpeed = settings.transcriptionSpeed;
        }
    }
}

// Initialize settings on load
loadSavedSettings();
