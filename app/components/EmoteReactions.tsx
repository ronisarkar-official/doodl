'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';

// Emotes available for reactions
export const EMOTES = ['😂', '👏', '🔥', '💀', '❤️', '👀', '🎨', '✨'];

export default function EmoteReactions() {
	const { emoteReactions, sendEmote, gamePhase, isDrawer } = useGame();
	
	// Only show emote buttons during drawing phase for non-drawers
	const showEmoteButtons = gamePhase === 'drawing' && !isDrawer;
	
	return (
		<>
			{/* Floating Emotes Display */}
			<div className="fixed bottom-32 right-8 pointer-events-none z-50">
				<AnimatePresence>
					{emoteReactions.map((reaction) => (
						<motion.div
							key={reaction.id}
							initial={{ opacity: 0, y: 20, scale: 0.5 }}
							animate={{ opacity: 1, y: -60, scale: 1 }}
							exit={{ opacity: 0, y: -100, scale: 0.3 }}
							transition={{ duration: 1.5, ease: 'easeOut' }}
							className="absolute bottom-0 right-0 flex flex-col items-center">
							<span className="text-4xl drop-shadow-lg">{reaction.emote}</span>
							<span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
								{reaction.playerName}
							</span>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
			
			{/* Emote Buttons */}
			{showEmoteButtons && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center gap-1 mt-2">
					{EMOTES.slice(0, 5).map((emote) => (
						<button
							key={emote}
							onClick={() => sendEmote(emote)}
							className="w-9 h-9 flex items-center justify-center text-lg bg-secondary/50 hover:bg-secondary rounded-lg border border-border/50 transition-all hover:scale-110 active:scale-95"
							title={`React with ${emote}`}>
							{emote}
						</button>
					))}
				</motion.div>
			)}
		</>
	);
}
