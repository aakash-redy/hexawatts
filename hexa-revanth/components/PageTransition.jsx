"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function PageLoader({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          {/* Scanlines */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
            }}
          />

          {/* Glow orbs */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-[400px] h-[400px] bg-[#42AACC]/10 blur-[100px] rounded-full"
          />

          {/* Panther Logo */}
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            {/* Color splash */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute inset-0 bg-gradient-to-r from-[#B6B2A5]/30 via-[#42AACC]/30 to-[#B6B2A5]/30 blur-[50px] rounded-full scale-150"
            />

            <Image
              src="/images/logo.png"
              alt="Hexawatts Panther"
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_40px_rgba(255,198,0,0.4)]"
              priority
            />
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 text-center z-10"
          >
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              HEXAWATTS
            </h1>
            <p className="text-[#B6B2A5] text-xs tracking-[0.3em] uppercase mt-2">
              Racing Team
            </p>
            
            {/* Loading dots */}
            <div className="flex gap-1.5 justify-center mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 bg-[#42AACC] rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Bottom progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#B6B2A5] via-[#42AACC] to-[#B6B2A5] origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}