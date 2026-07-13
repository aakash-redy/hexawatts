'use client';

import Navbar from '@/components/Navbar';
import Team from '@/components/Team';
import Footer from '@/components/Footer';

export default function TeamPage() {
  return (
    <div className="bg-black text-white font-body-md overflow-x-hidden pt-32 md:pt-40">
      <Navbar />
      <Team />
      <Footer />
    </div>
  );
}
