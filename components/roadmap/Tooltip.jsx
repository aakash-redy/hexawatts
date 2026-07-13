'use client';
import { COLORS } from './trackData';

/**
 * Tooltip — appears when hovering a checkpoint.
 * Uses glassmorphism styling with cyan accent.
 */
export default function Tooltip({ checkpoint, visible }) {
  if (!visible || !checkpoint) return null;

  const isCompleted = checkpoint.status === 'completed';
  const isCurrent = checkpoint.status === 'current';

  return (
    <div className={`roadmap-tooltip ${visible ? 'roadmap-tooltip-visible' : ''}`}>
      <div className="roadmap-tooltip-header">
        <span className="roadmap-tooltip-phase">PHASE {checkpoint.phase}</span>
        <span
          className="roadmap-tooltip-status"
          style={{
            color: isCompleted
              ? COLORS.cyan
              : isCurrent
              ? COLORS.cyan
              : '#555',
          }}
        >
          {checkpoint.statusLabel}
        </span>
      </div>
      <h4 className="roadmap-tooltip-title">{checkpoint.name}</h4>
      <p className="roadmap-tooltip-desc">{checkpoint.description}</p>
      <div className="roadmap-tooltip-bar">
        <div
          className="roadmap-tooltip-bar-fill"
          style={{
            width: isCompleted ? '100%' : isCurrent ? '60%' : '0%',
            background: isCompleted || isCurrent ? COLORS.cyan : COLORS.locked,
          }}
        />
      </div>
    </div>
  );
}
