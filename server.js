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

const MIN_ROOM_ID_LENGTH = 4;
const MAX_ROOM_ID_LENGTH = 8;
const MAX_PLAYER_NAME_LENGTH = 24;
const MAX_CHAT_MESSAGE_LENGTH = 120;
const MAX_WORD_LENGTH = 64;
const MAX_EMOTE_LENGTH = 16;
const MAX_DRAW_COORDINATE = 10000;
const MAX_BRUSH_SIZE = 120;

const EVENT_RATE_LIMITS = {
	quickPlay: { limit: 5, windowMs: 10000 },
	joinRoom: { limit: 6, windowMs: 15000 },
	sendMessage: { limit: 12, windowMs: 10000 },
	lobbyMessage: { limit: 10, windowMs: 10000 },
	typing: { limit: 12, windowMs: 5000 },
	sendEmote: { limit: 8, windowMs: 10000 },
	draw: { limit: 240, windowMs: 5000 },
	clearCanvas: { limit: 12, windowMs: 5000 },
	canvasSync: { limit: 5, windowMs: 10000 },
	updateSettings: { limit: 8, windowMs: 10000 },
};

const DRAW_TYPES = new Set(['start', 'draw', 'end']);
const DRAW_TOOLS = new Set(['brush', 'eraser', 'fill']);
const DRAW_SHAPES = new Set(['rectangle', 'circle', 'line']);
const IMAGE_DATA_URL_RE = /^data:image\/(?:png|jpeg|webp);base64,/i;

function parsePositiveInt(raw, fallback, min, max) {
	const parsed = Number.parseInt(raw ?? '', 10);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(max, Math.max(min, parsed));
}

const CHAT_HISTORY_LIMIT = parsePositiveInt(
	process.env.CHAT_HISTORY_LIMIT,
	200,
	20,
	1000,
);
const MAX_ROOMS = parsePositiveInt(process.env.MAX_ROOMS, 500, 10, 5000);
const MAX_CANVAS_SYNC_BYTES = parsePositiveInt(
	process.env.MAX_CANVAS_SYNC_BYTES,
	2 * 1024 * 1024,
	1024,
	10 * 1024 * 1024,
);
const SOCKET_MAX_HTTP_BUFFER_SIZE = parsePositiveInt(
	process.env.SOCKET_MAX_HTTP_BUFFER_SIZE,
	2 * 1024 * 1024,
	1024,
	10 * 1024 * 1024,
);

function normalizeOrigin(value) {
	if (typeof value !== 'string') return null;
	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
}

function getHeaderFirstValue(value) {
	if (Array.isArray(value)) {
		value = value[0];
	}
	if (typeof value !== 'string') return '';
	return value.split(',')[0]?.trim() || '';
}

function getRequestOrigin(req) {
	const host =
		getHeaderFirstValue(req?.headers?.['x-forwarded-host']) ||
		getHeaderFirstValue(req?.headers?.host);
	if (!host) return null;

	const protocol =
		getHeaderFirstValue(req?.headers?.['x-forwarded-proto']) ||
		(req?.socket?.encrypted ? 'https' : 'http');

	return normalizeOrigin(`${protocol}://${host}`);
}

const configuredAllowedOrigins = new Set(
	(process.env.ALLOWED_ORIGINS || '')
		.split(',')
		.map((origin) => normalizeOrigin(origin.trim()))
		.filter(Boolean),
);

const inferredDeploymentOrigins = new Set(
	[
		process.env.RENDER_EXTERNAL_URL,
		process.env.PUBLIC_URL,
		process.env.URL,
		process.env.NEXT_PUBLIC_APP_URL,
		process.env.APP_URL,
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
	]
		.map((origin) => normalizeOrigin(origin))
		.filter(Boolean),
);

const defaultAllowedOrigins = new Set(
	[
		`http://${hostname}:${port}`,
		`https://${hostname}:${port}`,
		`http://${hostname}`,
		`https://${hostname}`,
		`http://localhost:${port}`,
		`https://localhost:${port}`,
		`http://127.0.0.1:${port}`,
		`https://127.0.0.1:${port}`,
		...inferredDeploymentOrigins,
	]
		.map(normalizeOrigin)
		.filter(Boolean),
);

