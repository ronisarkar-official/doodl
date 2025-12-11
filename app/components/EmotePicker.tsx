'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

const EMOTES = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '😱', label: 'Shock' },
  { emoji: '🤯', label: 'Mind Blown' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '👀', label: 'Eyes' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '😍', label: 'Love Eyes' },
  { emoji: '🤔', label: 'Think' },
];

// YouTube-style inline emote picker for chat
export default function EmotePicker() {
  const { sendEmote, gamePhase, isDrawer, players, playerId } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const lastEmoteTimeRef = useRef(0);

  const handleEmoteClick = useCallback((emoji: string) => {
    const now = Date.now();
    if (now - lastEmoteTimeRef.current < 500) return;
    
    lastEmoteTimeRef.current = now;
    sendEmote(emoji);
    setIsOpen(false);
  }, [sendEmote]);

  const currentPlayer = players.find((p) => p.id === playerId);
  const hasGuessed = Boolean(currentPlayer?.hasGuessed);

  // Only show for non-drawers during drawing phase who haven't guessed
  if (gamePhase !== 'drawing' || isDrawer || hasGuessed) {
    return null;
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close on click outside */}
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />
            {/* Popover Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, type: 'spring' }}
              className="absolute bottom-10 right-0 z-50 p-2 bg-card border border-border rounded-xl shadow-xl w-64 mb-2"
            >
              <div className="grid grid-cols-6 gap-1">
                {EMOTES.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmoteClick(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-secondary transition-colors"
                    title={label}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg transition-all ${
          isOpen
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
        title={isOpen ? 'Close reactions' : 'Send reaction'}
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <Smile className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

// Quick reaction bar that shows above the chat input
export function EmoteQuickBar() {
  const { sendEmote, gamePhase, isDrawer, players, playerId } = useGame();
  const lastEmoteTimeRef = useRef(0);

  const currentPlayer = players.find((p) => p.id === playerId);
  const hasGuessed = Boolean(currentPlayer?.hasGuessed);

  const handleEmoteClick = useCallback((emoji: string) => {
    const now = Date.now();
    if (now - lastEmoteTimeRef.current < 400) return;
    
    lastEmoteTimeRef.current = now;
    sendEmote(emoji);
  }, [sendEmote]);

  // Only show for non-drawers during drawing phase
  if (gamePhase !== 'drawing' || isDrawer || hasGuessed) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 px-3 pb-2">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">React:</span>
      {EMOTES.slice(0, 6).map(({ emoji, label }) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.2, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleEmoteClick(emoji)}
          className="w-7 h-7 flex items-center justify-center text-base rounded-full hover:bg-secondary/80 transition-all"
          title={label}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}

