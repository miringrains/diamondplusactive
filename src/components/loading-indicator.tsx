"use client"

import { useFormStatus } from "react-dom"

interface LoadingIndicatorProps {
  isLoading?: boolean
  text?: string
}

// Minimal loading indicator - can be controlled or auto-detect form submission
export function LoadingIndicator({ isLoading, text }: LoadingIndicatorProps) {
  const { pending } = useFormStatus()
  const showLoading = isLoading || pending

  if (!showLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* Minimal three-dot pulse */}
        <div className="flex items-center gap-1.5">
          <span 
            className="h-2 w-2 rounded-full bg-[#176FFF]"
            style={{ animation: 'dotPulse 1.2s ease-in-out infinite' }}
          />
          <span 
            className="h-2 w-2 rounded-full bg-[#176FFF]"
            style={{ animation: 'dotPulse 1.2s ease-in-out 0.2s infinite' }}
          />
          <span 
            className="h-2 w-2 rounded-full bg-[#176FFF]"
            style={{ animation: 'dotPulse 1.2s ease-in-out 0.4s infinite' }}
          />
        </div>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
