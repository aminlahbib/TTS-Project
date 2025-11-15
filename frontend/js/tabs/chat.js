// Chat Tab Module - AI Chat functionality

import { CONFIG } from '../config.js';
import { sendChatMessage, sendVoiceChatMessage } from '../services/api.js';
import { setButtonState, showStatus } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { addChatMessage, scrollChatToBottom, clearChat, exportChat } from '../components/chat.js';
import { isSpeechRecognitionSupported } from '../services/voice.js';

/**
 * Initialize Chat tab
 * @param {Object} elements - DOM elements
 * @param {Object} state - State object with currentConversationId
 * @returns {Object} Tab handlers and cleanup functions
 */
export function initChatTab(elements, state) {
    // Chat Form Submission Handler
    async function handleChatSubmit(e) {
        e.preventDefault();
        
        const message = elements.chatInput.value.trim();
        
        if (!message) {
            showStatus(elements.chatStatus, 'error', 'Please enter a message');
            return;
        }
        
        // Add user message to chat
        addChatMessage(elements.chatMessages, 'user', message);
        elements.chatInput.value = '';
        
        setButtonState(elements.chatBtn, true, 'Thinking...');
        showStatus(elements.chatStatus, 'info', 'Sending message...');
        
        try {
            const data = await sendChatMessage(message, state.currentConversationId);
            
            // Store conversation ID
            if (state.setCurrentConversationId) {
                state.setCurrentConversationId(data.conversation_id);
            } else {
                state.currentConversationId = data.conversation_id;
            }
            
            // Add bot response with audio
            addChatMessage(
                elements.chatMessages, 
                'bot', 
                data.reply || 'No response received', 
                data.audio_base64
            );
            
            showStatus(elements.chatStatus, 'success', 'Message sent successfully!');
            showToast('success', 'Message sent successfully!');
            
        } catch (error) {
            console.error('Chat Error:', error);
            addChatMessage(
                elements.chatMessages, 
                'bot', 
                `Sorry, I'm having trouble connecting to the AI service. ${error.message}`
            );
            showStatus(elements.chatStatus, 'error', `Error: ${error.message}`);
            showToast('error', `Error: ${error.message}`);
        } finally {
            setButtonState(elements.chatBtn, false, 'Send');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        if (elements.chatForm) {
            elements.chatForm.addEventListener('submit', handleChatSubmit);
        }
        
        // Enter key support for chat
        if (elements.chatInput) {
            elements.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (elements.chatForm) {
                        elements.chatForm.dispatchEvent(new Event('submit'));
                    }
                }
            });
        }
        
        // Clear and export chat buttons
        if (elements.clearChatBtn) {
            elements.clearChatBtn.addEventListener('click', () => {
                clearChat(elements.chatMessages);
                if (state.setCurrentConversationId) {
                    state.setCurrentConversationId(null);
                } else {
                    state.currentConversationId = null;
                }
                showStatus(elements.chatStatus, 'info', 'Chat cleared');
                showToast('success', 'Chat cleared');
            });
        }
        
        if (elements.exportChatBtn) {
            elements.exportChatBtn.addEventListener('click', () => {
                exportChat(elements.chatMessages);
                showStatus(elements.chatStatus, 'success', 'Chat exported!');
                showToast('success', 'Chat exported successfully!');
            });
        }
    }
    
    // Setup voice input and voice mode
    function setupVoiceFeatures() {
        // Check for speech recognition support and hide button if not supported
        if (!isSpeechRecognitionSupported()) {
            if (elements.chatMicBtn) {
                elements.chatMicBtn.style.display = 'none';
            }
            console.warn('Speech recognition not supported in this browser');
        }
        
        // Setup voice mode toggle (simplified - full implementation would be in voice.js)
        if (elements.voiceModeToggleBtn) {
            elements.voiceModeToggleBtn.addEventListener('click', () => {
                if (elements.textInputWrapper && elements.voiceModeWrapper) {
                    elements.textInputWrapper.classList.add('hidden');
                    elements.voiceModeWrapper.classList.remove('hidden');
                    // TODO: Full voice mode setup would go here
                    showToast('info', 'Voice mode - full implementation coming soon');
                }
            });
        }
        
        if (elements.exitVoiceModeBtn) {
            elements.exitVoiceModeBtn.addEventListener('click', () => {
                if (elements.textInputWrapper && elements.voiceModeWrapper) {
                    elements.textInputWrapper.classList.remove('hidden');
                    elements.voiceModeWrapper.classList.add('hidden');
                }
            });
        }
    }
    
    // Initialize
    setupEventListeners();
    setupVoiceFeatures();
    
    // Scroll to bottom when tab is activated
    if (elements.chatMessages) {
        setTimeout(() => {
            scrollChatToBottom(elements.chatMessages);
        }, 100);
    }
    
    return {
        handleChatSubmit
    };
}

