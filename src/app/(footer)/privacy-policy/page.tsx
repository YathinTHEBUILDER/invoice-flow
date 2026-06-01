import React from "react";

export const metadata = {
  title: "Privacy Policy | InvoiceFlow",
  description: "Privacy policy detailing data collection, storage security, and usage on the InvoiceFlow platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">Privacy Policy</h1>
        <p className="text-muted-foreground font-medium">Last Updated: June 1, 2026</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">1. Data Collected</h2>
        <p className="text-muted-foreground leading-relaxed">
          We collect personal and business information necessary to verify accounts and list opportunities. This includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Contact information: email address, telephone numbers, and business names.</li>
          <li>KYC documents: Aadhaar, PAN cards, cancelled cheques, and utility statements.</li>
          <li>Invoice details: B2B billing records, purchase orders, e-way bills, and logistics reports.</li>
          <li>Wallet records: transaction history, top-ups, allocations, and withdrawal ledgers.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">2. How Data is Used</h2>
        <p className="text-muted-foreground leading-relaxed">
          We utilize your data to authenticate identity credentials, manually review underlying invoices, manage active transactions, process bank payouts, and fulfill auditing obligations. We do not sell or lease user information to third-party marketing companies.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">3. Data Security & Storage</h2>
        <p className="text-muted-foreground leading-relaxed">
          All collected data is stored using secure cloud resources (such as Supabase) with access controls and encryption. Verification uploads are hosted in private storage buckets with no public access permissions.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">4. Third-Party Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          We integrate secure cloud database providers (Supabase) to handle data storage and system authorization. KYC validations are audited manually by our risk assessment team.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">5. User Rights</h2>
        <p className="text-muted-foreground leading-relaxed">
          You possess the right to inspect your uploaded information, request rectifications to mistakes, or suspend your account. Deletion requests are processed subject to ongoing financial settlement requirements and statutory audit record retention rules.
        </p>
      </section>

      <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
        <p className="text-sm font-medium text-primary">
          For privacy inquiries or data requests, please contact us at: <a href="mailto:invoiceflowindia@gmail.com" className="underline">invoiceflowindia@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
