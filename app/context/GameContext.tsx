'use client';

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { AvatarParts, DEFAULT_AVATAR } from '../data/avatarParts';

export interface Player {
	id: string;
	name: string;
	score: number;
	avatar: string; // Legacy emoji avatar
	customAvatar?: AvatarParts; // New custom avatar
	hasGuessed: boolean;
	isDrawing: boolean;
}

export interface ChatMessage {
	id: string;
	playerId: string;
	playerName: string;
	text: string;
	isCorrect: boolean;
	isSystem: boolean;
}

export type GamePhase =
	| 'lobby'
	| 'choosing'
	| 'drawing'
	| 'roundEnd'
	| 'gameEnd';

interface GameState {
	socket: Socket | null;
	roomId: string;
	playerId: string;
	ownerId: string;
	players: Player[];
	currentDrawerIndex: number;
	currentWord: string;
	wordHint: string;
	roundTime: number;
	maxDrawTime: number;
	currentRound: number;
	totalRounds: number;
	gamePhase: GamePhase;
	chatMessages: ChatMessage[];
	wordOptions: string[];
	isDrawer: boolean;
	isOwner: boolean;
	isPublic: boolean;
	nextRoundIn?: number;
}

interface GameContextType extends GameState {
	joinRoom: (
		roomId: string,
		playerName: string,
		isPublic?: boolean,
		customAvatar?: AvatarParts,
	) => void;
	quickPlay: (
		playerName: string,
		onRoomFound: (roomId: string) => void,
	) => void;
	startGame: () => void;
	selectWord: (word: string) => void;
	submitGuess: (guess: string) => void;
	nextRound: () => void;
	resetGame: () => void;
	updateSettings: (totalRounds: number, drawTime: number) => void;
	emitDraw: (drawData: DrawData) => void;
	emitClearCanvas: () => void;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	clearCanvas: () => void;
	kickPlayer: (playerId: string) => void;
	leaveRoom: () => void;
	reactToDrawing: (reaction: 'like' | 'dislike') => void;
}

export interface DrawData {
	type: 'start' | 'draw' | 'end';
	x: number;
	y: number;
	color: string;
	brushSize: number;
	tool: 'brush' | 'eraser' | 'fill';
	prevX?: number;
	prevY?: number;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
	const socketRef = useRef<Socket | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [state, setState] = useState<GameState>({
		socket: null,
		roomId: '',
		playerId: '',
		ownerId: '',
		players: [],
		currentDrawerIndex: 0,
		currentWord: '',
		wordHint: '',
		roundTime: 80,
		maxDrawTime: 80,
		currentRound: 1,
		totalRounds: 2,
		gamePhase: 'lobby',
		chatMessages: [],
		wordOptions: [],
		isDrawer: false,
		isOwner: false,
		isPublic: false,
	});

