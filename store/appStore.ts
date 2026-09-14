import { create } from 'zustand';
import {
  ADDRESSES,
  CURRENT_USER,
  DURATIONS,
  EXPERIENCES,
  NOTIFICATIONS,
  ORDERS,
  PAYMENT_METHODS,
  PRODUCTS,
  RECENT_SEARCHES,
  REVIEWS,
} from '@/data/mock';
import { calcCartTotals, generateOrderId } from '@/utils/format';
import type {
  Address,
  AppNotification,
  CartItem,
  Order,
  PaymentMethod,
  RentalDurationId,
  Review,
  User,
} from '@/types';

interface AppState {
  isAuthenticated: boolean;
  phoneDraft: string;
  user: User | null;
  cart: CartItem[];
  addresses: Address[];
  selectedAddressId: string | null;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: string;
  orders: Order[];
  notifications: AppNotification[];
  reviews: Review[];
  recentSearches: string[];
  lastOrderId: string | null;
  paymentError: string | null;

  setPhoneDraft: (phone: string) => void;
  login: (phone: string) => void;
  logout: () => void;
  browseAsGuest: () => void;

  addProductToCart: (productId: string, durationId: RentalDurationId, quantity?: number) => void;
  addExperienceToCart: (experienceId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  updateCartDuration: (cartItemId: string, durationId: RentalDurationId) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  selectAddress: (id: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => string;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  selectPaymentMethod: (id: string) => void;
  placeOrder: (fail?: boolean) => { ok: boolean; orderId?: string; error?: string };
  cancelOrder: (orderId: string, reason: string) => void;
  completeReturn: (orderId: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addReview: (review: Omit<Review, 'id' | 'dateLabel' | 'userName'>) => void;
  pushRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearPaymentError: () => void;
}

function durationLabel(id: RentalDurationId): string {
  return DURATIONS.find((d) => d.id === id)?.label ?? id;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  phoneDraft: '',
  user: null,
  cart: [],
  addresses: ADDRESSES,
  selectedAddressId: ADDRESSES.find((a) => a.isDefault)?.id ?? ADDRESSES[0]?.id ?? null,
  paymentMethods: PAYMENT_METHODS,
  selectedPaymentMethodId: PAYMENT_METHODS[0].id,
  orders: ORDERS,
  notifications: NOTIFICATIONS,
  reviews: REVIEWS,
  recentSearches: RECENT_SEARCHES,
  lastOrderId: null,
  paymentError: null,

  setPhoneDraft: (phone) => set({ phoneDraft: phone }),

  login: (phone) =>
    set({
      isAuthenticated: true,
      user: {
        ...CURRENT_USER,
        phone: phone.startsWith('+') ? phone : `+91 ${phone}`,
      },
      phoneDraft: phone,
    }),

  logout: () => set({ isAuthenticated: false, user: null, cart: [] }),

  browseAsGuest: () =>
    set({
      isAuthenticated: true,
      user: { ...CURRENT_USER, name: 'Guest Explorer', phone: 'Guest', email: 'guest@playport.app' },
    }),

  addProductToCart: (productId, durationId, quantity = 1) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    const existing = get().cart.find((c) => c.productId === productId && c.durationId === durationId);
    if (existing) {
      set({
        cart: get().cart.map((c) =>
          c.id === existing.id ? { ...c, quantity: c.quantity + quantity } : c
        ),
      });
      return;
    }
    const item: CartItem = {
      id: `cart-${productId}-${durationId}-${Date.now()}`,
      productId,
      name: product.shortName,
      image: product.images[0],
      categoryLabel: product.categoryId.replace('-', ' ').toUpperCase(),
      durationId,
      durationLabel: durationLabel(durationId),
      unitPrice: product.priceByDuration[durationId],
      quantity,
      includesNote: product.includes[0]?.detail,
    };
    set({ cart: [...get().cart, item] });
  },

  addExperienceToCart: (experienceId) => {
    const exp = EXPERIENCES.find((e) => e.id === experienceId);
    if (!exp) return;
    const existing = get().cart.find((c) => c.experienceId === experienceId);
    if (existing) {
      set({
        cart: get().cart.map((c) =>
          c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c
        ),
      });
      return;
    }
    const item: CartItem = {
      id: `cart-exp-${experienceId}-${Date.now()}`,
      experienceId,
      name: exp.name,
      image: exp.image,
      categoryLabel: exp.tag,
      durationId: '12h',
      durationLabel: exp.durationLabel.replace('/', '').trim() || 'Night',
      unitPrice: exp.price,
      quantity: 1,
      includesNote: exp.includes.slice(0, 2).join(' • '),
    };
    set({ cart: [...get().cart, item] });
  },

  updateCartQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      set({ cart: get().cart.filter((c) => c.id !== cartItemId) });
      return;
    }
    set({
      cart: get().cart.map((c) => (c.id === cartItemId ? { ...c, quantity } : c)),
    });
  },

