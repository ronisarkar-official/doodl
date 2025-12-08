"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Timer, 
  Medal, 
  RefreshCcw, 
  Award, 
  BarChart3,
  Home,
  ThumbsUp,
  Smile,
  Flame
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import Confetti from './Confetti';

// Vote options
const VOTE_OPTIONS = [
  { id: 'like', emoji: '👍', label: 'Nice!', icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { id: 'funny', emoji: '😂', label: 'Funny', icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { id: 'amazing', emoji: '🔥', label: 'Amazing', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
];

export default function RoundEnd() {
  const { gamePhase, currentWord, players, resetGame, playerId, isOwner, isDrawer } = useGame();
  const { playVictory, playFail } = useSoundEffects();
  const router = useRouter();
  
  // Voting state
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Confetti only active during game end
  const showConfetti = gamePhase === 'gameEnd';

  // Get current player's guessed status
  const currentPlayer = players.find(p => p.id === playerId);
  const didNotGuess = currentPlayer && !currentPlayer.hasGuessed && !isDrawer;
  
  // Get the drawer for this round
  const drawer = players.find(p => p.isDrawing);

  // Reset vote state when game phase changes
  useEffect(() => {
    setSelectedVote(null);
    setHasVoted(false);
  }, [gamePhase]);

  // Play victory sound when game ends
  useEffect(() => {
    if (gamePhase === 'gameEnd') {
      playVictory();
    }
  }, [gamePhase, playVictory]);

  // Play fail sound when round ends and player didn't guess (not drawer)
  useEffect(() => {
    if (gamePhase === 'roundEnd' && didNotGuess) {
      playFail();
    }
  }, [gamePhase, didNotGuess, playFail]);

  if (gamePhase !== 'roundEnd' && gamePhase !== 'gameEnd') return null;

  const isGameEnd = gamePhase === 'gameEnd';
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Handle vote click
  const handleVote = (voteId: string) => {
    if (hasVoted || isDrawer) return;
    setSelectedVote(voteId);
    setHasVoted(true);
  };

  return (
    <>
      <Confetti active={showConfetti} duration={5000} particleCount={100} />
      
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
          className="bg-card/95 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full text-center backdrop-blur-xl ring-1 ring-white/5"
        >
          {/* Header */}
          {isGameEnd ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center mb-6"
            >
              <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-3 ring-1 ring-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-br from-yellow-400 to-orange-600 bg-clip-text text-transparent">
                Game Over
              </h2>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 ring-1 ring-primary/20">
                <Timer className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Time&apos;s Up!
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Word was:
                </span>
                <span className="text-lg font-bold text-primary capitalize">
                  {currentWord}
                </span>
              </div>
            </div>
          )}

          {/* Voting Section - Only show at round end, not game end */}
          {!isGameEnd && drawer && !isDrawer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
                Rate {drawer.name}&apos;s drawing
              </p>
              <div className="flex justify-center gap-2">
                {VOTE_OPTIONS.map((option) => {
                  const isSelected = selectedVote === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: hasVoted ? 1 : 1.05 }}
                      whileTap={{ scale: hasVoted ? 1 : 0.95 }}
                      onClick={() => handleVote(option.id)}
                      disabled={hasVoted}
                      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl border transition-all ${
                        isSelected
                          ? `${option.bg} ${option.border} ${option.color} ring-2 ring-current ring-offset-2 ring-offset-card`
                          : hasVoted
                          ? 'bg-secondary/30 border-border/30 text-muted-foreground opacity-50'
                          : `${option.bg} ${option.border} ${option.color} hover:scale-105`
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider">
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              {hasVoted && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-500 mt-2"
                >
                  ✓ Vote submitted!
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Scoreboard */}
          <div className="bg-secondary/30 rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-secondary/20">
              {isGameEnd ? (
                <Award className="w-4 h-4 text-yellow-500" />
              ) : (
                <BarChart3 className="w-4 h-4 text-primary" />
              )}
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isGameEnd ? 'Final Standings' : 'Leaderboard'}
              </h3>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                    index === 0 && isGameEnd
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : player.id === playerId
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 flex justify-center font-bold text-sm ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-500' : 'text-muted-foreground'
                    }`}>
                      {index <= 2 ? (
                        <Medal className="w-4 h-4" />
                      ) : (
                        <span>#{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{player.avatar}</span>
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-semibold ${player.id === playerId ? 'text-primary' : 'text-foreground'}`}>
                          {player.name}
                        </span>
                        {player.id === playerId && (
                          <span className="text-[9px] font-bold text-primary uppercase tracking-wider leading-none">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-sm font-bold font-mono ${
                    index === 0 && isGameEnd ? 'text-yellow-500' : 'text-foreground'
                  }`}>
                    {player.score}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Section */}
          <div className="mt-6 pt-0">
            {isGameEnd ? (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </motion.button>
                
                {isOwner && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetGame}
                    className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Play Again
                  </motion.button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-bold uppercase tracking-wider">
                  <span>Next round</span>
                  <span>5s</span>
                </div>
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
