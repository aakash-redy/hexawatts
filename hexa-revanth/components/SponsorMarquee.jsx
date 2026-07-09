"use client";

import Image from "next/image";

export default function SponsorMarquee({ sponsors, title, direction = "left", speed = "normal" }) {
  if (!sponsors || sponsors.length === 0) return null;

  // Duplicate sponsors for seamless infinite scroll
  const duplicatedSponsors = [...sponsors, ...sponsors];

  const speedClass = speed === "slow" ? "animate-marquee-slow" : "animate-marquee";
  const directionClass = direction === "right" ? "animate-marquee-reverse" : speedClass;

  return (
    <div className="relative w-full py-6">
      {/* Section Label */}
      <div className="text-center mb-6">
        <span className="text-[#B6B2A5] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">
          {title}
        </span>
      </div>

      {/* Marquee Container */}
      <div className="relative overflow-hidden">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className={`flex gap-10 md:gap-14 ${directionClass}`}>
          {duplicatedSponsors.map((sponsor, index) => (
            <div
              key={`${sponsor.id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {sponsor.photo_url || sponsor.photoUrl ? (
                <div className="relative w-28 h-16 md:w-36 md:h-20 flex items-center justify-center">
                  <Image
                    src={sponsor.photo_url || sponsor.photoUrl}
                    alt={sponsor.name}
                    width={144}
                    height={80}
                    className="w-full h-full object-contain opacity-50 hover:opacity-100 transition-opacity duration-300"
                    unoptimized
                  />
                </div>
              ) : (
                // Fallback when no logo - show name
                <div className="w-28 h-16 md:w-36 md:h-20 bg-white/[0.02] border border-white/[0.06] rounded-lg flex items-center justify-center px-3">
                  <span className="text-white/30 text-[10px] font-bold text-center leading-tight">
                    {sponsor.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}