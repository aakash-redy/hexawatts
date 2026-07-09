'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { CHECKPOINTS, DEFAULT_PROGRESS, COLORS } from './trackData';
import Tooltip from './Tooltip';
import ProgressHUD from './ProgressHUD';
import supabase from '@/lib/supabase';

const TrackCanvas = dynamic(() => import('./TrackCanvas'), {
  ssr: false,
  loading: () => (
    <div className="roadmap-loader">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="roadmap-loader-ring"
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        INITIALIZING 3D ENGINE...
      </motion.span>
    </div>
  ),
});

export default function RoadmapSection() {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [hoveredCheckpoint, setHoveredCheckpoint] = useState(null);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [dbCheckpoints, setDbCheckpoints] = useState([]);
  const containerRef = useRef(null);

  // Fetch checkpoints and active checkpoint from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const [checkpointsRes, settingsRes] = await Promise.all([
          supabase.from('roadmap_checkpoints').select('*').order('display_order'),
          supabase.from('site_settings').select('*').eq('key', 'roadmap_active_checkpoint').single(),
        ]);

        // FIX (V3): Default missing/empty status to 'locked' so legend class lookups
        // never break with an undefined `cp.status` when the DB row omits the column.
        const checkpoints = (checkpointsRes.data || []).map(cp => ({
          status: 'locked',
          ...cp,
        }));
        setDbCheckpoints(checkpoints);

        // Set progress to active checkpoint position
        const activeId = settingsRes.data?.value;
        if (activeId) {
          const activeCp = checkpoints.find(c => c.id === activeId);
          if (activeCp) {
            setProgress(activeCp.t);
            setActiveCheckpoint(activeCp);
          }
        }
      } catch (error) {
        console.error('Failed to fetch roadmap data:', error);
      }
    })();
  }, []);

  const handleClickCheckpoint = useCallback((checkpoint) => {
    setActiveCheckpoint(checkpoint);
    setProgress(checkpoint.t);
  }, []);

  return (
    <section id="roadmap" className="roadmap-section" ref={containerRef}>
      {/* Background Effects — gold/amber tint instead of cyan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="roadmap-scanlines" />
      </div>

      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="roadmap-header"
      >
        <span className="roadmap-header-tag">HEXAWATTS R&D PIPELINE</span>
        <h2 className="roadmap-header-title">
          ROAD TO <span className="text-primary">PODIUM 2027</span>
        </h2>
        <p className="roadmap-header-subtitle">
          From the workshops of CIET to the Kari Motor Speedway. Follow the evolution of our next-gen platform.
        </p>
      </motion.div>

      <div className="roadmap-canvas-container relative">
        {/* Glass frame — padded so it's actually visible around the opaque 3D canvas, not hidden behind it */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: 'rgba(13, 26, 58, 0.25)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: '1px solid rgba(255, 198, 0, 0.12)',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.25), 0 8px 40px rgba(0,0,0,0.35)',
          }}
        />

        {/* Track Canvas — inset so the glass frame shows around its edges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="w-full h-full relative z-10 p-3 md:p-5"
        >
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <TrackCanvas
              progress={progress}
              hoveredCheckpoint={hoveredCheckpoint}
              onHoverCheckpoint={setHoveredCheckpoint}
              onLeaveCheckpoint={() => setHoveredCheckpoint(null)}
              onClickCheckpoint={handleClickCheckpoint}
            />
          </div>
        </motion.div>

        {/* Dynamic Tooltip */}
        <AnimatePresence>
          {hoveredCheckpoint && (
            <Tooltip checkpoint={hoveredCheckpoint} visible={true} />
          )}
        </AnimatePresence>

        {/* Progress HUD */}
        <ProgressHUD
          progress={progress}
          activeCheckpoint={activeCheckpoint}
          checkpoints={dbCheckpoints.length > 0 ? dbCheckpoints : CHECKPOINTS}
        />

        {/* Legend — gold hover instead of cyan */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="roadmap-legend"
        >
          {(dbCheckpoints.length > 0 ? dbCheckpoints : CHECKPOINTS).map((cp, index) => (
            <motion.button
              key={cp.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ x: -5, backgroundColor: "rgba(255, 198, 0, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              className={`roadmap-legend-item ${
                cp.status === 'completed' ? 'roadmap-legend-completed' :
                cp.status === 'current' ? 'roadmap-legend-current' : 'roadmap-legend-locked'
              } ${activeCheckpoint?.id === cp.id ? 'roadmap-legend-active' : ''}`}
              onClick={() => handleClickCheckpoint(cp)}
            >
              <div className="relative">
                <span className="roadmap-legend-dot" />
                {cp.status === 'current' && (
                  <span className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="roadmap-legend-phase">PHASE {cp.phase}</span>
                <span className="roadmap-legend-name">{cp.name}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}