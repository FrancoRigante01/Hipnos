// Sistema de reconocimiento de voz
import { DEEPGRAM_CONFIG, isDeepgramConfigured } from '../config/deepgram.js';

let recognition = null;
let isListening = false;
let finalTranscript = '';
let currentMode = 'voice'; // 'voice' o 'text'
let restartAttempts = 0;
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

// Variables para Deepgram
let deepgramSocket = null;
let mediaRecorder = null;
let audioStream = null;
let useDeepgram = false;

// Inicializar Web Speech API
function initVoiceRecognition() {
  // Configurar selector de modo
  setupModeSelector();

  // Determinar si usar Deepgram o Web Speech API
  const shouldUseDeepgram = (isMobile || isFirefox) && isDeepgramConfigured();
  
  if (shouldUseDeepgram) {
    useDeepgram = true;
    return initDeepgramRecognition();
  }

  useDeepgram = false;

  // Verificar compatibilidad con Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('El navegador no soporta Web Speech API');
    
    // Si Deepgram está disponible, usarlo como fallback
    if (isDeepgramConfigured()) {
      useDeepgram = true;
      return initDeepgramRecognition();
    }
    
    // Si no hay ninguna opción, mostrar advertencia y usar solo texto
    const browserWarning = document.getElementById('browserWarning');
    if (browserWarning) {
      browserWarning.classList.remove('hidden');
    }
    
    switchToTextMode();
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // Elementos del DOM
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceBtnText = document.getElementById('voiceBtnText');
  const listeningIndicator = document.getElementById('listeningIndicator');
  const transcriptionContainer = document.getElementById('transcriptionContainer');
  const transcriptionText = document.getElementById('transcriptionText');
  const clearTranscription = document.getElementById('clearTranscription');
  const interpretBtn = document.getElementById('interpretBtn');

  if (!voiceBtn || !transcriptionText) {
    console.error('Elementos del DOM no encontrados');
    return false;
  }

  // Inicio de reconocimiento
  recognition.onstart = () => {
    isListening = true;
    restartAttempts = 0;
    voiceBtn.classList.add('listening');
    voiceBtnText.textContent = 'Te escucho...';
    listeningIndicator?.classList.remove('hidden');
  };

  // Resultado del reconocimiento
  recognition.onresult = (event) => {
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Actualizar transcripción en pantalla
    if (transcriptionText) {
      const displayText = finalTranscript + interimTranscript;
      transcriptionText.textContent = displayText.trim();
      
      // Mostrar contenedor si hay texto
      if (displayText.trim() && transcriptionContainer) {
        transcriptionContainer.classList.remove('hidden');
      }

      // Mostrar botón de interpretar si hay texto final
      if (finalTranscript.trim() && interpretBtn) {
        interpretBtn.classList.remove('hidden');
      }
    }
  };

  // Manejo de errores
  recognition.onerror = (event) => {
    console.error('Error en reconocimiento de voz:', event.error);
    
    // No reintentar automáticamente en caso de 'no-speech'
    // Esto evita el molesto sonido de encendido/apagado constante
    if (event.error === 'no-speech') {
      return;
    }
    
    // Para 'aborted', tampoco mostrar error
    if (event.error === 'aborted') {
      return;
    }
    
    let errorMessage = 'Error al escuchar. Intenta de nuevo.';
    
    switch(event.error) {
      case 'audio-capture':
        errorMessage = 'No se pudo acceder al micrófono. Verifica los permisos.';
        break;
      case 'not-allowed':
        errorMessage = 'Permiso de micrófono denegado. Habilítalo en la configuración del navegador.';
        break;
      case 'network':
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
        break;
    }
    
    if (typeof showSnackbar === 'function') {
      showSnackbar(errorMessage);
    }
    
    stopListening();
  };

  // Fin de reconocimiento
  recognition.onend = () => {
    // No reiniciar automáticamente - el usuario debe presionar el botón nuevamente
    stopListening();
  };

  // Click en botón de voz
  voiceBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      // Limpiar transcripción anterior al iniciar nueva grabación
      finalTranscript = '';
      if (transcriptionText) {
        transcriptionText.textContent = '';
      }
      startListening();
    }
  });

  // Click en botón de limpiar transcripción
  clearTranscription?.addEventListener('click', () => {
    finalTranscript = '';
    if (transcriptionText) {
      transcriptionText.textContent = '';
    }
    transcriptionContainer?.classList.add('hidden');
    interpretBtn?.classList.add('hidden');
  });

  // Detectar cambios manuales en la transcripción
  transcriptionText?.addEventListener('input', () => {
    const text = transcriptionText.textContent?.trim() || '';
    if (text && interpretBtn) {
      interpretBtn.classList.remove('hidden');
    } else if (interpretBtn) {
      interpretBtn.classList.add('hidden');
    }
  });

  return true;
}

// ============================================
// DEEPGRAM RECOGNITION
// ============================================

