import { containsKeyword } from './keywordMatching.js';
import { showSnackbar } from './ui.js';

// Cargar datos de sueños
let dreamsData = [];

async function loadDreamsData() {
  try {
    const response = await fetch('/dreams.json');
    const data = await response.json();
    dreamsData = data.dreams;
  } catch (error) {
    console.error('Error cargando dreams.json:', error);
  }
}

// Buscar interpretación basada en keywords
function findInterpretation(dreamText) {
  const matches = [];

  for (const dream of dreamsData) {
    if (containsKeyword(dreamText, dream.keyword)) {
      matches.push(dream);
    }
  }

  if (matches.length > 0) {
    // Si hay múltiples coincidencias, elegir una aleatoria
    return matches[Math.floor(Math.random() * matches.length)];
  }

  return null;
}

// Mostrar interpretación
function displayInterpretation(dreamText, interpretation) {
  const resultContainer = document.getElementById('dreamResult');
  const resultBackground = document.getElementById('resultBackground');
  const resultKeyword = document.getElementById('resultKeyword');
  const resultSymbolism = document.getElementById('resultSymbolism');
  const resultInterpretation = document.getElementById('resultInterpretation');
  const resultDreamText = document.getElementById('resultDreamText');

  if (!resultContainer || !resultBackground || !resultKeyword || !resultSymbolism || !resultInterpretation || !resultDreamText) {
    return null;
  }

  if (!interpretation) {
    // Mostrar mensaje cuando no hay coincidencias
    resultKeyword.textContent = 'Misterio Inexplorado';
    resultSymbolism.textContent = 'Visión desconocida';
    resultInterpretation.textContent = 'Mortal, has navegado por reinos oníricos que escapan incluso a mi comprensión divina. Tu sueño contiene símbolos que trascienden los arquetipos conocidos. Cuéntame sobre el agua, el fuego, los animales o los lugares que visitas en tus sueños, y te revelaré sus secretos.';
    resultDreamText.textContent = dreamText;

    // Limpiar clases de patrón anteriores
    resultBackground.className = 'result-background';

    // Aplicar estilo por defecto
    resultContainer.style.background = 'rgba(30, 41, 59, 0.5)';
    resultContainer.classList.remove('hidden');
    resultKeyword.focus({ preventScroll: true });

    return null;
  }

  // Mostrar interpretación encontrada
  resultKeyword.textContent = interpretation.keyword;
  resultSymbolism.textContent = interpretation.symbolism;
  resultInterpretation.textContent = interpretation.interpretation;
  resultDreamText.textContent = dreamText;

  // Limpiar clases de fondo
  resultBackground.className = 'result-background';

  // Aplicar colores del tema
  if (interpretation.colorTheme && interpretation.colorTheme.length >= 2) {
    const gradient = `linear-gradient(135deg, ${interpretation.colorTheme[0]}33 0%, ${interpretation.colorTheme[1]}33 50%, ${interpretation.colorTheme[2] || interpretation.colorTheme[0]}33 100%)`;
    resultContainer.style.background = gradient;
  }

  resultContainer.classList.remove('hidden');
  resultKeyword.focus({ preventScroll: true });

  // Scroll suave al resultado
  setTimeout(() => {
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  return interpretation;
}

// Guardar sueño en LocalStorage
function saveDream(dreamText, interpretation) {
  // Guardar el sueño
  const savedDreams = JSON.parse(localStorage.getItem('Hipnos_dreams') || '[]');

  const dreamEntry = {
    id: Date.now(),
    date: new Date().toISOString(),
    dreamText: dreamText,
    keyword: interpretation ? interpretation.keyword : 'Misterio Inexplorado',
    symbolism: interpretation ? interpretation.symbolism : 'Visión desconocida',
    interpretation: interpretation ? interpretation.interpretation : 'Mortal, has navegado por reinos oníricos que escapan incluso a mi comprensión divina. Tu sueño contiene símbolos que trascienden los arquetipos conocidos.',
    colorTheme: interpretation ? interpretation.colorTheme : ['#6366f1', '#8b5cf6']
  };

  savedDreams.unshift(dreamEntry);
  localStorage.setItem('Hipnos_dreams', JSON.stringify(savedDreams));

  loadGallery();

  // Verificar logros nuevos desbloqueados
  if (window.achievementSystem && dreamText) {
    const newAchievements = window.achievementSystem.checkForNewAchievements(dreamText);
    
    // También verificar logros acumulativos
    const cumulativeAchievements = window.achievementSystem.checkCumulativeAchievements();
    
    // Combinar ambos arrays sin duplicados
    const allNewAchievements = [...newAchievements];
    cumulativeAchievements.forEach(cumAch => {
      if (!allNewAchievements.find(a => a.id === cumAch.id)) {
        allNewAchievements.push(cumAch);
      }
    });
    
    if (allNewAchievements.length > 0) {
      allNewAchievements.forEach(achievement => {
        const unlocked = window.achievementSystem.unlockAchievement(achievement.id);
        
        if (window.showAchievementUnlockedAnimation) {
          window.showAchievementUnlockedAnimation(achievement);
        }
      });
      
      // Actualizar galería de logros
      if (window.renderAchievementGallery) {
        setTimeout(() => {
          window.renderAchievementGallery();
        }, 500);
      }
      if (window.updateFabBadge) {
        setTimeout(() => {
          window.updateFabBadge();
        }, 600);
      }
    }
  }
}

// Cargar galería de sueños guardados
function loadGallery() {
  const gallery = document.getElementById('dreamGallery');
  if (!gallery) return;

  const savedDreams = JSON.parse(localStorage.getItem('Hipnos_dreams') || '[]');

  if (savedDreams.length === 0) {
    gallery.innerHTML = '<p class="empty-message">Tu archivo está vacío, mortal. Comparte tus sueños conmigo y guardaré sus interpretaciones aquí.</p>';
    return;
  }

  gallery.replaceChildren();

  savedDreams.forEach(dream => {
    const date = new Date(dream.date);
    const formattedDate = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const gradient = dream.colorTheme && dream.colorTheme.length >= 2
      ? `linear-gradient(90deg, ${dream.colorTheme[0]}, ${dream.colorTheme[1]})`
      : 'linear-gradient(90deg, #6366f1, #8b5cf6)';

    const card = document.createElement('div');
    card.className = 'dream-card';
    card.style.setProperty('--card-color', gradient);

    const header = document.createElement('div');
    header.className = 'card-header';

    const keyword = document.createElement('h3');
    keyword.className = 'card-keyword';
    keyword.textContent = dream.keyword;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'card-date';
    dateSpan.textContent = formattedDate;

    header.append(keyword, dateSpan);

    const symbolism = document.createElement('p');
    symbolism.className = 'card-symbolism';
    symbolism.textContent = dream.symbolism;

    const dreamText = document.createElement('p');
    dreamText.className = 'card-dream';
    dreamText.textContent = dream.dreamText;

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => window.deleteDream(dream.id));

    actions.appendChild(deleteBtn);
    card.append(header, symbolism, dreamText, actions);
    gallery.appendChild(card);
  });
}

// Eliminar un sueño
window.deleteDream = function(id) {
  const savedDreams = JSON.parse(localStorage.getItem('Hipnos_dreams') || '[]');
  const filtered = savedDreams.filter(dream => dream.id !== id);
  localStorage.setItem('Hipnos_dreams', JSON.stringify(filtered));
  loadGallery();
};

// Limpiar todos los sueños
function showClearModal() {
  const modal = document.getElementById('clearModal');
  if (modal) modal.classList.remove('hidden');
}

function hideClearModal() {
  const modal = document.getElementById('clearModal');
  if (modal) modal.classList.add('hidden');
}

function clearAllDreams() {
  localStorage.removeItem('Hipnos_dreams');
  loadGallery();
  hideClearModal();
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  await loadDreamsData();
  loadGallery();

  // Cargar galería de logros
  if (window.renderAchievementGallery) {
    window.renderAchievementGallery();
  }

  // Inicializar reconocimiento de voz
  const voiceSupported = initVoiceRecognition();
  
  // Mostrar advertencia si no hay soporte
  const browserWarning = document.getElementById('browserWarning');
  const voiceBtn = document.getElementById('voiceBtn');
  
  if (!voiceSupported && browserWarning && voiceBtn) {
    browserWarning.classList.remove('hidden');
    voiceBtn.disabled = true;
    voiceBtn.style.opacity = '0.5';
    voiceBtn.style.cursor = 'not-allowed';
  }

  const interpretBtn = document.getElementById('interpretBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  if (!interpretBtn || !clearAllBtn) return;

  interpretBtn.addEventListener('click', () => {
    // Obtener texto de la transcripción de voz o del textarea
    const dreamText = getTranscription();

    if (!dreamText) {
      showSnackbar('Mortal, debes relatarme tu sueño primero.');
      return;
    }

    // Reproducir audio
    try {
      const audio = new Audio('/dream.mp3');  
      audio.play();
    } catch (error) {
      // Silenciar error de audio
    }

    const interpretation = findInterpretation(dreamText);
    displayInterpretation(dreamText, interpretation);
    saveDream(dreamText, interpretation);

    // Limpiar entrada después de interpretar
    if (typeof clearCurrentInput === 'function') {
      clearCurrentInput();
    }
  });

  clearAllBtn.addEventListener('click', showClearModal);
  const confirmClearBtn = document.getElementById('confirmClearBtn');
  const cancelClearBtn = document.getElementById('cancelClearBtn');
  if (confirmClearBtn) confirmClearBtn.addEventListener('click', clearAllDreams);
  if (cancelClearBtn) cancelClearBtn.addEventListener('click', hideClearModal);
});