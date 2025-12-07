// Avatar parts for the custom avatar builder

export interface AvatarParts {
  skinColor: string;
  eyeStyle: number;
  mouthStyle: number;
  hairStyle: number;
  hairColor: string;
  accessory: number;
}

export const SKIN_COLORS = [
  '#FFDBB4', // Light
  '#EDB98A', // Medium Light
  '#D08B5B', // Medium
  '#AE5D29', // Medium Dark
  '#614335', // Dark
  '#3B2219', // Very Dark
];

export const HAIR_COLORS = [
  '#090806', // Black
  '#2C222B', // Dark Brown
  '#71635A', // Brown
  '#B7A69E', // Light Brown
  '#D6C4C2', // Blonde
  '#CABFB1', // Platinum
  '#B55239', // Auburn
  '#8D4A43', // Red
  '#E0E0E0', // Gray
  '#6B5B95', // Purple
  '#88B04B', // Green
  '#45B8AC', // Teal
];

// Eye styles - index corresponds to the style
export const EYE_STYLES = [
  { name: 'Normal', path: 'M8,12 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 M20,12 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0' },
  { name: 'Happy', path: 'M8,14 Q10,10 12,14 M20,14 Q22,10 24,14' },
  { name: 'Sleepy', path: 'M8,12 L12,14 M20,12 L24,14' },
  { name: 'Wink', path: 'M8,12 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0 M20,14 L24,14' },
  { name: 'Stars', path: 'M10,12 l1,-2 1,2 2,0 -1.5,1.5 0.5,2 -2,-1 -2,1 0.5,-2 -1.5,-1.5z M22,12 l1,-2 1,2 2,0 -1.5,1.5 0.5,2 -2,-1 -2,1 0.5,-2 -1.5,-1.5z' },
  { name: 'Hearts', path: 'M10,11 c-1,-2 -4,-2 -4,1 c0,2 4,4 4,4 c0,0 4,-2 4,-4 c0,-3 -3,-3 -4,-1z M22,11 c-1,-2 -4,-2 -4,1 c0,2 4,4 4,4 c0,0 4,-2 4,-4 c0,-3 -3,-3 -4,-1z' },
];

// Mouth styles
export const MOUTH_STYLES = [
  { name: 'Smile', path: 'M12,22 Q16,26 20,22' },
  { name: 'Grin', path: 'M11,22 Q16,28 21,22 L11,22' },
  { name: 'Open', path: 'M12,22 a4,3 0 0,0 8,0 a4,2 0 0,0 -8,0' },
  { name: 'Flat', path: 'M12,23 L20,23' },
  { name: 'Smirk', path: 'M12,23 Q16,23 20,21' },
  { name: 'Tongue', path: 'M12,22 Q16,26 20,22 M15,24 a2,3 0 0,0 2,4' },
];

// Hair styles - SVG paths for different hairstyles
export const HAIR_STYLES = [
  { name: 'None', path: '' },
  { name: 'Short', path: 'M8,8 Q16,2 24,8 L24,6 Q16,0 8,6 Z' },
  { name: 'Spiky', path: 'M8,8 L6,2 L10,6 L12,0 L14,6 L16,1 L18,6 L20,0 L22,6 L26,2 L24,8 Q16,4 8,8 Z' },
  { name: 'Long', path: 'M6,8 Q16,0 26,8 L26,28 Q24,26 24,20 L24,10 Q16,4 8,10 L8,20 Q8,26 6,28 Z' },
  { name: 'Curly', path: 'M6,10 Q4,6 8,4 Q10,2 14,4 Q16,2 18,4 Q22,2 24,4 Q28,6 26,10 Q28,12 26,14 Q26,10 24,8 Q16,4 8,8 Q6,10 6,14 Q4,12 6,10 Z' },
  { name: 'Mohawk', path: 'M14,8 L14,0 Q16,-2 18,0 L18,8 Q16,6 14,8 Z' },
  { name: 'Ponytail', path: 'M8,8 Q16,2 24,8 L24,6 Q16,0 8,6 Z M24,8 Q28,10 28,16 Q30,20 26,22' },
];

// Accessories
export const ACCESSORIES = [
  { name: 'None', path: '' },
  { name: 'Glasses', path: 'M6,12 L10,12 a3,3 0 1,0 6,0 L16,12 M16,12 L18,12 a3,3 0 1,0 6,0 L28,12', fill: 'none', stroke: '#333' },
  { name: 'Sunglasses', path: 'M6,11 L10,11 Q10,8 13,8 L13,11 Q10,14 10,17 L6,17 Z M18,11 L22,11 Q22,8 25,8 L25,11 Q22,14 22,17 L18,17 Z M13,12 L18,12', fill: '#333' },
  { name: 'Hat', path: 'M4,8 L28,8 L26,6 Q16,4 6,6 Z M6,8 L6,10 L26,10 L26,8', fill: '#2563eb' },
  { name: 'Crown', path: 'M8,10 L8,4 L12,7 L16,2 L20,7 L24,4 L24,10 Z', fill: '#fbbf24' },
  { name: 'Headphones', path: 'M6,14 Q4,8 16,6 Q28,8 26,14 M6,12 a3,4 0 0,0 0,6 M26,12 a3,4 0 0,1 0,6', fill: 'none', stroke: '#666', strokeWidth: 3 },
  { name: 'Bow', path: 'M22,6 Q26,4 28,6 Q26,8 22,6 M22,6 Q18,4 16,6 Q18,8 22,6 M21,5 L23,7', fill: '#ec4899' },
];

export const DEFAULT_AVATAR: AvatarParts = {
  skinColor: SKIN_COLORS[0],
  eyeStyle: 0,
  mouthStyle: 0,
  hairStyle: 1,
  hairColor: HAIR_COLORS[0],
  accessory: 0,
};

export function getRandomAvatar(): AvatarParts {
  return {
    skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
    eyeStyle: Math.floor(Math.random() * EYE_STYLES.length),
    mouthStyle: Math.floor(Math.random() * MOUTH_STYLES.length),
    hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
    hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    accessory: Math.floor(Math.random() * ACCESSORIES.length),
  };
}

// Generate a simple hash from avatar parts for caching
export function avatarToString(avatar: AvatarParts): string {
  return `${avatar.skinColor}-${avatar.eyeStyle}-${avatar.mouthStyle}-${avatar.hairStyle}-${avatar.hairColor}-${avatar.accessory}`;
}
