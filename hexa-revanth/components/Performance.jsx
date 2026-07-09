export default function Performance() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden" id="performance">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#B6B2A5]/5 -skew-x-12 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#42AACC]/3 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative z-10 flex justify-center">
        
        {/* Single Centered Card */}
        <div className="bg-black border border-[#B6B2A5]/20 rounded-2xl p-10 md:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-2xl w-full text-center">
          {/* Top gold accent line */}
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#B6B2A5] to-transparent mx-auto mb-6" />
          
          <p className="text-[#B6B2A5] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4">
            PERFORMANCE 
          </p>
          
          <p className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed">
            The First Electric Vehicle Team from Both the Telugu States
          </p>
          
          {/* Bottom gold accent line */}
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#B6B2A5] to-transparent mx-auto mt-6" />
        </div>
      </div>
    </section>
  );
}