"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

export function ResetPasswordForm() {
  const router = useRouter();

  const { execute, isPending, result } = useAction(resetPasswordAction, {
    onSuccess: () => {
      toast.success("Password updated successfully!");
      router.push("/login");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to update password");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    execute({ password });
  };

  const validationErrors = result.validationErrors;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="password" title="New Password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
        <div className="relative">
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium pl-10"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        {validationErrors?.password && (
          <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{validationErrors.password._errors?.[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" title="Confirm Password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
        <div className="relative">
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium pl-10"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
      </Button>
    </form>
  );
}
