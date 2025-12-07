'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGame, DrawData } from '../context/GameContext';

// Compact color palette
const QUICK_COLORS = [
	'#000000',
	'#FFFFFF',
	'#FF0000',
	'#00FF00',
	'#0000FF',
	'#FFFF00',
	'#FF00FF',
	'#00FFFF',
];
const ALL_COLORS = [
	'#000000',
	'#4A4A4A',
	'#808080',
	'#FFFFFF',
	'#FF0000',
	'#FF4500',
	'#FF8000',
	'#FFD700',
	'#FFFF00',
	'#9ACD32',
	'#00FF00',
	'#00FFFF',
	'#0000FF',
	'#4B0082',
	'#8000FF',
	'#FF00FF',
	'#8B4513',
	'#CD853F',
	'#DEB887',
	'#FFE4C4',
];

const BRUSH_SIZES = [4, 8, 16, 24];

// Custom cursor SVGs
const createBrushCursor = (color: string, size: number) => {
	const displaySize = Math.max(24, Math.min(size * 2, 64));
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
		displaySize
	}" height="${displaySize}" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" fill="${color}" stroke="#333" stroke-width="1.5"/></svg>`;
	return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${
		(2 / 24) * displaySize
	} ${
		(22 / 24) * displaySize
	}, crosshair`;
};

