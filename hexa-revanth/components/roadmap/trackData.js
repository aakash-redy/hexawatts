import * as THREE from 'three';

const RAW_POINTS = [
  [0, 0, 0],
  [-6, 0, 2],
  [-12, 0, 3],
  [-16, 0, 2],
  [-19, 0, 0],
  [-17, 0, -3],
  [-15, 0, -6],
  [-20, 0, -8],
  [-28, 0, -10],
  [-34, 0, -10],
  [-37, 0, -8],
  [-38, 0, -5],
  [-37, 0, -2],
  [-38, 0, 2],
  [-39, 0, 6],
  [-38, 0, 9],
  [-35, 0, 11],
  [-32, 0, 10],
  [-28, 0, 6],
  [-24, 0, 3],
  [-20, 0, 1],
  [-17, 0, 5],
  [-15, 0, 7],
  [-13, 0, 6],
  [-10, 0, 5],
  [-6, 0, 6],
  [-3, 0, 5],
  [0, 0, 4],
  [5, 0, 5],
  [10, 0, 7],
  [14, 0, 9],
  [18, 0, 10],
  [22, 0, 9],
  [24, 0, 7],
  [24, 0, 10],
  [23, 0, 12],
  [25, 0, 13],
  [28, 0, 13],
  [30, 0, 11],
  [31, 0, 8],
  [32, 0, 4],
  [34, 0, 0],
  [35, 0, -4],
  [35, 0, -8],
  [34, 0, -10],
  [32, 0, -11],
  [29, 0, -10],
  [24, 0, -9],
  [20, 0, -10],
  [17, 0, -9],
  [16, 0, -5],
  [17, 0, -2],
  [16, 0, 1],
  [12, 0, 1],
  [8, 0, 0],
  [4, 0, -1],
  [0, 0, 0],
];

export function buildTrackCurve() {
  const points = RAW_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.3);
  return curve;
}

export function getTrackPoints(count = 500) {
  const curve = buildTrackCurve();
  return curve.getPoints(count);
}

export const CHECKPOINTS = [
  {
    id: 'phase-1',
    phase: '01',
    name: 'DESIGN & FEA',
    description: 'Conceptualization, structural optimization, and CFD simulations to validate the platform.',
    status: 'completed',
    statusLabel: 'COMPLETED / Q3 2024',
    t: 0.12,
  },
  {
    id: 'phase-2',
    phase: '02',
    name: 'MANUFACTURING',
    description: 'Chassis fabrication, composite layup, and harness wiring in our dedicated R&D workshop.',
    status: 'current',
    statusLabel: 'IN PROGRESS / Q4 2024',
    t: 0.38,
  },
  {
    id: 'phase-3',
    phase: '03',
    name: 'TESTING & VALIDATION',
    description: 'Shakedown tests, driver training, and endurance simulation at national race tracks.',
    status: 'locked',
    statusLabel: 'UPCOMING / Q1 2025',
    t: 0.62,
  },
  {
    id: 'phase-4',
    phase: '04',
    name: 'COMPETITION',
    description: 'Defending our design titles and competing for the overall podium at Formula Bharath 2025.',
    status: 'locked',
    statusLabel: 'UPCOMING / JAN 2025',
    t: 0.88,
  },
];

export const DEFAULT_PROGRESS = 0.38;
export const START_FINISH_T = 0.0;

// Updated to gold palette — cyan removed
export const COLORS = {
  gold: '#B6B2A5',
  goldRGB: [1.0, 0.776, 0.0],
  goldGlow: 'rgba(255, 198, 0, 0.25)',
  trackBase: '#111111',
  trackDark: '#0a0a0a',
  background: '#000000',
  locked: '#333333',
  lockedDim: '#1a1a1a',
  // Keep cyan alias so any other component referencing COLORS.cyan doesn't break
  cyan: '#B6B2A5',
  cyanRGB: [1.0, 0.776, 0.0],
  cyanGlow: 'rgba(255, 198, 0, 0.25)',
};