import { requestJson } from '../utils/api';

function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeServiceListResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.services)) {
    return data.services;
  }

  return [];
}

export async function fetchServices(signal) {
  const data = await requestJson('/services', { signal });
  return normalizeServiceListResponse(data);
}

export async function createService(payload, token) {
  return requestJson('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: buildAuthHeaders(token),
  });
}

export async function updateService(serviceId, payload, token) {
  return requestJson(`/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: buildAuthHeaders(token),
  });
}

export async function deleteService(serviceId, token) {
  return requestJson(`/services/${serviceId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  });
}