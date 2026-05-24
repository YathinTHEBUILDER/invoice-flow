"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";

interface CTASectionProps {
  user: User | null;
  role: string;
}

export function CTASection({ user, role }: CTASectionProps) {
  return (
    <section className="w-full relative px-4 py-20 md:py-24 overflow-hidden border-b border-white/[0.03] bg-[#080B10]/10">
      
      {/* Background soft blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/[0.03] blur-[150px] rounded-full pointer-events-none -z-10" />

      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-5xl mx-auto bg-gradient-to-b from-[#0D1117]/95 to-[#080B10]/98 rounded-[2rem] border border-white/[0.04] hover:border-blue-500/20 p-10 md:p-16 text-center space-y-6 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] transition-all duration-500"
      >
        
        {/* Soft corner glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/[0.02] blur-[100px] rounded-full group-hover:bg-blue-600/[0.04] transition-all duration-1000" />
        
        {/* Icon Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-12 h-12 rounded-xl bg-blue-500/5 flex items-center justify-center border border-blue-500/15 shadow-inner"
        >
          <ShieldCheck className="w-6 h-6 text-blue-400" />
        </motion.div>
        
        {/* Text */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
            Scale your working capital with verified invoice financing
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-normal">
            Join a professional receivables marketplace designed for secure supply chain transactions, fast manual auditing, and short maturity settlements.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          {user ? (
            <Button 
              size="lg" 
              asChild 
              className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 text-xs font-semibold rounded-lg shadow-md shadow-blue-600/10 active:scale-[0.98]"
            >
              <Link href={`/dashboard/${role}`}>
                Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                asChild 
                className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 text-xs font-semibold rounded-lg shadow-md shadow-blue-600/10 active:scale-[0.98]"
              >
                <Link href="/signup">
                  Create Account <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="h-10 px-6 bg-white/[0.02] border-white/5 hover:bg-white/5 transition-all duration-200 text-xs font-semibold text-white rounded-lg active:scale-[0.98]"
              >
                <Link href="/transparency">
                  Learn More
                </Link>
              </Button>
            </>
          )}
        </div>
        
      </motion.div>
    </section>
  );
}
