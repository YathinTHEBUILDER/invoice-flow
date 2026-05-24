"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Faq {
  persona: "MSME" | "Investor";
  question: string;
  answer: string;
}

const FAQ_DATA: Faq[] = [
  {
    persona: "MSME",
    question: "How long does it take to receive funding?",
    answer: "Typically 24–48 hours after your invoice passes our manual review. Our team reviews documents within one business day."
  },
  {
    persona: "MSME",
    question: "What documents do I need to submit?",
    answer: "GST invoice, buyer PO or agreement, 6-month bank statement, and your company's GST registration certificate."
  },
  {
    persona: "MSME",
    question: "Is there a minimum invoice value?",
    answer: "Yes — we currently accept invoices of ₹2 Lakh and above. There is no upper limit."
  },
  {
    persona: "Investor",
    question: "How is my capital protected?",
    answer: "All assets are 100% secured by verified invoices. We do not invest in unsecured debt. Our 0.12% historical default rate reflects our thorough manual review."
  },
  {
    persona: "Investor",
    question: "What happens if an MSME defaults?",
    answer: "InvoiceFlow initiates recovery proceedings against the corporate buyer (not the MSME). We also maintain a safety fund for investor protection."
  },
  {
    persona: "Investor",
    question: "When do I receive my returns?",
    answer: "On the invoice due date, principal + yield is transferred to your registered bank account within 24 hours of buyer payment."
  }
];

function FaqItem({ faq }: { faq: Faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-dark border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-center gap-4 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full shrink-0 ${
              faq.persona === "MSME"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {faq.persona}
          </span>
          <span className="font-bold text-base md:text-lg text-foreground tracking-tight">
            {faq.question}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-40 border-t border-white/5" : "max-h-0"
        }`}
      >
        <p className="p-6 text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export function FaqAccordion() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-32">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
          Common Questions
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Everything you need to know about the InvoiceFlow marketplace, whether you are raising capital or investing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FAQ_DATA.map((faq, i) => (
          <FaqItem key={i} faq={faq} />
        ))}
      </div>
    </section>
  );
}
