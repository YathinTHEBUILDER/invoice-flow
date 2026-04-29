import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined) {
  const val = amount === null || amount === undefined ? 0 : Number(amount);
  if (isNaN(val)) return "₹0";
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Formats numbers into Indian shorthand (Lakhs/Crores)
 */
export function formatIndianNumber(value: number | string | null | undefined) {
  const num = value === null || value === undefined ? 0 : Number(value);
  if (isNaN(num)) return "₹0";

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return formatCurrency(num);
}

export const formatINR = formatCurrency;

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
}
