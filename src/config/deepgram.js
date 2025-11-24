// Configuración de Deepgram para reconocimiento de voz
export const DEEPGRAM_CONFIG = {
  apiKey: import.meta.env.PUBLIC_DEEPGRAM_API_KEY || '',
  model: 'nova-2',
  language: 'es',
  options: {
    smart_format: true,
    punctuate: true,
    interim_results: true,
    endpointing: 300,
  }
};

export function isDeepgramConfigured() {
  return DEEPGRAM_CONFIG.apiKey && DEEPGRAM_CONFIG.apiKey.length > 0;
}
