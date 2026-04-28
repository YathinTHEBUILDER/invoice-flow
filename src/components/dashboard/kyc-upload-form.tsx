"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { submitKycDocumentAction } from "@/actions/kyc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Loader2,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

const REQUIRED_DOCS = [
  { id: "pan", label: "PAN Card", description: "Upload a clear photo of your PAN card." },
  { id: "aadhaar", label: "Aadhaar Card", description: "Identity and Address proof." },
  { id: "bank_statement", label: "Bank Statement", description: "Last 6 months statements." },
  { id: "cancelled_cheque", label: "Cancelled Cheque", description: "Account verification proof." },
];

export function KYCUploadForm({ userId }: { userId: string }) {
  const [activeDoc, setActiveDoc] = useState<typeof REQUIRED_DOCS[0]>(REQUIRED_DOCS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userDocs, setUserDocs] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchDocs();
  }, [userId]);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("user_id", userId);
    
    if (data) setUserDocs(data);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeDoc.id}_${Date.now()}.${fileExt}`;
      const filePath = `kyc/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc_documents")
        .upload(filePath, file);

      if (uploadError) throw new Error("File upload failed: " + uploadError.message);

      const result = await submitKycDocumentAction({
        documentType: activeDoc.id as any,
        filePath: filePath,
      });


      if (result?.data?.success) {
        toast.success("Document Submitted", {
          description: `${activeDoc.label} has been uploaded and sent for verification.`,
        });
        setFile(null);
        fetchDocs();
      } else {
        throw new Error(result?.data?.error || "Submission failed.");
      }
    } catch (err: any) {
      toast.error("Upload Error", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {REQUIRED_DOCS.map((doc) => {
          const status = userDocs.find(d => d.document_type === doc.id)?.status || "not_uploaded";
          return (
            <Button
              key={doc.id}
              variant={activeDoc.id === doc.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDoc(doc)}
              className="h-10 px-4 rounded-lg font-bold transition-all"
            >
              {status === 'approved' && <CheckCircle2 className="mr-2 h-3 w-3 text-emerald-400" />}
              {status === 'pending' && <Clock className="mr-2 h-3 w-3 text-amber-400 animate-pulse" />}
              {doc.label}
            </Button>
          );
        })}
      </div>

      <form onSubmit={handleUpload} className="space-y-4 p-6 border-2 border-dashed rounded-2xl bg-muted/5">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-bold">Upload {activeDoc.label}</h4>
            <p className="text-xs text-muted-foreground">{activeDoc.description}</p>
          </div>
          
          <div className="w-full max-w-xs">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <Button type="submit" disabled={!file || loading} className="w-full max-w-xs font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileCheck className="h-4 w-4 mr-2" />}
            Submit for Review
          </Button>
        </div>
      </form>
    </div>
  );
}
