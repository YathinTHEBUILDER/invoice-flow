import { formatINR } from "./utils";

/**
 * Calculates the outstanding balance for an invoice based on scheduled repayments.
 */
export function calculateOutstandingBalance(repayments: any[]) {
  return repayments.reduce((sum, r) => {
    if (r.status !== "paid") {
      return sum + Number(r.amount_due) + Number(r.penalty_amount || 0) - Number(r.amount_paid || 0);
    }
    return sum;
  }, 0);
}

/**
 * Calculates pre-closure amount.
 * Formula: Outstanding Principal + (2% of Outstanding Principal as pre-closure fee)
 */
export function calculatePreClosureDetails(repayments: any[]) {
  const outstandingPrincipal = repayments.reduce((sum, r) => {
    if (r.status !== "paid") {
      // In a real system, we'd separate principal and interest. 
      // Here we treat amount_due as the total to be settled.
      return sum + Number(r.amount_due) - Number(r.amount_paid || 0);
    }
    return sum;
  }, 0);

  const preClosureFeeRate = 0.02; // 2%
  const preClosureFee = outstandingPrincipal * preClosureFeeRate;
  const totalSettlement = outstandingPrincipal + preClosureFee;

  return {
    outstandingPrincipal,
    preClosureFee,
    totalSettlement,
  };
}

/**
 * Formats a number to Indian Rupee with words for large amounts
 */
export function formatLargeINR(amount: number) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(amount);
}
