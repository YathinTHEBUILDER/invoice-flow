import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient leading-[0.9]">
          Get in Touch.
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
          Have questions about our marketplace or need technical support? Our team is here to help you navigate the future of finance.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-10">
          <div className="grid gap-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Email Us</h3>
                <p className="text-muted-foreground">support@invoiceflow.in</p>
                <p className="text-muted-foreground">partners@invoiceflow.in</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Call Us</h3>
                <p className="text-muted-foreground">+91 (800) 123-4567</p>
                <p className="text-muted-foreground">Mon-Fri, 9am - 6pm IST</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Office</h3>
                <p className="text-muted-foreground">
                  123 FinTech Hub, BKC<br />
                  Mumbai, Maharashtra 400051<br />
                  India
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-dark border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Send a Message</h2>
            <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Message</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-primary/50 transition-colors resize-none" placeholder="How can we help?"></textarea>
            </div>
            <Button className="w-full h-14 text-lg font-bold">
              Send Message <MessageSquare className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
