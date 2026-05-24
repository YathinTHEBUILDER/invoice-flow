import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function FooterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#05070A] selection:bg-blue-500/30 overflow-hidden font-sans relative">
      <Navbar />
      
      {/* Background ambient grid layout */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 right-0 h-[800px] w-full hero-gradient pointer-events-none -z-10 opacity-25" />
      <div className="absolute top-0 right-[15%] w-[450px] h-[450px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-24 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
