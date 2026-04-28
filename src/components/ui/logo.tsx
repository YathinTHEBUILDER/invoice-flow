import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export function Logo({ className, iconSize = 28, textSize = "text-xl", showText = true, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 group select-none", className)} {...props}>
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style={{ width: iconSize, height: iconSize }}>
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="24" className="fill-blue-600 dark:fill-blue-500" />
          <path d="M28 65L45 42H58L41 65H28Z" fill="white" opacity="0.9" />
          <path d="M42 35L59 58H72L55 35H42Z" fill="white" opacity="0.6" />
          <path d="M28 35H41L45 40.5H32L28 35Z" fill="white" opacity="0.4" />
          <path d="M72 65H59L55 59.5H68L72 65Z" fill="white" opacity="0.4" />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col ml-1">
          <span className={cn("font-bold tracking-tight leading-none text-foreground", textSize)}>
            Invoice<span className="text-blue-600 dark:text-blue-500 font-extrabold">Flow</span>
          </span>
        </div>
      )}
    </div>
  );
}
