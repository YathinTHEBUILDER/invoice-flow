"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

interface AuthFormProps {
  type: "login" | "signup";
  role: string;
  action: any; // SafeAction object
  onSuccess?: (data?: any) => void;
}

export function AuthForm({ type, role, action, onSuccess }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { execute, isPending, result } = useAction(action, {
    onSuccess: ({ data }) => {
      const resultData = data as any;
      if (resultData?.unverified) {
        onSuccess?.({ unverified: true, email: resultData.email });
      } else {
        onSuccess?.(resultData);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (type === "signup" && !agreed) {
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.role = role;
    execute(data);
  };

  const serverError = result.serverError as any;
  const validationErrors = result.validationErrors as any;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
      {serverError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold text-center">
          {serverError}
        </div>
      )}

      {type === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            placeholder="Enter full name" 
            required 
            className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
          />
          {validationErrors?.fullName && (
            <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.fullName._errors?.[0]}</p>
          )}
        </div>
      )}

      {type === "signup" && role === "msme" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</Label>
            <Input 
              id="companyName" 
              name="companyName" 
              placeholder="Enter business entity name" 
              required 
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
            />
            {validationErrors?.companyName && (
              <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.companyName._errors?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company Address</Label>
            <Input 
              id="companyAddress" 
              name="companyAddress" 
              placeholder="Enter full registered office address" 
              required 
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
            />
            {validationErrors?.companyAddress && (
              <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.companyAddress._errors?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">GSTIN</Label>
            <Input 
              id="gstin" 
              name="gstin" 
              placeholder="e.g. 22AAAAA0000A1Z5" 
              required 
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium uppercase"
            />
            {validationErrors?.gstin && (
              <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.gstin._errors?.[0]}</p>
            )}
          </div>
        </>
      )}

      {type === "signup" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="pan" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">PAN / Tax ID</Label>
            <Input 
              id="pan" 
              name="pan" 
              placeholder="e.g. ABCDE1234F" 
              required 
              maxLength={10}
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium uppercase"
            />
            {validationErrors?.pan && (
              <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.pan._errors?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccountNo" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Bank Account Number</Label>
            <Input 
              id="bankAccountNo" 
              name="bankAccountNo" 
              placeholder="Enter account number" 
              required 
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
            />
            {validationErrors?.bankAccountNo && (
              <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.bankAccountNo._errors?.[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">IFSC Code / Routing</Label>
            <Input 
              id="ifscCode" 
              name="ifscCode" 
              placeholder="e.g. SBIN0001234" 
              required 
              maxLength={11}
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium uppercase"
            />
            {validationErrors?.ifscCode && (
              <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.ifscCode._errors?.[0]}</p>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="Email address" 
          required 
          className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
        />
        {validationErrors?.email && (
          <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.email._errors?.[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
        <div className="relative">
          <Input 
            id="password" 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            required 
            className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {validationErrors?.password && (
          <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.password._errors?.[0]}</p>
        )}
        {type === "login" && (
          <div className="flex justify-end mt-1">
            <a 
              href="/auth/forgot-password" 
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot Password?
            </a>
          </div>
        )}
      </div>

      {type === "signup" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-left">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">
              Data Collection & Privacy Notice
            </h4>
            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-2.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              <p>
                <strong>Information We Collect:</strong> We collect your name, email, business/company details, and identity documents (such as PAN, Aadhaar/KYC) to verify user identity.
              </p>
              <p>
                <strong>How We Use It:</strong> Your data is used exclusively to handle invoice financing transactions, perform mandatory KYC/AML verification checks, and secure your account.
              </p>
              <p>
                <strong>Data Protection:</strong> All information is transmitted securely using bank-grade encryption and stored on secure servers. We never sell or share your data with unauthorized third parties.
              </p>
              <p>
                Read our full <a href="/privacy" target="_blank" className="text-primary hover:underline font-bold">Privacy Policy</a> and <a href="/terms" target="_blank" className="text-primary hover:underline font-bold">Terms of Service</a>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 px-1">
            <input 
              type="checkbox" 
              id="agreeToTerms"
              name="agreeToTerms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="mt-0.5 cursor-pointer shrink-0 custom-checkbox"
            />
            <label htmlFor="agreeToTerms" className="text-[11px] font-medium text-muted-foreground select-none cursor-pointer leading-normal">
              I read and accept the Privacy Policy and consent to data collection for KYC & verification purposes.
            </label>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isPending || (type === "signup" && !agreed)}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (type === "login" ? "Sign In" : "Create Account")}
      </Button>
    </form>
  );
}
