'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import supabase from '@/lib/supabase';
import CarViewer from './car-viewer/CarViewer';

export default function Specs() {
  const [mechanicalSpecs, setMechanicalSpecs] = useState([]);
  const [electricalSpecs, setElectricalSpecs] = useState([]);
  const [activePart, setActivePart] = useState(null);
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

  const allSpecs = [...mechanicalSpecs, ...electricalSpecs];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" id="specs">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-[#42AACC]/8 blur-[150px] rounded-full" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-[#B6B2A5]/8 blur-[150px] rounded-full" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-black border border-white/[0.08] px-4 py-2 rounded-full mb-8"
          >
            <span className="text-[10px] font-mono text-[#42AACC] tracking-[0.3em]">SYS:SPECS_LOADED</span>
            <span className="w-1.5 h-1.5 bg-[#42AACC] rounded-full animate-pulse" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]"
          >
            BUILT<br />
            <span className="text-outline text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
              DIFFERENT
            </span>
          </motion.h2>
        </div>

        {/* 3D Viewer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-20"
        >
          <CarViewer activePart={activePart} onPartClick={setActivePart} />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 bg-black border border-white/[0.08] px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#B6B2A5] rounded-full animate-pulse" />
              <span className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">Loading Specifications...</span>
            </div>
          </div>
        )}

        {/* Specs Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allSpecs.map((spec, index) => {
              const isActive = activePart === spec.name;
              const accentColor = spec.category === 'mechanical' ? '#B6B2A5' : '#42AACC';
              
              return (
                <motion.div
                  key={spec.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActivePart(isActive ? null : spec.name)}
                  whileHover={{ scale: 1.02 }}
                  className={`relative group cursor-pointer overflow-hidden rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 ${
                    isActive
                      ? 'bg-black border-white/20'
                      : 'bg-black border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  {/* Left accent line */}
                  <div
                    className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}50, transparent)`,
                    }}
                  />

                  <div className="p-6 md:p-7 h-full flex flex-col">
                    {/* Top Section */}
                    <div>
                      {/* Type Badge */}
                      <div className="flex items-center justify-between mb-5">
                        <span className={`text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md ${
                          spec.category === 'mechanical' 
                            ? 'bg-[#B6B2A5]/10 text-[#B6B2A5]' 
                            : 'bg-[#42AACC]/10 text-[#42AACC]'
                        }`}>
                          {spec.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl md:text-2xl font-black mb-3 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                      }`}>
                        {spec.name}
                      </h3>

                      {/* Description */}
                      {spec.description && (
                        <p className="text-sm text-white/50 leading-relaxed mb-5">
                          {spec.description}
                        </p>
                      )}
                    </div>

                    {/* Details Points - Always Visible */}
                    {spec.details && spec.details.length > 0 && (
                      <div className="mt-auto pt-5 border-t border-white/[0.06]">
                        <ul className="space-y-2.5">
                          {spec.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-white/65 font-medium">
                              <span
                                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}60` }}
                              />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Active glow */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSpecGlow"
                        className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-[40px]"
                        style={{ background: accentColor, opacity: 0.15 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-10 h-10 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-1.5 h-10 bg-gradient-to-b from-white/10 to-transparent rotate-45 translate-x-3 -translate-y-3" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-wrap justify-center gap-6 md:gap-12"
        >
          {[
            { label: 'Total Power', value: '80 kW' },
            { label: 'Battery Capacity', value: '6.4 kWh' },
            { label: 'Data Rate', value: '120 Hz' },
            { label: 'Torsion', value: '2200 Nm/deg' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}