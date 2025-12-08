export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
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
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
