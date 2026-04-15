'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useGame } from './context/GameContext';
import {
	ArrowRight,
	Users,
	X,
	Globe,
	Lock,
	ChevronRight,
	Pencil,
	Brain,
	Trophy,
	Zap,
} from 'lucide-react';

import { AvatarParts, getRandomAvatar } from './data/avatarParts';
import { generateFunnyName } from './data/funnyNames';

// ── Floating doodle background icons ──────────────────────────────────────────
const DoodleIcons = () => (
	<div
		className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0"
		aria-hidden="true">
		{/* Pencil – top left */}
		<svg
			className="absolute top-[8%] left-[5%] w-14 h-14 opacity-30 text-white"
			style={{ transform: 'rotate(-30deg)' }}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
		</svg>

		{/* Triangle – left */}
		<svg
			className="absolute top-[30%] left-[3%] w-10 h-10 opacity-25 text-[#4fc3f7]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
		</svg>

		{/* Circle scribble – left middle */}
		<svg
			className="absolute top-[48%] left-[2%] w-14 h-14 opacity-25 text-white"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round">
			<circle
				cx="12"
				cy="12"
				r="10"
			/>
		</svg>

		{/* Wave / zigzag – bottom left */}
		<svg
			className="absolute bottom-[22%] left-[4%] w-12 h-6 opacity-25 text-white"
			viewBox="0 0 48 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round">
			<polyline points="0,18 8,6 16,18 24,6 32,18 40,6 48,18" />
		</svg>

		{/* Pencils group – bottom left */}
		<svg
			className="absolute bottom-[8%] left-[6%] w-20 h-20 opacity-25 text-white"
			style={{ transform: 'rotate(20deg)' }}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
		</svg>

		{/* Dash marks – top center-left */}
		<svg
			className="absolute top-[18%] left-[18%] w-8 h-8 opacity-20 text-[#4fc3f7]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round">
			<line
				x1="5"
				y1="12"
				x2="19"
				y2="12"
			/>
		</svg>

		{/* Small circle – top right area */}
		<svg
			className="absolute top-[10%] right-[12%] w-6 h-6 opacity-30 text-[#4fc3f7]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round">
			<circle
				cx="12"
				cy="12"
				r="9"
			/>
		</svg>

		{/* Paintbrush – top right */}
		<svg
			className="absolute top-[6%] right-[5%] w-16 h-16 opacity-30 text-[#4fc3f7]"
			style={{ transform: 'rotate(30deg)' }}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
			<path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 6.5 1 5 -4-.5-1.5-1.03-1.04-3-1.04z" />
		</svg>

		{/* Right middle doodle face */}
		<svg
			className="absolute top-[40%] right-[3%] w-16 h-16 opacity-25 text-[#4fc3f7]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round">
			<circle
				cx="12"
				cy="12"
				r="10"
			/>
			<path d="M8 14s1.5 2 4 2 4-2 4-2" />
			<line
				x1="9"
				y1="9"
				x2="9.01"
				y2="9"
				strokeWidth="3"
			/>
			<line
				x1="15"
				y1="9"
				x2="15.01"
				y2="9"
				strokeWidth="3"
			/>
		</svg>

		{/* Small circle dot – right */}
		<svg
			className="absolute top-[62%] right-[5%] w-5 h-5 opacity-30 text-white"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2">
			<circle
				cx="12"
				cy="12"
				r="9"
			/>
		</svg>

		{/* Spiral / curl – bottom right */}
		<svg
			className="absolute bottom-[28%] right-[4%] w-12 h-12 opacity-20 text-[#4fc3f7]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round">
			<path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-2 6-.227 1.26.184 2 1 2 .845 0 1.09-.415 1.25-.5.9-.666 1.35-1.75.75-2.75-.6-1-1.94-1.5-3-2-2.2-.9-4.95.5-5.25 4-.44 5.25 4.5 8.5 9 6.75l.3-.125" />
		</svg>

		{/* Sparkle marks – bottom right */}
		<svg
			className="absolute bottom-[10%] right-[8%] w-12 h-12 opacity-25 text-white"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round">
			<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
		</svg>

		{/* Tick / check marks – center left dashes */}
		<svg
			className="absolute bottom-[42%] left-[2%] w-10 h-8 opacity-20 text-[#4fc3f7]"
			viewBox="0 0 40 32"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round">
			<polyline points="4,16 10,22 20,8" />
			<polyline points="20,16 26,22 36,8" />
		</svg>
	</div>
);

