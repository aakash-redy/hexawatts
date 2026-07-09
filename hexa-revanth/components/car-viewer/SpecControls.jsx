'use client';
import { motion } from 'framer-motion';

const PARTS = [
  { id: 'CHASSIS', label: 'Chassis', color: '#5CE1E6', border: 'border-[#5CE1E6]', bgHover: 'hover:bg-[#5CE1E6]/10' },
  { id: 'ACCUMULATOR', label: 'Accumulator', color: '#facc15', border: 'border-[#facc15]', bgHover: 'hover:bg-[#facc15]/10' },
  { id: 'BRAKES & SUSPENSION', label: 'Brakes & Susp.', color: '#4ade80', border: 'border-[#4ade80]', bgHover: 'hover:bg-[#4ade80]/10' },
  { id: 'STEERING', label: 'Steering', color: '#a855f7', border: 'border-[#a855f7]', bgHover: 'hover:bg-[#a855f7]/10' },
];

export default function SpecControls({ activePart, onPartSelect }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-3xl px-4">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
        {PARTS.map((part) => {
          const isActive = activePart === part.id;
          return (
            <button
              key={part.id}
              onClick={() => onPartSelect(part.id)}
              className={`
                relative px-4 py-2 font-label-caps text-xs tracking-wider transition-all duration-300
                border-b-2 
                ${isActive ? `${part.border} text-white` : 'border-transparent text-zinc-500 hover:text-zinc-300'}
                ${part.bgHover}
              `}
            >
              {part.label}
              {isActive && (
                <motion.div
                  layoutId="activePartGlow"
                  className="absolute bottom-0 left-0 right-0 h-[2px] blur-[4px]"
                  style={{ backgroundColor: part.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
