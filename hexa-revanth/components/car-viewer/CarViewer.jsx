'use client';
import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import SpecControls from './SpecControls';

// Lazy load the 3D Canvas
const CarCanvas = dynamic(() => import('./CarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#5CE1E6] rounded-full animate-spin" />
        <span className="font-label-caps text-zinc-500 text-xs tracking-widest">LOADING TELEMETRY...</span>
      </div>
    </div>
  ),
});

export default function CarViewer({ activePart, onPartClick }) {
  const handlePartSelect = (partId) => {
    // Toggle off if clicking the same part
    const newPart = activePart === partId ? null : partId;
    
    // Bubble up so the parent can scroll and update state
    if (onPartClick) {
      onPartClick(newPart);
    }
  };

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-gradient-to-b from-[#000] to-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden mb-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <Suspense fallback={null}>
        <CarCanvas activePart={activePart} />
      </Suspense>
      <SpecControls activePart={activePart} onPartSelect={handlePartSelect} />
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10" />
    </div>
  );
}
