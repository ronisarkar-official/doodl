'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LogOut, Users, ChevronDown } from 'lucide-react';
import Canvas from '../components/Canvas';
import { ScrollArea } from '@/components/ui/scroll-area';
import Chat from '../components/Chat';
import PlayerList from '../components/PlayerList';
import Timer from '../components/Timer';
import WordHint from '../components/WordHint';
import WordSelector from '../components/WordSelector';
import RoundEnd from '../components/RoundEnd';
import SettingsPopup from '../components/Settings';
import { useGame } from '../context/GameContext';

function GameContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const roomIdFromUrl = searchParams.get('room') || '';
	const {
		gamePhase,
		currentWord,
		isDrawer,
		players,
		startGame,
		playerId,
		isOwner,
		isPublic,
		currentRound,
		totalRounds,
		maxDrawTime,
		updateSettings,
		roomId,
		joinRoom,
		leaveRoom,
	} = useGame();

	// Auto-join the room if navigating directly to the game URL
	useEffect(() => {
		if (roomIdFromUrl && playerId && !roomId) {
			const savedName = sessionStorage.getItem('playerName') || 'Player';
			joinRoom(roomIdFromUrl, savedName);
		}
	}, [roomIdFromUrl, playerId, roomId, joinRoom]);

	// Redirect to home if no room ID in URL
	useEffect(() => {
		if (!roomIdFromUrl) {
			router.push('/');
		}
	}, [roomIdFromUrl, router]);

	const [settingsRounds, setSettingsRounds] = useState(totalRounds);
	const [settingsTime, setSettingsTime] = useState(maxDrawTime);
	const [showMobilePlayers, setShowMobilePlayers] = useState(false);

	const currentDrawer = players.find((p) => p.isDrawing);

	const handleRoundsChange = (value: number) => {
		setSettingsRounds(value);
		if (isOwner) {
			updateSettings(value, settingsTime);
		}
	};

	const handleTimeChange = (value: number) => {
		setSettingsTime(value);
		if (isOwner) {
			updateSettings(settingsRounds, value);
		}
	};

	return (
		<div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
			{/* Top Bar - macOS Style */}
			<div className="h-12 sm:h-14 border-b border-border/50 glass flex items-center justify-between px-2 sm:px-4 z-10">
				{/* Left: Logo & Room Info */}
				<div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">
					{/* Logo */}
					<div className="flex items-center gap-1.5 sm:gap-2.5">
						<div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20">
							GG
						</div>
						<span className="font-semibold text-sm sm:text-base hidden md:block text-foreground">
							Galactic Guess
						</span>
					</div>

					{/* Room Info - Only show for private rooms and owner */}
					{!isPublic && isOwner && (
						<>
							<div className="h-5 sm:h-6 w-px bg-border/50"></div>
							<div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
								<span className="hidden sm:inline">Room:</span>
								<span className="font-mono bg-secondary/70 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-foreground border border-border/50 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
									{roomIdFromUrl}
								</span>
							</div>
						</>
					)}
				</div>

				{/* Center: Game Status */}
				<div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-center min-w-0 px-2">
					{/* Round Info */}
					<div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-secondary/50 rounded-full border border-border/50">
						<span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
							Round
						</span>
						<span className="font-mono font-bold text-xs sm:text-sm text-foreground">
							{currentRound}/{totalRounds}
						</span>
					</div>

					{(gamePhase === 'drawing' || gamePhase === 'choosing') && <Timer />}

					<WordHint />

					{/* Drawing/Watching Status - Hidden on mobile, visible from md+ */}
					{gamePhase === 'drawing' && isDrawer && (
						<div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border border-amber-500/20">
							<span>✏️</span>
							<span className="capitalize text-foreground max-w-24 truncate">
								{currentWord}
							</span>
						</div>
					)}
				</div>

				{/* Right: Actions */}
				<div className="flex items-center gap-1 sm:gap-2 shrink-0">
					{/* Mobile Players Button - only visible on mobile/tablet */}
					<button
						onClick={() => setShowMobilePlayers(!showMobilePlayers)}
						className={`lg:hidden flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
							showMobilePlayers
								? 'bg-primary/20 text-primary border border-primary/30'
								: 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
						}`}>
						<Users className="w-4 h-4" />
						<span className="hidden sm:inline">{players.length}</span>
						<ChevronDown
							className={`w-3.5 h-3.5 transition-transform duration-200 ${
								showMobilePlayers ? 'rotate-180' : ''
							}`}
						/>
					</button>

					<SettingsPopup />

					<div className="w-px h-5 sm:h-6 bg-border/50 hidden sm:block"></div>

					{/* Exit Button  do to change this code*/}
					<a
						href="/"
						className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-destructive p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium hover:bg-destructive/10">
						<LogOut className="w-4 h-4" />
						<span className="hidden sm:inline">Exit</span>
					</a>
				</div>
			</div>

			{/* Main Workspace Layout */}
			<div className="relative flex-1 w-full h-full overflow-hidden">
				{/* Left Sidebar - Players */}
				<div className="absolute left-0 top-0 bottom-0 w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 hidden lg:flex flex-col overflow-hidden z-20">
					<div className="p-3 border-b border-border/50 font-medium text-sm text-muted-foreground uppercase tracking-wider shrink-0">
						Players ({players.length})
					</div>
					<div className="flex-1 min-h-0 overflow-hidden">
						<ScrollArea className="h-full">
							<div className="p-2">
								<PlayerList />
							</div>
						</ScrollArea>
					</div>
				</div>

				{/* Center - Canvas/Lobby */}
				<div className="absolute left-0 lg:left-64 right-0 lg:right-80 top-0 bottom-0 bg-background flex flex-col overflow-hidden z-10">
					{gamePhase === 'lobby' ? (
						<div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="max-w-md w-full bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
								<div className="text-center mb-4 sm:mb-6 md:mb-8">
									<div className="hidden lg:flex w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/20 text-primary rounded-xl sm:rounded-2xl items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4">
										🎨
									</div>
									<h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-foreground">
										Ready to Draw?
									</h2>
									<p className="text-sm sm:text-base text-muted-foreground">
										Waiting for players to join...
									</p>
								</div>

								{/* Settings Panel - Only visible to owner */}
								{isOwner && (
									<div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6 md:mb-8">
										<div>
											<label className="block text-[10px] sm:text-xs font-medium text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider">
												Rounds
											</label>
											<div className="grid grid-cols-5 gap-1.5 sm:gap-2">
												{[2, 4, 6, 8, 10].map((num) => (
													<button
														key={num}
														onClick={() => handleRoundsChange(num)}
														disabled={!isOwner}
														className={`h-8 sm:h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
															settingsRounds === num
																? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
																: isOwner
																? 'bg-secondary/70 hover:bg-secondary text-foreground border border-border/50'
																: 'bg-secondary/30 text-muted-foreground cursor-not-allowed'
														}`}>
														{num}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-[10px] sm:text-xs font-medium text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider">
												Draw Time
											</label>
											<div className="grid grid-cols-3 gap-1.5 sm:gap-2">
												{[30, 60, 80, 100, 120, 180].map((time) => (
													<button
														key={time}
														onClick={() => handleTimeChange(time)}
														disabled={!isOwner}
														className={`h-8 sm:h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
															settingsTime === time
																? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
																: isOwner
																? 'bg-secondary/70 hover:bg-secondary text-foreground border border-border/50'
																: 'bg-secondary/30 text-muted-foreground cursor-not-allowed'
														}`}>
														{time}s
													</button>
												))}
											</div>
										</div>
									</div>
								)}

								{isOwner && players.length >= 2 ? (
									<button
										onClick={startGame}
										className="w-full py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-bold rounded-lg sm:rounded-xl transition-all shadow-lg shadow-primary/30">
										Start Game
									</button>
								) : !isOwner ? (
									<div className="text-center p-3 sm:p-4 bg-secondary/30 rounded-lg sm:rounded-xl border border-border/50 border-dashed">
										<p className="text-xs sm:text-sm text-muted-foreground">
											Waiting for host to start...
										</p>
									</div>
								) : (
									<div className="text-center p-3 sm:p-4 bg-secondary/30 rounded-lg sm:rounded-xl border border-border/50 border-dashed">
										<p className="text-xs sm:text-sm text-muted-foreground">
											Need at least 2 players to start
										</p>
									</div>
								)}
							</motion.div>
						</div>
					) : (
						<div className="flex-1 flex items-center justify-center p-4 bg-secondary/20">
							<div className="relative shadow-2xl rounded-2xl overflow-hidden border border-border/30">
								<Canvas />
							</div>
						</div>
					)}
				</div>

				{/* Right Sidebar - Chat */}
				<div className="absolute right-0 top-0 bottom-0 w-80 bg-card/80 backdrop-blur-xl border-l border-border/50 hidden lg:flex flex-col overflow-hidden z-20">
					<div className="p-3 border-b border-border/50 font-medium text-sm text-muted-foreground uppercase tracking-wider shrink-0">
						Chat & Guesses
					</div>
					<div className="flex-1 min-h-0 overflow-hidden">
						<Chat />
					</div>
				</div>
			</div>

			{/* Mobile Players Dropdown */}
			{showMobilePlayers && (
				<div className="lg:hidden absolute top-12 sm:top-14 left-0 right-0 z-40">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/40 backdrop-blur-sm"
						onClick={() => setShowMobilePlayers(false)}
					/>
					{/* Dropdown Panel */}
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className="relative mx-2 sm:mx-4 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl max-h-[60vh] overflow-hidden">
						<div className="p-3 border-b border-border/50 font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center justify-between">
							<span>Players ({players.length})</span>
							<button
								onClick={() => setShowMobilePlayers(false)}
								className="p-1 hover:bg-secondary/80 rounded-lg transition-colors">
								<ChevronDown className="w-4 h-4 rotate-180" />
							</button>
						</div>
						<ScrollArea className="max-h-[50vh]">
							<div className="p-3">
								<PlayerList />
							</div>
						</ScrollArea>
					</motion.div>
				</div>
			)}

			{/* Mobile Chat - Fixed at bottom */}
			<div className="lg:hidden h-[35vh] border-t border-border/50 bg-card/80 backdrop-blur-xl">
				<Chat />
			</div>

			{/* Modals */}
			<WordSelector />
			<RoundEnd />
		</div>
	);
}

export default function GamePage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-background flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold animate-pulse">
							do
						</div>
						<div className="text-muted-foreground text-sm">Loading...</div>
					</div>
				</div>
			}>
			<GameContent />
		</Suspense>
	);
}
