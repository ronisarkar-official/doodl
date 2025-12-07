'use client';

import React, { useState } from 'react';
import { Shuffle, Palette, User, Eye, Smile, Sparkles } from 'lucide-react';
import AvatarPreview from './AvatarPreview';
import {
  AvatarParts,
  SKIN_COLORS,
  HAIR_COLORS,
  EYE_STYLES,
  MOUTH_STYLES,
  HAIR_STYLES,
  ACCESSORIES,
  getRandomAvatar,
} from '../data/avatarParts';

interface AvatarBuilderProps {
  value: AvatarParts;
  onChange: (avatar: AvatarParts) => void;
  compact?: boolean;
}

export default function AvatarBuilder({ value, onChange, compact = false }: AvatarBuilderProps) {
  const [activeTab, setActiveTab] = useState<'skin' | 'eyes' | 'mouth' | 'hair' | 'accessory'>('skin');

  const handleRandomize = () => {
    onChange(getRandomAvatar());
  };

  const tabs = [
    { id: 'skin', label: 'Skin', icon: Palette },
    { id: 'hair', label: 'Hair', icon: User },
    { id: 'eyes', label: 'Eyes', icon: Eye },
    { id: 'mouth', label: 'Mouth', icon: Smile },
    { id: 'accessory', label: 'Acc.', icon: Sparkles },
  ] as const;

  return (
    <div className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header Area */}
      <div className="flex items-center gap-5 mb-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          <AvatarPreview avatar={value} size={compact ? 72 : 96} className="relative shadow-lg ring-4 ring-white/10" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1">Your Avatar</h3>
          <p className="text-sm text-white/50 mb-3 truncate">Customize your unique look</p>
          
          <button
            onClick={handleRandomize}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-lg text-xs font-medium text-white/80 hover:text-white transition-all group"
          >
            <Shuffle className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            Randomize
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 mb-5 bg-black/20 rounded-xl overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
              {!compact && <span>{tab.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[180px] animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'skin' && (
          <div className="space-y-3">
             <div className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Skin Tone</div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
              {SKIN_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onChange({ ...value, skinColor: color })}
                  className={`group relative w-full aspect-square rounded-full transition-all hover:scale-110 focus:outline-none ${
                    value.skinColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110' : ''
                  }`}
                  title={color}
                >
                  <span className="absolute inset-0 rounded-full shadow-inner" style={{ backgroundColor: color }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'eyes' && (
          <div className="grid grid-cols-3 gap-2">
            {EYE_STYLES.map((style, i) => (
              <button
                key={i}
                onClick={() => onChange({ ...value, eyeStyle: i })}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  value.eyeStyle === i
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow">👀</span>
                <span className="text-[10px] font-medium opacity-80">{style.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'mouth' && (
          <div className="grid grid-cols-3 gap-2">
            {MOUTH_STYLES.map((style, i) => (
              <button
                key={i}
                onClick={() => onChange({ ...value, mouthStyle: i })}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  value.mouthStyle === i
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow">👄</span>
                <span className="text-[10px] font-medium opacity-80">{style.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'hair' && (
          <div className="space-y-5">
            <div className="space-y-2">
               <div className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Style</div>
              <div className="grid grid-cols-4 gap-2">
                {HAIR_STYLES.map((style, i) => (
                  <button
                    key={i}
                    onClick={() => onChange({ ...value, hairStyle: i })}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                      value.hairStyle === i
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
               <div className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Color</div>
              <div className="grid grid-cols-8 gap-2">
                {HAIR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange({ ...value, hairColor: color })}
                    className={`w-full aspect-square rounded-full transition-all hover:scale-110 ${
                      value.hairColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accessory' && (
          <div className="grid grid-cols-4 gap-2">
            {ACCESSORIES.map((acc, i) => (
              <button
                key={i}
                onClick={() => onChange({ ...value, accessory: i })}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  value.accessory === i
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <span className="text-[10px] font-medium opacity-80 text-center leading-tight">{acc.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