function initDeepgramRecognition() {
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceBtnText = document.getElementById('voiceBtnText');
  const listeningIndicator = document.getElementById('listeningIndicator');
  const transcriptionContainer = document.getElementById('transcriptionContainer');
  const transcriptionText = document.getElementById('transcriptionText');
  const clearTranscription = document.getElementById('clearTranscription');
  const interpretBtn = document.getElementById('interpretBtn');

  if (!voiceBtn || !transcriptionText) {
    console.error('Elementos del DOM no encontrados');
    return false;
  }

  // Click en botón de voz
  voiceBtn.addEventListener('click', async () => {
    if (isListening) {
      stopDeepgramListening();
    } else {
      // Limpiar transcripción anterior
      finalTranscript = '';
      if (transcriptionText) {
        transcriptionText.textContent = '';
      }
      await startDeepgramListening();
    }
  });

  // Click en botón de limpiar transcripción
  clearTranscription?.addEventListener('click', () => {
    finalTranscript = '';
    if (transcriptionText) {
      transcriptionText.textContent = '';
    }
    transcriptionContainer?.classList.add('hidden');
    interpretBtn?.classList.add('hidden');
  });

  // Detectar cambios manuales en la transcripción
  transcriptionText?.addEventListener('input', () => {
    const text = transcriptionText.textContent?.trim() || '';
    if (text && interpretBtn) {
      interpretBtn.classList.remove('hidden');
    } else if (interpretBtn) {
      interpretBtn.classList.add('hidden');
    }
  });

  return true;
}

async function startDeepgramListening() {
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceBtnText = document.getElementById('voiceBtnText');
  const listeningIndicator = document.getElementById('listeningIndicator');
  const transcriptionContainer = document.getElementById('transcriptionContainer');
  const transcriptionText = document.getElementById('transcriptionText');
  const interpretBtn = document.getElementById('interpretBtn');

  try {
    // Solicitar acceso al micrófono
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Actualizar UI
    isListening = true;
    voiceBtn.classList.add('listening');
    voiceBtnText.textContent = 'Te escucho...';
    listeningIndicator?.classList.remove('hidden');

    // Crear WebSocket a Deepgram
    const wsUrl = `wss://api.deepgram.com/v1/listen?model=${DEEPGRAM_CONFIG.model}&language=${DEEPGRAM_CONFIG.language}&smart_format=true&punctuate=true&interim_results=true&endpointing=300`;
    
    deepgramSocket = new WebSocket(wsUrl, ['token', DEEPGRAM_CONFIG.apiKey]);

    deepgramSocket.onopen = () => {

      // Configurar MediaRecorder para enviar audio
      mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && deepgramSocket?.readyState === WebSocket.OPEN) {
          deepgramSocket.send(event.data);
        }
      };

      mediaRecorder.start(250); // Enviar chunks cada 250ms
    };

    deepgramSocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      
      if (data.channel?.alternatives?.[0]) {
        const transcript = data.channel.alternatives[0].transcript;
        
        if (transcript && transcript.trim().length > 0) {
          const isFinal = data.is_final;
          
          if (isFinal) {
            finalTranscript += transcript + ' ';
          }

          // Actualizar UI
          const displayText = finalTranscript + (isFinal ? '' : transcript);
          if (transcriptionText) {
            transcriptionText.textContent = displayText.trim();
          }

          // Mostrar contenedor
          if (displayText.trim() && transcriptionContainer) {
            transcriptionContainer.classList.remove('hidden');
          }

          // Mostrar botón interpretar si hay texto final
          if (finalTranscript.trim() && interpretBtn) {
            interpretBtn.classList.remove('hidden');
          }
        }
      }
    };

    deepgramSocket.onerror = (error) => {
      console.error('Error en Deepgram WebSocket:', error);
      if (typeof showSnackbar === 'function') {
        showSnackbar('Error de conexión con el servicio de voz');
      }
      stopDeepgramListening();
    };
  } catch (error) {
    let errorMessage = 'Error al acceder al micrófono';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Permiso de micrófono denegado. Habilítalo en la configuración del navegador.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No se encontró ningún micrófono en tu dispositivo.';
    }
    
    if (typeof showSnackbar === 'function') {
      showSnackbar(errorMessage);
    }
    
    stopDeepgramListening();
  }
}

function stopDeepgramListening() {
  isListening = false;
  
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceBtnText = document.getElementById('voiceBtnText');
  const listeningIndicator = document.getElementById('listeningIndicator');
  
  voiceBtn?.classList.remove('listening');
  if (voiceBtnText) {
    voiceBtnText.textContent = 'Invoca al oráculo';
  }
  listeningIndicator?.classList.add('hidden');

  // Detener MediaRecorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  // Cerrar WebSocket
  if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
    deepgramSocket.close();
  }

  // Detener stream de audio
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }

  mediaRecorder = null;
  deepgramSocket = null;
}

