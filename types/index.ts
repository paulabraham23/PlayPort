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

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'cod';

export type InventoryUnitStatus = 'available' | 'maintenance' | 'retired';

export type ReservationStatus = 'hold' | 'confirmed' | 'released' | 'completed';

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

/** Physical asset — parent of time-window reservations. */
export interface InventoryUnit {
  id: string;
  productId: string;
  hubId: string;
  skuLabel: string;
  status: InventoryUnitStatus;
  createdAt: string;
  updatedAt: string;
}

/** Source of truth for rental availability. */
export interface InventoryReservation {
  id: string;
  inventoryUnitId: string;
  productId: string;
  hubId: string;
  orderId: string;
  userId: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  holdExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId?: string;
  hubId?: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
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
  reservationIds?: string[];
  startAt?: string;
  endAt?: string;
  holdExpiresAt?: string | null;
  razorpayOrderId?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: 'INR';
  provider: 'razorpay' | 'demo';
  providerRef: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  productId?: string;
  experienceId?: string;
  orderId?: string;
  userId?: string;
  userName: string;
  rating: number;
  dateLabel: string;
  text: string;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  type: 'order' | 'delivery' | 'reminder' | 'account' | 'payment';
  read: boolean;
  createdAt?: string;
  orderId?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  kycVerified: boolean;
  sessionsCount: number;
  /** Display label for UI */
  homeHub: string;
  /** Firestore hubs/{id} reference — source for booking hub */
  homeHubId?: string;
}

/** Generic hub — multi-city ready. No city hardcoding in business logic. */
export interface HubInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
  sector?: string;
  etaMinutes?: number;
  statusLabel?: string;
}