function isOriginAllowed(origin, requestOrigin = null) {
	// Non-browser or same-origin clients may not send an Origin header.
	if (!origin) return true;
	const normalizedOrigin = normalizeOrigin(origin);
	if (!normalizedOrigin) return false;
	if (configuredAllowedOrigins.size > 0) {
		return configuredAllowedOrigins.has(normalizedOrigin);
	}
	if (defaultAllowedOrigins.has(normalizedOrigin)) return true;
	return requestOrigin ? normalizedOrigin === requestOrigin : false;
}

function sanitizeText(value, maxLength) {
	if (typeof value !== 'string') return '';
	return value
		.replace(/[\u0000-\u001F\u007F]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLength);
}

function sanitizePlayerName(name) {
	return sanitizeText(name, MAX_PLAYER_NAME_LENGTH) || 'Player';
}

function normalizeRoomId(roomId) {
	if (typeof roomId !== 'string') return null;
	const cleaned = roomId
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')
		.slice(0, MAX_ROOM_ID_LENGTH);
	if (cleaned.length < MIN_ROOM_ID_LENGTH) return null;
	return cleaned;
}

function clamp(value, min, max) {
	if (!Number.isFinite(value)) return min;
	return Math.min(max, Math.max(min, value));
}

function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}

function isValidHexColor(color) {
	return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isValidDrawPayload(drawData) {
	if (!drawData || typeof drawData !== 'object') return false;
	if (!DRAW_TYPES.has(drawData.type)) return false;
	if (!DRAW_TOOLS.has(drawData.tool)) return false;
	if (!isFiniteNumber(drawData.x) || !isFiniteNumber(drawData.y)) return false;
	if (
		Math.abs(drawData.x) > MAX_DRAW_COORDINATE ||
		Math.abs(drawData.y) > MAX_DRAW_COORDINATE
	) {
		return false;
	}
	if (!isValidHexColor(drawData.color)) return false;
	if (
		!isFiniteNumber(drawData.brushSize) ||
		drawData.brushSize < 1 ||
		drawData.brushSize > MAX_BRUSH_SIZE
	) {
		return false;
	}
	if (
		drawData.prevX !== undefined &&
		(!isFiniteNumber(drawData.prevX) ||
			Math.abs(drawData.prevX) > MAX_DRAW_COORDINATE)
	) {
		return false;
	}
	if (
		drawData.prevY !== undefined &&
		(!isFiniteNumber(drawData.prevY) ||
			Math.abs(drawData.prevY) > MAX_DRAW_COORDINATE)
	) {
		return false;
	}
	if (drawData.shape !== undefined && !DRAW_SHAPES.has(drawData.shape)) {
		return false;
	}
	return true;
}

function isValidCanvasDataUrl(imageDataUrl) {
	if (typeof imageDataUrl !== 'string') return false;
	if (!IMAGE_DATA_URL_RE.test(imageDataUrl)) return false;
	const encoded = imageDataUrl.split(',', 2)[1];
	if (!encoded) return false;
	const estimatedBytes = Math.floor((encoded.length * 3) / 4);
	return estimatedBytes <= MAX_CANVAS_SYNC_BYTES;
}

function appendChatMessage(room, message) {
	room.chatMessages.push(message);
	if (room.chatMessages.length > CHAT_HISTORY_LIMIT) {
		room.chatMessages.splice(0, room.chatMessages.length - CHAT_HISTORY_LIMIT);
	}
}

function clearRoomTimers(room) {
	clearInterval(room.timerInterval);
	room.timerInterval = null;
	if (room.nextRoundTimeout) {
		clearTimeout(room.nextRoundTimeout);
		room.nextRoundTimeout = null;
	}
}

function createRateLimiter(socket) {
	const activity = new Map();
	return (eventName) => {
		const rule = EVENT_RATE_LIMITS[eventName];
		if (!rule) return true;

		const now = Date.now();
		const existing = activity.get(eventName) || [];
		const recent = existing.filter((ts) => now - ts < rule.windowMs);
		if (recent.length >= rule.limit) {
			socket.emit('rateLimited', { event: eventName });
			return false;
		}
		recent.push(now);
		activity.set(eventName, recent);
		return true;
	};
}

const AVATARS = ['🎨', '🖌️', '✏️', '🖍️', '🎭', '🎪', '🎯', '🎲', '🎮', '🎸'];

const SKIN_COLORS = new Set([
	'#FFDBB4',
	'#EDB98A',
	'#D08B5B',
	'#AE5D29',
	'#614335',
	'#3B2219',
]);
const HAIR_COLORS = new Set([
	'#090806',
	'#2C222B',
	'#71635A',
	'#B7A69E',
	'#D6C4C2',
	'#CABFB1',
	'#B55239',
	'#8D4A43',
	'#E0E0E0',
	'#6B5B95',
	'#88B04B',
	'#45B8AC',
]);

const DEFAULT_AVATAR = {
	skinColor: '#FFDBB4',
	eyeStyle: 0,
	mouthStyle: 0,
	hairStyle: 1,
	hairColor: '#090806',
	accessory: 0,
};

function sanitizeAvatar(rawAvatar) {
	if (!rawAvatar || typeof rawAvatar !== 'object') return null;

	const skinColor =
		typeof rawAvatar.skinColor === 'string'
			? rawAvatar.skinColor.toUpperCase()
			: DEFAULT_AVATAR.skinColor;
	const hairColor =
		typeof rawAvatar.hairColor === 'string'
			? rawAvatar.hairColor.toUpperCase()
			: DEFAULT_AVATAR.hairColor;

	return {
		skinColor: SKIN_COLORS.has(skinColor)
			? skinColor
			: DEFAULT_AVATAR.skinColor,
		eyeStyle: clamp(
			Number.isInteger(rawAvatar.eyeStyle) ? rawAvatar.eyeStyle : 0,
			0,
			5,
		),
		mouthStyle: clamp(
			Number.isInteger(rawAvatar.mouthStyle) ? rawAvatar.mouthStyle : 0,
			0,
			5,
		),
		hairStyle: clamp(
			Number.isInteger(rawAvatar.hairStyle) ? rawAvatar.hairStyle : 1,
			0,
			6,
		),
		hairColor: HAIR_COLORS.has(hairColor)
			? hairColor
			: DEFAULT_AVATAR.hairColor,
		accessory: clamp(
			Number.isInteger(rawAvatar.accessory) ? rawAvatar.accessory : 0,
			0,
			6,
		),
	};
}

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
		nextRoundTimeout: null,
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
			origin: true,
			methods: ['GET', 'POST'],
			credentials: true,
		},
		allowRequest: (req, callback) => {
			const requestOrigin = getRequestOrigin(req);
			const originHeader = getHeaderFirstValue(req?.headers?.origin) || null;
			if (isOriginAllowed(originHeader, requestOrigin)) {
				callback(null, true);
				return;
			}
			console.warn('Blocked socket connection from disallowed origin', {
				origin: originHeader,
				requestOrigin,
			});
			callback('Socket origin not allowed', false);
		},
		maxHttpBufferSize: SOCKET_MAX_HTTP_BUFFER_SIZE,
	});

	io.on('connection', (socket) => {
		console.log('User connected:', socket.id);
		const allowEvent = createRateLimiter(socket);

		const removePlayerFromRoom = (leaveSuffix = 'left the game') => {
			const roomId = socket.roomId;
			if (!roomId) return;

			const room = rooms.get(roomId);
			if (!room) {
				socket.roomId = null;
				socket.playerId = null;
				return;
			}

			const playerIndex = room.players.findIndex((p) => p.id === socket.id);
			if (playerIndex === -1) {
				socket.roomId = null;
				socket.playerId = null;
				return;
			}

			const [player] = room.players.splice(playerIndex, 1);

			const leaveMessage = {
				id: Date.now().toString(),
				playerId: 'system',
				playerName: 'System',
				text: `${player.name} ${leaveSuffix}`,
				isCorrect: false,
				isSystem: true,
			};
			appendChatMessage(room, leaveMessage);
			io.to(roomId).emit('chatMessage', leaveMessage);
			io.to(roomId).emit('playersUpdate', room.players);

			// If owner left, assign new owner.
			if (room.ownerId === socket.id && room.players.length > 0) {
				room.ownerId = room.players[0].id;
				io.to(roomId).emit('ownerUpdate', room.ownerId);
			}

			// If drawer left during drawing, end round.
			if (player.isDrawing && room.gamePhase === 'drawing' && room.players.length > 0) {
				endRound(room, io);
			}

			// If one player remains in active gameplay, end the game.
			const activeGamePhases = ['choosing', 'drawing', 'roundEnd'];
			if (
				room.players.length === 1 &&
				activeGamePhases.includes(room.gamePhase)
			) {
				clearRoomTimers(room);
				room.gamePhase = 'gameEnd';

				const winner = room.players[0];
				const winMessage = {
					id: Date.now().toString(),
					playerId: 'system',
					playerName: 'System',
					text: `ðŸ† ${winner.name} wins! All other players left the game.`,
					isCorrect: false,
					isSystem: true,
				};
				appendChatMessage(room, winMessage);
				io.to(roomId).emit('chatMessage', winMessage);
				io.to(roomId).emit('gameEnd', { players: room.players });
			}

			if (room.players.length === 0) {
				clearRoomTimers(room);
				rooms.delete(roomId);
			}

			socket.leave(roomId);
			socket.roomId = null;
			socket.playerId = null;
		};

		// Join room
		// Quick play - find or create a public room
		socket.on('quickPlay', () => {
			if (!allowEvent('quickPlay')) return;

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
				if (rooms.size >= MAX_ROOMS) {
					socket.emit('quickPlayError', {
						message: 'Server is full right now. Please try again shortly.',
					});
					return;
				}
				// Create new public room
				let attempts = 0;
				do {
					roomId = generateRoomId();
					attempts++;
				} while (rooms.has(roomId) && attempts < 8);
				if (rooms.has(roomId)) {
					socket.emit('quickPlayError', {
						message: 'Could not create a room right now. Please retry.',
					});
					return;
				}
				const room = createRoom(roomId, true);
				rooms.set(roomId, room);
				console.log('Quick Play - Created new room:', roomId);
			}

			// Send the room ID to client
			socket.emit('quickPlayResult', { roomId });
		});

		// Join room
		socket.on('joinRoom', (payload = {}) => {
			if (!allowEvent('joinRoom')) return;

			const safeRoomId = normalizeRoomId(payload.roomId);
			let safePlayerName = sanitizePlayerName(payload.playerName);
			const safeIsPublic =
				typeof payload.isPublic === 'boolean' ? payload.isPublic : true;
			const safeAvatar = sanitizeAvatar(payload.customAvatar);

			if (!safeRoomId) {
				socket.emit('roomError', {
					message:
						'Invalid room code. Use 4-8 letters or numbers (A-Z, 0-9).',
				});
				return;
			}

			let room = rooms.get(safeRoomId);

			if (!room) {
				if (rooms.size >= MAX_ROOMS) {
					socket.emit('roomError', {
						message: 'Server is full right now. Please try again shortly.',
					});
					return;
				}

				// Create room with specified visibility (default public)
				room = createRoom(safeRoomId, safeIsPublic);
				rooms.set(safeRoomId, room);
			}

			// Check if this socket is already in the room (prevent duplicates)
			const playerBySocket = room.players.find((p) => p.id === socket.id);
			if (playerBySocket) {
				// Update name if changed
				if (safePlayerName) {
					playerBySocket.name = safePlayerName;
					// Update custom avatar if provided
					if (safeAvatar) {
						playerBySocket.customAvatar = safeAvatar;
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
				io.to(safeRoomId).emit('playersUpdate', room.players);
				return;
			}

			// Name collision: generate a unique visible alias.
			if (room.players.some((p) => p.name === safePlayerName)) {
				console.log(
					`Name collision for ${safePlayerName} in room ${safeRoomId}. Generating unique name.`,
				);
				let count = 2;
				let newName = `${safePlayerName} ${count}`;
				while (room.players.some((p) => p.name === newName)) {
					count++;
					newName = `${safePlayerName} ${count}`;
				}
				safePlayerName = newName;
			}

			// New joiners cannot exceed max room capacity.
			if (room.players.length >= room.maxPlayers) {
				socket.emit('roomError', { message: 'Room is full.' });
				return;
			}

			// Create new player
			const isGameInProgress = room.gamePhase !== 'lobby';
			const player = {
				id: socket.id,
				name: safePlayerName || 'Player',
				score: 0,
				avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
				customAvatar: safeAvatar || null, // Store custom avatar if provided
				// Late joiners can participate immediately in the current round
				hasGuessed: false,
				isDrawing: false,
			};

			room.players.push(player);
			socket.join(safeRoomId);
			socket.roomId = safeRoomId;
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
			io.to(safeRoomId).emit('playerJoined', player);
			io.to(safeRoomId).emit('playersUpdate', room.players);

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
			appendChatMessage(room, joinMessage);
			io.to(safeRoomId).emit('chatMessage', joinMessage);
		});

		// Update room settings (owner only)
		socket.on('updateSettings', (payload = {}) => {
			if (!allowEvent('updateSettings')) return;
			const { totalRounds, drawTime } = payload;

			const room = rooms.get(socket.roomId);
			if (!room) return;

			// Only owner can change settings
			if (room.ownerId !== socket.id) return;

			// Only allow changes in lobby
			if (room.gamePhase !== 'lobby') return;

			const safeTotalRounds = parsePositiveInt(totalRounds, room.totalRounds, 1, 10);
			const safeDrawTime = parsePositiveInt(drawTime, room.maxDrawTime, 30, 180);

			if (safeTotalRounds >= 1 && safeTotalRounds <= 10) {
				room.totalRounds = safeTotalRounds;
			}
			if (safeDrawTime >= 30 && safeDrawTime <= 180) {
				room.maxDrawTime = safeDrawTime;
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
			room.wordOptions = getRandomWords(room, 3);
			room.roundTime = 15;
			room.players.forEach((p) => {
				p.hasGuessed = false;
				p.isDrawing = false;
				p.score = 0;
			});
			room.players[0].isDrawing = true;
			room.chatMessages = []; // Clear chat on new game
			clearRoomTimers(room);

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

			const safeWord = sanitizeText(word, MAX_WORD_LENGTH);
			if (!safeWord) return;
			if (!room.wordOptions.includes(safeWord)) return;

			room.currentWord = safeWord;
			room.revealedLetters = 0;
			room.revealedIndices = [];
			const hintResult = getWordHint(safeWord, 0, []);
			room.wordHint = hintResult.hint;
			room.gamePhase = 'drawing';
			room.roundTime = room.maxDrawTime; // Use room setting
			room.canvasData = null;

			clearRoomTimers(room);

			// Send word to drawer only
			io.to(drawer.id).emit('currentWord', safeWord);

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
			if (!allowEvent('sendMessage')) return;

			const room = rooms.get(socket.roomId);
			if (!room || room.gamePhase !== 'drawing') return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			// Drawer can't chat
			if (player.isDrawing) return;

			// Already guessed
			if (player.hasGuessed) return;

			const safeText = sanitizeText(text, MAX_CHAT_MESSAGE_LENGTH);
			if (!safeText) return;

			const normalizedGuess = safeText.toLowerCase().trim();
			const isCorrect = normalizedGuess === room.currentWord.toLowerCase();

			const message = {
				id: Date.now().toString(),
				playerId: player.id,
				playerName: player.name,
				text: isCorrect ? safeText.replace(/./g, '*') : safeText,
				isCorrect,
				isSystem: false,
			};

			appendChatMessage(room, message);
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
				appendChatMessage(room, systemMessage);
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
			if (!allowEvent('draw')) return;

			const room = rooms.get(socket.roomId);
			if (!room) return;

			const drawer = room.players[room.currentDrawerIndex];
			if (!drawer || drawer.id !== socket.id) return;
			if (!isValidDrawPayload(drawData)) return;

			// Broadcast to all except sender
			socket.to(socket.roomId).emit('draw', drawData);
		});

		// Canvas clear
		socket.on('clearCanvas', () => {
			if (!allowEvent('clearCanvas')) return;

			const room = rooms.get(socket.roomId);
			if (!room) return;

			const drawer = room.players[room.currentDrawerIndex];
			if (!drawer || drawer.id !== socket.id) return;

			socket.to(socket.roomId).emit('clearCanvas');
		});

		// Canvas sync (for undo/redo - sends full canvas state)
		socket.on('canvasSync', (imageDataUrl) => {
			if (!allowEvent('canvasSync')) return;

			const room = rooms.get(socket.roomId);
			if (!room) return;

			const drawer = room.players[room.currentDrawerIndex];
			if (!drawer || drawer.id !== socket.id) return;
			if (!isValidCanvasDataUrl(imageDataUrl)) return;

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
			if (reaction !== 'like' && reaction !== 'dislike') return;

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
			appendChatMessage(room, reactionMessage);
			io.to(socket.roomId).emit('chatMessage', reactionMessage);
		});

		// Lobby chat - messages during lobby phase
		socket.on('lobbyMessage', (text) => {
			if (!allowEvent('lobbyMessage')) return;

			const room = rooms.get(socket.roomId);
			if (!room || room.gamePhase !== 'lobby') return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			const safeText = sanitizeText(text, MAX_CHAT_MESSAGE_LENGTH);
			if (!safeText) return;

			const message = {
				id: Date.now().toString(),
				playerId: player.id,
				playerName: player.name,
				text: safeText,
				isCorrect: false,
				isSystem: false,
			};
			appendChatMessage(room, message);
			io.to(socket.roomId).emit('chatMessage', message);
		});

		// Emote reactions during drawing
		socket.on('sendEmote', (emote) => {
			if (!allowEvent('sendEmote')) return;

			const room = rooms.get(socket.roomId);
			if (!room || room.gamePhase !== 'drawing') return;

			const player = room.players.find((p) => p.id === socket.id);
			if (!player) return;

			// Drawer can't send emotes
			if (player.isDrawing) return;

			const safeEmote = sanitizeText(emote, MAX_EMOTE_LENGTH);
			if (!safeEmote) return;

			// Broadcast emote to all players
			io.to(socket.roomId).emit('emote', {
				emote: safeEmote,
				playerName: player.name,
			});
		});

		// Typing indicator
		socket.on('typing', () => {
			if (!allowEvent('typing')) return;

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
			clearRoomTimers(room);

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
			if (typeof targetPlayerId !== 'string') return;

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
				kickedSocket.playerId = null;
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
			appendChatMessage(room, kickMessage);
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
				clearRoomTimers(room);
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
				appendChatMessage(room, winMessage);
				io.to(socket.roomId).emit('chatMessage', winMessage);
				io.to(socket.roomId).emit('gameEnd', { players: room.players });
			}

			// Clean up empty rooms
			if (room.players.length === 0) {
				clearRoomTimers(room);
				rooms.delete(socket.roomId);
			}
		});

		// Leave room
		socket.on('leaveRoom', () => {
			removePlayerFromRoom('left the room');
		});

		// Disconnect
		socket.on('disconnect', () => {
			console.log('User disconnected:', socket.id);
			removePlayerFromRoom('left the game');
		});
	});

	function startRoundTimer(room, io) {
		clearRoomTimers(room);

		room.timerInterval = setInterval(() => {
			if (!rooms.has(room.id) || room.players.length === 0) {
				clearRoomTimers(room);
				if (rooms.has(room.id) && room.players.length === 0) {
					rooms.delete(room.id);
				}
				return;
			}

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
				const hintResult = getWordHint(
					room.currentWord,
					room.revealedLetters,
					room.revealedIndices,
				);
				room.wordHint = hintResult.hint;
				room.revealedIndices = hintResult.revealedIndices;
				io.to(room.id).emit('wordHintUpdate', room.wordHint);
			}

			if (room.roundTime <= 0) {
				if (room.gamePhase === 'choosing') {
					if (!Array.isArray(room.wordOptions) || room.wordOptions.length === 0) {
						room.wordOptions = getRandomWords(room, 3);
					}
					// Auto-select random word
					const word =
						room.wordOptions[
							Math.floor(Math.random() * room.wordOptions.length)
						];
					if (!word) {
						endRound(room, io);
						return;
					}
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
		if (!room || room.players.length === 0) return;
		clearRoomTimers(room);
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
		if (!room || !Array.isArray(room.players) || room.players.length === 0) {
			if (room) {
				clearRoomTimers(room);
				rooms.delete(room.id);
			}
			return;
		}

		// One-player game cannot continue with turn rotation.
		if (room.players.length === 1) {
			clearRoomTimers(room);
			room.gamePhase = 'gameEnd';
			io.to(room.id).emit('gameEnd', { players: room.players });
			return;
		}

		clearRoomTimers(room);

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
		room.wordOptions = getRandomWords(room, 3);
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

