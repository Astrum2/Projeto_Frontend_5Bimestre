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

function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const BARBER_APPOINTMENTS_ENDPOINTS = (barberId, date) => {
  const encodedDate = encodeURIComponent(date);

  return [
    `/appointments?barber_id=${barberId}&date=${encodedDate}`,
    `/appointments?barberId=${barberId}&date=${encodedDate}`,
    `/barbers/${barberId}/appointments?date=${encodedDate}`,
  ];
};

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
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function fetchBarberSchedules(token, signal) {
  const data = await requestJson('/barber-schedules', {
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return normalizeList(data);
}

export async function fetchAppointmentDetails(appointmentId, token) {
  return requestJson(`/appointments/${appointmentId}`, {
    headers: buildAuthHeaders(token),
  });
}

export async function fetchAppointmentsByBarberAndDate(barberId, date, token, signal) {
  const endpoints = BARBER_APPOINTMENTS_ENDPOINTS(barberId, date);
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const data = await requestJson(endpoint, {
        signal,
        headers: buildAuthHeaders(token),
      });

      return normalizeList(data);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Nao foi possivel validar os agendamentos do barbeiro.');
}