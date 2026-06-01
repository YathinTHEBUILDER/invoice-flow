import React from "react";

export const metadata = {
  title: "Grievance Policy | InvoiceFlow",
  description: "Platform grievance redressal guidelines and support contacts for Indian users.",
};

export default function GrievancePolicyPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">Grievance Policy</h1>
        <p className="text-muted-foreground font-medium">Last Updated: June 1, 2026</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">1. Grievance Redressal Mechanism</h2>
        <p className="text-muted-foreground leading-relaxed">
          At InvoiceFlow, we prioritize client satisfaction and platform integrity. If you face any issues, transaction conflicts, or account discrepancies, you can raise a complaint directly with our grievance desk.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">2. How to Raise a Complaint</h2>
        <p className="text-muted-foreground leading-relaxed">
          Complaints must be sent in writing via email. Please detail the following:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Your registered name and login email address.</li>
          <li>Specific transaction reference ID or invoice number (if applicable).</li>
          <li>Detailed description of the issue along with any transaction receipts or screenshots.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">3. Primary Escalation Support</h2>
        <p className="text-muted-foreground leading-relaxed">
          All issues should be directed to: <a href="mailto:invoiceflowindia@gmail.com" className="text-primary underline">invoiceflowindia@gmail.com</a>
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">4. Expected Response Timelines</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our support team follows a structured verification path to resolve queries:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Acknowledgment:</strong> Within 24 business hours of email receipt.</li>
          <li><strong>Resolution:</strong> We aim to investigate and address most technical or operational issues within 5 to 7 business days.</li>
          <li><strong>Complex Escalations:</strong> Disputes requiring third-party bank checks or buyer verification updates can take up to 14 business days. We will keep you updated.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">5. Issue Categories</h2>
        <p className="text-muted-foreground leading-relaxed">
          To help us expedite your request, please format your email subject with one of the following categories:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground font-medium">
          <li>[KYC] - Issues related to document uploads, rejections, or cooldown locks.</li>
          <li>[Wallet] - Failures in wallet top-ups, withdrawal status delays, or balance discrepancies.</li>
          <li>[Repayment] - Discrepancies with outstanding dues, UTR check status, or pre-closure requests.</li>
          <li>[Dispute] - Issues contesting invoice verification, double-billing claims, or buyer conflicts.</li>
        </ul>
      </section>
    </div>
  );
}
