"use client"

import { cn } from "@/lib/utils"

interface PageSpinnerProps {
  fullScreen?: boolean
  className?: string
  text?: string
}

// Minimal dot pulse loader component
function DotLoader({ size = "md" }: { size?: "sm" | "md" }) {
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
  const gap = size === "sm" ? "gap-1" : "gap-1.5"
  
  return (
    <>
      <div className={cn("flex items-center", gap)}>
        <span 
          className={cn(dotSize, "rounded-full bg-[#176FFF]")}
          style={{ animation: 'dotPulse 1.2s ease-in-out infinite' }}
        />
        <span 
          className={cn(dotSize, "rounded-full bg-[#176FFF]")}
          style={{ animation: 'dotPulse 1.2s ease-in-out 0.2s infinite' }}
        />
        <span 
          className={cn(dotSize, "rounded-full bg-[#176FFF]")}
          style={{ animation: 'dotPulse 1.2s ease-in-out 0.4s infinite' }}
        />
      </div>
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}

export function PageSpinner({ fullScreen = false, className, text }: PageSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <DotLoader size="md" />
          {text && (
            <p className="text-sm text-muted-foreground">{text}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="flex flex-col items-center space-y-3">
        <DotLoader size="sm" />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  )
}
