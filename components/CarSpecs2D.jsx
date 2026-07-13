'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import supabase from '@/lib/supabase';

/**
 * Shared card renderer for both Mechanical & Electrical specs.
 * - Compact 2-col grid on mobile (grid-cols-2), 3-col on desktop.
 * - Tap-to-expand details (since hover doesn't exist on touch).
 * - Hover/tap micro-interactions via framer-motion.
 */
function SpecCard({ spec, accent, isActive, onToggle }) {
  const accentColor = accent === 'gold' ? '#B6B2A5' : '#42AACC';

  return (
    <motion.div
      layout
      onClick={() => onToggle(spec.id)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative rounded-xl md:rounded-2xl overflow-hidden flex flex-col bg-black border shadow-[0_4px_16px_rgba(0,0,0,0.4)] md:shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer transition-colors duration-300"
      style={{
        borderColor: isActive ? `${accentColor}66` : 'rgba(255,255,255,0.08)',
        boxShadow: isActive ? `0 0 24px ${accentColor}22` : undefined,
      }}
    >
      {/* Accent line */}
      <div
        className="absolute left-0 top-3 bottom-3 md:top-4 md:bottom-4 w-[2px] rounded-full transition-opacity duration-500"
        style={{
          opacity: isActive ? 1 : 0.5,
          background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}80, transparent)`,
        }}
      />

      {/* Header */}
      <div className="p-3 pb-1.5 md:p-5 md:pb-3 flex items-center justify-between gap-2">
        <h4 className="font-black text-white text-xs md:text-lg uppercase tracking-tight leading-tight">
          {spec.name}
        </h4>
        {/* Expand indicator — only meaningful on mobile where details are collapsed */}
        <motion.span
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="md:hidden flex-shrink-0 text-[10px]"
          style={{ color: accentColor }}
        >
          ▾
        </motion.span>
      </div>

      {/* Image Area */}
      <div
        className="relative w-full overflow-hidden flex items-center justify-center bg-black/40 border-t border-b border-white/[0.06]"
        style={{ aspectRatio: '1/1' }}
      >
        {spec.image_url ? (
          <Image
            src={spec.image_url}
            alt={spec.name}
            fill
            className="object-contain p-2 md:p-3 transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl md:text-7xl font-black text-white/5">
              {spec.name.charAt(0)}
            </span>
            <span className="text-[7px] md:text-[9px] tracking-widest uppercase mt-1 md:mt-2 text-white/15">
              Photo Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* Body — description/details collapse on mobile until tapped, always shown on desktop */}
      <div className="p-3 pt-2 md:p-5 md:pt-3 flex-1 flex flex-col">
        <div className={`${isActive ? 'block' : 'hidden'} md:block`}>
          {spec.description && (
            <p className="text-white/50 text-[10px] md:text-xs leading-relaxed mb-3 md:mb-4">
              {spec.description}
            </p>
          )}

          {spec.details && spec.details.length > 0 && (
            <div className="mt-auto pt-3 md:pt-4 border-t border-white/[0.06]">
              <ul className="space-y-1.5 md:space-y-2">
                {spec.details.map((detail, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[10px] md:text-xs text-white/60 font-medium"
                  >
                    <span
                      className="mt-1 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: accentColor,
                        boxShadow: `0 0 6px ${accentColor}66`,
                      }}
                    />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Mobile-only compact hint when collapsed */}
        {!isActive && (spec.description || (spec.details && spec.details.length > 0)) && (
          <span className="md:hidden text-white/25 text-[9px] uppercase tracking-widest">
            Tap for details
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function CarSpecs2D() {
  const [mechanicalSpecs, setMechanicalSpecs] = useState([]);
  const [electricalSpecs, setElectricalSpecs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpecs() {
      try {
        const [mechRes, elecRes] = await Promise.all([
          supabase.from('mechanical_specs').select('*').order('display_order'),
          supabase.from('electrical_specs').select('*').order('display_order'),
        ]);

        if (mechRes.data) setMechanicalSpecs(mechRes.data);
        if (elecRes.data) setElectricalSpecs(elecRes.data);
      } catch (error) {
        console.error('Error fetching specs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpecs();
  }, []);

  const toggleActive = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-14 md:py-28 relative overflow-hidden" id="specs-2d">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#B6B2A5]/3 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#42AACC]/3 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">

        {/* ── Section Header ── */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 md:gap-3 bg-black border border-white/[0.08] px-4 py-1.5 md:px-5 md:py-2 rounded-full mb-4 md:mb-6">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#B6B2A5] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,198,0,0.8)]" />
            <span className="text-[#B6B2A5] text-[9px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase">
              Technical Blueprint
            </span>
          </div>

          <h2 className="text-3xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.95] mb-3 md:mb-4">
            CAR{" "}
            <span className="text-[#B6B2A5] italic drop-shadow-[0_0_20px_rgba(255,198,0,0.4)]">
              SPECIFICATIONS
            </span>
          </h2>

          <p className="text-[#42AACC]/60 text-xs md:text-sm max-w-lg mx-auto leading-relaxed px-4">
            Every component engineered for maximum performance and reliability
          </p>
        </div>

        {/* ── Hero Image ── */}
        <div className="flex justify-center mb-10 md:mb-16">
          <div
            className="relative rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center shadow-lg w-full max-w-5xl
              bg-black border border-white/[0.08]"
            style={{
              aspectRatio: '16/9',
              boxShadow: '0 0 48px rgba(0,200,224,0.05)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src="/images/car specs photo.jpeg"
              alt="Hexawatts Racing Car"
              className="w-full h-full object-contain p-2 md:p-4 relative z-10"
            />
          </div>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 bg-black border border-white/[0.08] px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#B6B2A5] rounded-full animate-pulse" />
              <span className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                Loading Specifications...
              </span>
            </div>
          </div>
        )}

        {/* ── Mechanical Specs ── */}
        {!loading && mechanicalSpecs.length > 0 && (
          <div className="mb-10 md:mb-16">
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 md:gap-3 bg-black border border-white/[0.08] px-4 py-1.5 md:px-5 md:py-2 rounded-full mb-3 md:mb-4">
                <span className="w-1.5 h-1.5 bg-[#B6B2A5] rounded-full shadow-[0_0_8px_rgba(255,198,0,0.8)] animate-pulse" />
                <span className="text-[#B6B2A5] text-[9px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase">
                  Mechanical Systems
                </span>
              </div>
              <h3 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">
                Mechanical Specs
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
              {mechanicalSpecs.map((spec) => (
                <SpecCard
                  key={spec.id}
                  spec={spec}
                  accent="gold"
                  isActive={activeId === spec.id}
                  onToggle={toggleActive}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Electrical Specs ── */}
        {!loading && electricalSpecs.length > 0 && (
          <div>
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 md:gap-3 bg-black border border-white/[0.08] px-4 py-1.5 md:px-5 md:py-2 rounded-full mb-3 md:mb-4">
                <span className="w-1.5 h-1.5 bg-[#42AACC] rounded-full shadow-[0_0_8px_rgba(0,200,224,0.8)] animate-pulse" />
                <span className="text-[#42AACC] text-[9px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase">
                  Electrical Systems
                </span>
              </div>
              <h3 className="text-xl md:text-4xl font-black text-white uppercase tracking-tight">
                Electrical Specs
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
              {electricalSpecs.map((spec) => (
                <SpecCard
                  key={spec.id}
                  spec={spec}
                  accent="cyan"
                  isActive={activeId === spec.id}
                  onToggle={toggleActive}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}