export default function PrivacyPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground font-medium">Last Updated: April 28, 2026</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          InvoiceFlow India ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">2. Information We Collect</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Name, email address, and contact details during registration.</li>
            <li>KYC documents (Aadhaar, PAN, etc.) for identity verification.</li>
            <li>Financial information for transaction processing.</li>
            <li>Business details and invoice data for MSMEs.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">3. How We Use Your Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use your information to provide and improve our services, process transactions, verify identities, and comply with regulatory requirements. We do not sell your personal information to third parties.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">4. Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement bank-grade security measures, including end-to-end encryption and secure servers, to protect your data from unauthorized access or disclosure.
        </p>
      </section>

      <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
        <p className="text-sm font-medium text-primary">
          For any privacy-related concerns, please contact us at privacy@invoiceflow.in
        </p>
      </section>
    </div>
  );
}
