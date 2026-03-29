export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export async function requestJson(path, options = {}) {
  const { headers: customHeaders = {}, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders
    },
    ...restOptions
  });

  const contentType = response.headers.get('content-type') || '';
  const responseData = contentType.includes('application/json') ? await response.json() : null;
  const responseText = !contentType.includes('application/json') ? await response.text() : '';

  if (!response.ok) {
    const message =
      responseData?.message ||
      responseData?.error ||
      responseText ||
      `Falha ao conectar com o backend (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return responseData;
}