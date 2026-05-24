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
    <div className="space-y-12">
      <div className="space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold tracking-wide text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          The Flow
        </div>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-none text-white">
          Precision receivables.
        </h2>
        <p className="text-lg text-neutral-400 leading-relaxed">
          A seamless flow managing every invoice lifecycle from verification to automatic settlement.
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex bg-white/5 border border-white/10 rounded-full p-1 max-w-xs">
        <button
          onClick={() => setActiveTab("msme")}
          className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all rounded-full ${
            activeTab === "msme"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          For MSMEs
        </button>
        <button
          onClick={() => setActiveTab("investor")}
          className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all rounded-full ${
            activeTab === "investor"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          For Investors
        </button>
      </div>

      {/* Vertical Steps Timeline */}
      <div className="relative border-l border-white/5 pl-8 ml-3 space-y-10">
        {activeSteps.map((item) => (
          <div key={item.step} className="relative group/step text-left">
            {/* Timeline Bullet */}
            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center group-hover/step:border-primary/50 transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground group-hover/step:bg-primary transition-colors" />
            </div>
            
            <div className="space-y-1.5">
              <span className="text-xs font-semibold tracking-wider text-primary">Step {item.step}</span>
              <h3 className="text-lg font-bold tracking-tight text-white">{item.title}</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
