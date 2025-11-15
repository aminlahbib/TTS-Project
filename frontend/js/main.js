// Main entry point for the TTS application

import { initElements } from './utils/dom.js';
import { setupTabs } from './utils/tabs.js';
import { populateLanguageSelects } from './utils/voices.js';
import { showToast } from './utils/toast.js';
import { showStatus, updateServerStatus } from './utils/dom.js';
import { setupCustomAudioPlayer, downloadAudio } from './components/audioPlayer.js';
import { scrollChatToBottom } from './components/chat.js';
import { getVoices, getVoiceDetails, checkServerHealth } from './services/api.js';
import { initTtsTab } from './tabs/tts.js';
import { initStreamTab } from './tabs/stream.js';
import { initChatTab } from './tabs/chat.js';
import { initServerTab } from './tabs/server.js';

// Global state
let elements = {};
let voices = [];
let voiceDetails = [];
let currentAudioBlob = null;
let currentStreamAudioBlob = null;
let currentConversationId = null;
let isStreaming = false;
let currentWebSocket = null;

// State management functions
function setCurrentAudioBlob(blob) {
    currentAudioBlob = blob;
}

function setCurrentStreamAudioBlob(blob) {
    currentStreamAudioBlob = blob;
}

function setCurrentConversationId(id) {
    currentConversationId = id;
}

// Initialize the application
async function init() {
    console.log('[Main] TTS Project Frontend Initializing...');
    console.log('[Main] Window location:', {
        href: window.location.href,
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol
    });
    
    // Initialize DOM elements
    elements = initElements();
    console.log('[Main] DOM elements initialized:', Object.keys(elements).length, 'elements');
    
    // Set up tabs
    setupTabs((tabName, tabContent) => {
        if (tabName === 'chat') {
            setTimeout(() => {
                scrollChatToBottom(elements.chatMessages);
            }, 100);
        }
        if (tabName === 'server') {
            // Server tab will check status on initialization
        }
    });
    
    // Check server status on load
    await checkServerStatus();
    
    // Load voices dynamically
    await loadVoices();
    
    // Set up custom audio player
    setupCustomAudioPlayer(elements);
    
    // Initialize tab modules
    const ttsState = {
        setCurrentAudioBlob
    };
    initTtsTab(elements, ttsState);
    
    // Stream state with getters/setters for reactivity
    const streamState = {
        get isStreaming() { return isStreaming; },
        set isStreaming(value) { isStreaming = value; },
        get currentWebSocket() { return currentWebSocket; },
        set currentWebSocket(value) { currentWebSocket = value; },
        setCurrentStreamAudioBlob
    };
    initStreamTab(elements, streamState);
    
    // Chat state with getters/setters for reactivity
    const chatState = {
        get currentConversationId() { return currentConversationId; },
        set currentConversationId(value) { currentConversationId = value; },
        setCurrentConversationId
    };
    initChatTab(elements, chatState);
    
    const serverTab = initServerTab(elements);
    
    // Set up download button handlers
    setupDownloadHandlers();
    
    console.log('[Main] Frontend initialized successfully');
}

// Load voices from API
async function loadVoices() {
    try {
        voices = await getVoices();
        
        // Populate language selects
        const selects = [elements.ttsLanguage, elements.streamLanguage, elements.voiceModeLanguage].filter(Boolean);
        populateLanguageSelects(selects, voices);
        
        // Load voice details
        voiceDetails = await getVoiceDetails();
        
    } catch (error) {
        console.error('Error loading voices:', error);
        showStatus(elements.serverInfo, 'error', `Failed to load voices: ${error.message}`);
    }
}

// Set up download button handlers
function setupDownloadHandlers() {
    // TTS download button
    if (elements.downloadTtsBtn) {
        elements.downloadTtsBtn.addEventListener('click', () => {
            try {
                if (currentAudioBlob) {
                    downloadAudio(currentAudioBlob, `tts-${Date.now()}.wav`);
                    showStatus(elements.ttsStatus, 'success', 'Audio downloaded!');
                    showToast('success', 'Audio downloaded successfully!');
                } else {
                    showStatus(elements.ttsStatus, 'error', 'No audio to download');
                }
            } catch (error) {
                showStatus(elements.ttsStatus, 'error', error.message);
            }
        });
    }
    
    // Stream download button
    if (elements.streamDownloadBtn) {
        elements.streamDownloadBtn.addEventListener('click', () => {
            try {
                if (currentStreamAudioBlob) {
                    downloadAudio(currentStreamAudioBlob, `stream-${Date.now()}.wav`);
                    showStatus(elements.streamStatus, 'success', 'Audio downloaded!');
                    showToast('success', 'Streaming audio downloaded successfully!');
                } else {
                    showStatus(elements.streamStatus, 'error', 'No audio to download');
                }
            } catch (error) {
                showStatus(elements.streamStatus, 'error', error.message);
            }
        });
    }
}

// Server Status Functions (called from main init)
async function checkServerStatus() {
    console.log('[Main] Checking server status...');
    try {
        const healthResponse = await checkServerHealth();
        console.log('[Main] Server health check passed:', healthResponse);
        if (elements.serverStatus) {
            updateServerStatus(elements.serverStatus, 'connected', 'Server Connected');
        }
        showToast('success', 'Server connected');
    } catch (error) {
        console.error('[Main] Server Status Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        if (elements.serverStatus) {
            updateServerStatus(elements.serverStatus, 'disconnected', 'Server Disconnected');
        }
        showToast('error', `Server connection failed: ${error.message}`);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

