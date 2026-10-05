export type CategoryId = string;

/** Plan id is free-form (e.g. "1h", "3h", "12h") — admin-configurable. */
export type RentalPlanId = string;

/** @deprecated Prefer RentalPlanId — kept for gradual migration aliases. */
export type RentalDurationId = RentalPlanId;

export type PricingMode = 'package' | 'hourly';

export type OrderStatus =
  | 'pending_payment'
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

export interface RentalPlan {
  id: RentalPlanId;
  label: string;
  hours: number;
  price: number;
  popular?: boolean;
}

export interface ProductHourlyRate {
  enabled: boolean;
  firstHourPrice: number;
  extraHourPrice: number;
  maxHours?: number;
}

export interface ProductAddonPricing {
  perHour: number;
  /** Use per-hour pricing when selected plan hours <= this (e.g. 6). */
  perHourMaxPlanHours: number;
  flatPrice: number;
  /** Use flat pricing when selected plan hours >= this (e.g. 12). */
  flatMinPlanHours: number;
}

export interface ProductAddon {
  id: string;
  name: string;
  description?: string;
  maxQuantity: number;
  pricing: ProductAddonPricing;
}

export interface CartAddonLine {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

/** @deprecated Legacy duration metadata — prefer RentalPlan on products. */
export interface RentalDuration {
  id: RentalPlanId;
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
  /** Admin-configurable package plans (1h, 3h, 6h, …). */
  plans: RentalPlan[];
  hourly?: ProductHourlyRate | null;
  addons?: ProductAddon[];
  /** @deprecated Migrated into plans — kept for reading old Firestore docs. */
  priceByDuration?: Record<string, number>;
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
  /** Selected package plan id, or "hourly" when pricingMode is hourly. */
  planId: string;
  durationId: string;
  durationLabel: string;
  hours: number;
  pricingMode: PricingMode;
  /** Kit / base line unit price (package or hourly total for selected hours). */
  unitPrice: number;
  addons?: CartAddonLine[];
  addonsTotal?: number;
  /** Chosen physical unit (e.g. PS4 #1 vs PS4 #2). */
  inventoryUnitId?: string;
  unitLabel?: string;
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
  /** Games installed on this physical unit. */
  games?: string[];
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
  /** demo = no payment gateway was used */
  paymentProvider?: 'razorpay' | 'demo';
  progressPercent: number;
  riderName?: string;
  riderDistanceKm?: number;
  /** Assigned delivery partner */
  riderId?: string | null;
  riderPhone?: string;
  riderAcceptedAt?: string;
  /** Live rider GPS while en route (not shown as a map to customers) */
  riderLat?: number;
  riderLng?: number;
  riderLocationUpdatedAt?: string;
  /** Drop-off coordinates for ETA */
  dropoffLat?: number;
  dropoffLng?: number;
  /** Computed delivery ETA in minutes from last location ping */
  etaMinutes?: number;
  /** road = Google Routes (traffic-aware); straight = fallback */
  etaSource?: 'road' | 'straight';
  setupIncluded: boolean;
  liveDispatch?: boolean;
  /** 4-digit handover code — customer reads it to the rider before mark-delivered. */
  deliveryOtp?: string;
  reservationIds?: string[];
  startAt?: string;
  endAt?: string;
  holdExpiresAt?: string | null;
  razorpayOrderId?: string;
}

/** Delivery partner profile — doc id usually matches Auth uid after bind. */
export interface Rider {
  id: string;
  name: string;
  phone: string;
  hubId: string;
  active: boolean;
  vehicle?: string;
  /** Bound Firebase Auth uid (set on first rider login) */
  uid?: string;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
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
  /** Ops can hide a review from customer-facing surfaces without deleting it. */
  hidden?: boolean;
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
  /** True after name + first address onboarding */
  onboardingComplete?: boolean;
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
  /** Optional geo for Places bias / routing */
  lat?: number;
  lng?: number;
  addressLine?: string;
  pincode?: string;
  phone?: string;
  notes?: string;
}

/** Global ops knobs — edited in Admin → Settings */
export interface AppConfig {
  taxPercent: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  defaultEtaMinutes: number;
  bookingHoldMinutes: number;
  supportPhone: string;
  supportEmail: string;
  supportWhatsapp: string;
  brandTagline: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowGuestCheckout: boolean;
  minOrderAmount: number;
  maxUnitsPerOrder: number;
  rapidZonePincodes: string[];
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  updatedAt?: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  taxPercent: 18,
  deliveryFee: 0,
  freeDeliveryAbove: 0,
  defaultEtaMinutes: 30,
  bookingHoldMinutes: 15,
  supportPhone: '',
  supportEmail: 'playportofficial@gmail.com',
  supportWhatsapp: '',
  brandTagline: 'Entertainment on demand',
  maintenanceMode: false,
  maintenanceMessage: 'We’re upgrading hubs — back shortly.',
  allowGuestCheckout: false,
  minOrderAmount: 0,
  maxUnitsPerOrder: 5,
  rapidZonePincodes: [],
  homeHeroTitle: '',
  homeHeroSubtitle: '',
};

