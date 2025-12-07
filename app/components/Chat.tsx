'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, Player } from '../context/GameContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import Confetti from './Confetti';

type ChatMessage = {
	id: string;
	playerName?: string;
	text: string;
	isSystem?: boolean;
	isCorrect?: boolean;
};

export default function Chat(): React.JSX.Element {
	const {
		chatMessages = [],
		submitGuess,
		gamePhase,
		isDrawer,
		players = [],
		playerId,
	} = useGame();
	const [input, setInput] = useState('');
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const isUserNearBottomRef = useRef(true);
	const prevMessageCountRef = useRef(0);
	const lastSentTextRef = useRef<string | null>(null); // Track text of last message we sent
	const [showConfetti, setShowConfetti] = useState(false);

	const { playCorrect, playMessage } = useSoundEffects();

	// scroll to bottom (smooth) but only when user hasn't intentionally scrolled up
	const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
		if (!messagesEndRef.current) return;
		messagesEndRef.current.scrollIntoView({ behavior });
	};

	// update whether user is near bottom
	const handleScroll = () => {
		const el = viewportRef.current;
		if (!el) return;
		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		// threshold can be tuned
		isUserNearBottomRef.current = distanceFromBottom < 150;
	};

	useEffect(() => {
		// when new messages arrive, auto-scroll if user was near bottom
		if (isUserNearBottomRef.current) scrollToBottom();

		// Play sound for new messages
		if (chatMessages.length > prevMessageCountRef.current) {
			const newMessage = chatMessages[chatMessages.length - 1];

			// Check if this is our own message (compare text)
			const isOwnMessage =
				lastSentTextRef.current && newMessage?.text === lastSentTextRef.current;

			if (isOwnMessage) {
				lastSentTextRef.current = null; // Clear after matching
				// For our own message: play correct sound if correct, message sound if wrong
				if (newMessage.isCorrect) {
					playCorrect();
					setShowConfetti(true);
					setTimeout(() => setShowConfetti(false), 100);
				} else {
					playMessage(); // Play message sound for wrong guesses
				}
			} else if (newMessage && !newMessage.isSystem) {
				// Other player's message
				if (
					newMessage.isCorrect ||
					newMessage.text.includes('guessed the word')
				) {
					playCorrect();
					setShowConfetti(true);
					setTimeout(() => setShowConfetti(false), 100);
				} else {
					playMessage(); // Play message sound for all chat messages
				}
			}
		}
		prevMessageCountRef.current = chatMessages.length;
	}, [chatMessages.length, chatMessages, playCorrect, playMessage]);

	useEffect(() => {
		// initial scroll on mount
		scrollToBottom('auto');
	}, []);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!input.trim() || gamePhase !== 'drawing') return;
		if (isDrawer) return; // drawer cannot chat

		lastSentTextRef.current = input.trim(); // Save text to determine sound later
		submitGuess(input.trim());
		setInput('');
		// make sure the new message is visible immediately
		setTimeout(() => scrollToBottom(), 50);
	};

	// allow Enter to send, Shift+Enter for newline
	const handleKeyDown: React.KeyboardEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const currentPlayer = players.find((p: Player) => p.id === playerId);
	const hasGuessed = Boolean(currentPlayer?.hasGuessed);

	const getInputState = () => {
		if (gamePhase !== 'drawing')
			return { placeholder: 'Waiting for round...', disabled: true };
		if (isDrawer)
			return { placeholder: "You're drawing! Can't chat.", disabled: true };
		if (hasGuessed)
			return { placeholder: 'You already guessed correctly!', disabled: true };
		return { placeholder: 'Type your guess...', disabled: false };
	};

	const inputState = getInputState();

	return (
		<>
			<Confetti active={showConfetti} />
			<div className="flex flex-col h-full bg-sidebar overflow-hidden">
				{/* Messages */}
				<div className="flex-1 min-h-0 overflow-hidden">
					<ScrollArea className="h-full">
						{/* Using an inner div as the viewport for easier control and to attach onScroll */}
						<div
							ref={viewportRef}
							onScroll={handleScroll}
							className="p-3 space-y-1 min-h-0 overflow-auto"
							aria-live="polite"
							aria-relevant="additions">
							<AnimatePresence mode="popLayout">
								{chatMessages.map((msg: ChatMessage, index: number) => (
									<motion.div
										key={`${msg.id}-${index}`}
										initial={{ opacity: 0, x: 10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -8 }}
										transition={{ type: 'spring', stiffness: 300, damping: 28 }}
										className={`text-sm py-1 px-2 rounded break-words max-w-full leading-relaxed ${
											msg.isSystem
												? 'text-muted-foreground italic text-xs text-center my-2'
												: msg.isCorrect
												? 'bg-green-500/10 text-green-500 border border-green-500/20'
												: 'hover:bg-secondary/50'
										}`}>
										{!msg.isSystem && (
											<span
												className={`font-semibold mr-2 ${
													msg.isCorrect ? 'text-green-500' : 'text-primary'
												}`}>
												{msg.playerName}:
											</span>
										)}
										<span className={msg.isSystem ? '' : 'text-foreground'}>
											{msg.text}
										</span>
									</motion.div>
								))}
							</AnimatePresence>
							<div ref={messagesEndRef} />
						</div>

						{/* shadcn scrollbar components are optional; if your implementation exposes them, they will show here.
              If not, ScrollArea will still provide a native fallback. */}
					</ScrollArea>
				</div>

				{/* Input Area */}
				<div className="p-3 border-t border-sidebar-border bg-sidebar">
					<form
						onSubmit={(e) => handleSubmit(e)}
						className="relative">
						{/* switch to textarea if you want multi-line editing */}
						<input
							aria-label="Chat message"
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={inputState.placeholder}
							disabled={inputState.disabled}
							className={`w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-md border border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground ${
								inputState.disabled
									? 'opacity-50 cursor-not-allowed'
									: 'hover:bg-secondary focus:bg-background'
							}`}
						/>

						{/* Send button (desktop) */}
						<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
							<span className="text-xs text-muted-foreground hidden sm:inline">
								↵
							</span>
							<Button
								size="sm"
								type="button"
								onClick={() => handleSubmit()}
								disabled={inputState.disabled || !input.trim()}
								aria-label="Send message">
								<Send className="h-4 w-4" />
							</Button>
						</div>
					</form>

					{isDrawer && gamePhase === 'drawing' && (
						<p className="text-destructive text-[10px] mt-1.5 text-center font-medium">
							🚫 Chat disabled while drawing
						</p>
					)}
				</div>
			</div>
		</>
	);
}
