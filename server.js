const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const AVATARS = ['🎨', '🖌️', '✏️', '🖍️', '🎭', '🎪', '🎯', '🎲', '🎮', '🎸'];

// Load words from app/data/wordPacks.ts
function loadLocalWords() {
	try {
		const filePath = path.join(process.cwd(), 'app', 'data', 'wordPacks.ts');
		if (!fs.existsSync(filePath)) {
			console.error('Words file not found at:', filePath);
			return { default: ['apple', 'banana', 'orange'] };
		}
		const content = fs.readFileSync(filePath, 'utf8');
		const packs = {};

		// Simple regex to parse the structure: id: 'id', ..., words: [...]
		const packMatches = content.match(
			/{\s*id:\s*'([^']+)',[^}]+words:\s*\[([\s\S]*?)\]\s*}/g,
		);

		if (packMatches) {
			packMatches.forEach((packStr) => {
				const idMatch = packStr.match(/id:\s*'([^']+)'/);
				const wordsMatch = packStr.match(/words:\s*\[([\s\S]*?)\]/);

				if (idMatch && wordsMatch) {
					const id = idMatch[1];
					const wordsContent = wordsMatch[1];
					const words =
						wordsContent
							.match(/"([^"]+)"|'([^']+)'/g)
							?.map((w) => w.replace(/['"]/g, '')) || [];

					if (words.length > 0) {
						packs[id] = words;
					}
				}
			});
		}

		console.log('Loaded local word packs:', Object.keys(packs));
		return packs;
	} catch (e) {
		console.error('Failed to load words from wordPacks.ts:', e);
		return { default: ['apple', 'banana', 'orange'] };
	}
}

let WORD_PACKS = loadLocalWords();
// Fallback words (all loaded words flattened)
let WORDS = Object.values(WORD_PACKS).flat();

// Log loaded word packs
console.log(`Loaded ${WORDS.length} drawable words from local word packs`);

// Game rooms storage
const rooms = new Map();

