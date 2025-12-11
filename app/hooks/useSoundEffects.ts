'use client';

import { useCallback, useRef, useEffect } from 'react';

// Sound file paths
const SOUNDS = {
	message: '/sounds/message.mp3',
	correct: '/sounds/correct.mp3',
	tick: '/sounds/ticking-clock.mp3',
	victory: '/sounds/confetti-pop (1).mp3',
	fail: '/sounds/fail.mp3',
	join: '/sounds/join.mp3',
	leave: '/sounds/leave.mp3',
	gameStart: '/sounds/game-start.mp3',
} as const;

type SoundType = keyof typeof SOUNDS;

// Cache for preloaded audio
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Track currently playing tick audio so we can stop it
let currentTickAudio: HTMLAudioElement | null = null;

export function useSoundEffects() {
	const volumeRef = useRef(0.5);
	const enabledRef = useRef(true);

	// Preload sounds on mount
	useEffect(() => {
		if (typeof window === 'undefined') return;

		Object.entries(SOUNDS).forEach(([key, src]) => {
			if (!audioCache.has(key)) {
				const audio = new Audio(src);
				audio.preload = 'auto';
				audio.volume = volumeRef.current;
				audioCache.set(key, audio);
			}
		});
	}, []);

	const playSound = useCallback((type: SoundType) => {
		if (!enabledRef.current) return;
		if (typeof window === 'undefined') return;

		try {
			const audio = new Audio(SOUNDS[type]);
			audio.volume = volumeRef.current;
			audio.play().catch(() => {
				// Ignore autoplay errors
			});
		} catch {
			// Ignore errors
		}
	}, []);

	const playMessage = useCallback(() => playSound('message'), [playSound]);
	const playCorrect = useCallback(() => playSound('correct'), [playSound]);
	const playVictory = useCallback(() => playSound('victory'), [playSound]);
	const playFail = useCallback(() => playSound('fail'), [playSound]);
	const playJoin = useCallback(() => playSound('join'), [playSound]);
	const playLeave = useCallback(() => playSound('leave'), [playSound]);
	const playGameStart = useCallback(() => playSound('gameStart'), [playSound]);

	// Special tick function that tracks the audio so it can be stopped
	const playTick = useCallback(() => {
		if (!enabledRef.current) return;
		if (typeof window === 'undefined') return;

		try {
			// Stop any existing tick sound first
			if (currentTickAudio) {
				currentTickAudio.pause();
				currentTickAudio.currentTime = 0;
			}

			const audio = new Audio(SOUNDS.tick);
			audio.volume = volumeRef.current;
			currentTickAudio = audio;
			audio.play().catch(() => {});
		} catch {
			// Ignore errors
		}
	}, []);

	// Function to stop the tick sound
	const stopTick = useCallback(() => {
		if (currentTickAudio) {
			currentTickAudio.pause();
			currentTickAudio.currentTime = 0;
			currentTickAudio = null;
		}
	}, []);

	const setVolume = useCallback((v: number) => {
		volumeRef.current = Math.max(0, Math.min(1, v));
		audioCache.forEach((audio) => {
			audio.volume = volumeRef.current;
		});
	}, []);

	const setEnabled = useCallback((enabled: boolean) => {
		enabledRef.current = enabled;
	}, []);

	return {
		playMessage,
		playCorrect,
		playTick,
		stopTick,
		playVictory,
		playFail,
		playJoin,
		playLeave,
		playGameStart,
		playSound,
		setVolume,
		setEnabled,
	};
}
