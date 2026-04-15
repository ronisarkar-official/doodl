import type { Metadata } from 'next';
import { Nunito, Kalam } from 'next/font/google';
import './globals.css';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar';

const nunito = Nunito({
	variable: '--font-nunito',
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700', '800'],
});

const kalam = Kalam({
	variable: '--font-kalam',
	subsets: ['latin'],
	weight: ['300', '400', '700'],
});

export const viewport = {
	width: 'device-width',
	initialScale: 1,
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
				url: '/opengraph-image.webp',
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
		images: ['/opengraph-image.webp'],
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
				className={`${nunito.variable} ${kalam.variable} font-sans antialiased h-screen w-screen overflow-hidden`}
				style={{ fontFamily: 'var(--font-kalam), sans-serif' }}
				suppressHydrationWarning>
				<GameProvider>
					<Navbar />
					{children}
				</GameProvider>
			</body>
		</html>
	);
}
