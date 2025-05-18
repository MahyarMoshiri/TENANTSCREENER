/**
 * Analysis module for Real-Time AI Tenant Screening Assistant
 */

class AnalysisManager {
    constructor() {
        this.isAnalyzing = false;
        this.lastAnalysisTime = 0;
        this.analysisUpdateCallback = null;
        this.analysisInterval = null;
        this.lastTranscriptionLength = 0;
        this.knowledgeBase = [];
    }

    /**
     * Initialize the analysis manager
     */
    initialize() {
        // Start periodic analysis
        this.startAnalysisInterval();
        
        // Load knowledge base from storage
        this.loadKnowledgeBase();
        
        return true;
    }

    /**
     * Start periodic analysis interval
     */
    startAnalysisInterval() {
        this.analysisInterval = setInterval(() => {
            this.analyzeTranscription();
        }, CONFIG.ui.suggestionUpdateInterval);
    }

    /**
     * Stop analysis interval
     */
    stopAnalysisInterval() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
    }

    /**
     * Analyze current transcription
     */
    async analyzeTranscription() {
        // Skip if already analyzing or no transcription
        const transcription = transcriptionManager.getTranscription();
        if (this.isAnalyzing || 
            !transcription || 
            transcription.length === 0 || 
            transcription.length === this.lastTranscriptionLength) {
            return;
        }

        // Update last transcription length
        this.lastTranscriptionLength = transcription.length;
        
        // Set analyzing flag
        this.isAnalyzing = true;
        
        try {
            // Check if API key is available
            if (!CONFIG.apiKey) {
                console.error('OpenAI API key not set');
                this.simulateAnalysis(transcription);
                return;
            }

            // Prepare knowledge context
            const knowledgeContext = this.prepareKnowledgeContext();
            
            // Prepare request to OpenAI Chat API
            const response = await fetch(CONFIG.openai.chatEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: CONFIG.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an AI assistant helping with tenant screening. 
                            Analyze the conversation between a landlord/property manager and a potential tenant.
                            Provide real-time suggestions, highlight red flags, and note missing information.
                            Focus on key screening criteria: income verification, rental history, employment stability, 
                            credit worthiness, and potential issues.
                            
                            Format your response as JSON with the following structure:
                            {
                                "suggestions": [
                                    {
                                        "text": "Suggested question or observation",
                                        "priority": "high|medium|low",
                                        "type": "question|red_flag|missing_info"
                                    }
                                ],
                                "summary": "Brief summary of key points so far"
                            }
                            
                            Knowledge base context:
                            ${knowledgeContext}`
                        },
                        {
                            role: 'user',
                            content: `Current conversation transcript:\n${transcription}`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Parse and update suggestions
            if (data.choices && data.choices[0] && data.choices[0].message) {
                try {
                    const content = data.choices[0].message.content;
                    const parsedContent = JSON.parse(content);
                    
                    // Update via callback
                    if (this.analysisUpdateCallback) {
                        this.analysisUpdateCallback(parsedContent);
                    }
                } catch (parseError) {
                    console.error('Error parsing analysis response:', parseError);
                    this.simulateAnalysis(transcription);
                }
            }
        } catch (error) {
            console.error('Analysis error:', error);
            
            // For demo/development without API key
            this.simulateAnalysis(transcription);
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * Prepare knowledge context from knowledge base
     */
    prepareKnowledgeContext() {
        if (!this.knowledgeBase || this.knowledgeBase.length === 0) {
            return "No custom knowledge available.";
        }
        
        // Combine knowledge items (simplified - in a real implementation, 
        // this would use embeddings and semantic search)
        return this.knowledgeBase.map(item => 
            `Document: ${item.name}\nContent: ${item.content}`
        ).join('\n\n');
    }

    /**
     * For demo/development without API key - simulate analysis
     */
    simulateAnalysis(transcription) {
        // Demo suggestions based on common screening topics
        const demoSuggestions = [
            {
                text: "Ask about their income verification documents (pay stubs, tax returns)",
                priority: "high",
                type: "question"
            },
            {
                text: "Inquire about their rental history and previous landlord references",
                priority: "medium",
                type: "question"
            },
            {
                text: "The tenant hasn't mentioned their credit score or financial situation",
                priority: "medium",
                type: "missing_info"
            },
            {
                text: "Ask about their reason for moving from their current residence",
                priority: "low",
                type: "question"
            }
        ];
        
        // Add contextual suggestions based on transcription content
        if (transcription.includes("income")) {
            demoSuggestions.push({
                text: "Request specific income amount and verification",
                priority: "high",
                type: "question"
            });
        }
        
        if (transcription.includes("pet") || transcription.includes("cat") || transcription.includes("dog")) {
            demoSuggestions.push({
                text: "Confirm pet policy and any additional pet deposit requirements",
                priority: "medium",
                type: "question"
            });
        }
        
        if (transcription.includes("evict")) {
            demoSuggestions.push({
                text: "RED FLAG: Potential previous eviction mentioned - probe for details",
                priority: "high",
                type: "red_flag"
            });
        }
        
        // Generate simple summary
        const summary = "Tenant has expressed interest in the property. " + 
                        (transcription.includes("job") || transcription.includes("work") ? 
                            "Some employment information provided. " : "Employment details still needed. ") +
                        (transcription.includes("income") ? 
                            "Income mentioned but verification needed. " : "No income information yet. ") +
                        (transcription.includes("move in") ? 
                            "Move-in timeframe discussed. " : "Move-in timeline not established. ");
        
        // Randomly select 2-3 suggestions
        const shuffled = demoSuggestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
        
        // Create analysis result
        const analysisResult = {
            suggestions: selected,
            summary: summary
        };
        
        // Update via callback
        if (this.analysisUpdateCallback) {
            this.analysisUpdateCallback(analysisResult);
        }
    }

    /**
     * Add document to knowledge base
     */
    addToKnowledgeBase(document) {
        // Add to knowledge base
        this.knowledgeBase.push(document);
        
        // Save to storage
        this.saveKnowledgeBase();
        
        return true;
    }

    /**
     * Remove document from knowledge base
     */
    removeFromKnowledgeBase(documentId) {
        // Remove from knowledge base
        this.knowledgeBase = this.knowledgeBase.filter(doc => doc.id !== documentId);
        
        // Save to storage
        this.saveKnowledgeBase();
        
        return true;
    }

    /**
     * Save knowledge base to storage
     */
    saveKnowledgeBase() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(CONFIG.storage.knowledgeBase, JSON.stringify(this.knowledgeBase));
        }
    }

    /**
     * Load knowledge base from storage
     */
    loadKnowledgeBase() {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(CONFIG.storage.knowledgeBase);
            if (stored) {
                try {
                    this.knowledgeBase = JSON.parse(stored);
                } catch (error) {
                    console.error('Error loading knowledge base:', error);
                    this.knowledgeBase = [];
                }
            }
        }
    }

    /**
     * Generate final summary
     */
    async generateFinalSummary() {
        const transcription = transcriptionManager.getTranscription();
        if (!transcription || transcription.length === 0) {
            return {
                summary: "No conversation recorded.",
                riskAssessment: "Unable to assess risk without conversation data."
            };
        }
        
        try {
            // Check if API key is available
            if (!CONFIG.apiKey) {
                console.error('OpenAI API key not set');
                return this.simulateFinalSummary(transcription);
            }

            // Prepare knowledge context
            const knowledgeContext = this.prepareKnowledgeContext();
            
            // Prepare request to OpenAI Chat API
            const response = await fetch(CONFIG.openai.chatEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: CONFIG.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an AI assistant helping with tenant screening. 
                            Create a comprehensive summary of the tenant screening call.
                            Include key information gathered, missing information, and a risk assessment.
                            
                            Format your response as JSON with the following structure:
                            {
                                "summary": "Detailed summary of the conversation and key points",
                                "missingInformation": ["List of missing information"],
                                "riskAssessment": "Overall risk assessment and recommendation",
                                "keyPoints": {
                                    "income": "Income information",
                                    "employment": "Employment information",
                                    "rentalHistory": "Rental history information",
                                    "moveInPlans": "Move-in plans",
                                    "otherNotes": "Other relevant information"
                                }
                            }
                            
                            Knowledge base context:
                            ${knowledgeContext}`
                        },
                        {
                            role: 'user',
                            content: `Complete conversation transcript:\n${transcription}`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Parse and return summary
            if (data.choices && data.choices[0] && data.choices[0].message) {
                try {
                    const content = data.choices[0].message.content;
                    return JSON.parse(content);
                } catch (parseError) {
                    console.error('Error parsing summary response:', parseError);
                    return this.simulateFinalSummary(transcription);
                }
            }
        } catch (error) {
            console.error('Summary generation error:', error);
            return this.simulateFinalSummary(transcription);
        }
    }

    /**
     * For demo/development without API key - simulate final summary
     */
    simulateFinalSummary(transcription) {
        // Extract basic information from transcription
        const hasIncome = transcription.includes("income") || transcription.includes("salary");
        const hasEmployment = transcription.includes("job") || transcription.includes("work") || transcription.includes("employ");
        const hasRentalHistory = transcription.includes("previous") || transcription.includes("landlord") || transcription.includes("rented");
        const hasMoveInPlans = transcription.includes("move in") || transcription.includes("moving");
        
        // Generate simulated summary
        return {
            summary: "The applicant has expressed interest in the property and provided some basic information during the screening call. " +
                    (hasEmployment ? "They mentioned current employment. " : "Employment details were not fully discussed. ") +
                    (hasIncome ? "Some income information was provided but verification is recommended. " : "Income details were not discussed in depth. ") +
                    (hasRentalHistory ? "The applicant mentioned previous rental experience. " : "Rental history was not fully explored. ") +
                    (hasMoveInPlans ? "Move-in timeline was discussed. " : "Move-in plans were not established."),
            missingInformation: [
                "Detailed employment verification",
                "Credit score information",
                "Complete rental history",
                "References from previous landlords",
                "Background check consent"
            ],
            riskAssessment: "Based on the limited information gathered, a moderate risk assessment is assigned. Further verification of employment, income, and rental history is strongly recommended before proceeding.",
            keyPoints: {
                income: hasIncome ? "Income was mentioned but requires verification." : "Income information not provided.",
                employment: hasEmployment ? "Employment mentioned but details are limited." : "Employment information not provided.",
                rentalHistory: hasRentalHistory ? "Some rental history mentioned." : "No rental history discussed.",
                moveInPlans: hasMoveInPlans ? "Move-in timeline discussed." : "No move-in plans established.",
                otherNotes: "Further screening recommended including credit check, background check, and landlord references."
            }
        };
    }

    /**
     * Set callback for analysis updates
     */
    onAnalysisUpdate(callback) {
        this.analysisUpdateCallback = callback;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.stopAnalysisInterval();
    }
}

// Create singleton instance
const analysisManager = new AnalysisManager();
