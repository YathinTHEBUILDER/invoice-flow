import React from "react";

export const metadata = {
  title: "Refund & Wallet Policy | InvoiceFlow",
  description: "Guidelines regarding wallet balances, failed transactions, and withdrawal refund processing.",
};

export default function RefundPolicyPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">Refund & Wallet Policy</h1>
        <p className="text-muted-foreground font-medium">Last Updated: June 1, 2026</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">1. Wallet Top-up Auditing</h2>
        <p className="text-muted-foreground leading-relaxed">
          Balance top-ups in your platform wallet represent pre-allocated capital. All cash deposits are manually validated by our operations desk. Funds must originate from bank accounts matching the verified user's registration name.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">2. Failed Transactions</h2>
        <p className="text-muted-foreground leading-relaxed">
          If money is debited from your bank account but fails to reflect in your platform wallet, the amount is typically held by your originating bank or processing gateway. These funds are usually reverted by the bank automatically. If the transfer does not revert within 3 to 5 business days, please send your transaction receipt and bank statement to our support desk for manual reconciliation.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">3. Wallet Withdrawal Refunds</h2>
        <p className="text-muted-foreground leading-relaxed">
          Unallocated cash balances in your wallet can be withdrawn to your verified bank account at any time. Withdrawal requests are processed manually to ensure compliance. Payouts are dispatched within 24 to 48 business hours after manual verification. Instant withdrawals are not supported.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">4. Platform Transaction Fees</h2>
        <p className="text-muted-foreground leading-relaxed">
          Withdrawals or transfers can incur payment gateway processing fees which are visible during checkout. Transaction fees paid to intermediary payment processors are non-refundable once the transfer is executed.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">5. Duplicate Payment Resolutions</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you make a duplicate payment towards an outstanding repayment or top-up due to a network glitch, the extra amount will be credited to your platform wallet balance or can be manually refunded upon written request to support.
        </p>
      </section>

      <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
        <p className="text-sm font-medium text-primary">
          For wallet reconciliation or refund assistance, contact support: <a href="mailto:invoiceflowindia@gmail.com" className="underline">invoiceflowindia@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
