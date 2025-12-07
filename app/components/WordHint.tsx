'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';

export default function WordHint() {
	const { wordHint, currentWord, gamePhase, isDrawer } = useGame();

	// Show full word during roundEnd or for drawer
	const displayWord = gamePhase === 'roundEnd' || isDrawer ? currentWord : wordHint;

	// Parse the hint to get individual characters and words
	// Handle both formats: "_ _ _ _" (space-separated chars) and "apple" (no spaces)
	const { words, letterCount } = useMemo(() => {
		if (!displayWord) {
			return { words: [], letterCount: 0 };
		}

		// Check if the display word is space-separated characters (hint format)
		const isSpaceSeparated = displayWord.includes(' ') && 
			displayWord.split(' ').every(char => char.length <= 1 || char === '');

		if (isSpaceSeparated) {
			// Hint format: "_ _ _ _ _ _" or "a p _ l e" - split by space
			const chars = displayWord.split(' ').filter(char => char !== '');
			return { 
				words: [chars], 
				letterCount: chars.filter(c => c !== ' ').length 
			};
		} else {
			// Full word format: "apple" or "apple pie" (multi-word)
			// Split by spaces to get individual words, then split each word into characters
			const wordParts = displayWord.split(/\s+/).filter(w => w.length > 0);
			const parsedWords = wordParts.map(word => word.split(''));
			const totalLetters = parsedWords.reduce((acc, word) => acc + word.length, 0);
			return { 
				words: parsedWords, 
				letterCount: totalLetters 
			};
		}
	}, [displayWord]);

	// Don't render if:
	// - User is the drawer (they see the word in the navbar)
	// - Game is not in drawing or roundEnd phase
	// - No words to display
	if (isDrawer || (gamePhase !== 'drawing' && gamePhase !== 'roundEnd') || words.length === 0) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-secondary/50 rounded-lg sm:rounded-xl border border-border/50 backdrop-blur-sm"
		>
			{/* Word Label - Hidden on mobile */}
			<div className="hidden sm:flex items-center gap-1.5">
				<span className="text-base sm:text-lg">💬</span>
				<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Word</span>
			</div>

			{/* Divider - Hidden on mobile */}
			<div className="hidden sm:block h-5 w-px bg-border" />

			{/* Letter Boxes - with word separators for multi-word phrases */}
			<div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto max-w-[180px] sm:max-w-none">
				{words.map((word, wordIndex) => (
					<React.Fragment key={`word-${wordIndex}`}>
						{/* Word separator for multi-word phrases */}
						{wordIndex > 0 && (
							<div className="w-2 sm:w-3 h-0.5 bg-border/50 mx-0.5 sm:mx-1 rounded-full shrink-0" />
						)}
						<div className="flex items-center gap-0.5">
							{word.map((char, charIndex) => {
								const globalIndex = words
									.slice(0, wordIndex)
									.reduce((acc, w) => acc + w.length, 0) + charIndex;
								
								return (
									<motion.div
										key={`${wordIndex}-${charIndex}`}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: globalIndex * 0.03 }}
										className={`
											flex items-center justify-center shrink-0
											w-4 h-5 sm:w-6 sm:h-7 rounded sm:rounded-md text-[10px] sm:text-sm font-bold font-mono
											transition-colors duration-200
											${char === '_'
												? 'bg-muted/50 border border-border/50 text-muted-foreground/30'
												: 'bg-foreground/5 border border-foreground/10 text-foreground'
											}
										`}
									>
										{char === '_' ? (
											<span className="text-muted-foreground/50">_</span>
										) : (
											<motion.span
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{ type: 'spring', stiffness: 300 }}
											>
												{char.toUpperCase()}
											</motion.span>
										)}
									</motion.div>
								);
							})}
						</div>
					</React.Fragment>
				))}
			</div>

			{/* Letter Count Badge - Hidden on mobile */}
			<motion.div
				initial={{ opacity: 0, x: 10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: 0.2 }}
				className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full"
			>
				<span className="text-[10px] font-semibold text-muted-foreground">
					{letterCount} {letterCount === 1 ? 'letter' : 'letters'}
				</span>
			</motion.div>
		</motion.div>
	);
}
