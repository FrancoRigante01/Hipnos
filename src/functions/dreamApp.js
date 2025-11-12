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
  const lowerText = dreamText.toLowerCase();
  const matches = [];

  for (const dream of dreamsData) {
    if (lowerText.includes(dream.keyword.toLowerCase())) {
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

    return null;
  }

  // Mostrar interpretación encontrada
  resultKeyword.textContent = interpretation.keyword;
  resultSymbolism.textContent = interpretation.symbolism;
  resultInterpretation.textContent = interpretation.interpretation;
  resultDreamText.textContent = dreamText;

  // Aplicar patrón de fondo
  resultBackground.className = 'result-background';
  if (interpretation.pattern) {
    resultBackground.classList.add(interpretation.pattern);
  }

  // Aplicar colores del tema
  if (interpretation.colorTheme && interpretation.colorTheme.length >= 2) {
    const gradient = `linear-gradient(135deg, ${interpretation.colorTheme[0]}33 0%, ${interpretation.colorTheme[1]}33 50%, ${interpretation.colorTheme[2] || interpretation.colorTheme[0]}33 100%)`;
    resultContainer.style.background = gradient;
  }

  resultContainer.classList.remove('hidden');

  // Scroll suave al resultado
  setTimeout(() => {
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  return interpretation;
}

// Guardar sueño en LocalStorage
function saveDream(dreamText, interpretation) {
  if (!interpretation) return;

  const savedDreams = JSON.parse(localStorage.getItem('dreamscape_dreams') || '[]');

  const dreamEntry = {
    id: Date.now(),
    date: new Date().toISOString(),
    dreamText: dreamText,
    keyword: interpretation.keyword,
    symbolism: interpretation.symbolism,
    interpretation: interpretation.interpretation,
    colorTheme: interpretation.colorTheme,
    pattern: interpretation.pattern
  };

  savedDreams.unshift(dreamEntry); // Agregar al inicio
  localStorage.setItem('dreamscape_dreams', JSON.stringify(savedDreams));

  loadGallery();
}

// Cargar galería de sueños guardados
function loadGallery() {
  const gallery = document.getElementById('dreamGallery');
  if (!gallery) return;

  const savedDreams = JSON.parse(localStorage.getItem('dreamscape_dreams') || '[]');

  if (savedDreams.length === 0) {
    gallery.innerHTML = '<p class="empty-message">Tu archivo está vacío, mortal. Comparte tus sueños conmigo y guardaré sus interpretaciones aquí.</p>';
    return;
  }

  gallery.innerHTML = savedDreams.map(dream => {
    const date = new Date(dream.date);
    const formattedDate = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const gradient = dream.colorTheme && dream.colorTheme.length >= 2
      ? `linear-gradient(90deg, ${dream.colorTheme[0]}, ${dream.colorTheme[1]})`
      : 'linear-gradient(90deg, #6366f1, #8b5cf6)';

    return `
      <div class="dream-card" style="--card-color: ${gradient}">
        <div class="card-header">
          <h3 class="card-keyword">${dream.keyword}</h3>
          <span class="card-date">${formattedDate}</span>
        </div>
        <p class="card-symbolism">${dream.symbolism}</p>
        <p class="card-dream">${dream.dreamText}</p>
        <div class="card-actions">
          <button class="delete-btn" onclick="window.deleteDream(${dream.id})">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
}

// Eliminar un sueño
window.deleteDream = function(id) {
  const savedDreams = JSON.parse(localStorage.getItem('dreamscape_dreams') || '[]');
  const filtered = savedDreams.filter(dream => dream.id !== id);
  localStorage.setItem('dreamscape_dreams', JSON.stringify(filtered));
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
  localStorage.removeItem('dreamscape_dreams');
  loadGallery();
  hideClearModal();
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  await loadDreamsData();
  loadGallery();

  const interpretBtn = document.getElementById('interpretBtn');
  const dreamTextArea = document.getElementById('dreamText');
  const clearAllBtn = document.getElementById('clearAllBtn');

  if (!interpretBtn || !dreamTextArea || !clearAllBtn) return;

  interpretBtn.addEventListener('click', () => {
    const dreamText = dreamTextArea.value.trim();

    if (!dreamText) {
      alert('Mortal, debes relatarme tu sueño primero.');
      return;
    }

    const interpretation = findInterpretation(dreamText);
    displayInterpretation(dreamText, interpretation);
    saveDream(dreamText, interpretation);

    // Limpiar textarea
    dreamTextArea.value = '';
  });

  // Permitir interpretar con Enter (Ctrl+Enter o Cmd+Enter)
  dreamTextArea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      interpretBtn.click();
    }
  });

  clearAllBtn.addEventListener('click', showClearModal);
  const confirmClearBtn = document.getElementById('confirmClearBtn');
  const cancelClearBtn = document.getElementById('cancelClearBtn');
  if (confirmClearBtn) confirmClearBtn.addEventListener('click', clearAllDreams);
  if (cancelClearBtn) cancelClearBtn.addEventListener('click', hideClearModal);
});