const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}

export interface Product {
  packageType: string;
  volume: any;
  unitCount: number;
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  comparePrice: string | null;
  unit: string;
  unitCount: number;
  volume: number | null;
  packageType: string | null;
  stock: number;
  isFeatured: boolean;
  category: { id: number; name: string; slug: string };
}

export interface AdminUser {
  id: number;
  clientNumber: string;
  name: string;
  email: string;
  document: string;
  documentType: 'CPF' | 'CNPJ';
  phone: string;
  creditBalance: string;
  isActive: boolean;
  createdAt: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Erro ao buscar dados (${res.status})`);
  return res.json();
}

export const fetchCategories = () => get<Category[]>('/api/categories');

export const fetchUsers = () => get<AdminUser[]>('/api/users');

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

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: { id: number; name: string; slug: string; imageUrl: string | null; unit: string };
}

export interface Order {
  id: number;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: string;
  total: string;
  paymentMethod: 'CREDIT_BALANCE' | 'BOLETO' | 'PIX' | 'CREDIT_CARD' | string;
  createdAt: string;
  deliveredAt: string | null;
  cancelledAt: string | null;
  orderItems: OrderItem[];
}

export async function fetchCart(): Promise<CartItem[]> {
  const res = await fetch(`${API_URL}/api/cart`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Erro ao buscar carrinho (${res.status})`);
  return res.json();
}

export async function setCartItem(productId: number, quantity: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/cart/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar carrinho (${res.status})`);
}

export async function clearCart(): Promise<void> {
  const res = await fetch(`${API_URL}/api/cart`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`Erro ao esvaziar carrinho (${res.status})`);
}

export async function createOrder(): Promise<Order> {
  const res = await fetch(`${API_URL}/api/orders`, { method: 'POST', headers: authHeaders() });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? 'Erro ao finalizar pedido');
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/api/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Erro ao buscar pedidos (${res.status})`);
  return res.json();
}

export async function fetchOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_URL}/api/orders/${orderNumber}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Erro ao buscar pedido (${res.status})`);
  return res.json();
}

export const formatPrice = (value: string | number) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
