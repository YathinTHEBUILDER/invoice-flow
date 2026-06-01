import React from "react";

export const metadata = {
  title: "Investor Terms & Conditions | InvoiceFlow",
  description: "Terms and conditions governing individual investor activity on the InvoiceFlow platform.",
};

export default function InvestorTermsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">Investor Terms</h1>
        <p className="text-muted-foreground font-medium">Last Updated: June 1, 2026</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">1. Investor Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          To register as an investor on InvoiceFlow, you must be a resident of India, possess a valid Permanent Account Number (PAN), a verified Indian bank account, and meet the KYC requirements. All participants must be at least 18 years old.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">2. KYC Requirement</h2>
        <p className="text-muted-foreground leading-relaxed">
          KYC verification is mandatory before deploying capital. You must upload genuine copies of identity proofs, bank accounts, and addresses. InvoiceFlow reserves the right to reject accounts failing manual KYC checks without disclosing specific reasons.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">3. Wallet Funding</h2>
        <p className="text-muted-foreground leading-relaxed">
          Investors add funds to their virtual wallet on the platform. These funds represent pre-allocated investment balance. Wallet additions are processed via secure payments and remain locked until deployed or successfully requested for withdrawal back to the user's verified bank account.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">4. Manual Investment Confirmation</h2>
        <p className="text-muted-foreground leading-relaxed">
          Every investment transaction requires the user to select the listing and manually trigger confirmation. No automated investment systems or algorithms are active on InvoiceFlow. Users choose assets based on self-determined risk tolerance.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">5. Acceptance of Investment Risk</h2>
        <p className="text-muted-foreground leading-relaxed">
          By allocating funds to any listing, the investor explicitly accepts that returns are not guaranteed and repayment depends entirely on the buyer paying the MSME. InvoiceFlow does not assume responsibility for defaults.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">6. Fees & Wallet Operations</h2>
        <p className="text-muted-foreground leading-relaxed">
          Platform margins are factored into the discounted values. Direct wallet withdrawal operations may incur flat transaction processing costs, which are shown to the user on the screen prior to confirming any transaction.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">7. Suspension for Misuse</h2>
        <p className="text-muted-foreground leading-relaxed">
          Any attempt to manipulate transaction logs, submit false verification requests, bypass security measures, or use the platform for unlawful transfers will lead to immediate account suspension and freezing of active wallet balances pending investigation.
        </p>
      </section>
    </div>
  );
}
