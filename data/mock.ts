import { colors } from '@/constants/theme';
import type {
  Address,
  AppNotification,
  Category,
  Experience,
  HubInfo,
  Order,
  PaymentMethod,
  Product,
  RentalDuration,
  Review,
  User,
} from '@/types';

export const HUB: HubInfo = {
  name: 'Indiranagar Dark Hub',
  sector: 'ACTIVE SECTOR • Dark Store #04',
  etaMinutes: 30,
  statusLabel: '30-45m dropoff active • Express gear dispatch',
};

export const LOCATION_LABEL = 'Indiranagar, 100ft Rd';

export const DURATIONS: RentalDuration[] = [
  { id: '6h', label: '6 Hours', hours: 6, description: 'Quick match or party slot' },
  { id: '12h', label: '12 Hours', hours: 12, description: 'All-night raid special', popular: true },
  { id: '24h', label: '24 Hours', hours: 24, description: 'Full day marathon session' },
  { id: 'weekend', label: 'Weekend Pass', hours: 48, description: 'Fri 7 PM - Sun 11 PM' },
];

export const CATEGORIES: Category[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    shortName: 'Gaming',
    description: 'Consoles ready to play',
    accent: colors.categories.gaming,
    icon: 'game-controller-outline',
    setupsReady: 8,
    etaMinutes: 30,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80',
  },
  {
    id: 'vr',
    name: 'VR',
    shortName: 'VR',
    description: 'Immersive headsets',
    accent: colors.categories.vr,
    icon: 'glasses-outline',
    setupsReady: 3,
    etaMinutes: 35,
    image: 'https://images.unsplash.com/photo-1622979135225-d2cd26462be2?w=600&q=80',
  },
  {
    id: 'racing',
    name: 'Racing',
    shortName: 'Racing',
    description: 'Sim wheels & pedals',
    accent: colors.categories.racing,
    icon: 'car-sport-outline',
    setupsReady: 2,
    etaMinutes: 40,
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&q=80',
  },
  {
    id: 'movie-nights',
    name: 'Projectors',
    shortName: 'Projector',
    description: 'Smart home cinema',
    accent: colors.categories.movieNights,
    icon: 'film-outline',
    setupsReady: 4,
    etaMinutes: 35,
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&q=80',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'ps5',
    name: 'PlayStation 5 + 2 DualSense Controllers',
    shortName: 'PS5',
    description:
      'Sanitized PS5 console kit with twin DualSense controllers, HDMI, and ready-to-play setup.',
    categoryId: 'gaming',
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=900&q=80',
      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=900&q=80',
    ],
    priceByDuration: { '6h': 699, '12h': 999, '24h': 1399, weekend: 2499 },
    rating: 4.9,
    reviewCount: 210,
    tags: ['CONSOLE', 'Zero Deposit'],
    badge: 'In stock',
    etaMinutes: 30,
    availabilityLabel: '4 units ready',
    includes: [
      { title: 'PS5 Console', detail: 'UV-sanitized and pre-tested', tag: 'Console' },
      { title: '2 DualSense Controllers', detail: 'Fully charged', tag: 'Pair' },
      { title: 'HDMI + Power', detail: 'Braided HDMI and power cable' },
    ],
    requirements: ['HDMI TV or monitor', 'Power outlet'],
    popular: true,
    featured: true,
  },
  {
    id: 'ps4',
    name: 'PlayStation 4 + 2 Controllers',
    shortName: 'PS4',
    description: 'Reliable PS4 kit with two DualShock controllers — great for classic multiplayer nights.',
    categoryId: 'gaming',
    images: ['https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=900&q=80'],
    priceByDuration: { '6h': 449, '12h': 649, '24h': 899, weekend: 1599 },
    rating: 4.7,
    reviewCount: 164,
    tags: ['CONSOLE'],
    etaMinutes: 30,
    availabilityLabel: '4 units ready',
    includes: [
      { title: 'PS4 Console', detail: 'Sanitized and tested', tag: 'Console' },
      { title: '2 DualShock Controllers', detail: 'Charged and paired', tag: 'Pair' },
      { title: 'HDMI + Power', detail: 'Plug-and-play cables' },
    ],
    popular: true,
  },
  {
    id: 'meta-quest-2',
    name: 'Meta Quest 2 VR Headset',
    shortName: 'Meta Quest 2',
    description: 'Standalone VR headset, sanitized and charged, with controllers ready for party experiences.',
    categoryId: 'vr',
    images: ['https://images.unsplash.com/photo-1622979135225-d2cd26462be2?w=900&q=80'],
    priceByDuration: { '6h': 599, '12h': 799, '24h': 1099, weekend: 1899 },
    rating: 4.8,
    reviewCount: 98,
    tags: ['VR'],
    etaMinutes: 35,
    availabilityLabel: '3 units ready',
    includes: [
      { title: 'Meta Quest 2', detail: 'UV-sanitized headset', tag: '128GB' },
      { title: 'Touch Controllers', detail: 'Paired and charged' },
      { title: 'Charging Cable', detail: 'USB-C fast charge cable' },
    ],
    popular: true,
  },
  {
    id: 'ferrari-thrustmaster',
    name: 'Ferrari Thrustmaster Steering Wheel',
    shortName: 'Ferrari Thrustmaster',
    description:
      'Ferrari-licensed Thrustmaster racing wheel with pedals — force-feedback ready for console racing.',
    categoryId: 'racing',
    images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&q=80'],
    priceByDuration: { '6h': 799, '12h': 1099, '24h': 1499, weekend: 2499 },
    rating: 4.85,
    reviewCount: 54,
    tags: ['RACING'],
    badge: 'Limited',
    etaMinutes: 40,
    availabilityLabel: '2 units ready',
    includes: [
      { title: 'Thrustmaster Wheel', detail: 'Ferrari edition wheel rim', tag: 'Wheel' },
      { title: 'Pedal Set', detail: 'Accelerator + brake pedals' },
      { title: 'Mounting Clamp', detail: 'Desk / table clamp included' },
    ],
    popular: true,
  },
  {
    id: 'lifelong-projector',
    name: 'Lifelong Smart Projector',
    shortName: 'Lifelong Smart Projector',
    description: 'Smart portable projector for movies, sports, and presentations — sanitized and cast-ready.',
    categoryId: 'movie-nights',
    images: ['https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=900&q=80'],
    priceByDuration: { '6h': 549, '12h': 749, '24h': 999, weekend: 1699 },
    rating: 4.6,
    reviewCount: 72,
    tags: ['PROJECTOR'],
    etaMinutes: 35,
    availabilityLabel: '4 units ready',
    includes: [
      { title: 'Lifelong Smart Projector', detail: 'Pre-tested optics and speakers', tag: 'Smart' },
      { title: 'Remote + HDMI', detail: 'Remote, HDMI cable, power adapter' },
    ],
    popular: true,
    featured: true,
  },
];

