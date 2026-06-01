import React from "react";

export const metadata = {
  title: "Risk Disclosure | InvoiceFlow",
  description: "Understand the risks associated with invoice-backed capital investments on the InvoiceFlow marketplace.",
};

export default function RiskDisclosurePage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">Risk Disclosure</h1>
        <p className="text-muted-foreground font-medium">Last Updated: June 1, 2026</p>
      </div>

      <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 md:p-8 space-y-3">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Important Notice</h3>
        <p className="text-sm font-medium text-neutral-300 leading-relaxed">
          InvoiceFlow is a marketplace for invoice-backed opportunities. Investments carry repayment, delay, and default risk. Returns are not guaranteed. Please review each invoice and risk disclosure before allocating capital.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">1. Invoice-Backed Investments are Not Risk-Free</h2>
        <p className="text-muted-foreground leading-relaxed">
          Participating in invoice discounting involves purchasing corporate trade receivables at a discount. While the invoices are manually verified against physical purchase agreements and tax receipts, they represent trade transactions which are subject to commercial variables and default.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">2. Returns are Not Guaranteed</h2>
        <p className="text-muted-foreground leading-relaxed">
          The yield rates shown on the platform represent target expected returns. Actual outcomes may differ based on actual payment dates and default occurrences. There is no assurance or guarantee of return.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">3. Buyer Payment Delays</h2>
        <p className="text-muted-foreground leading-relaxed">
          Repayment timeline is directly linked to the buyer clearing the invoice. If the buyer delays repayment due to cash flow constraints, operational issues, or other disputes, payouts to investors will be delayed accordingly.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">4. Invoice Dispute Risks</h2>
        <p className="text-muted-foreground leading-relaxed">
          Invoices represent commercial trade, which can face disputes related to goods delivery timelines, quality of supplies, pricing reconciliations, or contractual terms. Any active dispute can delay or compromise buyer repayment.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">5. Manual Verification Limits</h2>
        <p className="text-muted-foreground leading-relaxed">
          While InvoiceFlow performs manual checks on MSME suppliers, tax registrations, e-way bills, and buyer acceptance, these procedures reduce risk but do not eliminate it. Investors must perform their own due diligence before allocating funds.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">6. Legal Status of the Platform</h2>
        <p className="text-muted-foreground leading-relaxed">
          InvoiceFlow is a technology platform and marketplace connecting corporate buyers, MSME sellers, and individual investors. InvoiceFlow is not a bank, NBFC, or financial institution. InvoiceFlow does not guarantee buyer repayment or provide deposit insurance.
        </p>
      </section>
    </div>
  );
}
