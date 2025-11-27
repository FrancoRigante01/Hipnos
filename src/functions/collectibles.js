// Sistema de logros desbloqueables por palabras clave en sueños

class AchievementSystem {
  constructor() {
    this.achievements = this.initializeAchievements();
    this.userCollection = this.loadCollection();
  }

  initializeAchievements() {
    return [
      {
        id: 'achievement_water',
        name: 'Hijo de Poseidón',
        keywords: ['agua', 'mar', 'océano', 'río', 'lluvia', 'nadar', 'pileta', 'lago', 'playa', 'ola'],
        rarity: 'común',
        description: 'Las aguas profundas reconocieron en ti a un igual',
        hint: 'Las corrientes llaman a quienes no temen sumergirse',
        symbol: '/water.svg',
        color: '#38bdf8'
      },
      {
        id: 'achievement_fire',
        name: 'Llama Inextinguible',
        keywords: ['fuego', 'llama', 'calor', 'quemar', 'incendio', 'fogata', 'hoguera', 'brasa'],
        rarity: 'común',
        description: 'Hefesto reconoció tu espíritu ardiente',
        hint: 'Solo quienes danzan con el calor conocen su secreto',
        symbol: '/fire.svg',
        color: '#ef4444'
      },
      {
        id: 'achievement_wind',
        name: 'Elegido de Eolo',
        keywords: ['viento', 'aire', 'brisa', 'tormenta', 'volar', 'cielo', 'nube', 'tornado', 'huracán'],
        rarity: 'común',
        description: 'Los vientos te aceptaron como uno de los suyos',
        hint: 'Escucha el susurro invisible que mueve el mundo',
        symbol: '/wind.svg',
        color: '#a5f3fc'
      },
      {
        id: 'achievement_earth',
        name: 'Bendecido por Gea',
        keywords: ['tierra', 'montaña', 'bosque', 'árbol', 'suelo', 'campo', 'valle'],
        rarity: 'común',
        description: 'La tierra madre te acogió en su abrazo eterno',
        hint: 'Tus raíces se hunden más profundo de lo que imaginas',
        symbol: '/earth.svg',
        color: '#92400e'
      },
      {
        id: 'achievement_night',
        name: 'Discípulo de Nyx',
        keywords: ['noche', 'luna', 'estrella', 'oscuridad', 'medianoche', 'oscuro'],
        rarity: 'rara',
        description: 'Las tinieblas sagradas te revelaron sus misterios ancestrales',
        hint: 'Lo que brilla en la oscuridad solo se muestra a los valientes',
        symbol: '/moon.svg',
        color: '#312e81'
      },
      {
        id: 'achievement_animal',
        name: 'Espíritu Totémico',
        keywords: ['perro', 'gato', 'pájaro', 'lobo', 'serpiente', 'animal', 'pez', 'caballo', 'león', 'tigre', 'águila', 'búho', 'conejo', 'ciervo', 'delfín', 'elefante', 'jirafa', 'oso', 'tortuga', 'zorro', 'mariposa'],
        rarity: 'rara',
        description: 'Un guardián salvaje te eligió como hermano de manada',
        hint: 'La sabiduría antigua habla con colmillos, garras y alas',
        symbol: '/animal.svg',
        color: '#fbbf24'
      },
      {
        id: 'achievement_light',
        name: 'Portador del Alba',
        keywords: ['luz', 'sol', 'brillo', 'resplandor', 'amanecer', 'día', 'rayo'],
        rarity: 'rara',
        description: 'Helios te concedió su resplandor divino',
        hint: 'Donde todos ven oscuridad, tú traes el amanecer',
        symbol: '/light.svg',
        color: '#fde68a'
      },
      {
        id: 'achievement_shadow',
        name: 'Señor de las Sombras',
        keywords: ['sombra', 'oscuridad', 'negro', 'tiniebla', 'penumbra', 'oscuro'],
        rarity: 'épica',
        description: 'Caminaste por el reino donde la luz se rinde',
        hint: 'Solo enfrentando tu propia sombra encontrarás este poder',
        symbol: '/dark.svg',
        color: '#1e293b'
      },
      {
        id: 'achievement_flight',
        name: 'Alas de Ícaro Renovadas',
        keywords: ['volar', 'vuelo', 'flotar', 'alas', 'cielo', 'volaba', 'volando', 'volé'],
        rarity: 'épica',
        description: 'Conquistaste los cielos sin temer la caída',
        hint: 'Ícaro cayó por arrogancia; tú ascenderás con sabiduría',
        symbol: '/sky.svg',
        color: '#a5f3fc'
      },
      {
        id: 'achievement_elements',
        name: 'Avatar de los Cuatro Elementos',
        keywords: ['agua', 'fuego', 'viento', 'tierra'],
        requiredKeywords: 4,
        rarity: 'legendaria',
        description: 'Los cuatro elementos se inclinaron ante tu dominio absoluto',
        hint: 'Agua, fuego, tierra y aire... el equilibrio está en la unión',
        symbol: '/maestro.svg',
        color: '#fbbf24'
      },
      {
        id: 'achievement_cosmic',
        name: 'Habitante del Éter',
        keywords: ['espacio', 'cosmos', 'galaxia', 'planeta', 'estrella', 'universo', 'astronauta'],
        rarity: 'legendaria',
        description: 'Trascendiste los límites del mundo mortal',
        hint: 'Más allá de las nubes yace la verdadera inmensidad',
        symbol: '/space.svg',
        color: '#6366f1'
      },
      {
        id: 'achievement_time',
        name: 'Liberado de Cronos',
        keywords: ['tiempo', 'reloj', 'pasado', 'futuro', 'eternidad', 'edad'],
        rarity: 'legendaria',
        description: 'Escapaste de las cadenas del tiempo lineal',
        hint: 'El pasado y el futuro son ilusiones; solo el ahora es eterno',
        symbol: '/time.svg',
        color: '#fde68a'
      }
    ];
  }