/** Experiences paused — catalog is product-only for now. */
export const EXPERIENCES: Experience[] = [];

export const CURRENT_USER: User = {
  id: 'user-1',
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  email: 'rahul.sharma@email.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  kycVerified: true,
  sessionsCount: 4,
  homeHub: 'Indiranagar',
};

export const ADDRESSES: Address[] = [
  {
    id: 'addr-home',
    label: 'Home',
    type: 'home',
    line1: 'Flat 402, Skyline Heights',
    line2: '100ft Rd',
    area: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    contactName: 'Rahul',
    phone: '9876543210',
    instructions: 'Leave at door if not answering',
    isDefault: true,
    etaMinutes: 28,
    inRapidZone: true,
  },
  {
    id: 'addr-office',
    label: 'Office / Studio',
    type: 'work',
    line1: '3rd Floor, Creator Loft',
    line2: '12th Main Rd, HAL 2nd Stage',
    area: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560008',
    contactName: 'Rahul',
    phone: '9876543210',
    instructions: 'Reception handover',
    isDefault: false,
    etaMinutes: 35,
    inRapidZone: true,
  },
  {
    id: 'addr-villa',
    label: 'Weekend Villa',
    type: 'other',
    line1: 'Villa 14, Palm Meadows',
    line2: '',
    area: 'Whitefield',
    city: 'Bengaluru',
    pincode: '560066',
    contactName: 'Rahul',
    phone: '9876543210',
    instructions: 'Friend\'s place — call on arrival',
    isDefault: false,
    etaMinutes: 90,
    inRapidZone: false,
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-upi',
    type: 'upi',
    label: 'UPI Apps',
    subtitle: 'Google Pay, PhonePe, Paytm, CRED UPI',
    recommended: true,
  },
  {
    id: 'pay-card',
    type: 'card',
    label: 'Credit / Debit Cards',
    subtitle: 'Tokenized & secure per RBI directives',
    brand: 'VISA',
    last4: '4242',
  },
  {
    id: 'pay-net',
    type: 'netbanking',
    label: 'Net Banking',
    subtitle: 'HDFC, ICICI, SBI, Axis & 40+ others',
  },
  {
    id: 'pay-cod',
    type: 'cod',
    label: 'Pay on Delivery (Doorstep QR)',
    subtitle: 'Inspect gear at arrival, then scan to pay',
  },
];

