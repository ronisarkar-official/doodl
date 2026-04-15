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
        className="w-full max-w-2xl text-center relative p-6 sm:p-8"
        style={{
          background: '#202936',
          border: '4px solid #ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {isDrawer ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/20">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-2xl font-bold text-white leading-tight">
                  Your Turn to Draw!
                </h2>
                <div className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span className={roundTime <= 5 ? 'text-[#ffb74d] animate-pulse' : 'text-[#4fc3f7]'}>
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 4, boxShadow: 'none' }}
                  onClick={() => selectWord(word)}
                  className="group relative flex flex-col items-center justify-center p-6 transition-all duration-300"
                  style={{
                    background: '#cbd5e1',
                    border: '3px solid #000000',
                    borderRadius: '1rem',
                    boxShadow: '0 6px 0 #000000',
                    color: '#000000'
                  }}
                >
                  <span className="text-2xl font-bold capitalize mb-2 relative z-10 transition-colors group-hover:text-[#0056b3]">
                    {word}
                  </span>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10">
                    <Type className="w-4 h-4" />
                    <span className="text-sm font-bold">
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

            <h2 className="text-2xl font-bold text-white mb-2">
              <span className="text-[#3bbdf5]">{drawer?.name}</span> is choosing
            </h2>
            
            <div className="flex items-center gap-2 text-[15px] text-white px-4 py-2 mt-4 font-bold rounded-xl"
              style={{
                background: '#2d3748',
                border: '2px solid #a0aec0',
              }}>
              <Clock className="w-5 h-5" />
              <span>Time remaining:</span>
              <span className={`font-mono text-xl ml-2 ${roundTime <= 5 ? 'text-[#ffb74d]' : 'text-[#4fc3f7]'}`}>
                {roundTime}s
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
