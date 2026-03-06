// User and Authentication Types
export type UserRole = 'student' | 'vendor' | 'admin';
export type ProductCondition = 'novo' | 'como_novo' | 'usado';

export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  course: string;
  classroom: string;
  school: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  student_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  category: string;
  condition: ProductCondition;
  price: number;
  location: string;
  image_urls: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  product_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface AuthRequest {
  email: string;
  password: string;
  full_name?: string;
  student_id?: string;
}

export interface StudentVerificationRequest {
  student_id: string;
  email: string;
  full_name: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  category: string;
  condition: ProductCondition;
  price: number;
  location: string;
  image_urls: string[];
  stock: number;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  category?: string;
  condition?: ProductCondition;
  price?: number;
  location?: string;
  image_urls?: string[];
  stock?: number;
  is_active?: boolean;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface CreateMessageRequest {
  recipient_id: string;
  product_id?: string;
  content: string;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
