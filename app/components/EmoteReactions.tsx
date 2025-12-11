'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';

// Pre-generate random values for each reaction based on its ID
function getRandomValuesFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const seed1 = Math.abs(hash % 1000) / 1000;
  const seed2 = Math.abs((hash >> 8) % 1000) / 1000;
  const seed3 = Math.abs((hash >> 16) % 1000) / 1000;
  
  return {
    randomX: 10 + seed1 * 80, // 10-90% from left (spread across canvas)
    randomDuration: 2.5 + seed2 * 1.5, // 2.5-4 seconds
    randomDelay: seed3 * 0.3, // 0-0.3s delay for staggering
  };
}

interface EmoteReactionsProps {
  className?: string;
}

export default function EmoteReactions({ className = '' }: EmoteReactionsProps) {
  const { emoteReactions, gamePhase } = useGame();

  // Memoize the reactions with their random values
  const reactionsWithValues = useMemo(() => {
    return emoteReactions.map((reaction) => ({
      ...reaction,
      ...getRandomValuesFromId(reaction.id),
    }));
  }, [emoteReactions]);

  // Only show during drawing phase
  if (gamePhase !== 'drawing') {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 100 }}>
      <AnimatePresence>
        {reactionsWithValues.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ 
              opacity: 0, 
              y: '100%',
              scale: 0.3,
            }}
            animate={{ 
              opacity: [0, 0.7, 0.7, 0], 
              y: ['100%', '70%', '20%', '-20%'],
              scale: [0.3, 1.3, 1.1, 0.8],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: reaction.randomDuration,
              delay: reaction.randomDelay,
              ease: [0.25, 0.46, 0.45, 0.94],
              times: [0, 0.15, 0.7, 1]
            }}
            className="absolute bottom-24 flex flex-col items-center"
            style={{ 
              left: `${reaction.randomX}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Emote with glow effect */}
            <motion.span 
              className="text-3xl drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 0.5, 
                repeat: 2,
                repeatType: 'reverse' 
              }}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
              }}
            >
              {reaction.emote}
            </motion.span>
            
            {/* Player name badge */}
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg"
            >
              {reaction.playerName}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

