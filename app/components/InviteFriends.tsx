'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Users, Link2, Share2 } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface InviteFriendsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteFriends({ isOpen, onClose }: InviteFriendsProps) {
  const { roomId } = useGame();
  const [copied, setCopied] = useState(false);

  const roomUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/game?room=${roomId}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopyLink();
      return;
    }

    try {
      await navigator.share({
        title: 'Join my doodle game!',
        text: `Join my drawing game! Room code: ${roomId}`,
        url: roomUrl,
      });
    } catch {
      // User cancelled or share failed
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md p-6 sm:p-8 relative"
            style={{
              background: '#202936',
              border: '4px solid #ffffff',
              borderRadius: '1.5rem',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Invite Friends
              </h2>
              <button
                onClick={onClose}
                className="p-2 transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
                style={{
                  background: '#ff8a65',
                  border: '2px solid #000000',
                  borderRadius: '0.75rem',
                  boxShadow: '0 2px 0 #000000',
                  color: '#000000'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Code */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                Room Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 font-mono text-2xl font-bold tracking-widest"
                  style={{
                    background: '#2d3748',
                    border: '2px solid #a0aec0',
                    borderRadius: '0.75rem',
                    color: '#ffffff'
                  }}>
                  {roomId}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3 transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
                  style={{
                    background: '#cbd5e1',
                    border: '2px solid #000000',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 0 #000000',
                    color: '#000000'
                  }}
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Room Link */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                Share Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 text-[15px] truncate font-mono"
                  style={{
                    background: '#2d3748',
                    border: '2px solid #a0aec0',
                    borderRadius: '0.75rem',
                    color: '#ffffff'
                  }}>
                  {roomUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-3 transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
                  style={{
                    background: '#4fc3f7',
                    border: '2px solid #000000',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 0 #000000',
                    color: '#000000'
                  }}
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Link2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[18px] font-bold transition-all hover:scale-[1.02] active:translate-y-1 active:shadow-none"
              style={{
                background: '#4fc3f7',
                border: '2px solid #000000',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 0 #000000',
                color: '#000000'
              }}
            >
              <Share2 className="w-5 h-5" />
              Share with Friends
            </button>

            {/* Hint */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              Friends can join using the link or by entering the room code
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// Compact button version for the game header
export function InviteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 transition-all text-[15px] font-bold hover:scale-105 active:translate-y-0.5 active:shadow-none"
      style={{
        background: '#4fc3f7',
        border: '2px solid #000000',
        borderRadius: '0.75rem',
        boxShadow: '0 2px 0 #000000',
        color: '#000000'
      }}
      title="Invite Friends"
    >
      <Users className="w-4 h-4" />
      <span className="hidden sm:inline">Invite</span>
    </button>
  );
}