// Configurar selector de modo
function setupModeSelector() {
  const voiceModeBtn = document.getElementById('voiceModeBtn');
  const textModeBtn = document.getElementById('textModeBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const textInputContainer = document.getElementById('textInputContainer');
  const transcriptionContainer = document.getElementById('transcriptionContainer');
  const listeningIndicator = document.getElementById('listeningIndicator');
  const browserWarning = document.getElementById('browserWarning');
  const dreamTextArea = document.getElementById('dreamText');
  const interpretBtn = document.getElementById('interpretBtn');

  if (!voiceModeBtn || !textModeBtn) return;

  // Cambiar a modo voz
  voiceModeBtn.addEventListener('click', () => {
    if (currentMode === 'voice') return;
    
    currentMode = 'voice';
    voiceModeBtn.classList.add('active');
    textModeBtn.classList.remove('active');
    
    // Mostrar/ocultar elementos
    voiceBtn?.classList.remove('hidden');
    listeningIndicator?.classList.add('hidden');
    textInputContainer?.classList.add('hidden');
    
    // Si hay transcripción, mantenerla visible
    const hasTranscription = document.getElementById('transcriptionText')?.textContent?.trim();
    if (!hasTranscription) {
      transcriptionContainer?.classList.add('hidden');
      interpretBtn?.classList.add('hidden');
    }
  });

  // Cambiar a modo texto
  textModeBtn.addEventListener('click', () => {
    if (currentMode === 'text') return;
    
    switchToTextMode();
  });

  // Detectar cambios en textarea
  dreamTextArea?.addEventListener('input', () => {
    const text = dreamTextArea.value.trim();
    if (text && interpretBtn) {
      interpretBtn.classList.remove('hidden');
    } else if (interpretBtn) {
      interpretBtn.classList.add('hidden');
    }
  });
}

// Cambiar a modo texto
function switchToTextMode() {
  currentMode = 'text';
  const voiceModeBtn = document.getElementById('voiceModeBtn');
  const textModeBtn = document.getElementById('textModeBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const textInputContainer = document.getElementById('textInputContainer');
  const transcriptionContainer = document.getElementById('transcriptionContainer');
  const listeningIndicator = document.getElementById('listeningIndicator');
  const browserWarning = document.getElementById('browserWarning');
  const interpretBtn = document.getElementById('interpretBtn');
  
  voiceModeBtn?.classList.remove('active');
  textModeBtn?.classList.add('active');
  
  // Detener reconocimiento si está activo
  if (isListening) {
    stopListening();
  }
  
  // Mostrar/ocultar elementos
  voiceBtn?.classList.add('hidden');
  listeningIndicator?.classList.add('hidden');
  transcriptionContainer?.classList.add('hidden');
  browserWarning?.classList.add('hidden');
  textInputContainer?.classList.remove('hidden');
  
  // Verificar si hay texto
  const dreamTextArea = document.getElementById('dreamText');
  const hasText = dreamTextArea?.value?.trim();
  if (!hasText) {
    interpretBtn?.classList.add('hidden');
  }
}

// Iniciar escucha
function startListening() {
  if (useDeepgram) {
    startDeepgramListening();
    return;
  }
  
  if (!recognition) return;
  
  try {
    restartAttempts = 0;
    recognition.start();
  } catch (error) {
    if (error.message && error.message.includes('already started')) {
      return;
    }
  }
}

// Detener escucha
function stopListening() {
  if (useDeepgram) {
    stopDeepgramListening();
    return;
  }
  
  if (!recognition) return;
  
  isListening = false;
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceBtnText = document.getElementById('voiceBtnText');
  const listeningIndicator = document.getElementById('listeningIndicator');
  
  voiceBtn?.classList.remove('listening');
  if (voiceBtnText) {
    voiceBtnText.textContent = 'Invoca al oráculo';
  }
  listeningIndicator?.classList.add('hidden');
  
  try {
    recognition.stop();
  } catch (error) {
    console.error('Error al detener reconocimiento:', error);
  }
}

// Obtener transcripción actual (voz o texto)
function getTranscription() {
  if (currentMode === 'text') {
    const dreamTextArea = document.getElementById('dreamText');
    return dreamTextArea?.value?.trim() || '';
  } else {
    const transcriptionText = document.getElementById('transcriptionText');
    return transcriptionText?.textContent?.trim() || finalTranscript.trim();
  }
}

// Limpiar entrada actual
function clearCurrentInput() {
  if (currentMode === 'text') {
    const dreamTextArea = document.getElementById('dreamText');
    if (dreamTextArea) dreamTextArea.value = '';
  } else {
    const clearBtn = document.getElementById('clearTranscription');
    clearBtn?.click();
  }
}

// Exportar funciones
if (typeof window !== 'undefined') {
  window.initVoiceRecognition = initVoiceRecognition;
  window.getTranscription = getTranscription;
  window.clearCurrentInput = clearCurrentInput;
}
