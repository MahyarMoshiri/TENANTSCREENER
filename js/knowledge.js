/**
 * Knowledge base module for Real-Time AI Tenant Screening Assistant
 */

class KnowledgeManager {
    constructor() {
        this.documents = [];
        this.documentUpdateCallback = null;
    }

    /**
     * Initialize the knowledge manager
     */
    initialize() {
        // Load documents from storage
        this.loadDocuments();
        return true;
    }

    /**
     * Process uploaded file
     * @param {File} file - Uploaded file object
     */
    async processFile(file) {
        try {
            // Generate unique ID
            const id = 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            
            // Extract text content based on file type
            let content = '';
            
            if (file.type.includes('image')) {
                // For images, just store metadata (in a real implementation, 
                // this would use OCR or image analysis)
                content = `[Image file: ${file.name}]`;
            } else if (file.type.includes('pdf')) {
                // For PDFs, extract text (simplified - in a real implementation, 
                // this would use a PDF parsing library)
                content = `[PDF content from: ${file.name}]`;
            } else {
                // For text files, read directly
                content = await this.readFileAsText(file);
            }
            
            // Create document object
            const document = {
                id: id,
                name: file.name,
                type: file.type,
                size: file.size,
                content: content,
                added: new Date().toISOString()
            };
            
            // Add to documents array
            this.documents.push(document);
            
            // Save to storage
            this.saveDocuments();
            
            // Add to analysis knowledge base
            analysisManager.addToKnowledgeBase({
                id: id,
                name: file.name,
                content: content
            });
            
            // Notify callback
            if (this.documentUpdateCallback) {
                this.documentUpdateCallback(this.documents);
            }
            
            return document;
        } catch (error) {
            console.error('Error processing file:', error);
            return null;
        }
    }

    /**
     * Read file as text
     * @param {File} file - File to read
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    /**
     * Remove document
     * @param {string} id - Document ID to remove
     */
    removeDocument(id) {
        // Remove from documents array
        this.documents = this.documents.filter(doc => doc.id !== id);
        
        // Save to storage
        this.saveDocuments();
        
        // Remove from analysis knowledge base
        analysisManager.removeFromKnowledgeBase(id);
        
        // Notify callback
        if (this.documentUpdateCallback) {
            this.documentUpdateCallback(this.documents);
        }
        
        return true;
    }

    /**
     * Save documents to storage
     */
    saveDocuments() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('tenant_assistant_documents', JSON.stringify(this.documents));
        }
    }

    /**
     * Load documents from storage
     */
    loadDocuments() {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('tenant_assistant_documents');
            if (stored) {
                try {
                    this.documents = JSON.parse(stored);
                    
                    // Also load into analysis knowledge base
                    this.documents.forEach(doc => {
                        analysisManager.addToKnowledgeBase({
                            id: doc.id,
                            name: doc.name,
                            content: doc.content
                        });
                    });
                    
                    // Notify callback
                    if (this.documentUpdateCallback) {
                        this.documentUpdateCallback(this.documents);
                    }
                } catch (error) {
                    console.error('Error loading documents:', error);
                    this.documents = [];
                }
            }
        }
    }

    /**
     * Get all documents
     */
    getDocuments() {
        return this.documents;
    }

    /**
     * Set callback for document updates
     */
    onDocumentUpdate(callback) {
        this.documentUpdateCallback = callback;
    }
}

// Create singleton instance
const knowledgeManager = new KnowledgeManager();
