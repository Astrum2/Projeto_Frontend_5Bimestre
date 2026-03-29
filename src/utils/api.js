export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const responseData = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = responseData?.message || 'Falha ao conectar com o backend.';
    throw new Error(message);
  }

  return responseData;
}