  loadCollection() {
    const saved = localStorage.getItem('hipnos_achievements');
    return saved ? JSON.parse(saved) : [];
  }

  saveCollection() {
    localStorage.setItem('hipnos_achievements', JSON.stringify(this.userCollection));
  }

  // Analiza el texto del sueño y detecta logros desbloqueados
  checkForNewAchievements(dreamText) {
    const text = dreamText.toLowerCase();
    const newAchievements = [];

    this.achievements.forEach(achievement => {
      // Si ya tiene el logro, no lo vuelve a desbloquear
      if (this.userCollection.includes(achievement.id)) {
        return;
      }

      if (achievement.requiredKeywords) {
        // Logros especiales que necesitan múltiples keywords diferentes
        const matchedKeywords = achievement.keywords.filter(keyword => 
          text.includes(keyword)
        );
        if (matchedKeywords.length >= achievement.requiredKeywords) {
          newAchievements.push(achievement);
        }
      } else {
        // Logros normales (una keyword es suficiente)
        const hasKeyword = achievement.keywords.some(keyword => 
          text.includes(keyword)
        );
        if (hasKeyword) {
          newAchievements.push(achievement);
        }
      }
    });

    return newAchievements;
  }

  // Verifica logros acumulativos basándose en el historial de sueños
  checkCumulativeAchievements() {
    const savedDreams = JSON.parse(localStorage.getItem('dreamscape_dreams') || '[]');
    const allDreamsText = savedDreams.map(d => d.dreamText.toLowerCase()).join(' ');
    const newAchievements = [];

    this.achievements.forEach(achievement => {
      // Si ya tiene el logro, saltar
      if (this.userCollection.includes(achievement.id)) {
        return;
      }

      // Solo verificar logros que requieren múltiples keywords
      if (achievement.requiredKeywords) {
        const matchedKeywords = achievement.keywords.filter(keyword => 
          allDreamsText.includes(keyword)
        );
        
        if (matchedKeywords.length >= achievement.requiredKeywords) {
          newAchievements.push(achievement);
        }
      }
    });

    return newAchievements;
  }

