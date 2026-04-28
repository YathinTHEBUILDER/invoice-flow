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
            placeholder="John Doe" 
            required 
            className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
          />
          {validationErrors?.fullName && (
            <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.fullName._errors?.[0]}</p>
          )}
        </div>
      )}

      {type === "signup" && role === "msme" && (
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</Label>
          <Input 
            id="companyName" 
            name="companyName" 
            placeholder="Acme Corp" 
            required 
            className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
          />
          {validationErrors?.companyName && (
            <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.companyName._errors?.[0]}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="name@example.com" 
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

      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (type === "login" ? "Sign In" : "Create Account")}
      </Button>
    </form>
  );
}
