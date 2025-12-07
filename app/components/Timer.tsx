"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function Timer() {
  const { roundTime, maxDrawTime, gamePhase } = useGame();
  const { playTick, stopTick } = useSoundEffects();
  const lastTickRef = useRef<number>(-1);

  const percentage = (roundTime / maxDrawTime) * 100;
  const isLow = roundTime <= 20;
  const isCritical = roundTime <= 10;

  // Play tick sound when time is critical (10 seconds or less)
  useEffect(() => {
    if (gamePhase === 'drawing' && isCritical && roundTime > 0 && roundTime !== lastTickRef.current) {
      lastTickRef.current = roundTime;
      playTick();
    }
  }, [roundTime, isCritical, gamePhase, playTick]);

  // Stop tick sound when phase changes or component unmounts
  useEffect(() => {
    if (gamePhase !== 'drawing') {
      stopTick();
      lastTickRef.current = -1;
    }
    return () => stopTick();
  }, [gamePhase, stopTick]);

  // Format time as MM:SS
  const minutes = Math.floor(roundTime / 60);
  const seconds = roundTime % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Get color based on time
  const getColor = () => {
    if (isCritical) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', ring: 'ring-red-500/20' };
    if (isLow) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', ring: 'ring-amber-500/20' };
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', ring: 'ring-emerald-500/20' };
  };

  const colors = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${colors.bg} border ${colors.border} ${isCritical ? 'ring-2 ' + colors.ring : ''}`}
    >
      {/* Timer Icon with pulse animation */}
      <motion.div
        animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className={`text-xs sm:text-sm ${colors.text}`}
      >
        ⏱️
      </motion.div>

      {/* Time Display */}
      <motion.span
        className={`font-mono font-bold text-xs sm:text-sm tabular-nums ${colors.text}`}
        animate={isCritical ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {formattedTime}
      </motion.span>

      {/* Progress bar underneath */}
      <div className="absolute bottom-0 left-1.5 sm:left-2 right-1.5 sm:right-2 h-0.5 bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

