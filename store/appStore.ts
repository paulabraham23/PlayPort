import { create } from 'zustand';
import {
  ADDRESSES,
  CURRENT_USER,
  DURATIONS,
  EXPERIENCES,
  PAYMENT_METHODS,
  PRODUCTS,
  RECENT_SEARCHES,
  REVIEWS,
} from '@/data/mock';
import {
  confirmPhoneLogin,
  mapFirebaseUserToAppUser,
  signOutUser,
  startPhoneLogin,
  watchAuth,
} from '@/lib/auth';
import {
  clearUserCart,
  createReviewDoc,
  deleteAddressDoc,
  deleteCartItem,
  fetchReviews,
  fetchUserAddresses,
  fetchUserCart,
  fetchUserNotifications,
  fetchUserOrders,
  markAllNotificationsReadRemote,
  markNotificationReadRemote,
  replaceUserCart,
  upsertAddress,
  upsertCartItem,
  watchUserNotifications,
  watchUserOrders,
} from '@/lib/firestore';
import {
  callCancelBooking,
  callCompleteReturn,
  callConfirmPayment,
  callCreateBooking,
  callCreateRazorpayOrder,
} from '@/lib/functions';
import { useCatalogStore } from '@/store/catalogStore';
import { calcCartTotals } from '@/utils/format';
import { formatFunctionsError } from '@/utils/functionsError';
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
import type { Unsubscribe } from 'firebase/firestore';

interface AppState {
  isAuthenticated: boolean;
  authReady: boolean;
  phoneDraft: string;
  otpMode: 'firebase' | 'mock' | null;
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
  pendingOrderId: string | null;

  bootstrapAuth: () => () => void;
  setPhoneDraft: (phone: string) => void;
  requestOtp: (phone: string) => Promise<'firebase' | 'mock'>;
  login: (code: string) => Promise<void>;
  logout: () => void;
  hydrateUserData: (userId: string) => Promise<void>;

