'use client';
import { useEffect, useState } from 'react';
import { COLORS } from './trackData';

/**
 * ProgressHUD — F1 telemetry-style progress indicator overlay.
 * Shows current phase, progress percentage, and status.
 */
export default function ProgressHUD({ progress, activeCheckpoint, checkpoints }) {
  const [displayPercent, setDisplayPercent] = useState(0);

  // Animate the percentage counter
  useEffect(() => {
    const target = Math.round(progress * 100);
    let current = displayPercent;
    let raf;
    let active = true;
    const step = () => {
      if (!active) return;
      if (Math.abs(current - target) < 1) {
        setDisplayPercent(target);
        return;
      }
      current += (target - current) * 0.08;
      setDisplayPercent(Math.round(current));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [progress, displayPercent]);

  // Find the active/current phase
  const currentPhase = activeCheckpoint ||
    checkpoints.find((c) => c.status === 'current') ||
    checkpoints[0];

  return (
    <div className="roadmap-hud">
      {/* Progress bar */}
      <div className="roadmap-hud-progress">
        <div className="roadmap-hud-progress-track">
          {checkpoints.map((cp, i) => (
            <div
              key={cp.id}
              className="roadmap-hud-segment"
              style={{
                left: `${cp.t * 100}%`,
                background:
                  cp.status === 'completed'
                    ? COLORS.cyan
                    : cp.status === 'current'
                    ? COLORS.cyan
                    : '#333',
                boxShadow:
                  cp.status === 'completed' || cp.status === 'current'
                    ? `0 0 8px ${COLORS.cyanGlow}`
                    : 'none',
              }}
            />
          ))}
          <div
            className="roadmap-hud-progress-fill"
            style={{ width: `${displayPercent}%` }}
          />
        </div>
      </div>

      {/* Info display */}
      <div className="roadmap-hud-info">
        <div className="roadmap-hud-label">CURRENT PHASE</div>
        <div className="roadmap-hud-value">{currentPhase.name}</div>
      </div>

      <div className="roadmap-hud-percent">
        <span className="roadmap-hud-number">{displayPercent}</span>
        <span className="roadmap-hud-unit">%</span>
      </div>
    </div>
  );
}