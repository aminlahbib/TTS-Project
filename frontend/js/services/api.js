// API service for HTTP requests

import { CONFIG } from '../config.js';

const { API_BASE, REQUEST } = CONFIG;

// Log API configuration on module load
console.log('[API Service] Initialized with:', {
    API_BASE,
    REQUEST_TIMEOUT: REQUEST.TIMEOUT,
    REQUEST_LLM_TIMEOUT: REQUEST.LLM_TIMEOUT,
    REQUEST_TTS_TIMEOUT: REQUEST.TTS_TIMEOUT
});


async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
    } catch (error) {
        // Handle specific error types
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            throw new Error('Request timed out. Please try again.');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        }
        throw error;
    }
}


export async function checkServerHealth() {
    const url = `${API_BASE}/health`;
    console.log('[API] Checking server health at:', url);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain',
            },
        });
        
        console.log('[API] Health check response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error('[API] Health check failed:', {
                status: response.status,
                statusText: response.statusText,
                errorText
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const text = await response.text();
        console.log('[API] Health check successful:', text);
        return text;
    } catch (error) {
        console.error('[API] Health check error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            url
        });
        
        // Handle network errors specifically
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to server at ${API_BASE}. Is the server running?`);
        }
        throw error;
    }
}


export async function getVoices() {
    const response = await fetchWithErrorHandling(`${API_BASE}/voices`);
    return await response.json();
}

/**
 * Get detailed voice information
 */
export async function getVoiceDetails() {
    const response = await fetchWithErrorHandling(`${API_BASE}/voices/detail`);
    return await response.json();
}

/**
 * Generate TTS audio
 */
export async function generateTTS(text, language, speaker = null) {
    const requestBody = { text, language };
    if (speaker !== null) {
        requestBody.speaker = speaker;
    }
    
    const response = await fetchWithErrorHandling(`${API_BASE}/tts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(REQUEST.TTS_TIMEOUT)
    });
    
    return await response.json();
}

/**
 * Send chat message
 */
export async function sendChatMessage(message, conversationId = null) {
    const requestBody = { message };
    if (conversationId) {
        requestBody.conversation_id = conversationId;
    }
    
    const response = await fetchWithErrorHandling(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(REQUEST.LLM_TIMEOUT)
    });
    
    return await response.json();
}

/**
 * Send voice chat message (with audio response)
 */
export async function sendVoiceChatMessage(message, language, conversationId = null) {
    const requestBody = { message, language };
    if (conversationId) {
        requestBody.conversation_id = conversationId;
    }
    
    const response = await fetchWithErrorHandling(`${API_BASE}/voice-chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(REQUEST.LLM_TIMEOUT)
    });
    
    return await response.json();
}

/**
 * Get server metrics
 */
export async function getServerMetrics() {
    const response = await fetchWithErrorHandling(`${API_BASE}/metrics`);
    return await response.json();
}

