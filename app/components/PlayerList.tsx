'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	UserMinus,
	Crown,
	Pencil,
	CheckCircle2,
	Medal,
	Trophy,
} from 'lucide-react';
import AvatarPreview from './AvatarPreview';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function PlayerList() {
	const { players, playerId, isOwner, ownerId, kickPlayer } = useGame();
	const { playJoin, playLeave } = useSoundEffects();
	const prevPlayerIdsRef = useRef<Set<string>>(new Set());
	const isInitialMount = useRef(true);

	// Play join/leave sound when players join or leave
	useEffect(() => {
		const currentPlayerIds = new Set(players.map((p) => p.id));

		// Skip sound effects on initial mount
		if (isInitialMount.current) {
			isInitialMount.current = false;
			prevPlayerIdsRef.current = currentPlayerIds;
			return;
		}

		// Check for new players (join sound)
		for (const player of players) {
			if (!prevPlayerIdsRef.current.has(player.id) && player.id !== playerId) {
				playJoin();
				break;
			}
		}

		// Check for players leaving (leave sound)
		for (const id of prevPlayerIdsRef.current) {
			if (!currentPlayerIds.has(id)) {
				playLeave();
				break;
			}
		}

		prevPlayerIdsRef.current = currentPlayerIds;
	}, [players, playerId, playJoin, playLeave]);

	// Sort players by score for the visual list
	const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

	return (
		<div className="space-y-2 md:max-w-60 sm:max-w-72">
			<AnimatePresence mode="popLayout">
				{sortedPlayers.map((player, index) => (
					<motion.div
						layout
						key={player.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.2 }}
						className={`group relative flex items-center gap-2 p-2.5 rounded-xl border transition-all w-full ${
							player.id === playerId
								? 'bg-primary/10 border-primary/30'
								: 'bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border'
						} ${
							player.isDrawing
								? 'ring-2 ring-amber-500/40 bg-amber-500/5'
								: ''
						}`}>
						{/* Rank */}
						<div
							className={`w-6 flex justify-center font-bold text-sm shrink-0 ${
								index === 0
									? 'text-amber-500'
									: index === 1
									? 'text-slate-400'
									: index === 2
									? 'text-orange-500'
									: 'text-muted-foreground'
							}`}>
							{index === 0 ? (
								<Trophy className="w-4 h-4" />
							) : index <= 2 ? (
								<Medal className="w-4 h-4" />
							) : (
								<span className="font-mono text-xs opacity-60">
									#{index + 1}
								</span>
							)}
						</div>

						{/* Avatar & Name */}
						<div className="flex-1 min-w-0 flex items-center gap-3">
							<div className="relative shrink-0">
								{player.customAvatar ? (
									<AvatarPreview
										avatar={player.customAvatar}
										size={32}
									/>
								) : (
									<span className="text-xl leading-none filter drop-shadow-sm">
										{player.avatar}
									</span>
								)}
								{player.isDrawing && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="absolute -top-1 -right-1 bg-amber-500 text-amber-950 p-0.5 rounded-full ring-2 ring-card">
										<Pencil className="w-2.5 h-2.5" />
									</motion.div>
								)}
								{player.hasGuessed && !player.isDrawing && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="absolute -top-1 -right-1 bg-green-500 text-white p-0.5 rounded-full ring-2 ring-card">
										<CheckCircle2 className="w-2.5 h-2.5" />
									</motion.div>
								)}
							</div>

							<div className="flex-1 min-w-0 flex flex-col justify-center">
								<div className="flex items-center gap-1.5">
									<span
										className={`text-sm font-semibold truncate ${
											player.id === playerId
												? 'text-primary'
												: 'text-foreground'
										}`}>
										{player.name}
									</span>
									{player.id === ownerId && (
										<Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30 shrink-0" />
									)}
								</div>

								<div className="flex items-center justify-between">
									<span className="text-[10px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1">
										{player.id === playerId
											? 'You'
											: player.isDrawing
											? 'Drawing'
											: player.hasGuessed
											? 'Guessed!'
											: ''}
									</span>
								</div>
							</div>
						</div>

						{/* Score */}
						<div
							className={`flex flex-col items-end transition-opacity duration-200 shrink-0 ${
								isOwner && player.id !== playerId ? 'group-hover:opacity-0' : ''
							}`}>
							<span
								className={`font-mono font-bold text-sm ${
									index === 0 ? 'text-amber-500' : 'text-foreground'
								}`}>
								{player.score}
							</span>
							<span className="text-[9px] text-muted-foreground uppercase hidden sm:block">
								pts
							</span>
						</div>

						{/* Kick button */}
						{isOwner && player.id !== playerId && (
							<div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<button
											className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-md"
											title="Kick player">
											<UserMinus className="w-4 h-4" />
										</button>
									</AlertDialogTrigger>
									<AlertDialogContent className="bg-card border-border">
										<AlertDialogHeader>
											<AlertDialogTitle className="text-foreground">Kick {player.name}?</AlertDialogTitle>
											<AlertDialogDescription className="text-muted-foreground">
												Are you sure you want to kick this player? They will be
												removed immediately.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border text-foreground">
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => kickPlayer(player.id)}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
												Yes, Kick
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						)}
					</motion.div>
				))}
			</AnimatePresence>

			{players.length === 0 && (
				<div className="text-center text-muted-foreground text-xs py-8 italic bg-secondary/20 rounded-xl border border-border/50 border-dashed">
					Waiting for players...
				</div>
			)}
		</div>
	);
}

