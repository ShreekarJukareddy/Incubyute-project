export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => undefined);
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText;
    throw new Error(message);
  }
  return data as T;
}

export async function register(payload: { email: string; password: string; name?: string; role?: Role }) {
  return request<{ token: string; user: User }>(`/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function login(payload: { email: string; password: string }) {
  return request<{ token: string; user: User }>(`/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function getSweets(token: string) {
  return request<Sweet[]>(`/api/sweets`, {
    headers: authHeaders(token)
  });
}

export async function searchSweets(token: string, params: { name?: string; category?: string; minPrice?: string; maxPrice?: string }) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) query.append(k, v);
  });
  const qs = query.toString();
  return request<Sweet[]>(`/api/sweets/search${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(token)
  });
}

export async function createSweet(token: string, sweet: Omit<Sweet, 'id'>) {
  return request<Sweet>(`/api/sweets`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(sweet)
  });
}

export async function updateSweet(token: string, id: string, sweet: Partial<Omit<Sweet, 'id'>>) {
  return request<Sweet>(`/api/sweets/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(sweet)
  });
}

export async function deleteSweet(token: string, id: string) {
  await request<void>(`/api/sweets/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });
}

export async function purchaseSweet(token: string, id: string, quantity: number) {
  return request<Sweet>(`/api/sweets/${id}/purchase`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ quantity })
  });
}

export async function restockSweet(token: string, id: string, quantity: number) {
  return request<Sweet>(`/api/sweets/${id}/restock`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ quantity })
  });
}
