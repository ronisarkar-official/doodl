import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { GameProvider } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: '#0f172a',
};

export const metadata: Metadata = {
	metadataBase: new URL('https://doodl.onrender.com'), // Replace with actual domain
	title: {
		default: 'Doodl - Multiplayer Draw & Guess Game',
		template: '%s ',
	},
	description:
		'Join the fun! Sketch your masterpieces and guess what others are drawing in real-time. The most aesthetic drawing game on the web.',
	keywords: [
		'drawing game',
		'pictionary',
		'multiplayer',
		'online game',
		'sketch',
		'doodle',
		'guess',
		'party game',
		'browser game',
	],
	authors: [{ name: 'doodl Team' }],
	creator: 'doodl Team',
	publisher: 'doodl',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://doodl.onrender.com',
		title: 'doodl - Multiplayer Draw & Guess Game',
		description:
			'Join the fun! Sketch your masterpieces and guess what others are drawing in real-time.',
		siteName: 'doodl',
		images: [
			{
				url: '/opengraph-image.png',
				width: 1200,
				height: 630,
				alt: 'doodl - Draw & Guess Game',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'doodl - Multiplayer Draw & Guess Game',
		description:
			'Join the fun! Sketch your masterpieces and guess what others are drawing in real-time.',
		images: ['/opengraph-image.png'],
		creator: '@doodlgame',
	},
	icons: {
		icon: '/icon.png',
		apple: '/apple-icon.png',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className="dark"
			suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden`}
				suppressHydrationWarning>
				<ThemeProvider>
					<GameProvider>
						<Navbar />
						{children}
					</GameProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
