import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Wallet } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground antialiased selection:bg-blue-500/30">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <Card className="flex flex-col hover:border-blue-500/50 transition-colors shadow-lg hover:shadow-blue-500/10">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">MSME Portal</CardTitle>
              <CardDescription className="text-base mt-2">
                Unlock working capital by discounting your outstanding invoices instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end pt-4">
              <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Instant verification & scoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Access to institutional capital
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Transparent fee structure
                </li>
              </ul>
              <Button size="lg" asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/register/msme">Get Funded</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col hover:border-indigo-500/50 transition-colors shadow-lg hover:shadow-indigo-500/10">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl">Investor Portal</CardTitle>
              <CardDescription className="text-base mt-2">
                Access high-yield, short-term asset-backed investment opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end pt-4">
              <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Curated asset portfolio
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Predictable risk-adjusted returns
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Automated settlement system
                </li>
              </ul>
              <Button size="lg" variant="outline" asChild className="w-full border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-900/30">
                <Link href="/register/investor">Start Investing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
