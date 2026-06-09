export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  address: string;
  city: string;
  pib: string;
  phone: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

export interface Company {
  id: number;
  name: string;
  address: string;
  city: string;
  pib: string;
  phone: string;
  email: string;
}

export interface CompanyRequest {
  name: string;
  address: string;
  city: string;
  pib: string;
  phone: string;
  email: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId?: number;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyPib?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'DELIVERED';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  userName: string;
  companyId: number;
  companyName: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  items: OrderItemResponse[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ApiError {
  message: string;
  status: number;
}
