'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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

// Quick messages for fast interaction
const QUICK_MESSAGES = ['Nice!', 'Close!', 'LOL 😂', 'GG', '🔥'];

export default function Chat(): React.JSX.Element {
	const {
		chatMessages = [],
		submitGuess,
		sendLobbyMessage,
		sendTypingIndicator,
		typingPlayers,
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
	const lastSentTextRef = useRef<string | null>(null);
	const lastTypingEmitRef = useRef<number>(0);
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
		isUserNearBottomRef.current = distanceFromBottom < 150;
	};

	useEffect(() => {
		if (isUserNearBottomRef.current) scrollToBottom();

		if (chatMessages.length > prevMessageCountRef.current) {
			const newMessage = chatMessages[chatMessages.length - 1];

			const isOwnMessage =
				lastSentTextRef.current && newMessage?.text === lastSentTextRef.current;

			if (isOwnMessage) {
				lastSentTextRef.current = null;
				if (newMessage.isCorrect) {
					playCorrect();
					queueMicrotask(() => {
						setShowConfetti(true);
						setTimeout(() => setShowConfetti(false), 100);
					});
				} else {
					playMessage();
				}
			} else if (newMessage && !newMessage.isSystem) {
				if (
					newMessage.isCorrect ||
					newMessage.text.includes('guessed the word')
				) {
					playCorrect();
					queueMicrotask(() => {
						setShowConfetti(true);
						setTimeout(() => setShowConfetti(false), 100);
					});
				} else {
					playMessage();
				}
			}
		}
		prevMessageCountRef.current = chatMessages.length;
	}, [chatMessages.length, chatMessages, playCorrect, playMessage]);

	useEffect(() => {
		scrollToBottom('auto');
	}, []);

	// Handle typing indicator with debounce
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
		
		// Only emit typing if we're in drawing phase and not the drawer
		if (gamePhase === 'drawing' && !isDrawer && e.target.value.length > 0) {
			const now = Date.now();
			// Debounce: only emit every 2 seconds
			if (now - lastTypingEmitRef.current > 2000) {
				sendTypingIndicator();
				lastTypingEmitRef.current = now;
			}
		}
	}, [gamePhase, isDrawer, sendTypingIndicator]);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!input.trim()) return;
		
		// Handle lobby chat
		if (gamePhase === 'lobby') {
			lastSentTextRef.current = input.trim();
			sendLobbyMessage(input.trim());
			setInput('');
			setTimeout(() => scrollToBottom(), 50);
			return;
		}
		
		// Handle game guessing
		if (gamePhase !== 'drawing') return;
		if (isDrawer) return;

		lastSentTextRef.current = input.trim();
		submitGuess(input.trim());
		setInput('');
		setTimeout(() => scrollToBottom(), 50);
	};

	// Handle quick message click
	const handleQuickMessage = (msg: string) => {
		if (gamePhase === 'lobby') {
			sendLobbyMessage(msg);
		} else if (gamePhase === 'drawing' && !isDrawer) {
			submitGuess(msg);
		}
		setTimeout(() => scrollToBottom(), 50);
	};

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
		if (gamePhase === 'lobby')
			return { placeholder: 'Chat with players...', disabled: false };
		if (gamePhase !== 'drawing')
			return { placeholder: 'Waiting for round...', disabled: true };
		if (isDrawer)
			return { placeholder: "You're drawing! Can't chat.", disabled: true };
		if (hasGuessed)
			return { placeholder: 'You already guessed correctly!', disabled: true };
		return { placeholder: 'Type your guess...', disabled: false };
	};

	const inputState = getInputState();
	
	// Filter typing players (exclude self)
	const otherTypingPlayers = typingPlayers.filter(name => {
		const player = players.find(p => p.name === name);
		return player && player.id !== playerId;
	});

	return (
		<>
			<Confetti active={showConfetti} />
			<div className="flex flex-col h-full bg-sidebar overflow-hidden">
				{/* Messages */}
				<div className="flex-1 min-h-0 overflow-hidden">
					<ScrollArea className="h-full">
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
										className={`text-sm py-1 px-2 rounded wrap-break-word max-w-full leading-relaxed ${
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
					</ScrollArea>
				</div>

				{/* Typing Indicator */}
				{otherTypingPlayers.length > 0 && (
					<div className="px-3 py-1 text-xs text-muted-foreground animate-pulse">
						{otherTypingPlayers.length === 1
							? `${otherTypingPlayers[0]} is typing...`
							: `${otherTypingPlayers.length} people are typing...`}
					</div>
				)}

				{/* Quick Messages - Only show when chat is enabled */}
				{(gamePhase === 'lobby' || (gamePhase === 'drawing' && !isDrawer && !hasGuessed)) && (
					<div className="px-3 pb-2 flex flex-wrap gap-1.5">
						{QUICK_MESSAGES.map((msg) => (
							<button
								key={msg}
								onClick={() => handleQuickMessage(msg)}
								className="px-2.5 py-1 text-xs font-medium bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md border border-border/50 transition-all hover:scale-105">
								{msg}
							</button>
						))}
					</div>
				)}

				{/* Input Area */}
				<div className="p-3 border-t border-sidebar-border bg-sidebar">
					<form
						onSubmit={(e) => handleSubmit(e)}
						className="relative">
						<input
							aria-label="Chat message"
							type="text"
							value={input}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							placeholder={inputState.placeholder}
							disabled={inputState.disabled}
							className={`w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-md border border-transparent focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground ${
								inputState.disabled
									? 'opacity-50 cursor-not-allowed'
									: 'hover:bg-secondary focus:bg-background'
							}`}
						/>

						{/* Send button */}
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
