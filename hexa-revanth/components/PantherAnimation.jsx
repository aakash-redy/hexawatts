'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import Image from 'next/image';

export default function PantherAnimation({
  size = 150,
  opacity = 0.75,
  glowColor = '#00DCC8',
}) {
  const [pantherUrl, setPantherUrl] = useState(null);

  useEffect(() => {
    async function fetchPanther() {
      const { data } = await supabase
        .from('hero_slides')
        .select('image_url')
        .eq('id', 'e8cdc5ed-e063-4449-9a48-70af52a4948e')
        .single();

      if (data?.image_url) {
        console.log('✅ Panther image loaded:', data.image_url);
        setPantherUrl(data.image_url);
      } else {
        console.log('❌ No panther image found');
      }
    }

    fetchPanther();
  }, []);

  // Show placeholder while loading
  if (!pantherUrl) {
    return (
      <div
        id="panther-overlay"
        aria-hidden="true"
        style={{
          position: 'fixed',
          zIndex: 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          width: `${size}px`,
          height: `${size}px`,
          opacity: 0,
        }}
      />
    );
  }

  return (
    <div
      id="panther-overlay"
      aria-hidden="true"
      style={{
        position: 'fixed',
        zIndex: 0,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        userSelect: 'none',
        width: `${size}px`,
        height: `${size}px`,
        filter: `opacity(${opacity}) drop-shadow(0 0 30px ${glowColor}40)`,
      }}
    >
      <Image
        src={pantherUrl}
        alt="Hexawatts Panther"
        fill
        className="object-contain"
        style={{ mixBlendMode: 'screen' }}
        unoptimized
        priority
      />
    </div>
  );
}