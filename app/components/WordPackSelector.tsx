'use client';

import React from 'react';
import { WORD_PACKS } from '../data/wordPacks';

interface WordPackSelectorProps {
  selectedPacks: string[];
  onPacksChange: (packs: string[]) => void;
  customWords: string;
  onCustomWordsChange: (words: string) => void;
  disabled?: boolean;
}

export default function WordPackSelector({
  selectedPacks,
  onPacksChange,
  customWords,
  onCustomWordsChange,
  disabled = false,
}: WordPackSelectorProps) {
  const togglePack = (packId: string) => {
    if (disabled) return;
    
    if (selectedPacks.includes(packId)) {
      onPacksChange(selectedPacks.filter(id => id !== packId));
    } else {
      onPacksChange([...selectedPacks, packId]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    onPacksChange(WORD_PACKS.map(p => p.id));
  };

  const selectNone = () => {
    if (disabled) return;
    onPacksChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Word Packs</h3>
          <p className="text-xs text-muted-foreground">Choose categories for the game</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            All
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            type="button"
            onClick={selectNone}
            disabled={disabled}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            None
          </button>
        </div>
      </div>

      {/* Pack Grid */}
      <div className="grid grid-cols-3 gap-2">
        {WORD_PACKS.map((pack) => {
          const isSelected = selectedPacks.includes(pack.id);
          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => togglePack(pack.id)}
              disabled={disabled}
              className={`p-2 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'bg-secondary/30 border-border hover:bg-secondary/50 text-muted-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{pack.emoji}</span>
                <div>
                  <div className="text-xs font-medium">{pack.name}</div>
                  <div className="text-[10px] opacity-60">{pack.words.length} words</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Words */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Custom Words (one per line)
        </label>
        <textarea
          value={customWords}
          onChange={(e) => onCustomWordsChange(e.target.value)}
          disabled={disabled}
          placeholder="Add your own words here..."
          className="w-full h-20 px-3 py-2 text-sm bg-secondary/30 border border-border rounded-lg placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none disabled:opacity-50"
        />
        {customWords.trim() && (
          <p className="text-[10px] text-muted-foreground mt-1">
            +{customWords.split('\n').filter(w => w.trim()).length} custom words
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="text-xs text-muted-foreground bg-secondary/20 p-2 rounded">
        Total words: {
          selectedPacks.reduce((acc, id) => {
            const pack = WORD_PACKS.find(p => p.id === id);
            return acc + (pack?.words.length || 0);
          }, 0) + customWords.split('\n').filter(w => w.trim()).length
        }
      </div>
    </div>
  );
}
