# Real-Time AI Tenant Screening Assistant - Architecture

## System Overview

The Real-Time AI Tenant Screening Assistant is designed to provide real-time guidance during tenant screening phone calls. The system listens to conversations through a microphone, transcribes the audio in real-time, analyzes the conversation content against best practices and custom data, and provides actionable suggestions to the user.

## Architecture Components

### 1. Audio Capture Module
- **Purpose**: Capture audio from the microphone in real-time
- **Technology**: Web Audio API (browser-based solution)
- **Functionality**: Records audio from the user's microphone and the tenant's voice (through speaker output or direct line)

### 2. Transcription Module
- **Purpose**: Convert speech to text in real-time
- **Technology**: OpenAI Whisper API
- **Functionality**: Streams audio chunks to the API and receives transcribed text with minimal latency

### 3. Knowledge Base Module
- **Purpose**: Store and retrieve custom screening data
- **Technology**: Vector database (simple in-memory for MVP)
- **Functionality**: Processes uploaded documents (PDF, Word, CSV, images) and converts them to retrievable knowledge

### 4. Analysis Engine
- **Purpose**: Analyze conversation in real-time
- **Technology**: OpenAI GPT-4o API
- **Functionality**: Processes transcribed text, retrieves relevant knowledge, and generates suggestions

### 5. User Interface
- **Purpose**: Display transcription and suggestions
- **Technology**: Simple web interface (HTML, CSS, JavaScript)
- **Functionality**: Shows real-time transcription, highlights key points, displays suggestions, and provides post-call summary

## Data Flow

1. Audio is captured from the microphone
2. Audio is streamed to the OpenAI Whisper API for transcription
3. Transcribed text is displayed in the UI and sent to the Analysis Engine
4. Analysis Engine retrieves relevant information from the Knowledge Base
5. Analysis Engine generates suggestions based on the conversation and knowledge
6. Suggestions are displayed in the UI in real-time
7. After the call, a summary is generated and displayed

## Implementation Approach

For the fastest implementation with minimal technical expertise required:

1. **Web-based solution**: A simple HTML/JS application that runs in the browser
2. **Serverless architecture**: Direct API calls to OpenAI from the browser
3. **Local storage**: Store custom data in the browser's local storage
4. **Simple deployment**: Host on GitHub Pages or similar free hosting service

This approach minimizes setup complexity while providing the core functionality needed.
