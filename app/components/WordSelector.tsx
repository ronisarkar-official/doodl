"use client";

import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Pencil, 
  Type, 
  Palette
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function WordSelector() {
  const { wordOptions, selectWord, roundTime, gamePhase, isDrawer, players, currentDrawerIndex } = useGame();

  // Only show during choosing phase
  if (gamePhase !== 'choosing') return null;

  const drawer = players[currentDrawerIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-card/95 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-2xl w-full text-center backdrop-blur-xl ring-1 ring-white/5"
      >
        {isDrawer ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/20">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  Your Turn to Draw!
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  <span className={roundTime <= 5 ? 'text-red-500 animate-pulse' : 'text-primary'}>
                    {roundTime}s remaining
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {wordOptions.map((word, index) => (
                <motion.button
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectWord(word)}
                  className="group relative flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-secondary/30 hover:bg-primary hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <span className="text-lg font-bold text-foreground group-hover:text-primary-foreground capitalize mb-2 relative z-10">
                    {word}
                  </span>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 group-hover:bg-black/10 transition-colors">
                    <Type className="w-3 h-3 text-muted-foreground group-hover:text-primary-foreground/70" />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary-foreground/90">
                      {word.length} letters
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <p className="mt-6 text-xs text-muted-foreground/60 font-medium">
              Choose a word carefully... easier words get guessed faster!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-2 border-dashed border-primary/30"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Pencil className="w-8 h-8 text-primary animate-bounce box-decoration-slice" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              <span className="text-primary">{drawer?.name}</span> is choosing
            </h2>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-4 py-2 rounded-full border border-white/5">
              <Clock className="w-4 h-4" />
              <span>Time remaining:</span>
              <span className={`font-mono font-bold ${roundTime <= 5 ? 'text-red-500' : 'text-foreground'}`}>
                {roundTime}s
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
