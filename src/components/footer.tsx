import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { 
  Globe, 
  Users, 
  Shield, 
  Lock 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
          <div className="col-span-2 md:col-span-1 space-y-8">
            <Logo className="scale-110 origin-left" />
            <p className="text-base text-muted-foreground font-medium pr-8 leading-relaxed">
              The modern infrastructure for premium-grade invoice factoring and supply chain finance.
            </p>
            <div className="flex gap-4">
              {[Globe, Users, Shield].map((Icon, i) => (
                <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-foreground">Solutions</h4>
            <ul className="space-y-5 text-base font-bold text-muted-foreground">
              <li><Link href="/signup?role=msme" className="hover:text-primary transition-colors">For MSMEs</Link></li>
              <li><Link href="/signup?role=investor" className="hover:text-primary transition-colors">For Investors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-foreground">Company</h4>
            <ul className="space-y-5 text-base font-bold text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/transparency" className="hover:text-foreground transition-colors">Transparency</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-foreground">Legal</h4>
            <ul className="space-y-5 text-base font-bold text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/compliance" className="hover:text-foreground transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
          <p>© {new Date().getFullYear()} InvoiceFlow India. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Secured by
            <span className="text-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" /> Vercel Cloud
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
