"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { verifyEmailOtpAction, resendOtpAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

interface OtpFormProps {
  email: string;
  type?: 'signup' | 'recovery' | 'email_change';
  onSuccess?: () => void;
}

export function OtpForm({ email, type = 'signup', onSuccess }: OtpFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Handle countdown for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const { execute: executeVerify, isPending: isVerifying, result: verifyResult } = useAction(verifyEmailOtpAction, {
    onSuccess: () => {
      toast.success("Verification successful!");
      onSuccess?.() || router.push("/login");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Verification failed");
    },
  });

  const { execute: executeResend, isPending: isResending } = useAction(resendOtpAction, {
    onSuccess: () => {
      toast.success("Verification code resent!");
      setResendTimer(60); // 60 seconds cooldown
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to resend code");
    },
  });

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value !== "" && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 6) {
      toast.error("Please enter the verification code");
      return;
    }
    executeVerify({ email, token, type });
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    executeResend({ email, type });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-sm mx-auto">
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        ))}
      </div>

      <div className="space-y-4">
        <Button 
          type="submit" 
          disabled={isVerifying || otp.some(d => d === "")}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Account"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || resendTimer > 0}
          className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
