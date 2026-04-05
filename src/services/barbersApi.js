import { requestJson } from '../utils/api';

function normalizeBarbersResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.barbers)) {
    return data.barbers;
  }

  return [];
}

export async function fetchBarbers(signal) {
  const data = await requestJson('/barbers', { signal });
  return normalizeBarbersResponse(data);
}

export function filterActiveBarbers(barbers) {
  return barbers.filter((barber) => Number(barber.active ?? barber.ativo) !== 0);
}