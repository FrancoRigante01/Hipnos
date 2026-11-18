export async function handler() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: 'DEEPGRAM_API_KEY no configurada' };
  }

  const response = await fetch('https://api.deepgram.com/v1/auth/grant', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!response.ok) {
    return { statusCode: response.status, body: 'No se pudo generar el token de Deepgram' };
  }

  const { access_token } = await response.json();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ access_token }),
  };
}
