const adjectives = [
	'Cosmic',
	'Galactic',
	'Nebula',
	'Star',
	'Space',
	'Moon',
	'Solar',
	'Alien',
	'Rocket',
	'Meteor',
	'Comet',
	'Orbit',
	'Lunar',
	'Stellar',
	'Astro',
	'Happy',
	'Brave',
	'Clever',
	'Swift',
	'Bright',
];

const nouns = [
	'Cadet',
	'Surfer',
	'Walker',
	'Ranger',
	'Pilot',
	'Explorer',
	'Traveler',
	'Ninja',
	'Pirate',
	'Captain',
	'Guardian',
	'Drifter',
	'Voyager',
	'Nomad',
	'Jumper',
	'Goat',
	'Panda',
	'Eagle',
	'Tiger',
	'Falcon',
];

export const generateFunnyName = () => {
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	return `${adj} ${noun} ${Math.floor(Math.random() * 100)}`;
};
