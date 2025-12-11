'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Github, HelpCircle, Home, Menu, X } from 'lucide-react';
import Settings from './Settings';

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	const isGamePage = pathname === '/game' || pathname?.startsWith('/game/');

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	const navItems = [
		{ name: 'Home', href: '/', icon: Home },
		{ name: 'How to Play', href: '/#how-to-play', icon: HelpCircle },
		{
			name: 'Source Code',
			href: 'https://github.com',
			icon: Github,
			external: true,
		},
	];

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					isGamePage
						? 'bg-transparent pointer-events-none hidden'
						: 'glass border-b border-border/50'
				}`}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-14 sm:h-16">
						{/* Logo */}
						<Link
							href="/"
							className={`flex items-center gap-2 sm:gap-2.5 pointer-events-auto ${
								isGamePage ? 'opacity-0 pointer-events-none' : 'opacity-100'
							}`}>
						<Image
							src="/images/logo.png"
							alt="doodl"
							width={100}
							height={100}
							className="drop-shadow-lg"
						/>
						</Link>

						{/* Desktop Nav */}
						<div
							className={`hidden md:flex items-center gap-6 pointer-events-auto ${
								isGamePage ? 'opacity-0 pointer-events-none' : 'opacity-100'
							}`}>
							{navItems.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									target={item.external ? '_blank' : undefined}
									className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors group text-sm">
									<item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
									{item.name}
								</Link>
							))}
							
							{/* Settings Button */}
							<div className="pl-2 border-l border-border/50">
								<Settings />
							</div>
						</div>

						{/* Mobile Menu Button */}
						<div
							className={`md:hidden flex items-center gap-1.5 sm:gap-2 pointer-events-auto ${
								isGamePage ? 'opacity-0 pointer-events-none' : 'opacity-100'
							}`}>
							<Settings />
							<button
								onClick={() => setIsOpen(!isOpen)}
								aria-label={isOpen ? 'Close menu' : 'Open menu'}
								aria-expanded={isOpen}
								className="p-2.5 sm:p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors">
								<motion.div
									animate={{ rotate: isOpen ? 90 : 0 }}
									transition={{ duration: 0.2 }}>
									{isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
								</motion.div>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile Nav Overlay & Menu */}
			<AnimatePresence>
				{isOpen && !isGamePage && (
					<>
						{/* Backdrop overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => setIsOpen(false)}
							className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm pointer-events-auto"
						/>
						
						{/* Mobile menu panel */}
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2, ease: 'easeOut' }}
							className="md:hidden fixed top-14 sm:top-16 left-0 right-0 z-50 glass border-b border-border/50 pointer-events-auto shadow-xl">
							<div className="px-4 py-3 space-y-1">
								{navItems.map((item, index) => (
									<motion.div
										key={item.name}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05, duration: 0.2 }}>
										<Link
											href={item.href}
											target={item.external ? '_blank' : undefined}
											onClick={() => setIsOpen(false)}
											className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-muted-foreground hover:bg-secondary/80 hover:text-foreground active:bg-secondary font-medium transition-colors">
											<item.icon className="w-5 h-5" />
											<span className="text-base">{item.name}</span>
										</Link>
									</motion.div>
								))}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
