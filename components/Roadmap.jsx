// components/Roadmap.jsx
'use client';
import dynamic from 'next/dynamic';

const RoadmapSection = dynamic(
  () => import('./roadmap/RoadmapSection'),
  { ssr: false }
);

export default function Roadmap(props) {
  return <RoadmapSection {...props} />;
}