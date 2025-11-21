// Sistema de Cartas Coleccionables por Palabras Clave en Sueños

class CollectibleCards {
  constructor() {
    this.cards = this.initializeCards();
    this.userCollection = this.loadCollection();
  }

  initializeCards() {
    return [
      {
        id: 'card_water',
        name: 'Carta de Agua',
        keywords: ['agua', 'mar', 'océano', 'río', 'lluvia', 'nadar', 'piscina', 'lago', 'playa', 'ola'],
        rarity: 'común',
        description: 'Soñaste con las profundidades acuáticas',
        emoji: '💧'
      },
      {
        id: 'card_fire',
        name: 'Carta de Fuego',
        keywords: ['fuego', 'llama', 'calor', 'quemar', 'incendio', 'fogata', 'hoguera', 'ardor', 'brasa'],
        rarity: 'común',
        description: 'El fuego iluminó tus sueños',
        emoji: '🔥'
      },
      {
        id: 'card_wind',
        name: 'Carta de Viento',
        keywords: ['viento', 'aire', 'brisa', 'tormenta', 'volar', 'cielo', 'nube', 'soplo', 'huracán', 'tornado'],
        rarity: 'común',
        description: 'El viento sopló en tu mundo onírico',
        emoji: '💨'
      },
      {
        id: 'card_earth',
        name: 'Carta de Tierra',
        keywords: ['tierra', 'montaña', 'roca', 'arena', 'bosque', 'árbol', 'piedra', 'suelo', 'campo', 'valle'],
        rarity: 'común',
        description: 'La tierra te ancló en tus sueños',
        emoji: '🌍'
      },
      {
        id: 'card_night',
        name: 'Guardián de la Noche',
        keywords: ['noche', 'luna', 'estrella', 'oscuridad', 'medianoche', 'oscuro'],
        rarity: 'rara',
        description: 'La noche reveló sus secretos',
        emoji: '🌙'
      },
      {
        id: 'card_animal',
        name: 'Espíritu Animal',
        keywords: ['perro', 'gato', 'pájaro', 'lobo', 'serpiente', 'animal', 'pez', 'caballo', 'león', 'tigre'],
        rarity: 'rara',
        description: 'Un espíritu animal te visitó',
        emoji: '🦊'
      },
      {
        id: 'card_light',
        name: 'Portador de Luz',
        keywords: ['luz', 'sol', 'brillo', 'resplandor', 'amanecer', 'día', 'rayo'],
        rarity: 'rara',
        description: 'La luz iluminó tu camino onírico',
        emoji: '✨'
      },
      {
        id: 'card_shadow',
        name: 'Caminante de Sombras',
        keywords: ['sombra', 'oscuridad', 'negro', 'tiniebla', 'penumbra'],
        rarity: 'épica',
        description: 'Las sombras te revelaron sus misterios',
        emoji: '🌑'
      },
      {
        id: 'card_flight',
        name: 'Maestro del Vuelo',
        keywords: ['volar', 'vuelo', 'flotando', 'elevarse', 'alas', 'cielo'],
        rarity: 'épica',
        description: 'Conquistaste los cielos en tus sueños',
        emoji: '🕊️'
      },
      {
        id: 'card_elements',
        name: 'Maestro de los Elementos',
        keywords: ['agua', 'fuego', 'viento', 'tierra'],
        requiredKeywords: 4,
        rarity: 'legendaria',
        description: '¡Dominaste todos los elementos en un sueño!',
        emoji: '⚡'
      },
      {
        id: 'card_cosmic',
        name: 'Viajero Cósmico',
        keywords: ['espacio', 'cosmos', 'galaxia', 'planeta', 'estrella', 'universo', 'astronauta'],
        rarity: 'legendaria',
        description: 'Viajaste más allá de las estrellas',
        emoji: '🌌'
      },
      {
        id: 'card_time',
        name: 'Tejedor del Tiempo',
        keywords: ['tiempo', 'reloj', 'pasado', 'futuro', 'eternidad', 'edad'],
        rarity: 'legendaria',
        description: 'El tiempo se plegó a tu voluntad',
        emoji: '⏳'
      }
    ];
  }

  loadCollection() {
    const saved = localStorage.getItem('hipnos_cards');
    return saved ? JSON.parse(saved) : [];
  }

  saveCollection() {
    localStorage.setItem('hipnos_cards', JSON.stringify(this.userCollection));
  }

