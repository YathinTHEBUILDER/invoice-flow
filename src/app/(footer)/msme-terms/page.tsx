import React from "react";

export const metadata = {
  title: "MSME Terms & Conditions | InvoiceFlow",
  description: "Terms and conditions governing Indian MSME suppliers on the InvoiceFlow marketplace.",
};

export default function MsmeTermsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">MSME Terms</h1>
        <p className="text-muted-foreground font-medium">Last Updated: June 1, 2026</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">1. Business Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          MSME sellers must represent registered corporate entities inside India with active GST registrations. You must be authorized to pledge trade receivables and enter into financing agreements.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">2. KYC Verification</h2>
        <p className="text-muted-foreground leading-relaxed">
          Full business registration checks, including GST logs, PAN details, and corporate registries are verified manually. Onboarding is dependent on successful completion of these audits.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">3. Invoice Document Accuracy</h2>
        <p className="text-muted-foreground leading-relaxed">
          MSMEs must upload genuine invoice PDFs, valid e-way bills, and clear purchase order documentation representing valid, unpaid B2B transactions. Information uploaded must reflect matching ledger records.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">4. Prohibition of Duplicate Invoices</h2>
        <p className="text-muted-foreground leading-relaxed">
          MSME users are strictly prohibited from submitting duplicate invoices, invoices that have already been settled or financed, or invoices that are subject to active commercial disputes.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">5. Manual Verification & Consent</h2>
        <p className="text-muted-foreground leading-relaxed">
          All listings are subject to manual reviews, duplicate checks, and direct confirmation queries to the corporate buyer. Invoices will not be listed in the marketplace without completed validation checks.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">6. Platform Discretion</h2>
        <p className="text-muted-foreground leading-relaxed">
          InvoiceFlow maintains final discretion over listing approval, financing thresholds, risk evaluations, and account suspensions. Approval is not an automatic right.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">7. Repayment & Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          MSMEs retain ultimate liability for the underlying invoice. In the event of buyer default, dispute, or non-payment, the MSME seller is responsible for resolving the commercial issues and ensuring the platform's escrow accounts are settled.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">8. Consequences of Misrepresentation</h2>
        <p className="text-muted-foreground leading-relaxed">
          Uploading false purchase orders, fake bills, or duplicate invoices will lead to permanent platform suspension, blacklisting from the network, and immediate legal proceedings for misrepresentation.
        </p>
      </section>
    </div>
  );
}
