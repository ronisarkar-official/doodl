'use client';

import React from 'react';
import {
  AvatarParts,
  EYE_STYLES,
  MOUTH_STYLES,
  HAIR_STYLES,
  ACCESSORIES,
} from '../data/avatarParts';

interface AvatarPreviewProps {
  avatar: AvatarParts;
  size?: number;
  className?: string;
}

export default function AvatarPreview({ avatar, size = 64, className = '' }: AvatarPreviewProps) {
  const eyeStyle = EYE_STYLES[avatar.eyeStyle] || EYE_STYLES[0];
  const mouthStyle = MOUTH_STYLES[avatar.mouthStyle] || MOUTH_STYLES[0];
  const hairStyle = HAIR_STYLES[avatar.hairStyle] || HAIR_STYLES[0];
  const accessory = ACCESSORIES[avatar.accessory] || ACCESSORIES[0];

  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-indigo-50/50 dark:from-white/10 dark:to-white/5" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className="relative z-10 w-full h-full"
        style={{ borderRadius: '50%' }}
      >
        {/* Face */}
        <ellipse cx="16" cy="16" rx="12" ry="14" fill={avatar.skinColor} />
        
        {/* Hair (behind face for some styles) */}
        {hairStyle.path && (
          <path d={hairStyle.path} fill={avatar.hairColor} />
        )}
        
        {/* Eyes */}
        <path d={eyeStyle.path} fill="#333" className="fill-slate-800" />
        
        {/* Mouth */}
        <path d={mouthStyle.path} fill="none" stroke="#333" strokeWidth="1" strokeLinecap="round" className="stroke-slate-800" />
        
        {/* Accessory */}
        {accessory.path && (
          <path
            d={accessory.path}
            fill={accessory.fill || 'none'}
            stroke={accessory.stroke || 'none'}
            strokeWidth={accessory.strokeWidth || 1}
          />
        )}
      </svg>
    </div>
  );
}

// Compact version for player list
export function AvatarMini({ avatar, size = 32 }: { avatar: AvatarParts; size?: number }) {
  return <AvatarPreview avatar={avatar} size={size} />;
}
