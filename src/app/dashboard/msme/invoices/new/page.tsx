"use client";

import { useState } from "react";
import { createClient } from "@/lib/client";
import { uploadInvoiceAction } from "@/actions/msme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, UploadCloud, CheckCircle2, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewInvoicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    amount: "",
    dueDate: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const supabase = createClient();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Please select an invoice file." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `invoice_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `invoices/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("invoices")
        .upload(filePath, file);

      if (uploadError) throw new Error("File upload failed: " + uploadError.message);

      // 2. Call Server Action
      const result = await uploadInvoiceAction({
        invoiceNumber: formData.invoiceNumber,
        amount: formData.amount,
        dueDate: formData.dueDate,
        filePath: filePath,
      });


      if (result?.data?.success) {
        setMessage({ type: "success", text: "Invoice uploaded successfully and pending verification." });
        setTimeout(() => router.push("/dashboard/msme/invoices"), 2000);
      } else {
        throw new Error(result?.data?.error || "Failed to record invoice.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/msme/invoices">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upload Invoice</h2>
          <p className="text-muted-foreground">Submit your business invoice for verification and financing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg">Invoice Details</CardTitle>
              <CardDescription>Enter exact details from your document for faster verification.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-tight">Invoice Number</label>
                    <Input 
                      required
                      placeholder="e.g. INV-2024-001"
                      className="bg-muted/50 focus:bg-background transition-all"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-tight">Total Amount (₹)</label>
                    <Input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-muted/50 focus:bg-background transition-all"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-tight">Due Date</label>
                    <Input 
                      required
                      type="date"
                      className="bg-muted/50 focus:bg-background transition-all"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold tracking-tight">Upload Document</label>
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-muted-foreground/20 hover:border-primary/50 bg-muted/30'}`}>
                    <input 
                      type="file" 
                      id="invoice-file"
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="invoice-file" className="cursor-pointer flex flex-col items-center gap-3">
                      {file ? (
                        <>
                          <div className="p-3 bg-emerald-500/10 rounded-full">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-emerald-700">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Click to change file</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-primary/10 rounded-full">
                            <UploadCloud className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Drop your invoice here or click to browse</p>
                            <p className="text-xs text-muted-foreground">Supports PDF, JPG, PNG up to 5MB</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1 h-12 text-lg shadow-lg shadow-primary/20">
                    {loading ? "Uploading..." : "Submit Invoice"}
                  </Button>
                </div>
              </form>

              {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
                  <div>
                    <p className="font-semibold">{message.type === 'success' ? 'Ready!' : 'Oops!'}</p>
                    <p className="text-sm opacity-90">{message.text}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-slate-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>To ensure quick approval, please follow these guidelines:</p>
              <ul className="space-y-3 list-disc pl-4">
                <li>Document must be clear and legible.</li>
                <li>Invoice number and date must match the form.</li>
                <li>Buyer details should be clearly visible.</li>
                <li>Total amount must include all taxes (GST).</li>
                <li>Due date must be in the future.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">1</div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Verification</p>
                  <p className="text-muted-foreground text-xs">Admin reviews your invoice for authenticity (2-4 hours).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">2</div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Financing Request</p>
                  <p className="text-muted-foreground text-xs">Once approved, you can request financing for the invoice.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">3</div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Funding</p>
                  <p className="text-muted-foreground text-xs">Investors fill your request and funds are moved to your wallet.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
