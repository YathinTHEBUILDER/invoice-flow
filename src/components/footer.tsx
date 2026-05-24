import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Globe, Users, Shield, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#05070A] border-t border-white/[0.03] relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
          
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-5 text-left">
            <Logo className="scale-100 origin-left" />
            <p className="text-xs text-neutral-400 leading-relaxed pr-4 font-normal">
              A professional receivables marketplace for invoice financing and smart supply chain finance.
            </p>
          </div>
          
          {/* Solutions Col */}
          <div className="text-left">
            <h4 className="font-semibold text-[10px] uppercase tracking-widest mb-5 text-neutral-500">Solutions</h4>
            <ul className="space-y-3 text-xs text-neutral-400 font-medium">
              <li><Link href="/signup?role=msme" className="hover:text-white transition-colors duration-200">For MSMEs</Link></li>
              <li><Link href="/signup?role=investor" className="hover:text-white transition-colors duration-200">For Investors</Link></li>
            </ul>
          </div>
          
          {/* Company Col */}
          <div className="text-left">
            <h4 className="font-semibold text-[10px] uppercase tracking-widest mb-5 text-neutral-500">Company</h4>
            <ul className="space-y-3 text-xs text-neutral-400 font-medium">
              <li><Link href="/about" className="hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link href="/transparency" className="hover:text-white transition-colors duration-200">Transparency</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>
          
          {/* Legal Col */}
          <div className="text-left">
            <h4 className="font-semibold text-[10px] uppercase tracking-widest mb-5 text-neutral-500">Legal</h4>
            <ul className="space-y-3 text-xs text-neutral-400 font-medium">
              <li><Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
              <li><Link href="/compliance" className="hover:text-white transition-colors duration-200">Verification Integrity</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Col */}
        <div className="border-t border-white/[0.03] mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} InvoiceFlow India. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium tracking-wide">
            Secured by
            <span className="text-neutral-300 flex items-center gap-1 font-bold">
              <Lock className="w-3 h-3 text-neutral-400" /> Vercel Cloud
            </span>
          </p>
        </div>

      </div>
    </footer>
  );
}
