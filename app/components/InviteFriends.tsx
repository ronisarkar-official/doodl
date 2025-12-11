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
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
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
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Code */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Room Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 font-mono text-2xl font-bold text-center tracking-widest text-foreground">
                  {roomId}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
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
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Share Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground truncate font-mono">
                  {roomUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors"
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold transition-all hover:opacity-90 shadow-lg shadow-purple-500/20"
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
      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all text-sm font-medium"
      title="Invite Friends"
    >
      <Users className="w-4 h-4" />
      <span className="hidden sm:inline">Invite</span>
    </button>
  );
}
