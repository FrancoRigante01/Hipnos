// Sistema de reconocimiento de voz

let recognition = null;
let isListening = false;
let finalTranscript = '';
let currentMode = 'voice'; // 'voice' o 'text'
let restartAttempts = 0;
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Inicializar Web Speech API
function initVoiceRecognition() {
  // En móviles, deshabilitar voz y usar solo texto
  if (isMobile) {
    console.log('Dispositivo móvil detectado, usando solo modo texto');
    setupModeSelector();
    switchToTextMode();
    
    // Ocultar el botón de modo voz en móviles
    const voiceModeBtn = document.getElementById('voiceModeBtn');
    if (voiceModeBtn) {
      voiceModeBtn.style.display = 'none';
    }
    
    // Mostrar mensaje informativo para móviles
    const browserWarning = document.getElementById('browserWarning');
    if (browserWarning) {
      browserWarning.innerHTML = '<p>📱 En dispositivos móviles usa el teclado para escribir tu sueño.</p>';
      browserWarning.classList.remove('hidden');
      browserWarning.style.background = 'rgba(99, 102, 241, 0.1)';
      browserWarning.style.borderColor = 'rgba(99, 102, 241, 0.3)';
      const warningText = browserWarning.querySelector('p');
      if (warningText) {
        warningText.style.color = '#c7d2fe';
      }
    }
    
    return false;
  }

  // Configurar selector de modo
  setupModeSelector();

  // Verificar compatibilidad
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('El navegador no soporta Web Speech API');
    // Cambiar automáticamente a modo texto
    switchToTextMode();
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  
  // Intentar modo continuo en móviles también, pero con mejor manejo
  recognition.continuous = true;
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
    console.log('Reconocimiento de voz iniciado');
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
      console.log('No se detectó voz, pero manteniendo micrófono activo');
      // No hacer nada, dejar que onend lo maneje con delay
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
    console.log('Reconocimiento de voz finalizado');
    
    // Solo reiniciar en móviles si:
    // 1. El usuario todavía tiene el botón activo
    // 2. Han pasado al menos 2 segundos (evitar reinicios rápidos molestos)
    // 3. No hemos superado el límite de intentos
    if (isListening && isMobile && restartAttempts < 3) {
      console.log('Reconocimiento finalizado, esperando para reiniciar...');
      restartAttempts++;
      // Delay más largo para evitar sonidos repetitivos
      setTimeout(() => {
        if (isListening) {
          try {
            recognition.start();
          } catch (error) {
            console.log('No se pudo reiniciar:', error);
            stopListening();
          }
        }
      }, 300);
    } else {
      stopListening();
    }
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
  if (!recognition) return;
  
  try {
    // No limpiar finalTranscript aquí, permitir acumular
    // finalTranscript = '';
    restartAttempts = 0;
    recognition.start();
  } catch (error) {
    console.error('Error al iniciar reconocimiento:', error);
    // Si ya está iniciado, no es un error crítico
    if (error.message && error.message.includes('already started')) {
      console.log('El reconocimiento ya estaba iniciado');
    }
  }
}

// Detener escucha
function stopListening() {
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
