import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type LogoProps = {
  variant?: "full" | "mark";
  theme?: "dark" | "light";
  className?: string;
  priority?: boolean;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
};

export function Logo({
  variant = "full",
  theme = "dark",
  className,
  priority = false,
}: LogoProps) {
  const src =
    variant === "mark"
      ? "/brand/invoiceflow-mark.svg"
      : theme === "light"
        ? "/brand/invoiceflow-logo-dark.svg"
        : "/brand/invoiceflow-logo.svg";

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={src}
        alt="InvoiceFlow"
        width={variant === "mark" ? 40 : 180}
        height={variant === "mark" ? 40 : 44}
        priority={priority}
        className="h-auto w-auto object-contain"
      />
    </div>
  );
}