  // Analiza el texto del sueño y detecta cartas desbloqueadas
  checkForNewCards(dreamText) {
    const text = dreamText.toLowerCase();
    const newCards = [];

    console.log('Texto a analizar:', text);
    console.log('Total de cartas disponibles:', this.cards.length);
    console.log('Cartas ya desbloqueadas:', this.userCollection);

    this.cards.forEach(card => {
      // Si ya tiene la carta, no la vuelve a desbloquear
      if (this.userCollection.includes(card.id)) {
        console.log(`Carta ${card.name} ya desbloqueada, saltando...`);
        return;
      }

      if (card.requiredKeywords) {
        // Cartas especiales que necesitan múltiples keywords diferentes
        const matchedKeywords = card.keywords.filter(keyword => 
          text.includes(keyword)
        );
        console.log(`Carta especial ${card.name}: ${matchedKeywords.length}/${card.requiredKeywords} keywords encontradas`);
        if (matchedKeywords.length >= card.requiredKeywords) {
          newCards.push(card);
        }
      } else {
        // Cartas normales (una keyword es suficiente)
        const hasKeyword = card.keywords.some(keyword => 
          text.includes(keyword)
        );
        if (hasKeyword) {
          console.log(`Carta ${card.name} desbloqueada por keyword`);
          newCards.push(card);
        }
      }
    });

    console.log('Total cartas nuevas encontradas:', newCards.length);
    return newCards;
  }

  unlockCard(cardId) {
    if (!this.userCollection.includes(cardId)) {
      this.userCollection.push(cardId);
      this.saveCollection();
      return true;
    }
    return false;
  }

  getCollectionProgress() {
    return {
      total: this.cards.length,
      unlocked: this.userCollection.length,
      percentage: Math.round((this.userCollection.length / this.cards.length) * 100)
    };
  }

  getUnlockedCards() {
    return this.cards.filter(card => this.userCollection.includes(card.id));
  }

  getLockedCards() {
    return this.cards.filter(card => !this.userCollection.includes(card.id));
  }

  getAllCards() {
    return this.cards.map(card => ({
      ...card,
      unlocked: this.userCollection.includes(card.id)
    }));
  }
}

// Inicializar el sistema globalmente
window.cardSystem = new CollectibleCards();

// Función para mostrar animación de carta desbloqueada
function showCardUnlockedAnimation(card) {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = 'card-unlock-notification';
  notification.innerHTML = `
    <div class="unlock-content">
      <div class="unlock-emoji">${card.emoji}</div>
      <div class="unlock-text">
        <div class="unlock-title">¡Nueva Carta Desbloqueada!</div>
        <div class="unlock-name">${card.name}</div>
        <div class="unlock-rarity rarity-${card.rarity}">${card.rarity.toUpperCase()}</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Remover después de 4 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 4000);
}

// Función para renderizar la galería de cartas
function renderCardGallery() {
  const gallery = document.getElementById('cardGallery');
  if (!gallery) return;

  // Recargar la colección desde localStorage antes de renderizar
  if (window.cardSystem) {
    window.cardSystem.userCollection = window.cardSystem.loadCollection();
  }

  const allCards = window.cardSystem.getAllCards();
  const progress = window.cardSystem.getCollectionProgress();

  // Actualizar progreso
  const progressText = document.getElementById('cardProgressText');
  const progressFill = document.getElementById('cardProgressFill');
  
  if (progressText) {
    progressText.textContent = `${progress.unlocked}/${progress.total} (${progress.percentage}%)`;
  }
  
  if (progressFill) {
    progressFill.style.width = `${progress.percentage}%`;
  }

  // Renderizar cartas
  gallery.innerHTML = allCards.map(card => {
    const cardClass = card.unlocked ? 'unlocked' : 'locked';
    const rarityClass = `rarity-${card.rarity}`;
    
    return `
      <div class="collectible-card ${cardClass} ${rarityClass}">
        <div class="card-inner">
          <div class="card-emoji">${card.unlocked ? card.emoji : '❓'}</div>
          <div class="card-rarity-badge">${card.rarity.toUpperCase()}</div>
          <h3 class="card-title">${card.unlocked ? card.name : '???'}</h3>
          <p class="card-description">${card.unlocked ? card.description : 'Carta bloqueada'}</p>
          ${!card.unlocked ? `<p class="card-hint">💡 Sueña con: ${card.keywords.slice(0, 3).join(', ')}...</p>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Exportar funciones
window.showCardUnlockedAnimation = showCardUnlockedAnimation;
window.renderCardGallery = renderCardGallery;

// Auto-renderizar la galería cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  renderCardGallery();
});
