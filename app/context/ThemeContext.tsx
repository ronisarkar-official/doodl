'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
	if (typeof window !== 'undefined') {
		const savedTheme = localStorage.getItem('theme') as Theme;
		if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
			return savedTheme;
		}
	}
	return 'dark';
};

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);
	const [mounted, setMounted] = useState(false);

	// Set mounted on client
	useEffect(() => {
		setMounted(true);
	}, []);

	// Apply theme class to document
	useEffect(() => {
		if (!mounted) return;
		
		const root = document.documentElement;
		root.classList.remove('dark', 'light');
		root.classList.add(theme);
		localStorage.setItem('theme', theme);
	}, [theme, mounted]);

	const toggleTheme = () => {
		setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
	};

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	// Prevent flash of wrong theme
	if (!mounted) {
		return null;
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
