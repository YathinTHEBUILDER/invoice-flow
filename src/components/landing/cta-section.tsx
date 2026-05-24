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
    <section className="w-full relative px-4 py-24 md:py-32 overflow-hidden border-b border-white/[0.03]">
      
      {/* Background Soft Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/[0.05] blur-[150px] rounded-full pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        whileHover={{ y: -4 }}
        className="max-w-5xl mx-auto bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 hover:border-blue-500/30 p-10 md:p-20 text-center space-y-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] transition-all duration-500"
      >
        
        {/* Soft Inner Shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 group-hover:border-white/10 transition-colors pointer-events-none" />
        
        {/* Soft corner glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/[0.05] blur-[100px] rounded-full group-hover:bg-blue-600/[0.1] transition-all duration-1000 pointer-events-none" />
        
        {/* Icon Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center border border-blue-500/20 shadow-inner relative z-10"
        >
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </motion.div>
        
        {/* Text */}
        <div className="space-y-4 max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Scale your working capital with verified invoice financing
          </h2>
          <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-medium">
            Join a professional receivables marketplace designed for secure supply chain transactions, fast manual auditing, and short maturity settlements.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 relative z-10">
          {user ? (
            <Button 
              size="lg" 
              asChild 
              className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-[0.98]"
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
                className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Link href="/signup">
                  Create Account <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="h-12 px-8 bg-white/[0.03] border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-semibold text-neutral-300 rounded-xl hover:-translate-y-0.5 active:scale-[0.98]"
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
