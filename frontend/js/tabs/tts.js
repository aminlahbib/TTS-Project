// TTS Tab Module - Text-to-Speech functionality

import { CONFIG } from '../config.js';
import { generateTTS } from '../services/api.js';
import { setButtonState, showStatus } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { base64ToBlob } from '../utils/audio.js';
import { setupAudioPlayer } from '../components/audioPlayer.js';
import { displaySpectrogram } from '../components/spectrogram.js';
import { populateSpeakerSelect } from '../utils/voices.js';

/**
 * Initialize TTS tab
 * @param {Object} elements - DOM elements
 * @param {Object} state - State object with setCurrentAudioBlob and voiceDetails
 * @returns {Object} Tab handlers and cleanup functions
 */
export function initTtsTab(elements, state) {
    const { setCurrentAudioBlob, voiceDetails = [] } = state;
    
    // Handle language change to populate speaker select
    function handleLanguageChange() {
        if (!elements.ttsLanguage || !elements.speakerGroup) return;
        
        const language = elements.ttsLanguage.value;
        const voiceDetail = voiceDetails.find(v => v.key === language);
        
        if (voiceDetail && voiceDetail.speaker !== null) {
            // Show speaker selection if available
            populateSpeakerSelect(elements.ttsSpeaker, language, voiceDetails);
            elements.speakerGroup.style.display = 'block';
        } else {
            elements.speakerGroup.style.display = 'none';
        }
    }
    
    // Set up character counter
    function setupCharacterCounter() {
        if (!elements.ttsText || !elements.ttsCharCount) return;
        
        elements.ttsText.addEventListener('input', () => {
            const count = elements.ttsText.value.length;
            elements.ttsCharCount.textContent = count;
        });
        elements.ttsCharCount.textContent = elements.ttsText.value.length;
    }
    
    // TTS Form Submission Handler
    async function handleTtsSubmit(e) {
        e.preventDefault();
        
        if (!elements.ttsText || !elements.ttsLanguage) return;
        
        const text = elements.ttsText.value.trim();
        const language = elements.ttsLanguage.value;
        const speaker = elements.ttsSpeaker?.value ? parseInt(elements.ttsSpeaker.value) : null;
        
        if (!text) {
            showStatus(elements.ttsStatus, 'error', 'Please enter some text to synthesize');
            return;
        }
        
        if (!language) {
            showStatus(elements.ttsStatus, 'error', 'Please select a language');
            return;
        }
        
        setButtonState(elements.ttsBtn, true, 'Generating...');
        showStatus(elements.ttsStatus, 'info', 'Generating speech...');
        if (elements.downloadTtsBtn) elements.downloadTtsBtn.style.display = 'none';
        if (elements.ttsAudioPlayer) elements.ttsAudioPlayer.classList.add('hidden');
        
        try {
            const data = await generateTTS(text, language, speaker);
            
            // Store audio blob for download
            const audioBlob = await base64ToBlob(data.audio_base64, 'audio/wav');
            if (setCurrentAudioBlob) {
                setCurrentAudioBlob(audioBlob);
            }
            
            // Show download button
            if (elements.downloadTtsBtn) {
                elements.downloadTtsBtn.style.display = 'block';
            }
            
            // Set up custom audio player
            await setupAudioPlayer(elements, data.audio_base64);
            
            // Display spectrogram if available
            if (data.spectrogram_base64 && elements.ttsSpectrogram) {
                displaySpectrogram(elements.ttsSpectrogram, data.spectrogram_base64);
            }
            
            showStatus(elements.ttsStatus, 'success', 
                `Speech generated successfully!<br>
                 Duration: ${(data.duration_ms / 1000).toFixed(2)}s<br>
                 Sample Rate: ${data.sample_rate}Hz`);
            
            showToast('success', 'Speech generated successfully!');
            
        } catch (error) {
            console.error('TTS Error:', error);
            let errorMsg = error.message;
            
            // Handle specific error types
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                errorMsg = 'Request timed out. Please try again with shorter text.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMsg = 'Network error. Please check your connection and try again.';
            }
            
            showStatus(elements.ttsStatus, 'error', `Error: ${errorMsg}`);
            showToast('error', `Error: ${errorMsg}`);
        } finally {
            setButtonState(elements.ttsBtn, false, 'Generate Speech');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        if (elements.ttsForm) {
            elements.ttsForm.addEventListener('submit', handleTtsSubmit);
        }
        
        // Language change handler for speaker selection
        if (elements.ttsLanguage) {
            elements.ttsLanguage.addEventListener('change', handleLanguageChange);
        }
    }
    
    // Initialize
    setupCharacterCounter();
    setupEventListeners();
    
    return {
        handleTtsSubmit,
        handleLanguageChange,
        setupCharacterCounter
    };
}

