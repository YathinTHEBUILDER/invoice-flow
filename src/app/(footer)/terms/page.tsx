export default function TermsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground font-medium">Last Updated: April 28, 2026</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">1. Agreement to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using the InvoiceFlow platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">2. Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          You must be at least 18 years old and a resident of India to use our platform. MSMEs must be legally registered entities in India. Individual investors must comply with all local investment regulations.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">3. Marketplace Participation</h2>
        <p className="text-muted-foreground leading-relaxed">
          InvoiceFlow acts as a facilitator connecting MSMEs and individual investors. We do not provide financial advice, and all investment decisions are made at the sole discretion of the user. Past performance is not indicative of future returns.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">4. Fees & Charges</h2>
        <p className="text-muted-foreground leading-relaxed">
          InvoiceFlow charges a platform fee for its services, which is disclosed at the time of transaction. We reserve the right to modify our fee structure with prior notice.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">5. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          In no event shall InvoiceFlow be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.
        </p>
      </section>
    </div>
  );
}
