// Streaming Tab Module - Real-time audio streaming functionality

import { CONFIG } from '../config.js';
import { setButtonState, showStatus } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { playAudio } from '../utils/audio.js';
import { initStreamSpectrogram, visualizeMelFrame } from '../components/spectrogram.js';
import { startWebSocketStream } from '../services/websocket.js';

/**
 * Initialize Streaming tab
 * @param {Object} elements - DOM elements
 * @param {Object} state - State object with isStreaming, currentWebSocket, currentStreamAudioBlob
 * @returns {Object} Tab handlers and cleanup functions
 */
export function initStreamTab(elements, state) {
    let streamSpectrogramState = null;
    
    // Streaming Form Submission Handler
    async function handleStreamSubmit(e) {
        e.preventDefault();
        
        const text = elements.streamText.value.trim();
        const language = elements.streamLanguage.value;
        
        if (!text) {
            showStatus(elements.streamStatus, 'error', 'Please enter some text to stream');
            return;
        }
        
        if (!language) {
            showStatus(elements.streamStatus, 'error', 'Please select a language');
            return;
        }
        
        if (state.isStreaming) {
            // Stop streaming
            if (state.currentWebSocket && typeof state.currentWebSocket.close === 'function') {
                state.currentWebSocket.close();
                state.currentWebSocket = null;
            }
            state.isStreaming = false;
            setButtonState(elements.streamBtn, false, 'Start Streaming');
            showStatus(elements.streamStatus, 'info', 'Streaming stopped.');
            if (elements.streamProgress) {
                elements.streamProgress.classList.add('hidden');
            }
            return;
        }
        
        // Reset UI elements for new stream
        if (elements.streamSpectrogram) {
            elements.streamSpectrogram.classList.add('hidden');
        }
        if (elements.streamAudioContainer) {
            elements.streamAudioContainer.classList.add('hidden');
        }
        if (state.setCurrentStreamAudioBlob) {
            state.setCurrentStreamAudioBlob(null);
        }
        
        setButtonState(elements.streamBtn, true, 'Connecting...');
        showStatus(elements.streamStatus, 'info', 'Connecting to stream...');
        
        // Initialize spectrogram
        if (elements.streamSpectrogramCanvas && elements.streamSpectrogram) {
            streamSpectrogramState = initStreamSpectrogram(
                elements.streamSpectrogramCanvas,
                elements.streamSpectrogram
            );
            if (streamSpectrogramState) {
                elements.streamSpectrogram.classList.remove('hidden');
            }
        }
        
        try {
            const cleanup = await startWebSocketStream(text, language, {
                isStreaming: () => state.isStreaming,
                onOpen: () => {
                    state.isStreaming = true;
                    setButtonState(elements.streamBtn, false, 'Stop Streaming');
                    showStatus(elements.streamStatus, 'success', 'Connected! Streaming audio...');
                    showToast('success', 'Streaming started');
                    if (elements.streamProgress) {
                        elements.streamProgress.classList.remove('hidden');
                    }
                },
                onProgress: (chunks) => {
                    if (elements.streamProgress) {
                        const progressFill = elements.streamProgress.querySelector('.progress-fill');
                        if (progressFill) {
                            progressFill.style.width = `${Math.min(100, chunks * 2)}%`;
                        }
                    }
                },
                onMelFrame: (melFrame) => {
                    if (streamSpectrogramState) {
                        visualizeMelFrame(streamSpectrogramState, melFrame);
                    }
                },
                onError: (error) => {
                    showStatus(elements.streamStatus, 'error', error);
                    showToast('error', error);
                },
                onReconnecting: (attempt, max) => {
                    showStatus(elements.streamStatus, 'info', 
                        `Connection lost. Reconnecting... (${attempt}/${max})`);
                },
                onAudioBlob: (blob) => {
                    if (state.setCurrentStreamAudioBlob) {
                        state.setCurrentStreamAudioBlob(blob);
                    }
                },
                waveformCanvas: elements.streamWaveform,
                onComplete: async (wavBase64, chunks, samples) => {
                    if (elements.streamAudio) {
                        await playAudio(elements.streamAudio, wavBase64);
                    }
                    if (elements.streamAudioContainer) {
                        elements.streamAudioContainer.classList.remove('hidden');
                    }
                    showStatus(elements.streamStatus, 'success', 
                        `Streaming complete! Audio ready to play.<br>
                         Received ${chunks} chunks, ${samples} samples total.`);
                    showToast('success', 'Streaming complete!');
                },
                onClose: () => {
                    state.isStreaming = false;
                    state.currentWebSocket = null;
                    setButtonState(elements.streamBtn, false, 'Start Streaming');
                    if (elements.streamProgress) {
                        elements.streamProgress.classList.add('hidden');
                    }
                }
            });
            
            // Store cleanup function for stopping
            state.currentWebSocket = { close: cleanup };
        } catch (error) {
            console.error('Streaming Error:', error);
            showStatus(elements.streamStatus, 'error', `Error: ${error.message}`);
            setButtonState(elements.streamBtn, false, 'Start Streaming');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        if (elements.streamForm) {
            elements.streamForm.addEventListener('submit', handleStreamSubmit);
        }
        
        // Download button
        if (elements.streamDownloadBtn) {
            elements.streamDownloadBtn.addEventListener('click', () => {
                // Download handled by audioPlayer component
            });
        }
    }
    
    // Initialize
    setupEventListeners();
    
    return {
        handleStreamSubmit
    };
}

