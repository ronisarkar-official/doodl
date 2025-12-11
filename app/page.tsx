'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useGame } from './context/GameContext';
import { ArrowRight, Users, X, Globe, Lock, ChevronRight } from 'lucide-react';

import { AvatarParts, getRandomAvatar } from './data/avatarParts';
import { generateFunnyName } from './data/funnyNames';
import Image from 'next/image';

function Logo() {
	return (
		<div className="mb-8 text-center">
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				className="relative inline-block"
			>
				{/* Glow effect behind logo */}
				<div className="absolute inset-0 bg-linear-to-br from-blue-500/30 to-purple-600/30 blur-2xl rounded-full scale-150" />
				<Image
					src="/images/logo.png"
					alt="doodl logo"
					width={140}
					height={140}
					className="relative z-10 drop-shadow-2xl"
				/>
			</motion.div>
			<motion.p
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.2 }}
				className="text-sm text-muted-foreground mt-4 font-medium"
			>
				Fast, friendly multiplayer rounds
			</motion.p>
		</div>
	);
}

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
			className={`relative h-[72px] rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
				active
					? 'bg-primary/10 border-primary/30 shadow-sm'
					: 'bg-secondary/50 border-border hover:bg-secondary hover:border-border/80'
			}`}
			aria-pressed={active}>
			<Icon
				className={`w-5 h-5 ${
					active ? 'text-primary' : 'text-muted-foreground'
				}`}
				strokeWidth={1.5}
			/>
			<span
				className={`text-[13px] font-medium ${
					active ? 'text-foreground' : 'text-muted-foreground'
				}`}>
				{label}
			</span>
			{active && (
				<div className="absolute inset-0 border-2 border-primary/40 rounded-xl pointer-events-none" />
			)}
		</button>
	);
}

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
	const [onlineCount, setOnlineCount] = useState(2847);
	const router = useRouter();

	// Dynamic online count effect
	useEffect(() => {
		const updateOnlineCount = () => {
			setOnlineCount((prev) => {
				// Random change between -50 to +50
				const change = Math.floor(Math.random() * 101) - 50;
				// Keep the count between 2500 and 3200
				const newCount = Math.max(2500, Math.min(3200, prev + change));
				return newCount;
			});
		};

		// Update every 2-3 seconds randomly
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
		<div className="min-h-screen w-screen bg-background flex flex-col items-center justify-center px-4 py-12">
			{/* Subtle background pattern */}
			<div
				className="fixed inset-0 opacity-[0.015]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
				}}
			/>

			{/* Gradient glow */}
			<div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-linear-to-b from-primary/10 to-transparent blur-3xl pointer-events-none" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				className="relative z-10 w-full max-w-[480px]">
				<Logo />

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl shadow-black/5">
					<form onSubmit={handleQuickPlay}>
						<label
							htmlFor="displayName"
							className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
							Display name
						</label>
						<input
							id="displayName"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							maxLength={20}
							className="w-full h-12 px-4 bg-secondary/50 text-[15px] text-foreground rounded-xl border border-border/50 transition-all placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-secondary focus:ring-2 focus:ring-primary/20 mb-5"
							aria-label="Display name"
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<button
								type="submit"
								disabled={isJoining}
								className="flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-[15px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
								{isJoining ? 'Connecting...' : 'Play Now'}
								<ArrowRight className="w-4 h-4" />
							</button>

							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => {
										setIsPublic(true);
										setShowCreateModal(true);
									}}
									className="flex-1 h-12 rounded-xl text-[14px] font-medium bg-secondary/70 hover:bg-secondary text-foreground border border-border/50 transition-all">
									Create Room
								</button>
								<button
									type="button"
									onClick={() => {
										setRoomId('');
										setShowJoinModal(true);
									}}
									className="flex-1 h-12 rounded-xl text-[14px] font-medium bg-secondary/70 hover:bg-secondary text-foreground border border-border/50 transition-all">
									Join Room
								</button>
							</div>
						</div>
					</form>

					<div className="flex items-center gap-8 mt-6 justify-center text-muted-foreground">
						<div className="flex items-center gap-2">
							<Users
								className="w-4 h-4"
								strokeWidth={1.5}
							/>
							<span className="text-[13px]">1.2M players</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
							<span className="text-[13px]">
								{onlineCount.toLocaleString()} online
							</span>
						</div>
					</div>
				</motion.div>
			</motion.div>

			{/* Join Room Modal */}
			<AnimatePresence>
				{showJoinModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
							className="w-full max-w-[400px] bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h2
										id="join-room-title"
										className="text-lg font-semibold text-foreground">
										Join Room
									</h2>
									<p className="text-sm text-muted-foreground mt-0.5">
										Enter the room code to join
									</p>
								</div>
								<button
									aria-label="Close"
									onClick={() => setShowJoinModal(false)}
									className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
									<X className="w-4 h-4" />
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
										className="w-full h-14 px-5 text-xl text-center font-mono font-semibold tracking-[0.2em] bg-secondary/50 text-foreground rounded-xl border border-border/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all uppercase placeholder:text-muted-foreground/50"
										aria-label="Room code"
									/>
								</div>

								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setShowJoinModal(false)}
										className="flex-1 h-11 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
										Cancel
									</button>
									<button
										type="submit"
										disabled={!roomId.trim()}
										className={`flex-1 h-11 bg-primary text-primary-foreground text-[14px] font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
											roomId.trim()
												? 'hover:bg-primary/90 shadow-lg shadow-primary/20'
												: 'opacity-30 cursor-not-allowed'
										}`}>
										Join <ChevronRight className="w-4 h-4" />
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}

				{/* Create Room Modal */}
				{showCreateModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
							className="w-full max-w-[400px] bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h2
										id="create-room-title"
										className="text-lg font-semibold text-foreground">
										Create Room
									</h2>
									<p className="text-sm text-muted-foreground mt-0.5">
										Set up a new game room
									</p>
								</div>
								<button
									aria-label="Close"
									onClick={() => setShowCreateModal(false)}
									className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
									<X className="w-4 h-4" />
								</button>
							</div>

							<form onSubmit={handleCreateRoom}>
								<div className="mb-6">
									<label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
										Room visibility
									</label>
									<div className="grid grid-cols-2 gap-3">
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
									<p className="text-xs text-muted-foreground mt-3">
										{isPublic
											? 'Anyone can find and join your room'
											: 'Only players with the code can join'}
									</p>
								</div>

								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setShowCreateModal(false)}
										className="flex-1 h-11 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
										Cancel
									</button>
									<button
										type="submit"
										className="flex-1 h-11 bg-primary text-primary-foreground text-[14px] font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
										Create <ChevronRight className="w-4 h-4" />
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
