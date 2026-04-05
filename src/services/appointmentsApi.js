import { requestJson } from '../utils/api';

function normalizeList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.services)) {
    return data.services;
  }

  if (Array.isArray(data?.barbers)) {
    return data.barbers;
  }

  return [];
}

export async function fetchServices(signal) {
  const data = await requestJson('/services', { signal });
  return normalizeList(data);
}

export async function fetchBarbers(signal) {
  const data = await requestJson('/barbers', { signal });
  return normalizeList(data);
}

export async function createAppointment(payload, token) {
  return requestJson('/appointments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}