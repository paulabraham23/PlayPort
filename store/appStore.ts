import { create } from 'zustand';
import { PAYMENT_METHODS } from '@/constants/paymentMethods';
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
  fetchUserProfile,
  markAllNotificationsReadRemote,
  markNotificationReadRemote,
  replaceUserCart,
  upsertAddress,
  upsertCartItem,
  upsertUserProfile,
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
import { isPlaceholderName } from '@/utils/onboarding';
import {
  addonsTotal,
  computeAddonLines,
  defaultPlan,
  kitUnitPrice,
  normalizeProduct,
  resolveHours,
} from '@/utils/rentalPricing';
import type {
  Address,
  AppNotification,
  CartItem,
  PricingMode,
  Order,
  PaymentMethod,
  Review,
  User,
} from '@/types';
import type { Unsubscribe } from 'firebase/firestore';

export type AddToCartOptions = {
  planId?: string;
  pricingMode?: PricingMode;
  hours?: number;
  addons?: { id: string; quantity: number }[];
  quantity?: number;
  inventoryUnitId?: string;
  unitLabel?: string;
};

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
  updateUserProfile: (patch: Partial<User>) => Promise<void>;

  addProductToCart: (productId: string, options?: AddToCartOptions) => void;
  addExperienceToCart: (experienceId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  updateCartPlan: (
    cartItemId: string,
    patch: {
      planId?: string;
      pricingMode?: PricingMode;
      hours?: number;
      addons?: { id: string; quantity: number }[];
    }
  ) => void;
  /** @deprecated Use updateCartPlan */
  updateCartDuration: (cartItemId: string, planId: string) => void;
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

let ordersUnsub: Unsubscribe | null = null;
let notifUnsub: Unsubscribe | null = null;

function clearListeners() {
  ordersUnsub?.();
  notifUnsub?.();
  ordersUnsub = null;
  notifUnsub = null;
}

/** IDs previously auto-seeded from mock data — strip so profiles stay empty until real onboarding. */
const LEGACY_MOCK_ADDRESS_IDS = new Set(['addr-home', 'addr-office', 'addr-villa']);

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
  reviews: [],
  recentSearches: [],
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
      } catch (err) {
        // Don't wipe a valid Firebase session if profile hydrate flaked — keep signed in.
        console.warn('Auth bootstrap profile sync failed:', err);
        const phone = firebaseUser.phoneNumber ?? '';
        const signedIn = !firebaseUser.isAnonymous || phone.replace(/\D/g, '').length >= 10;
        if (!signedIn) {
          set({ authReady: true });
          return;
        }
        const existing = get().user;
        set({
          authReady: true,
          isAuthenticated: true,
          user:
            existing?.id === firebaseUser.uid
              ? existing
              : {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || 'PlayPort Member',
                  phone,
                  email: firebaseUser.email ?? '',
                  avatar:
                    firebaseUser.photoURL ||
                    `https://api.dicebear.com/7.x/avataaars/png?seed=${firebaseUser.uid}`,
                  kycVerified: false,
                  sessionsCount: 0,
                  homeHub: 'PlayPort',
                  onboardingComplete: false,
                },
        });
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

      const legacy = addresses.filter((a) => LEGACY_MOCK_ADDRESS_IDS.has(a.id));
      const realAddresses = addresses.filter((a) => !LEGACY_MOCK_ADDRESS_IDS.has(a.id));
      if (legacy.length) {
        void Promise.all(legacy.map((a) => deleteAddressDoc(userId, a.id))).catch(() => {});
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
        void upsertUserProfile(userId, {
          homeHubId: hub.id,
          homeHub: patched.homeHub,
        });
      }

      set({
        cart,
        addresses: realAddresses,
        selectedAddressId:
          realAddresses.find((a) => a.isDefault)?.id ?? realAddresses[0]?.id ?? null,
        orders,
        notifications,
        reviews,
      });

      // Heal profiles that finished setup before onboardingComplete was reliable.
      const healed = get().user;
      if (
        healed &&
        !healed.onboardingComplete &&
        !isPlaceholderName(healed.name) &&
        realAddresses.length > 0
      ) {
        const next = { ...healed, onboardingComplete: true };
        set({ user: next });
        void upsertUserProfile(userId, { onboardingComplete: true }).catch(() => {});
      }
    } catch (e) {
      console.warn('hydrateUserData failed', e);
      set({
        addresses: [],
        selectedAddressId: null,
        orders: [],
        notifications: [],
        reviews: [],
      });
    }
  },

  updateUserProfile: async (patch) => {
    const user = get().user;
    if (!user?.id) return;
    const next = { ...user, ...patch };
    set({ user: next });
    await upsertUserProfile(user.id, patch);
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
    // Re-read profile after hydrate heal so OTP routing sees sticky onboardingComplete.
    const fresh = await fetchUserProfile(user.id);
    if (fresh) {
      set({
        user: {
          ...get().user!,
          ...fresh,
          id: user.id,
          onboardingComplete: Boolean(fresh.onboardingComplete || get().user?.onboardingComplete),
        },
      });
    }
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

  addProductToCart: (productId, options = {}) => {
    const raw = useCatalogStore.getState().products.find((p) => p.id === productId);
    if (!raw) return;
    const product = normalizeProduct(raw);
    const quantity = options.quantity ?? 1;
    const pricingMode: PricingMode = options.pricingMode ?? 'package';
    const plan =
      pricingMode === 'hourly'
        ? null
        : product.plans.find((p) => p.id === options.planId) ?? defaultPlan(product);
    const planId = pricingMode === 'hourly' ? 'hourly' : plan?.id ?? '12h';
    const hours = resolveHours(product, pricingMode, planId, options.hours);
    const unitPrice = kitUnitPrice(product, pricingMode, planId, hours);
    const addonLines = computeAddonLines(product, hours, options.addons ?? []);
    const extras = addonsTotal(addonLines);
    const durationLabel =
      pricingMode === 'hourly'
        ? `${hours}h hourly`
        : plan?.label ?? planId;
    const key = `${productId}-${pricingMode}-${planId}-${hours}-${options.inventoryUnitId ?? ''}-${addonLines.map((a) => `${a.id}:${a.quantity}`).join(',')}`;
    const existing = get().cart.find(
      (c) =>
        c.productId === productId &&
        c.pricingMode === pricingMode &&
        c.planId === planId &&
        c.hours === hours &&
        (c.inventoryUnitId ?? '') === (options.inventoryUnitId ?? '') &&
        JSON.stringify(c.addons ?? []) === JSON.stringify(addonLines)
    );
    let next: CartItem[];
    if (existing) {
      next = get().cart.map((c) =>
        c.id === existing.id ? { ...c, quantity: c.quantity + quantity } : c
      );
    } else {
      const item: CartItem = {
        id: `cart-${key}-${Date.now()}`,
        productId,
        name: product.shortName,
        image: product.images[0],
        categoryLabel: product.categoryId.replace('-', ' ').toUpperCase(),
        planId,
        durationId: planId,
        durationLabel,
        hours,
        pricingMode,
        unitPrice,
        addons: addonLines,
        addonsTotal: extras,
        inventoryUnitId: options.inventoryUnitId,
        unitLabel: options.unitLabel,
        quantity,
        includesNote: options.unitLabel
          ? `${options.unitLabel}${product.includes[0]?.detail ? ` · ${product.includes[0].detail}` : ''}`
          : product.includes[0]?.detail,
      };
      next = [...get().cart, item];
    }
    set({ cart: next });
    const uid = get().user?.id;
    if (uid && get().isAuthenticated) {
      const item = next.find(
        (c) =>
          c.productId === productId &&
          c.planId === planId &&
          c.hours === hours &&
          c.pricingMode === pricingMode
      );
      if (item) void upsertCartItem(uid, item).catch(() => {});
    }
  },

  addExperienceToCart: (experienceId) => {
    const exp = useCatalogStore.getState().experiences.find((e) => e.id === experienceId);
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
        planId: 'combo',
        durationId: 'combo',
        durationLabel: exp.durationLabel.replace('/', '').trim() || 'Night',
        hours: 12,
        pricingMode: 'package',
        unitPrice: exp.price,
        addons: [],
        addonsTotal: 0,
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

  updateCartPlan: (cartItemId, patch) => {
    const products = useCatalogStore.getState().products;
    set({
      cart: get().cart.map((c) => {
        if (c.id !== cartItemId || !c.productId) return c;
        const raw = products.find((p) => p.id === c.productId);
        if (!raw) return c;
        const product = normalizeProduct(raw);
        const pricingMode = patch.pricingMode ?? c.pricingMode ?? 'package';
        const planId =
          pricingMode === 'hourly'
            ? 'hourly'
            : patch.planId ?? c.planId ?? defaultPlan(product)?.id ?? '12h';
        const hours = resolveHours(product, pricingMode, planId, patch.hours ?? c.hours);
        const unitPrice = kitUnitPrice(product, pricingMode, planId, hours);
        const selected =
          patch.addons ??
          (c.addons ?? []).map((a) => ({ id: a.id, quantity: a.quantity }));
        const addonLines = computeAddonLines(product, hours, selected);
        const extras = addonsTotal(addonLines);
        const plan = product.plans.find((p) => p.id === planId);
        return {
          ...c,
          planId,
          durationId: planId,
          pricingMode,
          hours,
          durationLabel:
            pricingMode === 'hourly' ? `${hours}h hourly` : plan?.label ?? planId,
          unitPrice,
          addons: addonLines,
          addonsTotal: extras,
        };
      }),
    });
    get().syncCartRemote();
  },

  updateCartDuration: (cartItemId, planId) => {
    get().updateCartPlan(cartItemId, { planId, pricingMode: 'package' });
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
    const { cart, addresses, selectedAddressId, selectedPaymentMethodId, paymentMethods, user, pendingOrderId } =
      get();
    if (!user?.id) return { ok: false, error: 'Sign in required' };

    const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
    if (!address?.line1 && !address?.area) {
      return { ok: false, error: 'Add a delivery address before paying' };
    }

    const payment = paymentMethods.find((p) => p.id === selectedPaymentMethodId);
    const totals = calcCartTotals(cart);
    const hub = useCatalogStore.getState().hub;
    const hubId = user.homeHubId || hub?.id;

    // Snapshot cart so we can restore if payment fails after booking.
    const cartSnapshot = cart.map((c) => ({ ...c }));

    try {
      let orderId = pendingOrderId ?? undefined;
      let bookingOrder: Order | undefined;

      // Resume unpaid hold if we already created a booking this session.
      if (!orderId) {
        if (!cartSnapshot.length) return { ok: false, error: 'Cart is empty' };
        const booking = await callCreateBooking({
          hubId,
          cart: cartSnapshot,
          addressLabel: address.label || 'Home',
          addressFull: [
            address.line1,
            address.line2,
            address.area,
            address.city,
            address.pincode,
          ]
            .filter(Boolean)
            .join(', '),
          paymentMethodLabel: payment?.label ?? 'UPI',
          subtotal: totals.itemsTotal,
          taxes: totals.taxes,
          total: totals.total,
          startAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        });
        orderId = booking.orderId;
        bookingOrder = booking.order as Order;
        set({
          pendingOrderId: orderId,
          orders: [bookingOrder, ...get().orders.filter((o) => o.id !== orderId)],
        });
      }

      const rzp = await callCreateRazorpayOrder(orderId!);
      const useDemo = Boolean(rzp.demo || !rzp.keyId);

      if (useDemo) {
        const paid = await callConfirmPayment(orderId!, fail);
        if (!paid.ok) {
          set({
            paymentError: paid.error ?? 'Payment failed',
            // Keep cart so user can retry or rebuild
            cart: get().cart.length ? get().cart : cartSnapshot,
          });
          return { ok: false, error: paid.error ?? 'Payment failed', orderId };
        }
      } else if (typeof window !== 'undefined') {
        await openRazorpayCheckout({
          keyId: rzp.keyId,
          amount: rzp.amount,
          currency: rzp.currency,
          razorpayOrderId: rzp.razorpayOrderId,
          orderId: orderId!,
          name: user.name,
          phone: user.phone,
        });
        await callConfirmPayment(orderId!, false);
      } else {
        await callConfirmPayment(orderId!, fail);
      }

      // Success — clear cart only now (server cart already cleared on createBooking)
      set({
        cart: [],
        lastOrderId: orderId!,
        paymentError: null,
        pendingOrderId: null,
        orders: get().orders.map((o) =>
          o.id === orderId
            ? { ...o, paymentStatus: 'paid', progressPercent: 20, status: 'confirmed' }
            : o
        ),
      });
      return { ok: true, orderId };
    } catch (e) {
      const message = formatFunctionsError(e);
      set({
        paymentError: message,
        cart: get().cart.length ? get().cart : cartSnapshot,
      });
      return { ok: false, error: message, orderId: get().pendingOrderId ?? undefined };
    }
  },

  cancelOrder: async (orderId, reason) => {
    await callCancelBooking(orderId, reason);
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled', progressPercent: 0 } : o
      ),
    });
  },

  completeReturn: async (orderId) => {
    await callCompleteReturn(orderId);
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
      set({ reviews });
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
