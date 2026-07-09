"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import supabase from "@/lib/supabase";

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState("/images/logo.png");
  const [captains, setCaptains] = useState([]);

  useEffect(() => {
    async function fetchFooterData() {
      const { data: logoData } = await supabase
        .from("site_images")
        .select("image_url")
        .eq("section", "footer")
        .eq("key", "logo")
        .single();

      if (logoData && logoData.image_url) {
        setLogoUrl(logoData.image_url);
      }

      const { data: captainsData } = await supabase
        .from("captains")
        .select("*")
        .order("display_order");

      if (captainsData) setCaptains(captainsData);
    }

    fetchFooterData();
  }, []);

  const captain = captains.find(c => c.role?.toLowerCase().includes('captain') && !c.role?.toLowerCase().includes('vice'));
  const viceCaptain = captains.find(c => c.role?.toLowerCase().includes('vice'));

  return (
    <footer className="relative bg-black border-t border-white/[0.06] w-full mt-16 md:mt-24 z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-12 py-12 md:py-16 max-w-[1440px] mx-auto">
        
        {/* Left: Brand & Logo */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt="HEXAWATTS RACING TEAM"
              width={36}
              height={36}
              className="h-7 md:h-9 w-auto drop-shadow-[0_0_10px_rgba(0,200,224,0.3)]"
            />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black italic tracking-tighter text-white font-grotesk leading-none">
                JNTU HEXAWATTS
              </span>
              <span className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] text-[#42AACC]/60 uppercase leading-none mt-0.5">
                Racing Team
              </span>
            </div>
          </div>
          <p className="text-[10px] text-white/30 tracking-wider text-center md:text-left leading-relaxed">
            © 2024 JNTU Hexawatts Racing Team.<br />
            Engineered for Speed. Built for Victory.
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-3 mt-2">
            <a
              href="https://www.instagram.com/_hexawatts_/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-black border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-[#E4405F] hover:border-[#E4405F]/30 transition-all duration-300"
              title="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <a
              href="https://linkedin.com/company/jntu-hexawatts-racing-team"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-black border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 transition-all duration-300"
              title="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Center: Team Leadership Contact - Clean text style */}
        <div className="flex flex-col items-center gap-5">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#B6B2A5]">
            Team Leadership
          </p>
          
          <div className="space-y-3 text-center">
            {captain && (
              <div>
                <p className="text-white/80 text-sm font-medium">
                  <span className="text-[#B6B2A5]/60 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                    {captain.role || 'Team Captain'}
                  </span>
                  {captain.name || 'TBA'}
                </p>
                {captain.number && (
                  <a
                    href={`tel:${captain.number?.replace(/\s/g, '')}`}
                    className="text-[#42AACC]/50 text-xs hover:text-[#42AACC] transition-colors mt-1 block"
                  >
                    {captain.number}
                  </a>
                )}
              </div>
            )}

            {viceCaptain && (
              <div>
                <p className="text-white/80 text-sm font-medium">
                  <span className="text-[#42AACC]/60 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                    {viceCaptain.role || 'Vice Captain'}
                  </span>
                  {viceCaptain.name || 'TBA'}
                </p>
                {viceCaptain.number && (
                  <a
                    href={`tel:${viceCaptain.number?.replace(/\s/g, '')}`}
                    className="text-[#42AACC]/50 text-xs hover:text-[#42AACC] transition-colors mt-1 block"
                  >
                    {viceCaptain.number}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Links */}
        <div className="flex flex-col items-center md:items-end gap-6">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#42AACC]">
            Quick Links
          </p>
          
          <div className="flex flex-col items-center md:items-end gap-3">
            {[
              { label: "Crowdfunding", href: "#crowdfund" },
              { label: "Sponsors", href: "#sponsors" },
              { label: "Specifications", href: "#specs-2d" },
              { label: "Meet the Team", href: "#team" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[11px] text-white/40 hover:text-[#42AACC] transition-colors tracking-wider uppercase"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04] py-4 px-6 text-center">
        <p className="text-[9px] text-white/15 tracking-[0.3em] uppercase">
          Where Power Meets Geometry • We Drive with Ingenuity
        </p>
      </div>
    </footer>
  );
}