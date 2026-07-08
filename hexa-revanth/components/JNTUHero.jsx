"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import supabase from "@/lib/supabase";

export default function JNTUHero() {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    async function fetchLogo() {
      const { data } = await supabase
        .from("preliminary_sponsors")
        .select("photo_url")
        .eq("name", "JNTU")
        .single();

      if (data?.photo_url) {
        setLogoUrl(data.photo_url);
      }
    }

    fetchLogo();
  }, []);

  return (
    <section className="py-16 md:py-24 px-6 md:px-8 max-w-[1440px] mx-auto relative z-10">
      <div className="bg-black border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="grid md:grid-cols-2 items-center">
          
          {/* Left: Logo */}
          <div className="flex justify-center items-center p-8 md:p-12 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/[0.06]">
            <div className="relative w-44 h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="JNTUH Logo"
                  fill
                  className="object-contain p-5"
                  unoptimized
                />
              ) : (
                <div className="text-center text-white/15">
                  <span className="text-4xl font-black">JNTUH</span>
                  <p className="text-[9px] tracking-widest uppercase mt-2">Logo</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="p-8 md:p-12 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-[1.2] mb-6">
              Proudly Representing{" "}
              <span className="text-[#00C8E0] italic drop-shadow-[0_0_15px_rgba(0,200,224,0.4)]">
                JNTU HYDERABAD
              </span>
            </h2>

            <p className="text-sm md:text-base text-white/50 leading-relaxed mb-6">
              Established in 1965 as Nagarjuna Sagar Engineering College, JNTUH underwent 
              a significant evolution before becoming the esteemed institution it is today. 
              Originally conceived as a college, it later transformed into a full-fledged 
              Technological University in 1972, earning recognition as Jawaharlal Nehru 
              Technological University, paying homage to India&apos;s first Prime Minister. 
              Nestled in the vibrant city of Hyderabad, its sprawling main campus in 
              Kukatpally stands as a testament to its commitment to excellence. Through its 
              varied colleges and departments, JNTUH continues to play a pivotal role in 
              shaping the future of numerous students and contributing significantly to the 
              advancements of knowledge and innovation in various fields.
            </p>

            <a
              href="https://jntuh.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#00C8E0]/60 hover:text-[#00C8E0] text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-300 group"
            >
              <span>Visit the College</span>
              <svg 
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}