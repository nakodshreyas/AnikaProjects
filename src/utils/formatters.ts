/**
 * Format numbers into Indian Rupee format (e.g. ₹ 24,50,000 or ₹ 24.5 Lakhs)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakhs(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹ ${cr} Cr`;
  }
  const lakhs = (amount / 100000).toFixed(2);
  return `₹ ${lakhs} Lakhs`;
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function isValidIndianPhone(phone: string): boolean {
  const clean = sanitizePhoneNumber(phone);
  // Match 10 digit Indian mobile numbers (starts with 6, 7, 8, 9)
  return /^[6-9]\d{9}$/.test(clean);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
