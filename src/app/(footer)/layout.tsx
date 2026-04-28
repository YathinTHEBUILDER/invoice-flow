import React from "react";
import { Navbar } from "@/components/navbar";

export default function FooterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </main>
      
      {/* Re-using the same footer logic but simplified if needed, or I can just import a Footer component if I had one */}
      <footer className="w-full bg-background border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
          <p>© {new Date().getFullYear()} InvoiceFlow India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
