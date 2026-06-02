import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Link from "next/link";
import { Shield } from "lucide-react";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvoiceFlow | High Quality Financing",
  description: "Secure, transparent MSME invoice financing for individual investors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('contextmenu', (e) => e.preventDefault());`
          }}
        />
        <QueryProvider>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </QueryProvider>
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}