export const ORDERS: Order[] = [
  {
    id: 'PLP-89214',
    status: 'out_for_delivery',
    createdAt: new Date().toISOString(),
    etaLabel: '7:45 PM',
    addressLabel: 'Home',
    addressFull: 'Flat 402, Skyline Heights, 100ft Rd, Indiranagar',
    items: [
      {
        productId: 'ps5',
        name: 'PlayStation 5',
        image: PRODUCTS[0].images[0],
        durationLabel: '12h Overnight Pass',
        returnLabel: 'Returns tomorrow 11:00 AM',
        price: 999,
        badges: ['+2 Controllers'],
      },
      {
        productId: 'lifelong-projector',
        name: 'Lifelong Smart Projector',
        image: PRODUCTS[4].images[0],
        durationLabel: '12h Overnight Pass',
        returnLabel: 'Returns tomorrow 11:00 AM',
        price: 749,
      },
    ],
    subtotal: 1748,
    taxes: 87,
    total: 1835,
    paymentMethodLabel: 'UPI / AXIS',
    progressPercent: 80,
    riderName: 'Vikram S.',
    riderDistanceKm: 1.4,
    setupIncluded: true,
    liveDispatch: true,
  },
  {
    id: 'PLP-88102',
    status: 'completed',
    createdAt: '2024-09-02T19:00:00.000Z',
    etaLabel: 'Delivered',
    addressLabel: 'Home',
    addressFull: 'Flat 402, Skyline Heights, Indiranagar',
    items: [
      {
        productId: 'meta-quest-2',
        name: 'Meta Quest 2',
        image: PRODUCTS[2].images[0],
        durationLabel: 'Night Pass',
        returnLabel: 'Returned & verified',
        price: 799,
      },
    ],
    subtotal: 799,
    taxes: 0,
    total: 799,
    paymentMethodLabel: 'UPI',
    progressPercent: 100,
    setupIncluded: true,
  },
  {
    id: 'PLP-87441',
    status: 'completed',
    createdAt: '2024-08-21T18:00:00.000Z',
    etaLabel: 'Completed',
    addressLabel: 'Office / Studio',
    addressFull: 'Creator Loft, Indiranagar',
    items: [
      {
        productId: 'ps4',
        name: 'PlayStation 4',
        image: PRODUCTS[1].images[0],
        durationLabel: 'Evening Slot',
        returnLabel: 'Returned',
        price: 649,
      },
    ],
    subtotal: 649,
    taxes: 0,
    total: 649,
    paymentMethodLabel: 'Card',
    progressPercent: 100,
    setupIncluded: false,
  },
  {
    id: 'PLP-86011',
    status: 'refunded',
    createdAt: '2024-08-10T17:00:00.000Z',
    etaLabel: 'Refunded',
    addressLabel: 'Home',
    addressFull: 'Flat 402, Skyline Heights, Indiranagar',
    items: [
      {
        productId: 'ferrari-thrustmaster',
        name: 'Ferrari Thrustmaster Steering Wheel',
        image: PRODUCTS[3].images[0],
        durationLabel: 'Day Pass',
        returnLabel: 'Cancelled before dispatch',
        price: 1099,
      },
    ],
    subtotal: 1099,
    taxes: 0,
    total: 1099,
    paymentMethodLabel: 'UPI',
    progressPercent: 0,
    setupIncluded: false,
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'ps5',
    userName: 'Arjun K.',
    rating: 5,
    dateLabel: 'Yesterday',
    text: 'Delivered in Indiranagar fast. Controllers were clean and ready to play.',
  },
  {
    id: 'rev-2',
    productId: 'lifelong-projector',
    userName: 'Meera S.',
    rating: 5,
    dateLabel: '3 days ago',
    text: 'Projector looked sharp for movie night. Setup was quick.',
  },
  {
    id: 'rev-3',
    productId: 'meta-quest-2',
    orderId: 'PLP-88102',
    userName: 'Rahul Sharma',
    rating: 5,
    dateLabel: 'Sep 3',
    text: 'Quest 2 was sanitized and charged. Great party session.',
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Order confirmed',
    body: 'PLP-89214 is being packed at Indiranagar Dark Hub.',
    timeLabel: '12 mins ago',
    type: 'order',
    read: false,
  },
  {
    id: 'n2',
    title: 'Rider en route',
    body: 'Vikram S. is 1.4 km away with your entertainment gear.',
    timeLabel: '4 mins ago',
    type: 'delivery',
    read: false,
  },
  {
    id: 'n3',
    title: 'Return reminder',
    body: 'PS5 overnight pass returns tomorrow at 11:00 AM.',
    timeLabel: '1 hr ago',
    type: 'reminder',
    read: true,
  },
  {
    id: 'n4',
    title: 'KYC active',
    body: 'DigiLocker verification keeps your deposit at ₹0.',
    timeLabel: 'Yesterday',
    type: 'account',
    read: true,
  },
];

