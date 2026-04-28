import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-destructive/5 via-background to-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex p-4 bg-destructive/10 rounded-full text-destructive mb-4">
          <ShieldAlert className="h-12 w-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Access Restricted</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            You don't have the necessary administrative or role-based privileges to view this page.
          </p>
        </div>

        <div className="grid gap-3 pt-6">
          <Button asChild size="lg" className="font-bold">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back to Safety
            </Link>
          </Button>
          
          <form action="/auth/signout" method="POST">
            <Button variant="outline" size="lg" className="w-full font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out & Switch Account
            </Button>
          </form>
        </div>
        
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pt-8 opacity-50">
          InvoiceFlow Security Protocol v1.0
        </p>
      </div>
    </div>
  );
}