  unlockAchievement(achievementId) {
    if (!this.userCollection.includes(achievementId)) {
      this.userCollection.push(achievementId);
      this.saveCollection();
      return true;
    }
    return false;
  }

  getCollectionProgress() {
    return {
      total: this.achievements.length,
      unlocked: this.userCollection.length,
      percentage: Math.round((this.userCollection.length / this.achievements.length) * 100)
    };
  }

  getUnlockedAchievements() {
    return this.achievements.filter(achievement => this.userCollection.includes(achievement.id));
  }

  getLockedAchievements() {
    return this.achievements.filter(achievement => !this.userCollection.includes(achievement.id));
  }

  getAllAchievements() {
    return this.achievements.map(achievement => ({
      ...achievement,
      unlocked: this.userCollection.includes(achievement.id)
    }));
  }
}

// Inicializar el sistema globalmente
window.achievementSystem = new AchievementSystem();

// Función para mostrar animación de logro desbloqueado
function showAchievementUnlockedAnimation(achievement) {
  // Crear snackbar si no existe
  let snackbar = document.getElementById('achievement-snackbar');
  if (!snackbar) {
    snackbar = document.createElement('div');
    snackbar.id = 'achievement-snackbar';
    snackbar.style.position = 'fixed';
    snackbar.style.bottom = '32px';
    snackbar.style.left = '50%';
    snackbar.style.transform = 'translateX(-50%)';
    snackbar.style.padding = '1rem 1.5rem';
    snackbar.style.borderRadius = '16px';
    snackbar.style.fontSize = '1rem';
    snackbar.style.zIndex = '10000';
    snackbar.style.opacity = '0';
    snackbar.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    snackbar.style.display = 'flex';
    snackbar.style.alignItems = 'center';
    snackbar.style.gap = '1rem';
    snackbar.style.minWidth = '280px';
    snackbar.style.maxWidth = '400px';
    document.body.appendChild(snackbar);
  }

  // Aplicar color del logro
  snackbar.style.background = `linear-gradient(135deg, ${achievement.color} 0%, ${achievement.color}dd 100%)`;
  snackbar.style.boxShadow = `0 8px 24px ${achievement.color}80`;
  snackbar.style.border = `2px solid ${achievement.color}`;
  snackbar.style.color = 'white';

  // Contenido del snackbar
  const symbolDiv = document.createElement('div');
  symbolDiv.style.cssText = 'font-size: 2rem; filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;';
  
  const img = document.createElement('img');
  img.src = achievement.symbol;
  img.alt = achievement.name;
  img.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
  symbolDiv.appendChild(img);
  
  snackbar.innerHTML = '';
  snackbar.appendChild(symbolDiv);
  
  const textDiv = document.createElement('div');
  textDiv.style.flex = '1';
  textDiv.innerHTML = `
    <div style="font-size: 0.75rem; opacity: 0.95; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">¡Logro Desbloqueado!</div>
    <div style="font-weight: 600; font-size: 1.1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${achievement.name}</div>
  `;
  snackbar.appendChild(textDiv);

  // Mostrar snackbar
  snackbar.style.opacity = '1';
  snackbar.style.transform = 'translateX(-50%) translateY(0)';

  // Ocultar después de 3.5 segundos
  setTimeout(() => {
    snackbar.style.opacity = '0';
    snackbar.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3500);
}

// Función para renderizar la galería de logros
function renderAchievementGallery() {
  const gallery = document.getElementById('achievementGallery');
  if (!gallery) return;

  // Recargar la colección desde localStorage antes de renderizar
  if (window.achievementSystem) {
    window.achievementSystem.userCollection = window.achievementSystem.loadCollection();
  }

  const allAchievements = window.achievementSystem.getAllAchievements();
  const progress = window.achievementSystem.getCollectionProgress();

  // Actualizar progreso
  const progressText = document.getElementById('achievementProgressText');
  const progressFill = document.getElementById('achievementProgressFill');
  
  if (progressText) {
    progressText.textContent = `${progress.unlocked}/${progress.total} (${progress.percentage}%)`;
  }
  
  if (progressFill) {
    progressFill.style.width = `${progress.percentage}%`;
  }

  // Renderizar logros
  gallery.innerHTML = '';
  
  allAchievements.forEach(achievement => {
    const achievementClass = achievement.unlocked ? 'unlocked' : 'locked';
    const rarityClass = `rarity-${achievement.rarity}`;
    
    const achievementItem = document.createElement('div');
    achievementItem.className = `achievement-item ${achievementClass} ${rarityClass}`;
    achievementItem.style.cssText = `border-left: 4px solid ${achievement.unlocked ? achievement.color : '#64748b'}; background: ${achievement.unlocked ? achievement.color + '11' : 'rgba(15,23,42,0.4)'}; padding-top: 1.6rem; padding-bottom: 1.6rem;`;
    
    const achievementInner = document.createElement('div');
    achievementInner.className = 'achievement-inner';
    achievementInner.style.marginLeft = '1.5rem';
    
    const achievementSymbol = document.createElement('div');
    achievementSymbol.className = 'achievement-symbol';
    achievementSymbol.style.cssText = `color: ${achievement.unlocked ? achievement.color : '#64748b'}; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;`;
    
    if (achievement.unlocked) {
      const img = document.createElement('img');
      img.src = achievement.symbol;
      img.alt = achievement.name;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
      achievementSymbol.appendChild(img);
    } else {
      achievementSymbol.textContent = '?';
    }
    
    const achievementInfo = document.createElement('div');
    achievementInfo.className = 'achievement-info';
    achievementInfo.innerHTML = `
      <div class="achievement-rarity-badge">${achievement.rarity.toUpperCase()}</div>
      <h3 class="achievement-title">${achievement.unlocked ? achievement.name : 'Logro Bloqueado'}</h3>
      <p class="achievement-description" style="margin-bottom: 0;">${achievement.unlocked ? achievement.description : 'Sigue explorando tus sueños para desbloquear este logro.'}</p>
      ${!achievement.unlocked ? `<p class="achievement-hint">💡 ${achievement.hint}</p>` : ''}
    `;
    
    achievementInner.appendChild(achievementSymbol);
    achievementInner.appendChild(achievementInfo);
    achievementItem.appendChild(achievementInner);
    gallery.appendChild(achievementItem);
  });
}

// Función para re-verificar todos los logros acumulativos manualmente
function recheckAllAchievements() {
  if (!window.achievementSystem) return;
  
  const cumulativeAchievements = window.achievementSystem.checkCumulativeAchievements();
  
  if (cumulativeAchievements.length > 0) {
    cumulativeAchievements.forEach(achievement => {
      const unlocked = window.achievementSystem.unlockAchievement(achievement.id);
      if (unlocked && window.showAchievementUnlockedAnimation) {
        window.showAchievementUnlockedAnimation(achievement);
      }
    });
    
    // Actualizar galería
    if (window.renderAchievementGallery) {
      setTimeout(() => window.renderAchievementGallery(), 500);
    }
    if (window.updateFabBadge) {
      setTimeout(() => window.updateFabBadge(), 600);
    }
  }
}

// Exportar funciones
window.showAchievementUnlockedAnimation = showAchievementUnlockedAnimation;
window.renderAchievementGallery = renderAchievementGallery;
window.recheckAllAchievements = recheckAllAchievements;

// Auto-renderizar la galería cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  renderAchievementGallery();
});
