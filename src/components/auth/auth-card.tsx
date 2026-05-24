import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function AuthCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  selected,
  className 
}: AuthCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "glass-dark rounded-2xl border border-white/[0.04] hover:border-primary/30 transition-all duration-500 group relative overflow-hidden cursor-pointer",
        selected && "border-primary bg-primary/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]",
        className
      )}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
        selected && "opacity-100"
      )} />
      
      <CardContent className="p-8 flex flex-col items-center text-center space-y-4 relative z-10">
        <div className={cn(
          "p-4 rounded-2xl bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 transition-all duration-500",
          selected && "bg-primary/20 text-primary scale-110"
        )}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
