"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import supabase from "@/lib/supabase";

// Sponsor Marquee Component (inline)
function SponsorMarquee({ sponsors, title, direction = "left", speed = "normal" }) {
  if (!sponsors || sponsors.length === 0) return null;

  // Triple the sponsors for seamless looping
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors];

  return (
    <div className="relative w-full py-4">
      {/* Section Label */}
      <div className="text-center mb-4">
        <span className="text-[#FFC600] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">
          {title}
        </span>
      </div>

      {/* Marquee Container */}
      <div className="relative overflow-hidden">
        {/* Subtle fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-6 md:w-10 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 md:w-10 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div 
          className="flex gap-12 md:gap-16"
          style={{
            animation: `marqueeScroll ${speed === 'slow' ? 40 : 25}s linear infinite`,
            animationDirection: direction === 'right' ? 'reverse' : 'normal',
            width: 'max-content',
          }}
        >
          {duplicatedSponsors.map((sponsor, index) => (
            <div
              key={`${sponsor.id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {sponsor.photo_url || sponsor.photoUrl ? (
                <div className="relative w-36 h-20 md:w-44 md:h-24 flex items-center justify-center">
                  <Image
                    src={sponsor.photo_url || sponsor.photoUrl}
                    alt={sponsor.name}
                    width={176}
                    height={96}
                    className="w-full h-full object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-36 h-20 md:w-44 md:h-24 bg-white/[0.03] border border-white/[0.08] rounded-lg flex items-center justify-center px-4">
                  <span className="text-white/70 text-[11px] font-bold text-center leading-tight">
                    {sponsor.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

// Main Sponsors Component
export default function Sponsors() {
  const [previousSponsors, setPreviousSponsors] = useState([]);
  const [preliminarySponsors, setPreliminarySponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const [prevRes, prelimRes] = await Promise.all([
          supabase.from("previous_sponsors").select("*").order("created_at"),
          supabase.from("preliminary_sponsors").select("*").order("created_at"),
        ]);

        if (prevRes.data) setPreviousSponsors(prevRes.data);
        if (prelimRes.data) setPreliminarySponsors(prelimRes.data);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsors();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-6 md:px-8 max-w-[1440px] mx-auto relative" id="sponsors">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#FFC600] rounded-full animate-pulse" />
            <span className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
              Loading Sponsors...
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" id="sponsors">
      {/* Background atmosphere */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FFC600]/3 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00C8E0]/3 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] px-5 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#FFC600] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,198,0,0.8)]" />
            <span className="text-[#FFC600] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">
              Our Partners
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.95]">
            POWERED{" "}
            <span className="text-[#FFC600] italic drop-shadow-[0_0_20px_rgba(255,198,0,0.4)]">
              BY
            </span>
          </h2>
        </div>

        {/* PRELIMINARY SPONSORS - First */}
        <SponsorMarquee 
          sponsors={preliminarySponsors} 
          title="Preliminary Sponsors" 
          direction="right"
          speed="slow"
        />

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        {/* PREVIOUS SPONSORS - Second */}
        <SponsorMarquee 
          sponsors={previousSponsors} 
          title="Previous Year Sponsors" 
          direction="left"
          speed="normal"
        />
      </div>
    </section>
  );
}