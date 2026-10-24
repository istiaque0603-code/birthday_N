import React from 'react';
import { Volume2, VolumeX, Pause, BookOpen } from 'lucide-react';
import { CHAPTER_CONFIGS } from '../game/scenes';
import { ChapterId } from '../types/game';

interface GameHUDProps {
  currentChapterId: ChapterId;
  objective: string;
  moneyLeft: number | null;
  unlockedMemoriesCount: number;
  totalMemoriesCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenScrapbook: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentChapterId,
  objective,
  moneyLeft,
  unlockedMemoriesCount,
  totalMemoriesCount,
  isMuted,
  onToggleMute,
  onPause,
  onOpenScrapbook
}) => {
  const config = CHAPTER_CONFIGS[currentChapterId];

  return (
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex items-start justify-between z-20 select-none">
      {/* Left cluster: Chapter info & objective */}
      <div className="flex flex-col gap-1.5 max-w-md pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg">
          <span className="font-screen text-amber-400 text-xs font-bold uppercase tracking-wider">
            {config.year}
          </span>
          <span className="text-slate-500 text-xs">/</span>
          <span className="font-pixel text-[11px] text-slate-100 font-semibold truncate">
            {config.title}
          </span>
        </div>

        {objective && (
          <div className="bg-slate-950/85 border border-sky-500/40 px-3 py-1.5 rounded-md shadow flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
            <span className="font-sans-clean text-xs text-sky-200 font-medium truncate">
              {objective}
            </span>
          </div>
        )}
      </div>

      {/* Right cluster: Money, Memories, and Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {moneyLeft !== null && (
          <div className="bg-slate-900/90 border border-amber-500/60 px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5">
            <span className="font-bangla text-xs text-amber-400 font-bold">টাকা:</span>
            <span className="font-bangla text-xs font-bold text-amber-300 tabular-nums">
              ৳{moneyLeft}
            </span>
          </div>
        )}

        <button
          onClick={onOpenScrapbook}
          title="স্মৃতির স্ক্র্যাপবুক খুলুন"
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg shadow flex items-center gap-2 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-pink-400" />
          <span className="font-screen text-[11px] font-bold text-pink-300 tabular-nums">
            {unlockedMemoriesCount}/{totalMemoriesCount}
          </span>
        </button>

        <button
          onClick={onToggleMute}
          title={isMuted ? 'শব্দ চালু করুন' : 'শব্দ বন্ধ করুন'}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 p-2 rounded-lg shadow transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onPause}
          title="পজ মেনু"
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 p-2 rounded-lg shadow transition-colors cursor-pointer"
        >
          <Pause className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