	// Connect to socket
	useEffect(() => {
		const socket = io(window.location.origin, {
			transports: ['websocket', 'polling'],
		});

		socketRef.current = socket;

		socket.on('connect', () => {
			console.log('Connected to server:', socket.id);
			setState((prev) => ({ ...prev, socket, playerId: socket.id || '' }));
		});

		// Room state on join
		socket.on('roomState', (roomState) => {
			console.log(
				'roomState received:',
				roomState.gamePhase,
				'players:',
				roomState.players.length,
			);
			setState((prev) => {
				// Calculate isDrawer based on the received player list
				const isDrawer =
					roomState.players[roomState.currentDrawerIndex]?.id === prev.playerId;
				return {
					...prev,
					players: roomState.players,
					currentDrawerIndex: roomState.currentDrawerIndex,
					wordHint: roomState.wordHint || '',
					roundTime: roomState.roundTime,
					maxDrawTime: roomState.maxDrawTime || 80,
					currentRound: roomState.currentRound,
					totalRounds: roomState.totalRounds,
					gamePhase: roomState.gamePhase,
					chatMessages: roomState.chatMessages || [],
					ownerId: roomState.ownerId || '',
					isOwner: roomState.ownerId === prev.playerId,
					isPublic: roomState.isPublic ?? false,
					isDrawer,
				};
			});
		});

		// Players update
		socket.on('playersUpdate', (players) => {
			setState((prev) => {
				const isDrawer = players[prev.currentDrawerIndex]?.id === prev.playerId;
				return { ...prev, players, isDrawer };
			});
		});

		// Owner update
		socket.on('ownerUpdate', (newOwnerId) => {
			setState((prev) => ({
				...prev,
				ownerId: newOwnerId,
				isOwner: newOwnerId === prev.playerId,
			}));
		});

		// Settings update
		socket.on('settingsUpdate', ({ totalRounds, maxDrawTime }) => {
			setState((prev) => ({
				...prev,
				totalRounds,
				maxDrawTime,
			}));
		});

		// Game phase change
		socket.on('gamePhaseChange', (data) => {
			console.log('gamePhaseChange received:', data);
			setState((prev) => {
				const drawerIndex = data.currentDrawerIndex ?? prev.currentDrawerIndex;
				const updatedPlayers = prev.players;
				const isDrawer = updatedPlayers[drawerIndex]?.id === prev.playerId;
				return {
					...prev,
					gamePhase: data.gamePhase,
					currentRound: data.currentRound ?? prev.currentRound,
					currentDrawerIndex: drawerIndex,
					roundTime: data.roundTime ?? prev.roundTime,
					wordHint: data.wordHint ?? prev.wordHint,
					totalRounds: data.totalRounds ?? prev.totalRounds,
					maxDrawTime: data.maxDrawTime ?? prev.maxDrawTime,
					isDrawer,
				};
			});
		});

		// Word options (only drawer receives this)
		socket.on('wordOptions', (options) => {
			console.log('wordOptions received:', options);
			setState((prev) => ({ ...prev, wordOptions: options, isDrawer: true }));
		});

		// Current word (only drawer receives this)
		socket.on('currentWord', (word) => {
			setState((prev) => ({ ...prev, currentWord: word }));
		});

		// Timer update
		socket.on('timerUpdate', (time) => {
			setState((prev) => ({ ...prev, roundTime: time }));
		});

		// Word hint update
		socket.on('wordHintUpdate', (hint) => {
			setState((prev) => ({ ...prev, wordHint: hint }));
		});

		// Chat message
		socket.on('chatMessage', (message) => {
			setState((prev) => ({
				...prev,
				chatMessages: [...prev.chatMessages, message],
			}));
		});

		// Draw data from other players
		socket.on('draw', (drawData: DrawData) => {
			const canvas = canvasRef.current;
			const ctx = canvas?.getContext('2d');
			if (!canvas || !ctx) return;

			// Handle fill tool
			if (drawData.type === 'draw' && drawData.tool === 'fill') {
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;
				const startX = Math.floor(drawData.x);
				const startY = Math.floor(drawData.y);

				const getPixel = (x: number, y: number) => {
					const i = (y * canvas.width + x) * 4;
					return { r: data[i], g: data[i + 1], b: data[i + 2] };
				};
				const setPixel = (
					x: number,
					y: number,
					c: { r: number; g: number; b: number },
				) => {
					const i = (y * canvas.width + x) * 4;
					data[i] = c.r;
					data[i + 1] = c.g;
					data[i + 2] = c.b;
					data[i + 3] = 255;
				};
				const match = (
					c1: { r: number; g: number; b: number },
					c2: { r: number; g: number; b: number },
				) =>
					Math.abs(c1.r - c2.r) < 10 &&
					Math.abs(c1.g - c2.g) < 10 &&
					Math.abs(c1.b - c2.b) < 10;

				const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
					drawData.color,
				);
				if (!hex) return;
				const fill = {
					r: parseInt(hex[1], 16),
					g: parseInt(hex[2], 16),
					b: parseInt(hex[3], 16),
				};
				const target = getPixel(startX, startY);
				if (match(target, fill)) return;

				const stack: [number, number][] = [[startX, startY]];
				const visited = new Set<string>();
				while (stack.length > 0) {
					const [x, y] = stack.pop()!;
					const key = `${x},${y}`;
					if (
						visited.has(key) ||
						x < 0 ||
						x >= canvas.width ||
						y < 0 ||
						y >= canvas.height
					)
						continue;
					if (!match(getPixel(x, y), target)) continue;
					visited.add(key);
					setPixel(x, y, fill);
					stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
				}
				ctx.putImageData(imageData, 0, 0);
				return;
			}

			// Handle brush/eraser strokes
			if (
				drawData.type === 'draw' &&
				drawData.prevX !== undefined &&
				drawData.prevY !== undefined
			) {
				ctx.beginPath();
				ctx.moveTo(drawData.prevX, drawData.prevY);
				ctx.lineTo(drawData.x, drawData.y);
				ctx.strokeStyle =
					drawData.tool === 'eraser' ? '#FFFFFF' : drawData.color;
				ctx.lineWidth = drawData.brushSize;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.stroke();
			}
		});

		// Clear canvas
		socket.on('clearCanvas', () => {
			const canvas = canvasRef.current;
			const ctx = canvas?.getContext('2d');
			if (canvas && ctx) {
				ctx.fillStyle = '#FFFFFF';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
		});

		// Round end
		socket.on('roundEnd', (data) => {
			setState((prev) => ({
				...prev,
				gamePhase: 'roundEnd',
				currentWord: data.word,
				players: data.players,
				nextRoundIn: data.nextRoundIn,
			}));
		});

		// Game end
		socket.on('gameEnd', (data) => {
			setState((prev) => ({
				...prev,
				gamePhase: 'gameEnd',
				players: data.players,
			}));
		});

		// Game reset
		socket.on('gameReset', (data) => {
			setState((prev) => ({
				...prev,
				gamePhase: 'lobby',
				currentRound: 1,
				currentWord: '',
				wordHint: '',
				roundTime: data?.maxDrawTime || prev.maxDrawTime,
				maxDrawTime: data?.maxDrawTime || prev.maxDrawTime,
				totalRounds: data?.totalRounds || prev.totalRounds,
				chatMessages: [],
				wordOptions: [],
				isDrawer: false,
				// Preserve owner status - don't reset it
				isOwner: data?.ownerId ? data.ownerId === prev.playerId : prev.isOwner,
			}));

			const canvas = canvasRef.current;
			const ctx = canvas?.getContext('2d');
			if (canvas && ctx) {
				ctx.fillStyle = '#FFFFFF';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
		});

		// Kicked from room
		socket.on('kicked', (data) => {
			alert(data.reason || 'You have been kicked from the game');
			// Reset state and redirect
			setState((prev) => ({
				...prev,
				roomId: '',
				players: [],
				gamePhase: 'lobby',
				chatMessages: [],
				isOwner: false,
				isDrawer: false,
			}));
			window.location.href = '/';
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const joinRoom = useCallback(
		(
			roomId: string,
			playerName: string,
			isPublic?: boolean,
			customAvatar?: AvatarParts,
		) => {
			const socket = socketRef.current;
			if (!socket) return;

			socket.emit('joinRoom', {
				roomId,
				playerName,
				isPublic,
				customAvatar: customAvatar || DEFAULT_AVATAR,
			});
			setState((prev) => ({ ...prev, roomId }));
		},
		[],
	);

	const quickPlay = useCallback(
		(playerName: string, onRoomFound: (roomId: string) => void) => {
			const socket = socketRef.current;
			if (!socket) {
				console.error('Socket not connected in quickPlay');
				return;
			}

			console.log('Emitting quickPlay for:', playerName);

			// Listen for the result once
			socket.once('quickPlayResult', ({ roomId }: { roomId: string }) => {
				console.log('Received quickPlayResult:', roomId);
				onRoomFound(roomId);
			});

			socket.emit('quickPlay', { playerName });
		},
		[],
	);

	const startGame = useCallback(() => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('startGame');
	}, []);

	const selectWord = useCallback((word: string) => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('selectWord', word);
		setState((prev) => ({ ...prev, currentWord: word, wordOptions: [] }));
	}, []);

	const submitGuess = useCallback((guess: string) => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('sendMessage', guess);
	}, []);

	const nextRound = useCallback(() => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('nextRound');
	}, []);

	const resetGame = useCallback(() => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('resetGame');
	}, []);

