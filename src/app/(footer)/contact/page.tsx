"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "./actions";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setErrorMessage(result.error || "Failed to send message. Please try again later.");
        setStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please check your internet connection and try again.");
    }
  };


  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
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
                <h3 className="font-bold text-lg text-white">Email Us</h3>
                <a 
                  href="mailto:invoiceflowiindia@gmail.com" 
                  className="text-muted-foreground hover:text-primary transition-colors block text-base font-medium"
                >
                  invoiceflowiindia@gmail.com
                </a>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-white">Call Us</h3>
                <a 
                  href="tel:+919113942723" 
                  className="text-muted-foreground hover:text-primary transition-colors block text-base font-medium"
                >
                  +91 91139 42723
                </a>
                <p className="text-muted-foreground text-xs font-medium">Mon-Fri, 9am - 6pm IST</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-dark rounded-2xl p-8 md:p-12 space-y-8">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-in fade-in-50 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-white">Message Sent!</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. We have received your message and will get back to you within 24 hours.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setStatus("idle")}
                className="h-12 px-6 rounded-xl hover:bg-white/5 transition-colors border-white/10 text-white"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">Send a Message</h2>
                <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
              </div>

              {status === "error" && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex gap-3 items-start text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors text-white placeholder-white/30" 
                      placeholder="Your Name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors text-white placeholder-white/30" 
                      placeholder="your.email@example.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-primary/50 transition-colors resize-none text-white placeholder-white/30" 
                    placeholder="How can we help?"
                  ></textarea>
                </div>
                <Button 
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full h-14 text-lg font-bold transition-all duration-300"
                >
                  {status === "submitting" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send Message <MessageSquare className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

