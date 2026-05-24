"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { User } from "@supabase/supabase-js";
import { signOutAction } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarClientProps {
  user: User | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
    router.refresh();
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        // Adjust for sticky header height
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        setMobileMenuOpen(false);
      }
    }
  };

  const role = user?.user_metadata?.role || "investor";

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "border-b border-white/[0.04] bg-[#05070A]/85 backdrop-blur-md py-3 shadow-lg shadow-black/20" 
          : "border-b border-transparent bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8">
        {/* Brand Logo */}
        <Link href="/" className="transition-all hover:opacity-90 active:scale-[0.98]">
          <Logo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-400">
          <a 
            href="/#how-it-works" 
            onClick={(e) => handleScrollTo(e, "how-it-works")} 
            className="hover:text-white transition-colors duration-200 relative py-1.5"
          >
            How it works
          </a>
          <a 
            href="/#msme-benefits" 
            onClick={(e) => handleScrollTo(e, "msme-benefits")} 
            className="hover:text-white transition-colors duration-200 relative py-1.5"
          >
            For MSMEs
          </a>
          <a 
            href="/#investor-benefits" 
            onClick={(e) => handleScrollTo(e, "investor-benefits")} 
            className="hover:text-white transition-colors duration-200 relative py-1.5"
          >
            For Investors
          </a>
          <Link 
            href="/transparency" 
            className={`hover:text-white transition-colors duration-200 relative py-1.5 ${
              pathname === "/transparency" ? "text-white" : ""
            }`}
          >
            Transparency
          </Link>
        </nav>

        {/* Desktop Call-to-Actions */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <div className="flex items-center gap-6">
              <Link 
                href={`/dashboard/${role}`} 
                className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors tracking-wide"
              >
                Dashboard
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleSignOut} 
                className="text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors h-9 px-3 rounded-lg"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link 
                href="/login" 
                className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Button 
                asChild 
                className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-all duration-200 shadow-md shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98]"
              >
                <Link href="/get-started">
                  Get Started
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors focus:outline-none rounded-lg hover:bg-white/[0.02]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-b border-white/[0.04] bg-[#05070A]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6 text-sm font-medium text-neutral-400">
              <a href="/#how-it-works" onClick={(e) => handleScrollTo(e, "how-it-works")} className="hover:text-white transition-colors py-2.5 border-b border-white/[0.03]">
                How it works
              </a>
              <a href="/#msme-benefits" onClick={(e) => handleScrollTo(e, "msme-benefits")} className="hover:text-white transition-colors py-2.5 border-b border-white/[0.03]">
                For MSMEs
              </a>
              <a href="/#investor-benefits" onClick={(e) => handleScrollTo(e, "investor-benefits")} className="hover:text-white transition-colors py-2.5 border-b border-white/[0.03]">
                For Investors
              </a>
              <Link href="/transparency" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2.5 border-b border-white/[0.03]">
                Transparency
              </Link>

              {user ? (
                <div className="flex flex-col gap-3 pt-4">
                  <Button asChild className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium">
                    <Link href={`/dashboard/${role}`} onClick={() => setMobileMenuOpen(false)}>
                      Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full h-10 border-white/10 hover:bg-white/5 text-white font-medium">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-4">
                  <Button asChild variant="outline" className="w-full h-10 border-white/10 hover:bg-white/5 text-white font-medium">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium">
                    <Link href="/get-started" onClick={() => setMobileMenuOpen(false)}>
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