  addProductToCart: (productId: string, durationId: RentalDurationId, quantity?: number) => void;
  addExperienceToCart: (experienceId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  updateCartDuration: (cartItemId: string, durationId: RentalDurationId) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  syncCartRemote: () => void;

  selectAddress: (id: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => string;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  selectPaymentMethod: (id: string) => void;
  placeOrder: (fail?: boolean) => Promise<{ ok: boolean; orderId?: string; error?: string }>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  completeReturn: (orderId: string) => Promise<void>;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addReview: (review: Omit<Review, 'id' | 'dateLabel' | 'userName'>) => void;
  loadReviews: () => Promise<void>;
  pushRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearPaymentError: () => void;
}

function durationLabel(id: RentalDurationId): string {
  return DURATIONS.find((d) => d.id === id)?.label ?? id;
}

let ordersUnsub: Unsubscribe | null = null;
let notifUnsub: Unsubscribe | null = null;

function clearListeners() {
  ordersUnsub?.();
  notifUnsub?.();
  ordersUnsub = null;
  notifUnsub = null;
}

function attachListeners(userId: string, set: (partial: Partial<AppState>) => void) {
  clearListeners();
  ordersUnsub = watchUserOrders(userId, (orders) => set({ orders }));
  notifUnsub = watchUserNotifications(userId, (notifications) => set({ notifications }));
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  authReady: false,
  phoneDraft: '',
  otpMode: null,
  user: null,
  cart: [],
  addresses: [],
  selectedAddressId: null,
  paymentMethods: PAYMENT_METHODS,
  selectedPaymentMethodId: PAYMENT_METHODS[0].id,
  orders: [],
  notifications: [],
  reviews: REVIEWS,
  recentSearches: RECENT_SEARCHES,
  lastOrderId: null,
  paymentError: null,
  pendingOrderId: null,

  bootstrapAuth: () => {
    const unsub = watchAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        clearListeners();
        set({
          authReady: true,
          isAuthenticated: false,
          user: null,
          orders: [],
          notifications: [],
        });
        return;
      }
      try {
        const user = await mapFirebaseUserToAppUser(firebaseUser);
        const phoneDigits = user.phone.replace(/\D/g, '');
        // Anonymous without phone = guest browse; anonymous/phone mock or Phone Auth = signed in
        const signedIn = !firebaseUser.isAnonymous || phoneDigits.length >= 10;
        if (!signedIn) {
          clearListeners();
          set({
            authReady: true,
            isAuthenticated: false,
            user: null,
          });
          return;
        }
        set({ isAuthenticated: true, user, authReady: true });
        await get().hydrateUserData(user.id);
        attachListeners(user.id, set);
      } catch {
        set({ authReady: true });
      }
    });
    return () => {
      unsub();
      clearListeners();
    };
  },

  hydrateUserData: async (userId) => {
    try {
      const [cart, addresses, orders, notifications, reviews] = await Promise.all([
        fetchUserCart(userId),
        fetchUserAddresses(userId),
        fetchUserOrders(userId),
        fetchUserNotifications(userId),
        fetchReviews(),
      ]);

      const nextAddresses = addresses.length ? addresses : ADDRESSES;
      if (!addresses.length) {
        await Promise.all(ADDRESSES.map((a) => upsertAddress(userId, a)));
      }

      const hub = useCatalogStore.getState().hub;
      const user = get().user;
      if (user && hub?.id && !user.homeHubId) {
        const patched = {
          ...user,
          homeHubId: hub.id,
          homeHub: hub.city || hub.name,
        };
        set({ user: patched });
        const { upsertUserProfile } = await import('@/lib/firestore');
        void upsertUserProfile(userId, {
          homeHubId: hub.id,
          homeHub: patched.homeHub,
        });
      }

      set({
        cart,
        addresses: nextAddresses,
        selectedAddressId:
          nextAddresses.find((a) => a.isDefault)?.id ?? nextAddresses[0]?.id ?? null,
        orders,
        notifications: notifications.length ? notifications : [],
        reviews: reviews.length ? reviews : REVIEWS,
      });
    } catch (e) {
      console.warn('hydrateUserData failed', e);
      set({
        addresses: ADDRESSES,
        selectedAddressId: ADDRESSES.find((a) => a.isDefault)?.id ?? ADDRESSES[0]?.id ?? null,
        orders: [],
        notifications: [],
      });
    }
  },

  setPhoneDraft: (phone) => set({ phoneDraft: phone }),

  requestOtp: async (phone) => {
    const digits = phone.replace(/\D/g, '').slice(-10);
    set({ phoneDraft: digits });
    const { mode } = await startPhoneLogin(digits);
    set({ otpMode: mode });
    return mode;
  },

  login: async (code) => {
    const user = await confirmPhoneLogin(code);
    set({
      isAuthenticated: true,
      user,
      phoneDraft: user.phone.replace(/\D/g, '').slice(-10),
    });
    await get().hydrateUserData(user.id);
    attachListeners(user.id, set);

    // Push any local cart built while guest
    const { cart } = get();
    if (cart.length) {
      await replaceUserCart(user.id, cart);
    }
  },

  logout: () => {
    clearListeners();
    void signOutUser().catch(() => {});
    set({
      isAuthenticated: false,
      user: null,
      cart: [],
      orders: [],
      notifications: [],
      addresses: [],
      selectedAddressId: null,
      pendingOrderId: null,
    });
  },

  syncCartRemote: () => {
    const { user, cart, isAuthenticated } = get();
    if (!isAuthenticated || !user?.id) return;
    void replaceUserCart(user.id, cart).catch(() => {});
  },

  addProductToCart: (productId, durationId, quantity = 1) => {
    const catalogProducts = useCatalogStore.getState().products;
    const product = catalogProducts.find((p) => p.id === productId) ?? PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    const existing = get().cart.find((c) => c.productId === productId && c.durationId === durationId);
    let next: CartItem[];
    if (existing) {
      next = get().cart.map((c) =>
        c.id === existing.id ? { ...c, quantity: c.quantity + quantity } : c
      );
    } else {
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
      next = [...get().cart, item];
    }
    set({ cart: next });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) {
      const item = next.find((c) => c.productId === productId && c.durationId === durationId);
      if (item) void upsertCartItem(uid, item).catch(() => {});
    }
  },

  addExperienceToCart: (experienceId) => {
    const catalogExperiences = useCatalogStore.getState().experiences;
    const exp =
      catalogExperiences.find((e) => e.id === experienceId) ?? EXPERIENCES.find((e) => e.id === experienceId);
    if (!exp) return;
    const existing = get().cart.find((c) => c.experienceId === experienceId);
    let next: CartItem[];
    if (existing) {
      next = get().cart.map((c) =>
        c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
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
      next = [...get().cart, item];
    }
    set({ cart: next });
    get().syncCartRemote();
  },

  updateCartQuantity: (cartItemId, quantity) => {
    const uid = get().user?.id;
    if (quantity <= 0) {
      set({ cart: get().cart.filter((c) => c.id !== cartItemId) });
      if (uid && get().isAuthenticated) void deleteCartItem(uid, cartItemId).catch(() => {});
      return;
    }
    const next = get().cart.map((c) => (c.id === cartItemId ? { ...c, quantity } : c));
    set({ cart: next });
    const item = next.find((c) => c.id === cartItemId);
    if (uid && get().isAuthenticated && item) void upsertCartItem(uid, item).catch(() => {});
  },

  updateCartDuration: (cartItemId, durationId) => {
    const products = useCatalogStore.getState().products;
    set({
      cart: get().cart.map((c) => {
        if (c.id !== cartItemId) return c;
        const product = c.productId
          ? products.find((p) => p.id === c.productId) ?? PRODUCTS.find((p) => p.id === c.productId)
          : undefined;
        return {
          ...c,
          durationId,
          durationLabel: durationLabel(durationId),
          unitPrice: product ? product.priceByDuration[durationId] : c.unitPrice,
        };
      }),
    });
    get().syncCartRemote();
  },

  removeFromCart: (cartItemId) => {
    set({ cart: get().cart.filter((c) => c.id !== cartItemId) });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) void deleteCartItem(uid, cartItemId).catch(() => {});
  },

  clearCart: () => {
    set({ cart: [] });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) void clearUserCart(uid).catch(() => {});
  },

  selectAddress: (id) => set({ selectedAddressId: id }),

  addAddress: (address) => {
    const id = `addr-${Date.now()}`;
    const next = address.isDefault
      ? get().addresses.map((a) => ({ ...a, isDefault: false }))
      : get().addresses;
    const created = { ...address, id };
    set({
      addresses: [...next, created],
      selectedAddressId: address.isDefault ? id : get().selectedAddressId,
    });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) {
      void (async () => {
        if (address.isDefault) {
          await Promise.all(next.map((a) => upsertAddress(uid, { ...a, isDefault: false })));
        }
        await upsertAddress(uid, created);
      })();
    }
    return id;
  },

  updateAddress: (id, patch) => {
    const next = get().addresses.map((a) => {
      if (a.id !== id) {
        return patch.isDefault ? { ...a, isDefault: false } : a;
      }
      return { ...a, ...patch };
    });
    set({ addresses: next });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) {
      void Promise.all(next.map((a) => upsertAddress(uid, a))).catch(() => {});
    }
  },

  deleteAddress: (id) => {
    const remaining = get().addresses.filter((a) => a.id !== id);
    const selected = get().selectedAddressId === id ? remaining[0]?.id ?? null : get().selectedAddressId;
    set({ addresses: remaining, selectedAddressId: selected });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) void deleteAddressDoc(uid, id).catch(() => {});
  },

  setDefaultAddress: (id) => {
    const next = get().addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    set({ addresses: next, selectedAddressId: id });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) {
      void Promise.all(next.map((a) => upsertAddress(uid, a))).catch(() => {});
    }
  },

  selectPaymentMethod: (id) => set({ selectedPaymentMethodId: id, paymentError: null }),

  placeOrder: async (fail = false) => {
    const { cart, addresses, selectedAddressId, selectedPaymentMethodId, paymentMethods, user } = get();
    if (!cart.length) return { ok: false, error: 'Cart is empty' };
    if (!user?.id) return { ok: false, error: 'Sign in required' };

    const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
    const payment = paymentMethods.find((p) => p.id === selectedPaymentMethodId);
    const totals = calcCartTotals(cart);
    const hub = useCatalogStore.getState().hub;

    try {
      const booking = await callCreateBooking({
        hubId: hub.id,
        cart,
        addressLabel: address?.label ?? 'Home',
        addressFull: address
          ? `${address.line1}, ${address.line2 ? address.line2 + ', ' : ''}${address.area}, ${address.city}`
          : `${hub.city}`,
        paymentMethodLabel: payment?.label ?? 'UPI',
        subtotal: totals.itemsTotal,
        taxes: totals.taxes,
        total: totals.total,
      });

      set({
        pendingOrderId: booking.orderId,
        cart: [],
        orders: [booking.order as Order, ...get().orders.filter((o) => o.id !== booking.orderId)],
      });

      const rzp = await callCreateRazorpayOrder(booking.orderId);

      if (rzp.demo || !rzp.keyId) {
        const paid = await callConfirmPayment(booking.orderId, fail);
        if (!paid.ok) {
          set({ paymentError: paid.error ?? 'Payment failed' });
          return { ok: false, error: paid.error ?? 'Payment failed', orderId: booking.orderId };
        }
      } else if (typeof window !== 'undefined') {
        await openRazorpayCheckout({
          keyId: rzp.keyId,
          amount: rzp.amount,
          currency: rzp.currency,
          razorpayOrderId: rzp.razorpayOrderId,
          orderId: booking.orderId,
          name: user.name,
          phone: user.phone,
        });
        await callConfirmPayment(booking.orderId, false);
        set({
          orders: get().orders.map((o) =>
            o.id === booking.orderId ? { ...o, paymentStatus: 'paid', progressPercent: 20 } : o
          ),
        });
      } else {
        await callConfirmPayment(booking.orderId, fail);
      }

      set({
        lastOrderId: booking.orderId,
        paymentError: null,
        pendingOrderId: null,
      });
      return { ok: true, orderId: booking.orderId };
    } catch (e) {
      const message = formatFunctionsError(e);
      set({ paymentError: message });
      return { ok: false, error: message };
    }
  },

  cancelOrder: async (orderId, reason) => {
    try {
      await callCancelBooking(orderId, reason);
      set({
        orders: get().orders.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled', progressPercent: 0 } : o
        ),
      });
    } catch (e) {
      console.warn('cancelOrder failed', e);
      set({
        orders: get().orders.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled', progressPercent: 0 } : o
        ),
      });
    }
  },

  completeReturn: async (orderId) => {
    try {
      await callCompleteReturn(orderId);
    } catch (e) {
      console.warn('completeReturn failed', e);
    }
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, status: 'completed', progressPercent: 100 } : o
      ),
    });
  },

  markNotificationRead: (id) => {
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) void markNotificationReadRemote(uid, id).catch(() => {});
  },

  markAllNotificationsRead: () => {
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) void markAllNotificationsReadRemote(uid).catch(() => {});
  },

  addReview: (review) => {
    const entry: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      dateLabel: 'Just now',
      userName: get().user?.name ?? 'You',
      userId: get().user?.id,
      createdAt: new Date().toISOString(),
    };
    set({ reviews: [entry, ...get().reviews] });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) {
      void createReviewDoc({
        ...entry,
        userId: uid,
        createdAt: entry.createdAt!,
      }).catch(() => {});
    }
  },

  loadReviews: async () => {
    try {
      const reviews = await fetchReviews();
      if (reviews.length) set({ reviews });
    } catch {
      /* keep local */
    }
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

async function openRazorpayCheckout(opts: {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderId: string;
  name: string;
  phone: string;
}) {
  await loadRazorpayScript();
  const RazorpayCtor = (window as unknown as { Razorpay: new (o: object) => { open: () => void } }).Razorpay;
  await new Promise<void>((resolve, reject) => {
    const rzp = new RazorpayCtor({
      key: opts.keyId,
      amount: opts.amount,
      currency: opts.currency,
      name: 'PlayPort',
      description: `Order ${opts.orderId}`,
      order_id: opts.razorpayOrderId,
      prefill: { name: opts.name, contact: opts.phone.replace(/\D/g, '').slice(-10) },
      handler: () => resolve(),
      modal: { ondismiss: () => reject(new Error('Payment dismissed')) },
    });
    rzp.open();
  });
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Razorpay requires web'));
      return;
    }
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export function useCartCount() {
  return useAppStore((s) => s.cart.reduce((n, i) => n + i.quantity, 0));
}

export function useCartTotals() {
  const cart = useAppStore((s) => s.cart);
  return calcCartTotals(cart);
}

// Silence unused CURRENT_USER if tree-shaken oddly
void CURRENT_USER;
