"use client";

import { useState, useEffect } from "react";

interface Step {
  step: string;
  title: string;
  desc: string;
}

export function HowItWorksTabs() {
  const [activeTab, setActiveTab] = useState<"msme" | "investor">("msme");

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash === "#investors") {
        setActiveTab("investor");
      } else if (typeof window !== "undefined" && window.location.hash === "#how-it-works") {
        setActiveTab("msme");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const msmeSteps: Step[] = [
    {
      step: "01",
      title: "Manual Verification",
      desc: "MSMEs upload invoices; our verification team manually reviews document integrity and buyer limits."
    },
    {
      step: "02",
      title: "Marketplace Listing",
      desc: "Verified assets are listed with transparent duration and discount rates for investor evaluation."
    },
    {
      step: "03",
      title: "Smart Payout",
      desc: "Upon funding, money is paid out to the MSME, with automated payment on the invoice due date."
    }
  ];

  const investorSteps: Step[] = [
    {
      step: "01",
      title: "Browse Verified Assets",
      desc: "Explore manually reviewed invoices with transparent duration, buyer ratings, and discount rates."
    },
    {
      step: "02",
      title: "Set Aside Money",
      desc: "Invest in one or multiple invoices. Minimum ticket size ₹10,000. No lock-in beyond invoice duration."
    },
    {
      step: "03",
      title: "Collect on Due Date",
      desc: "Receive principal + yield directly to your bank account on invoice payment date."
    }
  ];

  const activeSteps = activeTab === "msme" ? msmeSteps : investorSteps;

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
          The Engine
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
          Precision <br />
          Money Flow.
        </h2>
        <p className="text-xl text-muted-foreground font-medium max-w-lg">
          Our platform manages the entire invoice lifecycle, from thorough credit review to secure payment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 w-full max-w-md">
        <button
          onClick={() => setActiveTab("msme")}
          className={`flex-1 pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === "msme"
              ? "text-primary font-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          For MSMEs
          {activeTab === "msme" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("investor")}
          className={`flex-1 pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === "investor"
              ? "text-primary font-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          For Investors
          {activeTab === "investor" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-10 relative min-h-[340px]">
        {activeSteps.map((item) => (
          <div key={item.step} className="flex gap-6 group animate-in fade-in duration-500">
            <div className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors duration-500 leading-none shrink-0">
              {item.step}
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
