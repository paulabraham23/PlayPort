export type CategoryId =
  | 'gaming'
  | 'movie-nights'
  | 'music-karaoke'
  | 'party-social'
  | 'family'
  | 'kids'
  | 'date-night'
  | 'racing'
  | 'vr'
  | 'board-games';

export type RentalDurationId = '6h' | '12h' | '24h' | 'weekend';

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'active'
  | 'returning'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod';

export interface RentalDuration {
  id: RentalDurationId;
  label: string;
  hours: number;
  description: string;
  popular?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  icon: string;
  setupsReady: number;
  etaMinutes: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  description: string;
  categoryId: CategoryId;
  images: string[];
  priceByDuration: Record<RentalDurationId, number>;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  badge?: string;
  etaMinutes: number;
  availabilityLabel: string;
  includes: { title: string; detail: string; tag?: string }[];
  requirements?: string[];
  popular?: boolean;
  featured?: boolean;
}

export interface Experience {
  id: string;
  name: string;
  description: string;
  categoryId: CategoryId;
  image: string;
  price: number;
  durationLabel: string;
  etaMinutes: number;
  tag: string;
  chips: string[];
  people: string;
  includes: string[];
  productIds: string[];
  howItWorks: string[];
}

export interface CartItem {
  id: string;
  productId?: string;
  experienceId?: string;
  name: string;
  image: string;
  categoryLabel: string;
  durationId: RentalDurationId;
  durationLabel: string;
  unitPrice: number;
  quantity: number;
  includesNote?: string;
}

export interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  line1: string;
  line2?: string;
  area: string;
  city: string;
  pincode: string;
  contactName: string;
  phone: string;
  instructions?: string;
  isDefault: boolean;
  etaMinutes: number;
  inRapidZone: boolean;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  subtitle: string;
  recommended?: boolean;
  last4?: string;
  brand?: string;
}

export interface OrderItem {
  productId?: string;
  experienceId?: string;
  name: string;
  image: string;
  durationLabel: string;
  returnLabel: string;
  price: number;
  badges?: string[];
  extras?: string[];
}

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  etaLabel: string;
  addressLabel: string;
  addressFull: string;
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  total: number;
  paymentMethodLabel: string;
  progressPercent: number;
  riderName?: string;
  riderDistanceKm?: number;
  setupIncluded: boolean;
  liveDispatch?: boolean;
}

export interface Review {
  id: string;
  productId?: string;
  experienceId?: string;
  orderId?: string;
  userName: string;
  rating: number;
  dateLabel: string;
  text: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  type: 'order' | 'delivery' | 'reminder' | 'account';
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  kycVerified: boolean;
  sessionsCount: number;
  homeHub: string;
}

export interface HubInfo {
  name: string;
  sector: string;
  etaMinutes: number;
  statusLabel: string;
}
