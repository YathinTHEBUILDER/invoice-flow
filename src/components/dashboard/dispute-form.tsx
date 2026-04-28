"use client";

import { useState, useTransition } from "react";
import { raiseDisputeAction } from "@/actions/msme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DisputeForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("payment");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error("Validation Error", {
        description: "Please provide a title and detailed description of your issue.",
      });
      return;
    }

    startTransition(async () => {
      const result = await raiseDisputeAction({
        title,
        description,
        type: type as any,
      });

      if (result?.data?.success) {
        toast.success("Dispute Raised", {
          description: "Your ticket has been created and our team will contact you soon.",
        });
        setTitle("");
        setDescription("");
        router.refresh();
      } else {
        toast.error("Operation Failed", {
          description: result?.data?.error || "Could not raise dispute. Please try again.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Issue Type</label>
            <Select value={type} onValueChange={(val) => val && setType(val)}>
              <SelectTrigger className="h-11 bg-muted/30 border-muted-foreground/10 font-medium">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Payment Issue</SelectItem>
                <SelectItem value="invoice">Invoice Dispute</SelectItem>
                <SelectItem value="kyc">KYC Related</SelectItem>
                <SelectItem value="technical">Technical Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Summary Title</label>
            <Input
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 bg-muted/30 border-muted-foreground/10 font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Detailed Description</label>
          <Textarea
            placeholder="Please provide as much detail as possible, including invoice numbers or transaction IDs..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] bg-muted/30 border-muted-foreground/10 font-medium resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full sm:w-auto px-8 h-11 font-bold shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Raising Ticket...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Resolution Request
            </>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground italic max-w-[240px] leading-tight">
          By submitting, you agree to our dispute resolution terms and platform fair-use policy.
        </p>
      </div>
    </form>
  );
}
