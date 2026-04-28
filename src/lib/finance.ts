/**
 * InvoiceFlow Official Financial Model Utility
 * Based on the spec provided by InvoiceFlow, Mysuru.
 */

export interface FinancialSummary {
  invoiceValue: number;
  discountRate: number; // e.g., 0.145 for 14.5%
  tenureDays: number;
  discountAmount: number;
  platformFee: number;
  msmeReceives: number;
  investorIn: number;
  investorOut: number;
  investorProfit: number;
  annualizedReturn: number;
}

/**
 * Calculates the full financial summary for a single investor scenario.
 */
export function calculateFinancials(
  invoiceValue: number,
  discountRate: number,
  tenureDays: number
): FinancialSummary {
  // Discount = Invoice Value x Rate x (Days / 365)
  const discountAmount = Math.round(invoiceValue * discountRate * (tenureDays / 365));

  // Platform Fee = Invoice Value x 1%
  const platformFee = Math.round(invoiceValue * 0.01);

  // MSME Receives = Invoice - Discount - Platform Fee
  const msmeReceives = invoiceValue - discountAmount - platformFee;

  // Investor Perspective
  const investorIn = invoiceValue - discountAmount;
  const investorOut = invoiceValue;
  const investorProfit = discountAmount;

  // Annualized Return for Investor
  // Formula: (Profit / Deployed) * (365 / Days)
  const annualizedReturn = (investorProfit / investorIn) * (365 / tenureDays);

  return {
    invoiceValue,
    discountRate,
    tenureDays,
    discountAmount,
    platformFee,
    msmeReceives,
    investorIn,
    investorOut,
    investorProfit,
    annualizedReturn,
  };
}

/**
 * Calculates investor-specific returns for a shared investment.
 */
export function calculateInvestorShare(
  invoiceValue: number,
  discountAmount: number,
  sharePercentage: number // e.g., 0.25 for 25%
) {
  const shareOfInvoice = invoiceValue * sharePercentage;
  const shareOfDiscount = discountAmount * sharePercentage;

  return {
    deploys: Math.round(shareOfInvoice - shareOfDiscount),
    earns: Math.round(shareOfDiscount),
    receives: Math.round(shareOfInvoice),
  };
}

/**
 * Ravi's Effective Rate Calculation (Internal use)
 */
export function calculateEffectiveMSMERate(
  invoiceValue: number,
  totalCost: number,
  tenureDays: number
) {
  return (totalCost / invoiceValue) * (365 / tenureDays);
}
