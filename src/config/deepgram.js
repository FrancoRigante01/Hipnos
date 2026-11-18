// Configuración de Deepgram para reconocimiento de voz
export const DEEPGRAM_CONFIG = {
  tokenUrl: '/.netlify/functions/deepgram-token',
  model: 'nova-2',
  language: 'es',
  options: {
    smart_format: true,
    punctuate: true,
    interim_results: true,
    endpointing: 300,
  }
};

// Pide un token temporal (30 s) al backend; la API key nunca llega al navegador
export async function getDeepgramToken() {
  const response = await fetch(DEEPGRAM_CONFIG.tokenUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`No se pudo obtener el token de Deepgram (${response.status})`);
  }
  const { access_token } = await response.json();
  return access_token;
}