// ── Room visibility toggle ─────────────────────────────────────────────────────
function RoomVisibilityOption({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: React.ElementType;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`relative h-[72px] rounded-xl flex flex-col items-center justify-center gap-1.5 px-3 transition-all ${
				active ?
					'bg-[#4fc3f7] text-black border-2 border-black shadow-[0_4px_0_#000]'
				:	'bg-[#cbd5e1] text-black/70 border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none hover:bg-[#94a3b8]'
			}`}
			aria-pressed={active}>
			<Icon
				className={`w-6 h-6 ${active ? 'text-black' : 'text-black/70'}`}
				strokeWidth={2}
			/>
			<span
				className={`text-[15px] font-bold ${active ? 'text-black' : 'text-black/70'}`}>
				{label}
			</span>
		</button>
	);
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Home() {
	const [name, setName] = useState(() => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('playerDisplayName') || '';
		}
		return '';
	});
	const [roomId, setRoomId] = useState('');
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [isPublic, setIsPublic] = useState(true);
	const [avatar] = useState<AvatarParts>(() => getRandomAvatar());

	const [isJoining, setIsJoining] = useState(false);
	const [onlineCount, setOnlineCount] = useState(2819);
	const router = useRouter();

	// Dynamic online count effect
	useEffect(() => {
		const updateOnlineCount = () => {
			setOnlineCount((prev) => {
				const change = Math.floor(Math.random() * 101) - 50;
				const newCount = Math.max(2500, Math.min(3200, prev + change));
				return newCount;
			});
		};

		const scheduleUpdate = () => {
			const delay = 2000 + Math.random() * 1000;
			return setTimeout(() => {
				updateOnlineCount();
				timerId = scheduleUpdate();
			}, delay);
		};

		let timerId = scheduleUpdate();
		return () => clearTimeout(timerId);
	}, []);

	const { joinRoom, quickPlay } = useGame();

	// Save name to localStorage when it changes
	useEffect(() => {
		if (name) {
			localStorage.setItem('playerDisplayName', name);
		}
	}, [name]);

	const joinInputRef = useRef<HTMLInputElement>(null);
	const prevActiveElement = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (showJoinModal || showCreateModal) {
			prevActiveElement.current = document.activeElement as HTMLElement;
			setTimeout(() => joinInputRef.current?.focus?.(), 50);
			const handleKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					setShowJoinModal(false);
					setShowCreateModal(false);
				}
			};
			window.addEventListener('keydown', handleKey);
			return () => window.removeEventListener('keydown', handleKey);
		} else {
			prevActiveElement.current?.focus?.();
		}
	}, [showJoinModal, showCreateModal]);

	const sanitizeCode = (val: string) =>
		val.replace(/[^A-Z0-9-]/gi, '').toUpperCase();

	const generateRoomId = () =>
		Math.random().toString(36).substring(2, 8).toUpperCase();

	const handleJoinRoom = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!roomId.trim()) return;

		let playerName = name.trim();
		if (!playerName) {
			playerName = generateFunnyName();
			setName(playerName);
		}

		sessionStorage.setItem('playerName', playerName);
		sessionStorage.setItem('playerAvatar', JSON.stringify(avatar));
		joinRoom(roomId.trim(), playerName, undefined, avatar);
		router.push(`/game?room=${encodeURIComponent(roomId.trim())}`);
		setShowJoinModal(false);
	};

	const handleCreateRoom = (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		let playerName = name.trim();
		if (!playerName) {
			playerName = generateFunnyName();
			setName(playerName);
		}

		const newRoomId = generateRoomId();
		sessionStorage.setItem('playerName', playerName);
		sessionStorage.setItem('playerAvatar', JSON.stringify(avatar));
		joinRoom(newRoomId, playerName, isPublic, avatar);
		router.push(`/game?room=${encodeURIComponent(newRoomId)}`);
		setShowCreateModal(false);
	};

	const handleQuickPlay = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (isJoining) return;

		setIsJoining(true);

		let playerName = name.trim();
		if (!playerName) {
			playerName = generateFunnyName();
			setName(playerName);
		}

		sessionStorage.setItem('playerName', playerName);
		sessionStorage.setItem('playerAvatar', JSON.stringify(avatar));

		const timeoutId = setTimeout(() => {
			setIsJoining(false);
			alert('Connection timed out. Please try again.');
		}, 10000);

		quickPlay(playerName, (roomId) => {
			clearTimeout(timeoutId);
			joinRoom(roomId, playerName, undefined, avatar);
			router.push(`/game?room=${encodeURIComponent(roomId)}`);
		});
	};

	return (
		<div
			className="relative h-screen w-screen flex flex-col items-center px-4 overflow-y-auto hide-scrollbar"
			style={{
				background: '#1a2535',
				scrollBehavior: 'smooth',
			}}>
			{/* Floating doodle decorations */}
			<DoodleIcons />

			{/* ── Hero heading ─────────────────────────────────── */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
				className="relative z-10 text-center mb-6 mt-12">
				<h1
					className="font-bold text-white leading-none select-none"
					style={{
						fontSize: 'clamp(4rem, 10vw, 7rem)',
						letterSpacing: '0.02em',
					}}>
					Doodl
					{/* Pencil icon inline */}
					<span
						className="inline-block ml-2"
						style={{
							fontSize: '0.8em',
							verticalAlign: 'middle',
							transform: 'rotate(-10deg) translateY(-4px)',
							display: 'inline-block',
						}}
						aria-hidden="true">
						✏️
					</span>
				</h1>

				<p
					className="text-white/70 mt-2 text-2xl font-medium select-none"
					style={{ fontStyle: 'italic', letterSpacing: '0.05em' }}>
					Fast, friendly multiplayer rounds
				</p>
			</motion.div>

			{/* ── Card ─────────────────────────────────────────── */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
				className="relative z-10 w-full"
				style={{ maxWidth: 440 }}>
				<div
					className="relative"
					style={{
						background: '#202936',
						border: '4px solid #ffffff',
						borderRadius: '1.5rem',
						padding: '2rem',
						boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
					}}>
					<form onSubmit={handleQuickPlay}>
						{/* Label */}
						<label
							htmlFor="displayName"
							className="block text-[15px] font-bold tracking-widest uppercase mb-2"
							style={{ color: '#ffffff' }}>
							Display Name
						</label>

						{/* Name input */}
						<input
							id="displayName"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							maxLength={20}
							className="w-full h-14 px-4 rounded-xl text-[18px] transition-all mb-4 focus:outline-none"
							style={{
								background: '#2d3748',
								border: '2px solid #a0aec0',
								color: '#ffffff',
							}}
							aria-label="Display name"
						/>

						{/* Play Now button */}
						<button
							type="submit"
							disabled={isJoining}
							className="w-full h-14 rounded-xl font-bold text-[22px] flex items-center justify-center gap-2 transition-all mb-4 mt-2"
							style={{
								background: isJoining ? '#93c5fd' : '#4fc3f7',
								color: '#000000',
								border: '2px solid #000000',
								boxShadow: '0 4px 0 #000000',
							}}>
							{isJoining ? 'Connecting…' : 'Play Now'}
							{!isJoining && <ArrowRight className="w-6 h-6" />}
						</button>

						{/* Create Room / Join Room */}
						<div className="grid grid-cols-2 gap-4">
							<button
								type="button"
								onClick={() => {
									setIsPublic(true);
									setShowCreateModal(true);
								}}
								className="h-12 rounded-xl text-[18px] font-bold transition-all"
								style={{
									background: '#cbd5e1',
									border: '2px solid #000000',
									color: '#000000',
									boxShadow: '0 4px 0 #000000',
								}}>
								Create Room
							</button>
							<button
								type="button"
								onClick={() => {
									setRoomId('');
									setShowJoinModal(true);
								}}
								className="h-12 rounded-xl text-[18px] font-bold transition-all"
								style={{
									background: '#cbd5e1',
									border: '2px solid #000000',
									color: '#000000',
									boxShadow: '0 4px 0 #000000',
								}}>
								Join Room
							</button>
						</div>
					</form>
				</div>

				{/* Stats row */}
				<div className="flex items-center justify-center gap-7 mt-5 select-none">
					<div className="flex items-center gap-2 text-white/50 text-[13px] font-medium">
						<Users
							className="w-4 h-4"
							strokeWidth={1.5}
						/>
						<span>1.2M players</span>
					</div>
					<div className="flex items-center gap-2 text-[13px] font-medium">
						{/* Live broadcast icon */}
						<svg
							className="w-4 h-4 text-white/50"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round">
							<circle
								cx="12"
								cy="12"
								r="2"
							/>
							<path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
							<path d="M7.76 7.76a6 6 0 0 0 0 8.49" />
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
							<path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
						</svg>
						<span className="font-bold text-white/80">
							{onlineCount.toLocaleString()}
						</span>
						<span className="text-white/50">online</span>
					</div>
				</div>
			</motion.div>

			{/* ── How to Play Section ─────────────────────────── */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
				id="how-to-play"
				className="relative z-10 w-full mt-16 mb-8"
				style={{ maxWidth: 900 }}>
				<div className="text-center mb-12">
					<h2
						className="font-bold text-white leading-tight select-none mb-4"
						style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
						How to Play
					</h2>
					<p className="text-white/70 text-lg">
						Fast-paced drawing and guessing in multiplayer rounds
					</p>
				</div>

				{/* Game Flow Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Step 1 */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						className="relative"
						style={{
							background: '#202936',
							border: '3px solid #ffffff',
							borderRadius: '1.2rem',
							padding: '1.8rem',
							boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
						}}>
						<div className="flex items-start gap-4">
							<div
								className="flex-shrink-0 rounded-lg p-3 text-2xl"
								style={{ background: '#4fc3f7', color: '#000' }}>
								<Pencil className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-white mb-2">
									1. Someone Draws
								</h3>
								<p className="text-white/70 text-sm leading-relaxed">
									One player is chosen as the drawer and must sketch a secret
									word on the canvas while others watch in real-time.
								</p>
							</div>
						</div>
					</motion.div>

					{/* Step 2 */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.35, duration: 0.4 }}
						className="relative"
						style={{
							background: '#202936',
							border: '3px solid #ffffff',
							borderRadius: '1.2rem',
							padding: '1.8rem',
							boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
						}}>
						<div className="flex items-start gap-4">
							<div
								className="flex-shrink-0 rounded-lg p-3 text-2xl"
								style={{ background: '#4fc3f7', color: '#000' }}>
								<Brain className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-white mb-2">
									2. Everyone Guesses
								</h3>
								<p className="text-white/70 text-sm leading-relaxed">
									Other players watch the drawing and race to guess the word
									correctly. The faster you guess, the more points you earn!
								</p>
							</div>
						</div>
					</motion.div>

					{/* Step 3 */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.4 }}
						className="relative"
						style={{
							background: '#202936',
							border: '3px solid #ffffff',
							borderRadius: '1.2rem',
							padding: '1.8rem',
							boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
						}}>
						<div className="flex items-start gap-4">
							<div
								className="flex-shrink-0 rounded-lg p-3 text-2xl"
								style={{ background: '#4fc3f7', color: '#000' }}>
								<Zap className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-white mb-2">
									3. Earn Points
								</h3>
								<p className="text-white/70 text-sm leading-relaxed">
									Get points for correct guesses and for getting others to guess
									your drawing. Faster guesses = bigger rewards!
								</p>
							</div>
						</div>
					</motion.div>

					{/* Step 4 */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.45, duration: 0.4 }}
						className="relative"
						style={{
							background: '#202936',
							border: '3px solid #ffffff',
							borderRadius: '1.2rem',
							padding: '1.8rem',
							boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
						}}>
						<div className="flex items-start gap-4">
							<div
								className="flex-shrink-0 rounded-lg p-3 text-2xl"
								style={{ background: '#4fc3f7', color: '#000' }}>
								<Trophy className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-white mb-2">
									4. Win the Round
								</h3>
								<p className="text-white/70 text-sm leading-relaxed">
									Everyone takes turns drawing through multiple rounds. The
									player with the highest score at the end wins bragging rights!
								</p>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Features Row */}
				<div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.4 }}
						className="text-center p-4 rounded-xl"
						style={{
							background: 'rgba(79, 195, 247, 0.1)',
							border: '2px solid rgba(79, 195, 247, 0.3)',
						}}>
						<div className="text-2xl mb-2">⚡</div>
						<p className="text-white/80 font-medium text-sm">Quick Rounds</p>
						<p className="text-white/50 text-xs mt-1">3-5 min per round</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.55, duration: 0.4 }}
						className="text-center p-4 rounded-xl"
						style={{
							background: 'rgba(79, 195, 247, 0.1)',
							border: '2px solid rgba(79, 195, 247, 0.3)',
						}}>
						<div className="text-2xl mb-2">👥</div>
						<p className="text-white/80 font-medium text-sm">2-8 Players</p>
						<p className="text-white/50 text-xs mt-1">Perfect for friends</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6, duration: 0.4 }}
						className="text-center p-4 rounded-xl"
						style={{
							background: 'rgba(79, 195, 247, 0.1)',
							border: '2px solid rgba(79, 195, 247, 0.3)',
						}}>
						<div className="text-2xl mb-2">🎨</div>
						<p className="text-white/80 font-medium text-sm">No Skill Needed</p>
						<p className="text-white/50 text-xs mt-1">Fun drawing or not!</p>
					</motion.div>
				</div>
			</motion.div>

			{/* ── Join Room Modal ───────────────────────────────── */}
			<AnimatePresence>
				{showJoinModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
						role="dialog"
						aria-modal="true"
						aria-labelledby="join-room-title"
						onClick={() => setShowJoinModal(false)}>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-[400px] relative"
							style={{
								background: '#202936',
								border: '4px solid #ffffff',
								borderRadius: '1.5rem',
								padding: '2rem',
								boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
							}}>
							<div className="flex items-center justify-between mb-6">
								<div>
									<h2
										id="join-room-title"
										className="text-2xl font-bold text-white">
										Join Room
									</h2>
									<p className="text-[15px] text-white/70 mt-1">
										Enter the room code to join
									</p>
								</div>
								<button
									aria-label="Close"
									onClick={() => setShowJoinModal(false)}
									className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
									<X className="w-6 h-6" />
								</button>
							</div>

							<form onSubmit={handleJoinRoom}>
								<div className="mb-6">
									<input
										ref={joinInputRef}
										type="text"
										value={roomId}
										onChange={(e) => setRoomId(sanitizeCode(e.target.value))}
										placeholder="Enter code"
										maxLength={10}
										autoFocus
										className="w-full h-14 px-5 text-2xl text-center font-bold tracking-[0.2em] rounded-xl transition-all uppercase placeholder:text-white/30 focus:outline-none"
										style={{
											background: '#2d3748',
											border: '2px solid #a0aec0',
											color: '#ffffff',
										}}
										aria-label="Room code"
									/>
								</div>

								<div className="flex gap-4">
									<button
										type="button"
										onClick={() => setShowJoinModal(false)}
										className="flex-1 h-12 rounded-xl text-[18px] font-bold transition-all"
										style={{
											background: '#cbd5e1',
											border: '2px solid #000000',
											color: '#000000',
											boxShadow: '0 4px 0 #000000',
										}}>
										Cancel
									</button>
									<button
										type="submit"
										disabled={!roomId.trim()}
										className={`flex-1 h-12 rounded-xl text-[18px] font-bold flex flex-row items-center justify-center gap-2 transition-all ${!roomId.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
										style={{
											background: '#4fc3f7',
											border: '2px solid #000000',
											color: '#000000',
											boxShadow: '0 4px 0 #000000',
										}}>
										Join <ChevronRight className="w-5 h-5" />
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}

				{/* ── Create Room Modal ─────────────────────────── */}
				{showCreateModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
						role="dialog"
						aria-modal="true"
						aria-labelledby="create-room-title"
						onClick={() => setShowCreateModal(false)}>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
							onClick={(e) => e.stopPropagation()}
							className="w-full max-w-[400px] relative"
							style={{
								background: '#202936',
								border: '4px solid #ffffff',
								borderRadius: '1.5rem',
								padding: '2rem',
								boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
							}}>
							<div className="flex items-center justify-between mb-6">
								<div>
									<h2
										id="create-room-title"
										className="text-2xl font-bold text-white">
										Create Room
									</h2>
									<p className="text-[15px] text-white/70 mt-1">
										Set up a new game room
									</p>
								</div>
								<button
									aria-label="Close"
									onClick={() => setShowCreateModal(false)}
									className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
									<X className="w-6 h-6" />
								</button>
							</div>

							<form onSubmit={handleCreateRoom}>
								<div className="mb-6">
									<label
										className="block text-[15px] font-bold tracking-widest uppercase mb-3"
										style={{ color: '#ffffff' }}>
										Room visibility
									</label>
									<div className="grid grid-cols-2 gap-4">
										<RoomVisibilityOption
											icon={Globe}
											label="Public"
											active={isPublic}
											onClick={() => setIsPublic(true)}
										/>
										<RoomVisibilityOption
											icon={Lock}
											label="Private"
											active={!isPublic}
											onClick={() => setIsPublic(false)}
										/>
									</div>
									<p className="text-[15px] text-white/60 mt-4 leading-relaxed">
										{isPublic ?
											'Anyone can find and join your room randomly.'
										:	'Only players with the invite code can join!'}
									</p>
								</div>

								<div className="flex gap-4 mt-2">
									<button
										type="button"
										onClick={() => setShowCreateModal(false)}
										className="flex-1 h-12 rounded-xl text-[18px] font-bold transition-all"
										style={{
											background: '#cbd5e1',
											border: '2px solid #000000',
											color: '#000000',
											boxShadow: '0 4px 0 #000000',
										}}>
										Cancel
									</button>
									<button
										type="submit"
										className="flex-1 h-12 rounded-xl text-[18px] font-bold flex flex-row items-center justify-center gap-2 transition-all hover:brightness-110 active:translate-y-1 active:shadow-none"
										style={{
											background: '#4fc3f7',
											border: '2px solid #000000',
											color: '#000000',
											boxShadow: '0 4px 0 #000000',
										}}>
										Create <ChevronRight className="w-5 h-5" />
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
