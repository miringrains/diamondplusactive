export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      {/* Minimal three-dot pulse loader */}
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
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
