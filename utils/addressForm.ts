/** Human names for address fields that still block Save. */
export function missingAddressFields(f: {
  label: string;
  line1: string;
  area: string;
  city: string;
  pincode: string;
  contactName: string;
  phone: string;
}): string[] {
  const out: string[] = [];
  if (!f.label.trim()) out.push('a label');
  if (!f.line1.trim()) out.push('address line 1');
  if (!f.area.trim()) out.push('the area');
  if (!f.city.trim()) out.push('the city');
  if (f.pincode.replace(/\D/g, '').length < 6) out.push('a 6-digit pincode');
  if (!f.contactName.trim()) out.push('a contact name');
  if (f.phone.replace(/\D/g, '').length < 10) out.push('a 10-digit phone number');
  return out;
}

/** "a, b and c" */
export function listMissing(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