export const RECENT_SEARCHES = ['PS5', 'PS4', 'Meta Quest 2', 'Projector'];

export const POPULAR_SEARCHES = [
  { id: 'ps5', label: 'PlayStation 5', priceLabel: '₹999/12h', eta: '30m' },
  { id: 'ps4', label: 'PlayStation 4', priceLabel: '₹649/12h', eta: '30m' },
  { id: 'meta-quest-2', label: 'Meta Quest 2', priceLabel: '₹799/12h', eta: '35m' },
  { id: 'ferrari-thrustmaster', label: 'Ferrari Thrustmaster...', priceLabel: '₹1,099/12h', eta: '40m' },
  { id: 'lifelong-projector', label: 'Lifelong Smart Project...', priceLabel: '₹749/12h', eta: '35m' },
];

export const TRENDING_VIBES = [
  { id: 'ps5', emoji: '🎮', title: 'PS5 Night', subtitle: 'Console + 2 pads' },
  { id: 'lifelong-projector', emoji: '📽️', title: 'Projector Night', subtitle: 'Lifelong smart' },
];

export const HELP_TOPICS = [
  { id: 'orders', title: 'Orders & Tracking', subtitle: 'Status, ETA, and setup help' },
  { id: 'cancellation', title: 'Cancellation & Refunds', subtitle: 'Policies before dispatch' },
  { id: 'delivery', title: 'Delivery & Returns', subtitle: 'Dropoff, pickup, white-glove' },
  { id: 'payments', title: 'Payments & Deposits', subtitle: 'UPI, cards, zero deposit' },
  { id: 'products', title: 'Product Issues', subtitle: 'Hardware, games, accessories' },
  { id: 'faqs', title: 'FAQs', subtitle: 'Common questions answered' },
];

export const FAQS = [
  {
    q: 'How fast is delivery?',
    a: 'Most Indiranagar & Koramangala orders arrive in 30–45 minutes with doorstep setup.',
  },
  {
    q: 'Is there a security deposit?',
    a: 'With DigiLocker KYC, security deposit is ₹0 for eligible customers.',
  },
  {
    q: 'Can I cancel?',
    a: 'Free cancellation is supported before equipment leaves the dark hub facility.',
  },
  {
    q: 'How do returns work?',
    a: 'Leave gear assembled. Our specialist handles unhooking and pickup at your return time.',
  },
];
