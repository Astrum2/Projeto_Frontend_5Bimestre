import { requestJson } from '../utils/api';

function normalizeProductsResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  return [];
}

export async function fetchProducts(signal) {
  const data = await requestJson('/api/produtos', { signal });
  return normalizeProductsResponse(data);
}