  updateCartDuration: (cartItemId, durationId) => {
    set({
      cart: get().cart.map((c) => {
        if (c.id !== cartItemId) return c;
        const product = c.productId ? PRODUCTS.find((p) => p.id === c.productId) : undefined;
        return {
          ...c,
          durationId,
          durationLabel: durationLabel(durationId),
          unitPrice: product ? product.priceByDuration[durationId] : c.unitPrice,
        };
      }),
    });
  },

  removeFromCart: (cartItemId) => set({ cart: get().cart.filter((c) => c.id !== cartItemId) }),

  clearCart: () => set({ cart: [] }),

  selectAddress: (id) => set({ selectedAddressId: id }),

  addAddress: (address) => {
    const id = `addr-${Date.now()}`;
    const next = address.isDefault
      ? get().addresses.map((a) => ({ ...a, isDefault: false }))
      : get().addresses;
    set({
      addresses: [...next, { ...address, id }],
      selectedAddressId: address.isDefault ? id : get().selectedAddressId,
    });
    return id;
  },

  updateAddress: (id, patch) => {
    set({
      addresses: get().addresses.map((a) => {
        if (a.id !== id) {
          return patch.isDefault ? { ...a, isDefault: false } : a;
        }
        return { ...a, ...patch };
      }),
    });
  },

  deleteAddress: (id) => {
    const remaining = get().addresses.filter((a) => a.id !== id);
    const selected = get().selectedAddressId === id ? remaining[0]?.id ?? null : get().selectedAddressId;
    set({ addresses: remaining, selectedAddressId: selected });
  },

  setDefaultAddress: (id) => {
    set({
      addresses: get().addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      selectedAddressId: id,
    });
  },

  selectPaymentMethod: (id) => set({ selectedPaymentMethodId: id, paymentError: null }),

  placeOrder: (fail = false) => {
    const { cart, addresses, selectedAddressId, selectedPaymentMethodId, paymentMethods, user } = get();
    if (!cart.length) return { ok: false, error: 'Cart is empty' };
    if (fail) {
      set({ paymentError: 'Payment could not be completed. Please try another method.' });
      return { ok: false, error: 'Payment failed' };
    }
    const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
    const payment = paymentMethods.find((p) => p.id === selectedPaymentMethodId);
    const totals = calcCartTotals(cart);
    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      etaLabel: '7:45 PM',
      addressLabel: address?.label ?? 'Home',
      addressFull: address
        ? `${address.line1}, ${address.line2 ? address.line2 + ', ' : ''}${address.area}`
        : 'Indiranagar',
      items: cart.map((c) => ({
        productId: c.productId,
        experienceId: c.experienceId,
        name: c.name,
        image: c.image,
        durationLabel: c.durationLabel,
        returnLabel: c.durationId === '12h' ? 'Returns tomorrow 11:00 AM' : 'Returns after slot',
        price: c.unitPrice * c.quantity,
        badges: c.includesNote ? [c.includesNote.slice(0, 28)] : undefined,
      })),
      subtotal: totals.itemsTotal,
      taxes: totals.taxes,
      total: totals.total,
      paymentMethodLabel: payment?.label ?? 'UPI',
      progressPercent: 20,
      setupIncluded: true,
      liveDispatch: false,
    };
    set({
      orders: [order, ...get().orders],
      cart: [],
      lastOrderId: orderId,
      paymentError: null,
      notifications: [
        {
          id: `n-${Date.now()}`,
          title: 'Order confirmed',
          body: `${orderId} is being packed at Indiranagar Dark Hub.`,
          timeLabel: 'Just now',
          type: 'order',
          read: false,
        },
        ...get().notifications,
      ],
      user: user ?? CURRENT_USER,
      isAuthenticated: true,
    });
    return { ok: true, orderId };
  },

  cancelOrder: (orderId, _reason) => {
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled', progressPercent: 0 } : o
      ),
    });
  },

  completeReturn: (orderId) => {
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, status: 'completed', progressPercent: 100 } : o
      ),
    });
  },

  markNotificationRead: (id) =>
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }),

  markAllNotificationsRead: () =>
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

  addReview: (review) => {
    const entry: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      dateLabel: 'Just now',
      userName: get().user?.name ?? 'You',
    };
    set({ reviews: [entry, ...get().reviews] });
  },

  pushRecentSearch: (query) => {
    const q = query.trim();
    if (!q) return;
    const rest = get().recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase());
    set({ recentSearches: [q, ...rest].slice(0, 8) });
  },

  clearRecentSearches: () => set({ recentSearches: [] }),

  clearPaymentError: () => set({ paymentError: null }),
}));

export function useCartCount() {
  return useAppStore((s) => s.cart.reduce((n, i) => n + i.quantity, 0));
}

export function useCartTotals() {
  const cart = useAppStore((s) => s.cart);
  return calcCartTotals(cart);
}