const createEraserCursor = (size: number) => {
	const displaySize = Math.max(16, Math.min(size * 1.5, 48));
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
		displaySize + 8
	}" height="${displaySize + 8}" viewBox="0 0 ${displaySize + 8} ${
		displaySize + 8
	}"><circle cx="${displaySize / 2 + 4}" cy="${displaySize / 2 + 4}" r="${
		displaySize / 2
	}" fill="white" stroke="#666" stroke-width="2" stroke-dasharray="4,2"/></svg>`;
	return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${
		displaySize / 2 + 4
	} ${displaySize / 2 + 4}, crosshair`;
};

// ToolBtn component - moved outside to prevent re-creation during render
const ToolBtn = ({
	active,
	onClick,
	title,
	children,
	disabled,
}: {
	active?: boolean;
	onClick: () => void;
	title: string;
	children: React.ReactNode;
	disabled?: boolean;
}) => (
	<button
		onClick={onClick}
		title={title}
		disabled={disabled}
		className={`p-2 rounded-lg transition-all ${
			disabled ? 'opacity-40 cursor-not-allowed' : ''
		} ${
			active
				? 'bg-primary text-primary-foreground shadow-md'
				: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
		}`}>
		{children}
	</button>
);

export default function Canvas() {
	const { canvasRef, gamePhase, clearCanvas, isDrawer, emitDraw, reactToDrawing } = useGame();
	const [isDrawing, setIsDrawing] = useState(false);
	const [color, setColor] = useState('#000000');
	const [brushSize, setBrushSize] = useState(8);
	const [tool, setTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
	const [openDropdown, setOpenDropdown] = useState<'color' | 'size' | null>(
		null,
	);
	const lastPos = useRef<{ x: number; y: number } | null>(null);
	const colorInputRef = useRef<HTMLInputElement>(null);

	const canvasCursor = useMemo(() => {
		if (!isDrawer || gamePhase !== 'drawing') return 'not-allowed';
		if (tool === 'brush') return createBrushCursor(color, brushSize);
		if (tool === 'eraser') return createEraserCursor(brushSize);
		return 'crosshair';
	}, [tool, color, brushSize, isDrawer, gamePhase]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		canvas.width = 800;
		canvas.height = 600;
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Save initial state
		// const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// setHistory([initialState]);
		// setHistoryIndex(0);
	}, [canvasRef]);

	const getCanvasCoords = (
		e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
	) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		
		let clientX, clientY;
		if ('touches' in e) {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else {
			clientX = e.clientX;
			clientY = e.clientY;
		}

		return {
			x: (clientX - rect.left) * (canvas.width / rect.width),
			y: (clientY - rect.top) * (canvas.height / rect.height),
		};
	};

	const startDrawing = (
		e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
	) => {
		if (gamePhase !== 'drawing' || !isDrawer) return;
		const coords = getCanvasCoords(e);
		lastPos.current = coords;
		setIsDrawing(true);
		if (tool === 'fill') {
			floodFill(Math.floor(coords.x), Math.floor(coords.y), color);
			// Emit fill action to other players
			const fillData: DrawData = {
				type: 'draw',
				x: Math.floor(coords.x),
				y: Math.floor(coords.y),
				color,
				brushSize,
				tool: 'fill',
			};
			emitDraw(fillData);
			// saveToHistory();
		}
	};

	const draw = (
		e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
	) => {
		if (!isDrawing || gamePhase !== 'drawing' || tool === 'fill' || !isDrawer)
			return;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx || !lastPos.current) return;
		const coords = getCanvasCoords(e);
		ctx.beginPath();
		ctx.moveTo(lastPos.current.x, lastPos.current.y);
		ctx.lineTo(coords.x, coords.y);
		ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
		ctx.lineWidth = brushSize;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.stroke();
		const drawData: DrawData = {
			type: 'draw',
			x: coords.x,
			y: coords.y,
			prevX: lastPos.current.x,
			prevY: lastPos.current.y,
			color,
			brushSize,
			tool,
		};
		emitDraw(drawData);
		lastPos.current = coords;
	};

	const stopDrawing = () => {
		if (isDrawing) {
			// saveToHistory();
		}
		setIsDrawing(false);
		lastPos.current = null;
	};

	const floodFill = (startX: number, startY: number, fillColor: string) => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
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
		const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fillColor);
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
	};

	// Handle clear
	const handleClear = () => {
		clearCanvas();
	};

	const toggleDropdown = (dropdown: 'color' | 'size') => {
		setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
	};

	return (
		<div className="flex flex-col gap-2">
			{/* Canvas */}
			<motion.div
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				className="relative rounded-xl overflow-hidden shadow-lg border-2 border-border bg-card">
				<canvas
					ref={canvasRef}
					width={800}
					height={600}
					className="w-full touch-none select-none"
					style={{ aspectRatio: '4/2.5', cursor: canvasCursor, touchAction: 'none' }}
					onMouseDown={startDrawing}
					onMouseMove={draw}
					onMouseUp={stopDrawing}
					onMouseLeave={stopDrawing}
					onTouchStart={startDrawing}
					onTouchMove={draw}
					onTouchEnd={stopDrawing}
				/>
				{gamePhase !== 'drawing' && (
					<div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
						<span className="text-white font-bold px-4 py-2 bg-black/40 rounded-xl text-sm">
							{gamePhase === 'choosing'
								? '🎨 Selecting word...'
								: gamePhase === 'lobby'
								? '⏳ Waiting...'
								: '🏁 Round ended'}
						</span>
					</div>
				)}
			</motion.div>

			{/* Like/Dislike Buttons - visible only to non-drawers during drawing */}
			{gamePhase === 'drawing' && !isDrawer && (
				<motion.div
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center gap-3">
					<button
						onClick={() => reactToDrawing('like')}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-500 transition-all hover:scale-105"
						title="Like this drawing">
						<ThumbsUp className="w-4 h-4" />
						<span className="text-sm font-medium">Like</span>
					</button>
					<button
						onClick={() => reactToDrawing('dislike')}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 transition-all hover:scale-105"
						title="Dislike this drawing">
						<ThumbsDown className="w-4 h-4" />
						<span className="text-sm font-medium">Dislike</span>
					</button>
				</motion.div>
			)}

			{/* Compact Toolbar */}
			{isDrawer && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center gap-1 p-2 bg-card rounded-xl shadow-md border border-border">
					{/* Color Picker Dropdown */}
					<div className="relative">
						<button
							onClick={() => toggleDropdown('color')}
							className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-muted transition-all"
							title="Colors">
							<div
								className="w-6 h-6 rounded border-2 border-white/20 shadow-sm"
								style={{ backgroundColor: color }}
							/>
							<svg
								className="w-3 h-3 text-muted-foreground"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
						<AnimatePresence>
							{openDropdown === 'color' && (
								<motion.div
									initial={{ opacity: 0, y: -5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -5 }}
									className="absolute bottom-full left-0 mb-2 p-2 bg-popover rounded-xl shadow-xl border border-border z-100">
									<div className="grid grid-cols-4 gap-1.5 mb-2">
										{ALL_COLORS.map((c) => (
											<button
												key={c}
												onClick={() => {
													setColor(c);
													setTool('brush');
												}}
												className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${
													color === c
														? 'ring-2 ring-primary ring-offset-1 ring-offset-popover'
														: ''
												}`}
												style={{
													backgroundColor: c,
													border: c === '#FFFFFF' ? '1px solid #444' : 'none',
												}}
											/>
										))}
									</div>
									<div className="flex items-center gap-2 pt-2 border-t border-border">
										<input
											ref={colorInputRef}
											type="color"
											value={color}
											onChange={(e) => {
												setColor(e.target.value);
												setTool('brush');
											}}
											className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
										/>
										<span className="text-xs text-muted-foreground font-mono">
											{color.toUpperCase()}
										</span>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Quick Colors */}
					<div className="flex gap-0.5 px-1 gap-2">
						{QUICK_COLORS.slice(0, 6).map((c) => (
							<button
								key={c}
								onClick={() => {
									setColor(c);
									setTool('brush');
								}}
								className={`w-5 h-5 rounded transition-transform hover:scale-110 ${
									color === c && tool === 'brush'
										? 'ring-2 ring-primary ring-offset-1 ring-offset-card'
										: ''
								}`}
								style={{
									backgroundColor: c,
									border: c === '#FFFFFF' ? '1px solid #444' : 'none',
								}}
							/>
						))}
					</div>

					<div className="w-px h-6 bg-border mx-1" />

					{/* Brush Size Dropdown */}
					<div className="relative">
						<button
							onClick={() => toggleDropdown('size')}
							className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted transition-all text-xs font-medium text-muted-foreground hover:text-foreground"
							title="Brush Size">
							<div
								className="w-3 h-3 rounded-full bg-foreground"
								style={{
									width: Math.min(brushSize / 2, 12),
									height: Math.min(brushSize / 2, 12),
								}}
							/>
							<span>{brushSize}px</span>
							<svg
								className="w-3 h-3 text-muted-foreground"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
						<AnimatePresence>
							{openDropdown === 'size' && (
								<motion.div
									initial={{ opacity: 0, y: -5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -5 }}
									className="absolute bottom-full left-0 mb-2 p-2 bg-popover rounded-xl shadow-xl border border-border z-[100]">
									<div className="flex gap-1">
										{BRUSH_SIZES.map((size) => (
											<button
												key={size}
												onClick={() => {
													setBrushSize(size);
													setOpenDropdown(null);
												}}
												className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
													brushSize === size
														? 'bg-primary text-primary-foreground'
														: 'bg-muted hover:bg-muted/80'
												}`}>
												<div
													className={`rounded-full ${
														brushSize === size
															? 'bg-primary-foreground'
															: 'bg-muted-foreground'
													}`}
													style={{
														width: Math.max(4, size * 0.6),
														height: Math.max(4, size * 0.6),
													}}
												/>
											</button>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className="w-px h-6 bg-border mx-1" />

					{/* Tools */}
					<div className="flex gap-0.5">
						<ToolBtn
							active={tool === 'brush'}
							onClick={() => setTool('brush')}
							title="Brush">
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
						</ToolBtn>
						<ToolBtn
							active={tool === 'eraser'}
							onClick={() => setTool('eraser')}
							title="Eraser">
							<svg
								className="w-4 h-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M20 20H7L3 16c-.6-.6-.6-1.5 0-2.1l10-10c.6-.6 1.5-.6 2.1 0l6 6c.6.6.6 1.5 0 2.1L13 20"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 11l7 7"
								/>
							</svg>
						</ToolBtn>
						<ToolBtn
							active={tool === 'fill'}
							onClick={() => setTool('fill')}
							title="Fill">
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
								/>
							</svg>
						</ToolBtn>
					</div>

					<div className="w-px h-6 bg-border mx-1" />

					{/* Clear */}
					<button
						onClick={handleClear}
						title="Clear Canvas"
						className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all">
						<svg
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
				</motion.div>
			)}
		</div>
	);
}
