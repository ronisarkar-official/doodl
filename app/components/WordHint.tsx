'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../context/GameContext';

interface WordPart {
	chars: string[];
	length: number;
}

export default function WordHint() {
	const { wordHint, currentWord, gamePhase, isDrawer } = useGame();

	// Show full word during roundEnd or for drawer
	const displayWord = gamePhase === 'roundEnd' || isDrawer ? currentWord : wordHint;

	// Parse the hint - supports "_ _ _ _" (hint) or "apple pie" (full word)
	const wordParts: WordPart[] = (() => {
		if (!displayWord) return [];

		const tokens = displayWord.split(' ');
		const isHintFormat = tokens.every(token => token.length <= 1);

		if (isHintFormat) {
			const chars = tokens.filter(t => t !== '');
			return [{ chars, length: chars.length }];
		} else {
			const words = displayWord.split(/\s+/).filter(w => w.length > 0);
			return words.map(word => ({
				chars: word.split(''),
				length: word.length
			}));
		}
	})();

	// Don't render if drawer or wrong phase
	if (isDrawer || (gamePhase !== 'drawing' && gamePhase !== 'roundEnd') || wordParts.length === 0) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3"
		>
			{/* Word display */}
			<div className="flex items-center gap-3 sm:gap-4">
				{wordParts.map((part, wordIndex) => (
					<div key={`word-${wordIndex}`} className="flex items-center gap-1.5">
						{/* Letters */}
						<div className="flex items-center gap-[3px] sm:gap-1">
							{part.chars.map((char, charIndex) => {
								const isHidden = char === '_';
								const isRevealed = !isHidden && gamePhase === 'drawing';

								return (
									<div
										key={`${wordIndex}-${charIndex}`}
										className={`
											flex items-center justify-center
											w-5 h-7 sm:w-7 sm:h-9
											rounded-md
											font-bold font-mono text-sm sm:text-base uppercase
											transition-colors duration-200
											${isHidden
												? 'bg-muted/80 border-b-2 border-muted-foreground/30'
												: isRevealed
													? 'bg-white dark:bg-zinc-800 text-black dark:text-white border-b-2 border-black/20 dark:border-white/20'
													: 'bg-white dark:bg-zinc-800 text-black dark:text-white border-b-2 border-black/20 dark:border-white/20'
											}
										`}
									>
										{isHidden ? (
											<span className="text-muted-foreground/10 select-none">_</span>
										) : (
											<span>{char}</span>
										)}
									</div>
								);
							})}
						</div>

						{/* Word length - clean and minimal */}
						<span className="text-xs sm:text-sm font-medium text-muted-foreground/60 tabular-nums ml-0.5">
							{part.length}
						</span>
					</div>
				))}
			</div>
		</motion.div>
	);
}
