# Real-Time AI Tenant Screening Assistant - User Guide

## Overview

The Real-Time AI Tenant Screening Assistant is a web-based application designed to help you screen tenant applicants over the phone. The assistant listens to your conversation with the tenant, analyzes both sides in real-time, and provides suggested questions, highlights red flags, and offers follow-up prompts based on best practices.

## Features

- **Live Transcription**: Transcribes your phone conversation in real-time
- **AI-Powered Guidance**: Analyzes the conversation and provides suggestions
- **Custom Data Integration**: Learns from your uploaded screening guides and checklists
- **Post-Call Summary**: Generates a comprehensive summary after each call

## Getting Started

### Requirements

- Modern web browser (Chrome, Firefox, Edge)
- Microphone access
- OpenAI API key with access to GPT-4o and Whisper APIs

### Setup Instructions

1. **Extract the Files**:
   - Extract the `tenant_screening_assistant.zip` file to a location on your computer

2. **Open the Application**:
   - Open the `index.html` file in your web browser

3. **Configure API Key**:
   - Click the settings icon (⚙️) in the top right corner
   - Enter your OpenAI API key
   - Select your preferred model (GPT-4o recommended)
   - Choose your transcription speed preference
   - Click "Save Settings"

4. **Upload Reference Materials** (Optional):
   - In the "Knowledge Base" section, click "Upload Documents"
   - Select your tenant screening guides, checklists, or reference materials
   - Supported formats: PDF, Word, CSV, JSON, images

## Using the Assistant

### Starting a Call

1. Position your device so the microphone can clearly pick up both your voice and the tenant's voice (if on speaker)
2. Click the "Start Call" button
3. Begin your conversation with the tenant

### During the Call

- The left panel shows the real-time transcription of the conversation
- The right panel displays AI-generated suggestions, including:
  - Recommended questions to ask
  - Red flags that require attention
  - Missing information that should be collected
  - A running summary of the conversation

### Ending a Call

1. Click the "End Call" button when the conversation is complete
2. The system will generate a comprehensive summary
3. Review the summary, which includes:
   - Key information gathered
   - Missing information
   - Risk assessment
   - Recommendations
4. Click "Export Summary" to save the summary as a text file

## Tips for Best Results

- **Speak Clearly**: Ensure both you and the tenant speak clearly for accurate transcription
- **Use Speaker Mode**: If possible, put your phone on speaker mode for better audio capture
- **Upload Relevant Documents**: The more reference materials you provide, the more tailored the suggestions will be
- **Review Suggestions Quickly**: Glance at the suggestions panel regularly during the call
- **Start with Basic Questions**: Begin with standard questions to establish a baseline before diving into specifics

## Troubleshooting

- **Microphone Access Denied**: Ensure your browser has permission to access your microphone
- **Transcription Not Working**: Check your API key and internet connection
- **Slow Performance**: Try selecting "Fast" in the transcription speed settings
- **No Suggestions Appearing**: Ensure your API key has access to the GPT-4o model

## Future Extensions

This system is designed to be modular and extensible. In the future, you can:
- Train new models for different conversation types (landlord negotiations, rent-to-rent deals)
- Add more sophisticated document processing capabilities
- Integrate with your existing property management systems

## Privacy and Security

- All data remains on your device except for API calls to OpenAI
- No conversation data is stored on servers
- API keys are stored locally in your browser's storage

## Support

For additional support or questions, please contact the developer who provided this application.
