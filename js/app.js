/**
 * Main application module for Real-Time AI Tenant Screening Assistant
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    initializeApplication();
});

/**
 * Initialize the application
 */
async function initializeApplication() {
    try {
        // Initialize UI manager
        uiManager.initialize();
        
        // Initialize knowledge manager
        knowledgeManager.initialize();
        
        // Set up knowledge base document update callback
        knowledgeManager.onDocumentUpdate((documents) => {
            uiManager.updateFileList();
        });
        
        // Load initial file list
        uiManager.updateFileList();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}
