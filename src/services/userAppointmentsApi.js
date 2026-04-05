import { requestJson } from '../utils/api';

function normalizeArrayResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.appointments)) {
    return data.appointments;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

const APPOINTMENT_LIST_ENDPOINTS = (userId) => [
  `/appointments/user/${userId}`,
  `/appointments?user_id=${userId}`,
  `/appointments?userId=${userId}`,
  `/users/${userId}/appointments`,
];

export async function fetchUserAppointments(userId, token) {
  const endpoints = APPOINTMENT_LIST_ENDPOINTS(userId);
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const data = await requestJson(endpoint, {
        headers: authHeaders(token),
      });

      return normalizeArrayResponse(data);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Nao foi possivel carregar seus agendamentos.');
}

export async function updateUserAppointment(appointmentId, payload, token) {
  return requestJson(`/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteUserAppointment(appointmentId, token) {
  return requestJson(`/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}