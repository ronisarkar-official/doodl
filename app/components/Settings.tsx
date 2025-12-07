'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, X, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import { usePathname } from 'next/navigation';

export default function Settings() {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();
	const isGamePage = pathname === '/game';

	// Wait for client-side mount before using portal
	useEffect(() => {
		setMounted(true);
	}, []);

	const modalContent = (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
					onClick={() => setIsOpen(false)}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-[380px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-5 py-4 border-b border-border">
							<div className="flex items-center gap-2">
								<SettingsIcon className="w-5 h-5 text-muted-foreground" />
								<h2 className="text-lg font-semibold text-foreground">Settings</h2>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
								aria-label="Close"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Content */}
						<div className="p-5 space-y-6">
							{/* Appearance Section */}
							<div>
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
									Appearance
								</h3>
								
								{/* Theme Switcher - macOS Segmented Control Style */}
								<div className="bg-secondary/50 p-1 rounded-xl flex gap-1">
									<button
										onClick={() => setTheme('light')}
										className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
											theme === 'light'
												? 'bg-card text-foreground shadow-sm'
												: 'text-muted-foreground hover:text-foreground'
										}`}
									>
										<Sun className="w-4 h-4" />
										<span>Light</span>
									</button>
									<button
										onClick={() => setTheme('dark')}
										className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
											theme === 'dark'
												? 'bg-card text-foreground shadow-sm'
												: 'text-muted-foreground hover:text-foreground'
										}`}
									>
										<Moon className="w-4 h-4" />
										<span>Dark</span>
									</button>
								</div>
								
								<p className="text-xs text-muted-foreground mt-3">
									Choose your preferred color scheme for the interface
								</p>
							</div>

							{/* Divider */}
							<div className="border-t border-border" />

							{/* About Section */}
							<div>
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
									About
								</h3>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
										GG
									</div>
									<div>
										<p className="font-medium text-foreground text-sm">Galactic Guess</p>
										<p className="text-xs text-muted-foreground">Version 1.0.0</p>
									</div>
								</div>
							</div>

							{/* Mobile Exit Section - Only visible on mobile and inside a game */}
							{isGamePage && (
								<div className="sm:hidden">
									<div className="border-t border-border pt-6" />
									<a
										href="/"
										className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 font-medium text-sm transition-colors"
									>
										<LogOut className="w-4 h-4" />
										<span>Exit Game</span>
									</a>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="px-5 py-4 border-t border-border bg-secondary/20">
							<button
								onClick={() => setIsOpen(false)}
								className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
							>
								Done
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	return (
		<>
			{/* Settings Button */}
			<button
				onClick={() => setIsOpen(true)}
				className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
				aria-label="Settings"
			>
				<SettingsIcon className="w-5 h-5" />
			</button>

			{/* Portal the modal to document body */}
			{mounted && createPortal(modalContent, document.body)}
		</>
	);
}