function getRandomWords(room, count = 3) {
	// Get words from selected packs (or all if none selected)
	const availablePacks = Object.keys(WORD_PACKS);
	const packIds =
		room.wordPacks && room.wordPacks.length > 0
			? room.wordPacks
			: availablePacks;
	let allWords = packIds.flatMap((id) => WORD_PACKS[id] || []);

	// Add custom words if any
	if (room.customWords && room.customWords.length > 0) {
		allWords = [...allWords, ...room.customWords];
	}

	// Fall back to WORDS if nothing selected
	if (allWords.length === 0) {
		allWords = WORDS;
	}

	const shuffled = [...allWords].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

function getWordHint(word, revealedCount, existingRevealedIndices = []) {
	const letters = word.split('');
	const revealIndices = new Set(existingRevealedIndices);

	// Always reveal spaces (and hyphens/special chars if we wanted, but sticking to spaces for now)
	letters.forEach((char, i) => {
		if (char === ' ') revealIndices.add(i);
	});

	// Get potential indices to reveal (not spaces, not already revealed)
	let availableIndices = letters
		.map((c, i) => (c !== ' ' && !revealIndices.has(i) ? i : -1))
		.filter((i) => i !== -1);

	// Calculate how many new letters to reveal
	const currentlyRevealed = existingRevealedIndices.length;
	// Ensure we don't reveal more than available (though availableIndices check handles this loop)
	let newToReveal = revealedCount - currentlyRevealed;

	// Helper to calculate minimum distance from candidate to any revealed index
	const getMinDistance = (candidateIdx, currentRevealedSet) => {
		// If nothing revealed yet, distance is infinity (or effectively max)
		// We treat the "edges" as revealed points -1 and letters.length to push initialization to center?
		// Actually, standard practice for "scattered" is just max min distance to existing.
		// If set is empty, we can return a default high value.
		if (currentRevealedSet.size === 0) return 100;

		let minSrc = Infinity;
		for (const idx of currentRevealedSet) {
			const dist = Math.abs(candidateIdx - idx);
			if (dist < minSrc) minSrc = dist;
		}
		return minSrc;
	};

	// Iteratively pick the best next candidate
	for (let i = 0; i < newToReveal && availableIndices.length > 0; i++) {
		// Calculate score (min distance) for each available index
		const candidatesWithScores = availableIndices.map((idx) => {
			// We only care about distance to *revealed non-space letters* ideally,
			// or maybe spaces count as spacers? Let's say spaces count as revealed for spacing purposes
			// to avoid clustering next to a space. Yes, revealIndices includes spaces.
			return { idx, score: getMinDistance(idx, revealIndices) };
		});

		// Find max score
		let maxScore = -1;
		candidatesWithScores.forEach((c) => {
			if (c.score > maxScore) maxScore = c.score;
		});

		// Filter best candidates (ties are possible)
		const bestCandidates = candidatesWithScores.filter(
			(c) => c.score === maxScore,
		);

		// Pick one random best candidate
		const winner =
			bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

		// Add to revealed
		revealIndices.add(winner.idx);

		// Remove from available
		availableIndices = availableIndices.filter((idx) => idx !== winner.idx);
	}

	// Get the array of revealed letter indices (excluding spaces)
	const revealedLetterIndices = [...revealIndices].filter(
		(i) => letters[i] !== ' ',
	);

	const hint = letters
		.map((char, i) => (revealIndices.has(i) ? char : '_'))
		.join(' ');

	return { hint, revealedIndices: revealedLetterIndices };
}

function createRoom(roomId, isPublic = true) {
	return {
		id: roomId,
		players: [],
		currentDrawerIndex: 0,
		currentWord: '',
		wordHint: '',
		roundTime: 80,
		maxDrawTime: 80, // Room setting: draw time per turn
		currentRound: 1,
		currentTurn: 1, // Track which turn within the current round (1 to players.length)
		totalRounds: 2, // Room setting: number of rounds (each round = every player draws once)
		gamePhase: 'lobby', // lobby, choosing, drawing, roundEnd, gameEnd
		chatMessages: [],
		wordOptions: [],
		revealedLetters: 0,
		revealedIndices: [], // Store which letter indices have been revealed
		timerInterval: null,
		canvasData: null,
		ownerId: null, // First player to join is owner
		isPublic: isPublic, // Room visibility
		maxPlayers: 8, // Maximum players allowed
		wordPacks: Object.keys(WORD_PACKS), // Selected word packs (default: all)
		customWords: [], // Custom words added by host
	};
}

// Get available public rooms for quick play
// Allows joining rooms in progress (lobby, choosing, or drawing phases)
function getAvailablePublicRooms() {
	const publicRooms = [];
	const joinablePhases = ['lobby', 'choosing', 'drawing'];
	for (const [roomId, room] of rooms) {
		if (
			room.isPublic &&
			joinablePhases.includes(room.gamePhase) &&
			room.players.length < room.maxPlayers
		) {
			publicRooms.push({
				id: roomId,
				playerCount: room.players.length,
				maxPlayers: room.maxPlayers,
				gamePhase: room.gamePhase, // Include phase info
			});
		}
	}
	// Prioritize lobby rooms, then in-progress games
	return publicRooms.sort((a, b) => {
		if (a.gamePhase === 'lobby' && b.gamePhase !== 'lobby') return -1;
		if (a.gamePhase !== 'lobby' && b.gamePhase === 'lobby') return 1;
		return b.playerCount - a.playerCount; // More players = more fun
	});
}

// Generate a random room ID
function generateRoomId() {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket) => {
		console.log('User connected:', socket.id);

		// Join room
		// Quick play - find or create a public room
		socket.on('quickPlay', () => {
			const availableRooms = getAvailablePublicRooms();
			console.log('Quick Play - Available rooms:', availableRooms);
			console.log(
				'All rooms:',
				Array.from(rooms.entries()).map(([id, r]) => ({
					id,
					phase: r.gamePhase,
					isPublic: r.isPublic,
					players: r.players.length,
				})),
			);
			let roomId;

			if (availableRooms.length > 0) {
				// Join first available public room
				roomId = availableRooms[0].id;
				console.log('Quick Play - Joining existing room:', roomId);
			} else {
				// Create new public room
				roomId = generateRoomId();
				const room = createRoom(roomId, true);
				rooms.set(roomId, room);
				console.log('Quick Play - Created new room:', roomId);
			}

			// Send the room ID to client
			socket.emit('quickPlayResult', { roomId });
		});

		// Join room
		socket.on('joinRoom', ({ roomId, playerName, isPublic, customAvatar }) => {
			let room = rooms.get(roomId);

			if (!room) {
				// Create room with specified visibility (default public)
				room = createRoom(roomId, isPublic !== undefined ? isPublic : true);
				rooms.set(roomId, room);
			}

			// Check if this socket is already in the room (prevent duplicates)
			const playerBySocket = room.players.find((p) => p.id === socket.id);
			if (playerBySocket) {
				// Update name if changed
				if (playerName) {
					playerBySocket.name = playerName;
					// Update custom avatar if provided
					if (customAvatar) {
						playerBySocket.customAvatar = customAvatar;
					}
				}

				// Send current room state
				socket.emit('roomState', {
					id: room.id,
					players: room.players,
					currentDrawerIndex: room.currentDrawerIndex,
					wordHint: room.wordHint,
					roundTime: room.roundTime,
					maxDrawTime: room.maxDrawTime,
					currentRound: room.currentRound,
					currentTurn: room.currentTurn,
					totalRounds: room.totalRounds,
					gamePhase: room.gamePhase,
					chatMessages: room.chatMessages,
					ownerId: room.ownerId,
					isPublic: room.isPublic,
					currentWord:
						room.gamePhase === 'drawing' &&
						room.players[room.currentDrawerIndex]?.id === socket.id
							? room.currentWord
							: '',
					wordOptions:
						room.gamePhase === 'choosing' &&
						room.players[room.currentDrawerIndex]?.id === socket.id
							? room.wordOptions
							: [],
				});
				io.to(roomId).emit('playersUpdate', room.players);
				return;
			}

			// Check if player already exists (reconnection by name)
			const existingPlayer = room.players.find((p) => p.name === playerName);
			if (existingPlayer) {
				// Check if the existing player's socket is still active
				const existingSocket = io.sockets.sockets.get(existingPlayer.id);
				const isConnected = existingSocket && existingSocket.connected;

				if (!isConnected) {
					// Reconnection: Player exists but is disconnected
					console.log(
						`Reconnecting player ${playerName} to room ${roomId} (oldId: ${existingPlayer.id})`,
					);
					existingPlayer.id = socket.id;
					socket.join(roomId);
					socket.roomId = roomId;
					socket.playerId = socket.id;

					// Send current room state (only serializable fields)
					socket.emit('roomState', {
						id: room.id,
						players: room.players,
						currentDrawerIndex: room.currentDrawerIndex,
						wordHint: room.wordHint,
						roundTime: room.roundTime,
						maxDrawTime: room.maxDrawTime,
						currentRound: room.currentRound,
						currentTurn: room.currentTurn,
						totalRounds: room.totalRounds,
						gamePhase: room.gamePhase,
						chatMessages: room.chatMessages,
						ownerId: room.ownerId,
						isPublic: room.isPublic,
						currentWord:
							room.gamePhase === 'drawing' &&
							room.players[room.currentDrawerIndex]?.id === socket.id
								? room.currentWord
								: '',
						wordOptions:
							room.gamePhase === 'choosing' &&
							room.players[room.currentDrawerIndex]?.id === socket.id
								? room.wordOptions
								: [],
					});
					io.to(roomId).emit('playersUpdate', room.players);
					return;
				} else {
					// Name collision: Player exists and is connected
					console.log(
						`Name collision for ${playerName} in room ${roomId}. Generating unique name.`,
					);
					// Generate a unique name
					let count = 2;
					let newName = `${playerName} ${count}`;
					while (room.players.some((p) => p.name === newName)) {
						count++;
						newName = `${playerName} ${count}`;
					}
					playerName = newName; // Use the new unique name
				}
			}

			// Create new player
			const isGameInProgress = room.gamePhase !== 'lobby';
			const player = {
				id: socket.id,
				name: playerName || 'Player',
				score: 0,
				avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
				customAvatar: customAvatar || null, // Store custom avatar if provided
				// Late joiners can participate immediately in the current round
				hasGuessed: false,
				isDrawing: false,
			};

			room.players.push(player);
			socket.join(roomId);
			socket.roomId = roomId;
			socket.playerId = socket.id;

			// First player is the owner
			if (room.players.length === 1) {
				room.ownerId = socket.id;
			}

			// Send current room state to the new player (only serializable fields)
			socket.emit('roomState', {
				id: room.id,
				players: room.players,
				currentDrawerIndex: room.currentDrawerIndex,
				wordHint: room.wordHint,
				roundTime: room.roundTime,
				maxDrawTime: room.maxDrawTime,
				currentRound: room.currentRound,
				currentTurn: room.currentTurn,
				totalRounds: room.totalRounds,
				gamePhase: room.gamePhase,
				chatMessages: room.chatMessages,
				ownerId: room.ownerId,
				isPublic: room.isPublic,
				currentWord:
					room.gamePhase === 'drawing' &&
					room.players[room.currentDrawerIndex]?.id === socket.id
						? room.currentWord
						: '',
				wordOptions:
					room.gamePhase === 'choosing' &&
					room.players[room.currentDrawerIndex]?.id === socket.id
						? room.wordOptions
						: [],
			});

			// If game is in drawing phase, send the word hint and timer to the new player
			if (room.gamePhase === 'drawing') {
				socket.emit('gamePhaseChange', {
					gamePhase: 'drawing',
					wordHint: room.wordHint,
					roundTime: room.roundTime,
					currentRound: room.currentRound,
					currentDrawerIndex: room.currentDrawerIndex,
				});
			} else if (room.gamePhase === 'choosing') {
				socket.emit('gamePhaseChange', {
					gamePhase: 'choosing',
					currentRound: room.currentRound,
					currentDrawerIndex: room.currentDrawerIndex,
					roundTime: room.roundTime,
				});
			}

			// Notify all players about the new player
			io.to(roomId).emit('playerJoined', player);
			io.to(roomId).emit('playersUpdate', room.players);

			// System message
			const joinMessage = {
				id: Date.now().toString(),
				playerId: 'system',
				playerName: 'System',
				text:
					isGameInProgress && room.gamePhase === 'drawing'
						? `${player.name} joined! Start guessing!`
						: isGameInProgress
						? `${player.name} joined the game!`
						: `${player.name} joined the game!`,
				isCorrect: false,
				isSystem: true,
			};
			room.chatMessages.push(joinMessage);
			io.to(roomId).emit('chatMessage', joinMessage);
		});

		// Update room settings (owner only)
		socket.on('updateSettings', ({ totalRounds, drawTime }) => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			// Only owner can change settings
			if (room.ownerId !== socket.id) return;

			// Only allow changes in lobby
			if (room.gamePhase !== 'lobby') return;

			if (totalRounds >= 1 && totalRounds <= 10) {
				room.totalRounds = totalRounds;
			}
			if (drawTime >= 30 && drawTime <= 180) {
				room.maxDrawTime = drawTime;
			}

			// Broadcast updated settings to all players
			io.to(socket.roomId).emit('settingsUpdate', {
				totalRounds: room.totalRounds,
				maxDrawTime: room.maxDrawTime,
			});
		});

		// Start game
		socket.on('startGame', () => {
			const room = rooms.get(socket.roomId);
			if (!room || room.players.length < 2) return;

			// Only owner can start game
			if (room.ownerId !== socket.id) return;

			room.gamePhase = 'choosing';
			room.currentRound = 1;
			room.currentTurn = 1;
			room.currentDrawerIndex = 0;
			room.wordOptions = getRandomWords(3);
			room.roundTime = 15;
			room.players.forEach((p) => {
				p.hasGuessed = false;
				p.isDrawing = false;
				p.score = 0;
			});
			room.players[0].isDrawing = true;
			room.chatMessages = []; // Clear chat on new game

			// Send word options only to drawer
			const drawer = room.players[0];
			io.to(drawer.id).emit('wordOptions', room.wordOptions);

			// Update all players
			io.to(socket.roomId).emit('gamePhaseChange', {
				gamePhase: 'choosing',
				currentRound: room.currentRound,
				currentTurn: room.currentTurn,
				totalTurns: room.players.length,
				currentDrawerIndex: room.currentDrawerIndex,
				roundTime: room.roundTime,
				totalRounds: room.totalRounds,
				maxDrawTime: room.maxDrawTime,
			});
			io.to(socket.roomId).emit('playersUpdate', room.players);
			io.to(socket.roomId).emit('clearCanvas');

			startRoundTimer(room, io);
		});

		// Word selected
		socket.on('selectWord', (word) => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			const drawer = room.players[room.currentDrawerIndex];
			if (!drawer || drawer.id !== socket.id) return;

			room.currentWord = word;
			room.revealedLetters = 0;
			room.revealedIndices = [];
			const hintResult = getWordHint(word, 0, []);
			room.wordHint = hintResult.hint;
			room.gamePhase = 'drawing';
			room.roundTime = room.maxDrawTime; // Use room setting
			room.canvasData = null;

			clearInterval(room.timerInterval);

			// Send word to drawer only
			io.to(drawer.id).emit('currentWord', word);

			// Send hint to everyone
			io.to(socket.roomId).emit('gamePhaseChange', {
				gamePhase: 'drawing',
				wordHint: room.wordHint,
				roundTime: room.roundTime,
			});

			startRoundTimer(room, io);
		});

		// Chat message / guess
		socket.on('sendMessage', (text) => {
			const room = rooms.get(socket.roomId);
			if (!room || room.gamePhase !== 'drawing') return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			// Drawer can't chat
			if (player.isDrawing) return;

			// Already guessed
			if (player.hasGuessed) return;

			const normalizedGuess = text.toLowerCase().trim();
			const isCorrect = normalizedGuess === room.currentWord.toLowerCase();

			const message = {
				id: Date.now().toString(),
				playerId: player.id,
				playerName: player.name,
				text: isCorrect ? text.replace(/./g, '*') : text,
				isCorrect,
				isSystem: false,
			};

			room.chatMessages.push(message);
			io.to(socket.roomId).emit('chatMessage', message);

			if (isCorrect) {
				const points = Math.max(100, Math.floor(room.roundTime * 10));
				player.score += points;
				player.hasGuessed = true;

				// Drawer also gets points
				const drawer = room.players[room.currentDrawerIndex];
				if (drawer) {
					drawer.score += Math.floor(points / 2);
				}

				const systemMessage = {
					id: (Date.now() + 1).toString(),
					playerId: 'system',
					playerName: 'System',
					text: `🎉 ${player.name} guessed the word! (+${points} pts)`,
					isCorrect: false,
					isSystem: true,
				};
				room.chatMessages.push(systemMessage);
				io.to(socket.roomId).emit('chatMessage', systemMessage);
				io.to(socket.roomId).emit('playersUpdate', room.players);

				// Check if everyone guessed
				const nonDrawers = room.players.filter((p) => !p.isDrawing);
				if (nonDrawers.every((p) => p.hasGuessed)) {
					endRound(room, io);
				}
			}
		});

		// Canvas drawing
		socket.on('draw', (drawData) => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			const drawer = room.players[room.currentDrawerIndex];
			if (!drawer || drawer.id !== socket.id) return;

			// Broadcast to all except sender
			socket.to(socket.roomId).emit('draw', drawData);
		});

		// Canvas clear
		socket.on('clearCanvas', () => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			const drawer = room.players[room.currentDrawerIndex];
			if (!drawer || drawer.id !== socket.id) return;

			socket.to(socket.roomId).emit('clearCanvas');
		});

		// Canvas sync (for undo/redo - sends full canvas state)
		socket.on('canvasSync', (imageDataUrl) => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			const drawer = room.players[room.currentDrawerIndex];
			if (!drawer || drawer.id !== socket.id) return;

			// Broadcast canvas state to all other players
			socket.to(socket.roomId).emit('canvasSync', imageDataUrl);
		});

		// Drawing reaction (like/dislike)
		socket.on('drawingReaction', (reaction) => {
			const room = rooms.get(socket.roomId);
			if (!room || room.gamePhase !== 'drawing') return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			// Drawer can't react to their own drawing
			if (player.isDrawing) return;

			const emoji = reaction === 'like' ? '👍' : '👎';
			const action = reaction === 'like' ? 'liked' : 'disliked';

			const reactionMessage = {
				id: Date.now().toString(),
				playerId: 'system',
				playerName: 'System',
				text: `${player.name} ${emoji} ${action} this drawing!`,
				isCorrect: false,
				isSystem: true,
			};
			room.chatMessages.push(reactionMessage);
			io.to(socket.roomId).emit('chatMessage', reactionMessage);
		});

		// Lobby chat - messages during lobby phase
		socket.on('lobbyMessage', (text) => {
			const room = rooms.get(socket.roomId);
			if (!room || room.gamePhase !== 'lobby') return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			const message = {
				id: Date.now().toString(),
				playerId: player.id,
				playerName: player.name,
				text: text,
				isCorrect: false,
				isSystem: false,
			};
			room.chatMessages.push(message);
			io.to(socket.roomId).emit('chatMessage', message);
		});

		// Emote reactions during drawing
		socket.on('sendEmote', (emote) => {
			const room = rooms.get(socket.roomId);
			if (!room || room.gamePhase !== 'drawing') return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			// Drawer can't send emotes
			if (player.isDrawing) return;

			// Broadcast emote to all players
			io.to(socket.roomId).emit('emote', {
				emote,
				playerName: player.name,
			});
		});

		// Typing indicator
		socket.on('typing', () => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			// Broadcast typing to others in the room
			socket.to(socket.roomId).emit('playerTyping', {
				playerName: player.name,
			});
		});

		// Next round
		socket.on('nextRound', () => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			// Only owner can proceed
			if (room.ownerId !== socket.id) return;

			startNextTurn(room, io);
		});

		// Reset game (play again)
		socket.on('resetGame', () => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			// Only owner can reset
			if (room.ownerId !== socket.id) return;

			room.gamePhase = 'lobby';
			room.currentRound = 1;
			room.currentTurn = 1;
			room.currentWord = '';
			room.wordHint = '';
			room.chatMessages = [];
			room.wordOptions = [];
			room.currentDrawerIndex = 0;
			room.players.forEach((p) => {
				p.score = 0;
				p.hasGuessed = false;
				p.isDrawing = false;
			});
			clearInterval(room.timerInterval);

			io.to(socket.roomId).emit('gameReset', {
				totalRounds: room.totalRounds,
				maxDrawTime: room.maxDrawTime,
				ownerId: room.ownerId,
			});
			io.to(socket.roomId).emit('playersUpdate', room.players);
		});

		// Kick player (owner only)
		socket.on('kickPlayer', (targetPlayerId) => {
			const room = rooms.get(socket.roomId);
			if (!room) return;

			// Only owner can kick
			if (room.ownerId !== socket.id) return;

			// Can't kick yourself
			if (targetPlayerId === socket.id) return;

			const playerIndex = room.players.findIndex(
				(p) => p.id === targetPlayerId,
			);
			if (playerIndex === -1) return;

			const player = room.players[playerIndex];
			const wasDrawing = player.isDrawing;

			// Remove player from room
			room.players.splice(playerIndex, 1);

			// Notify the kicked player
			io.to(targetPlayerId).emit('kicked', {
				reason: 'You have been kicked by the host',
			});

			// Disconnect kicked player from room
			const kickedSocket = io.sockets.sockets.get(targetPlayerId);
			if (kickedSocket) {
				kickedSocket.leave(socket.roomId);
				kickedSocket.roomId = null;
			}

			// Adjust currentDrawerIndex if needed
			if (playerIndex < room.currentDrawerIndex) {
				room.currentDrawerIndex = Math.max(0, room.currentDrawerIndex - 1);
			} else if (
				playerIndex === room.currentDrawerIndex &&
				room.players.length > 0
			) {
				room.currentDrawerIndex = room.currentDrawerIndex % room.players.length;
			}

			// System message
			const kickMessage = {
				id: Date.now().toString(),
				playerId: 'system',
				playerName: 'System',
				text: `${player.name} was kicked from the game`,
				isCorrect: false,
				isSystem: true,
			};
			room.chatMessages.push(kickMessage);
			io.to(socket.roomId).emit('chatMessage', kickMessage);
			io.to(socket.roomId).emit('playersUpdate', room.players);

			// If kicked player was drawing, end round
			if (
				wasDrawing &&
				room.gamePhase === 'drawing' &&
				room.players.length > 0
			) {
				endRound(room, io);
			}

			// If only one player remains during an active game, they win!
			const activeGamePhases = ['choosing', 'drawing', 'roundEnd'];
			if (
				room.players.length === 1 &&
				activeGamePhases.includes(room.gamePhase)
			) {
				clearInterval(room.timerInterval);
				if (room.nextRoundTimeout) {
					clearTimeout(room.nextRoundTimeout);
				}
				room.gamePhase = 'gameEnd';

				const winner = room.players[0];
				const winMessage = {
					id: Date.now().toString(),
					playerId: 'system',
					playerName: 'System',
					text: `🏆 ${winner.name} wins! All other players were kicked or left.`,
					isCorrect: false,
					isSystem: true,
				};
				room.chatMessages.push(winMessage);
				io.to(socket.roomId).emit('chatMessage', winMessage);
				io.to(socket.roomId).emit('gameEnd', { players: room.players });
			}

			// Clean up empty rooms
			if (room.players.length === 0) {
				clearInterval(room.timerInterval);
				rooms.delete(socket.roomId);
			}
		});

		// Disconnect
		socket.on('disconnect', () => {
			console.log('User disconnected:', socket.id);

			const room = rooms.get(socket.roomId);
			if (!room) return;

			const playerIndex = room.players.findIndex((p) => p.id === socket.id);
			if (playerIndex === -1) return;

			const player = room.players[playerIndex];
			room.players.splice(playerIndex, 1);

			const leaveMessage = {
				id: Date.now().toString(),
				playerId: 'system',
				playerName: 'System',
				text: `${player.name} left the game`,
				isCorrect: false,
				isSystem: true,
			};
			room.chatMessages.push(leaveMessage);
			io.to(socket.roomId).emit('chatMessage', leaveMessage);
			io.to(socket.roomId).emit('playersUpdate', room.players);

			// If owner left, assign new owner
			if (room.ownerId === socket.id && room.players.length > 0) {
				room.ownerId = room.players[0].id;
				io.to(socket.roomId).emit('ownerUpdate', room.ownerId);
			}

			// If drawer left during drawing, end round
			if (player.isDrawing && room.gamePhase === 'drawing') {
				endRound(room, io);
			}

			// If only one player remains during an active game, they win!
			const activeGamePhases = ['choosing', 'drawing', 'roundEnd'];
			if (
				room.players.length === 1 &&
				activeGamePhases.includes(room.gamePhase)
			) {
				clearInterval(room.timerInterval);
				if (room.nextRoundTimeout) {
					clearTimeout(room.nextRoundTimeout);
				}
				room.gamePhase = 'gameEnd';

				const winner = room.players[0];
				const winMessage = {
					id: Date.now().toString(),
					playerId: 'system',
					playerName: 'System',
					text: `🏆 ${winner.name} wins! All other players left the game.`,
					isCorrect: false,
					isSystem: true,
				};
				room.chatMessages.push(winMessage);
				io.to(socket.roomId).emit('chatMessage', winMessage);
				io.to(socket.roomId).emit('gameEnd', { players: room.players });
			}

			// Clean up empty rooms
			if (room.players.length === 0) {
				clearInterval(room.timerInterval);
				if (room.nextRoundTimeout) {
					clearTimeout(room.nextRoundTimeout);
				}
				rooms.delete(socket.roomId);
			}
		});
	});

	function startRoundTimer(room, io) {
		clearInterval(room.timerInterval);

		room.timerInterval = setInterval(() => {
			room.roundTime--;

			io.to(room.id).emit('timerUpdate', room.roundTime);

			// Reveal letter every 20 seconds during drawing
			if (
				room.gamePhase === 'drawing' &&
				room.roundTime % 20 === 0 &&
				room.roundTime < room.maxDrawTime &&
				room.roundTime > 0
			) {
			room.revealedLetters++;
				// Ensure revealedIndices is an array (defensive for old rooms)
				if (!Array.isArray(room.revealedIndices)) {
					room.revealedIndices = [];
				}
				const hintResult = getWordHint(room.currentWord, room.revealedLetters, room.revealedIndices);
				room.wordHint = hintResult.hint;
				room.revealedIndices = hintResult.revealedIndices;
				io.to(room.id).emit('wordHintUpdate', room.wordHint);
			}

			if (room.roundTime <= 0) {
				if (room.gamePhase === 'choosing') {
					// Auto-select random word
					const word =
						room.wordOptions[
							Math.floor(Math.random() * room.wordOptions.length)
						];
					room.currentWord = word;
					room.revealedLetters = 0;
					room.revealedIndices = [];
					const autoHintResult = getWordHint(word, 0, []);
					room.wordHint = autoHintResult.hint;
					room.gamePhase = 'drawing';
					room.roundTime = room.maxDrawTime;

					const drawer = room.players[room.currentDrawerIndex];
					if (drawer) {
						io.to(drawer.id).emit('currentWord', word);
					}
					io.to(room.id).emit('gamePhaseChange', {
						gamePhase: 'drawing',
						wordHint: room.wordHint,
						roundTime: room.roundTime,
					});
				} else {
					endRound(room, io);
				}
			}
		}, 1000);
	}

	function endRound(room, io) {
		clearInterval(room.timerInterval);
		room.gamePhase = 'roundEnd';

		io.to(room.id).emit('roundEnd', {
			word: room.currentWord,
			players: room.players,
		});

		// Automatically start the next turn after 5 seconds
		room.nextRoundTimeout = setTimeout(() => {
			startNextTurn(room, io);
		}, 5000);
	}

	function startNextTurn(room, io) {
		// Move to next drawer
		room.currentDrawerIndex =
			(room.currentDrawerIndex + 1) % room.players.length;

		// Check if we've completed a round (all players have drawn)
		if (room.currentDrawerIndex === 0) {
			// All players have drawn, move to next round
			room.currentRound++;
			room.currentTurn = 1;

			// Check if game is over
			if (room.currentRound > room.totalRounds) {
				room.gamePhase = 'gameEnd';
				io.to(room.id).emit('gameEnd', { players: room.players });
				return;
			}
		} else {
			// Still in current round, just increment turn
			room.currentTurn++;
		}

		// Set up next turn
		room.gamePhase = 'choosing';
		room.wordOptions = getRandomWords(3);
		room.roundTime = 15;
		room.currentWord = '';
		room.wordHint = '';
		room.revealedLetters = 0;
		room.revealedIndices = [];
		room.players.forEach((p) => {
			p.hasGuessed = false;
			p.isDrawing = false;
		});
		room.players[room.currentDrawerIndex].isDrawing = true;

		const drawer = room.players[room.currentDrawerIndex];
		io.to(drawer.id).emit('wordOptions', room.wordOptions);

		io.to(room.id).emit('gamePhaseChange', {
			gamePhase: 'choosing',
			currentRound: room.currentRound,
			currentTurn: room.currentTurn,
			totalTurns: room.players.length,
			currentDrawerIndex: room.currentDrawerIndex,
			roundTime: room.roundTime,
		});
		io.to(room.id).emit('playersUpdate', room.players);
		io.to(room.id).emit('clearCanvas');

		startRoundTimer(room, io);
	}

	httpServer.listen(port, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
