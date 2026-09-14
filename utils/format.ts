export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatAddressLine(parts: {
  line1: string;
  line2?: string;
  area: string;
  city: string;
  pincode: string;
}): string {
  return [parts.line1, parts.line2, parts.area, `${parts.city} - ${parts.pincode}`]
    .filter(Boolean)
    .join(', ');
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'CONFIRMED';
    case 'preparing':
      return 'PREPARING';
    case 'out_for_delivery':
      return 'OUT FOR DELIVERY';
    case 'delivered':
      return 'DELIVERED';
    case 'active':
      return 'ACTIVE';
    case 'returning':
      return 'RETURNING';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    case 'refunded':
      return 'REFUNDED';
    default:
      return status.toUpperCase();
  }
}

export function generateOrderId(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `PLP-${n}`;
}

export function searchProducts<
  T extends { name: string; shortName: string; tags: string[]; description: string; categoryId: string },
>(query: string, products: T[]): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => {
    const hay = `${p.name} ${p.shortName} ${p.description} ${p.tags.join(' ')} ${p.categoryId}`.toLowerCase();
    return hay.includes(q) || q.split(/\s+/).every((token) => hay.includes(token));
  });
}

export function calcCartTotals(items: { unitPrice: number; quantity: number }[]) {
  const itemsTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxes = items.length ? Math.round(itemsTotal * 0.05) : 0;
  const sanitization = 0;
  const delivery = 0;
  const deposit = 0;
  const total = itemsTotal + taxes + sanitization + delivery + deposit;
  return { itemsTotal, taxes, sanitization, delivery, deposit, total, count: items.reduce((s, i) => s + i.quantity, 0) };
}