	const updateSettings = useCallback(
		(totalRounds: number, drawTime: number) => {
			const socket = socketRef.current;
			if (!socket) return;
			socket.emit('updateSettings', { totalRounds, drawTime });
		},
		[],
	);

	const emitDraw = useCallback((drawData: DrawData) => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('draw', drawData);
	}, []);

	const emitClearCanvas = useCallback(() => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('clearCanvas');
	}, []);

	const clearCanvas = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (canvas && ctx) {
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		emitClearCanvas();
	}, [emitClearCanvas]);

	const kickPlayer = useCallback((playerId: string) => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('kickPlayer', playerId);
	}, []);

	const leaveRoom = useCallback(() => {
		const socket = socketRef.current;
		if (!socket) return;

		socket.emit('leaveRoom');

		// Reset local state
		setState((prev) => ({
			...prev,
			roomId: '',
			players: [],
			gamePhase: 'lobby',
			chatMessages: [],
			currentWord: '',
			wordHint: '',
			isOwner: false,
			isDrawer: false,
			currentRound: 1,
			currentTurn: 1,
			currentDrawerIndex: 0,
		}));
	}, []);

	const reactToDrawing = useCallback((reaction: 'like' | 'dislike') => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.emit('drawingReaction', reaction);
	}, []);

	return (
		<GameContext.Provider
			value={{
				...state,
				joinRoom,
				quickPlay,
				startGame,
				selectWord,
				submitGuess,
				nextRound,
				resetGame,
				updateSettings,
				emitDraw,
				emitClearCanvas,
				canvasRef,
				clearCanvas,
				kickPlayer,
				leaveRoom,
				reactToDrawing,
			}}>
			{children}
		</GameContext.Provider>
	);
}

export function useGame() {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
}
