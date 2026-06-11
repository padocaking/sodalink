const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  comparePrice: string | null;
  unit: string;
  stock: number;
  isFeatured: boolean;
  category: { id: number; name: string; slug: string };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Erro ao buscar dados (${res.status})`);
  return res.json();
}

export const fetchCategories = () => get<Category[]>('/api/categories');

export const fetchProducts = (params?: { categorySlug?: string; featured?: boolean; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.categorySlug) query.set('categorySlug', params.categorySlug);
  if (params?.featured) query.set('featured', 'true');
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return get<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchFavorites(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/favorites`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Erro ao buscar favoritos (${res.status})`);
  return res.json();
}

export async function toggleFavorite(productId: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/favorites/${productId}`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Erro ao favoritar (${res.status})`);
  const data = await res.json();
  return data.favorited;
}

export const formatPrice = (value: string | number) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
