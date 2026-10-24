import React from 'react';
import { Play, RotateCcw, BookOpen, Settings, Heart } from 'lucide-react';
import { soundSystem } from '../services/audio';

interface TitleScreenProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  hasSaveGame: boolean;
  highestChapterName: string;
  onOpenScrapbook: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartNewGame,
  onContinueGame,
  hasSaveGame,
  highestChapterName,
  onOpenScrapbook,
  onOpenSettings
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-8 bg-slate-950 select-none overflow-hidden">
      {/* Background ambient stars & pixel grid */}
      <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="scanlines absolute inset-0 z-10 opacity-70 pointer-events-none" />

      {/* Floating retro animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-sky-400 rounded-none animate-pulse"
            style={{
              top: `${(i * 19) % 100}%`,
              left: `${(i * 31) % 100}%`,
              animationDuration: `${2 + (i % 4)}s`
            }}
          />
        ))}
      </div>

      {/* Top Banner / Dedication */}
      <div className="relative z-20 flex items-center gap-2 text-xs font-bangla text-slate-300 tracking-wider mt-2">
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-bounce" />
        <span>ইশতিয়াকের পক্ষ থেকে নাদিয়াকে জন্মদিনের উপহার · ২০২২–২০২৬</span>
      </div>

      {/* Hero Title Lockup */}
      <div className="relative z-20 text-center my-auto flex flex-col items-center">
        <div className="inline-block bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10 border border-slate-700/60 rounded-2xl px-8 py-6 backdrop-blur-md shadow-2xl">
          <span className="font-bangla text-sm text-sky-400 tracking-wider block mb-2 font-bold">
            নাদিয়ার বার্থডে অ্যাডভেঞ্চার
          </span>
          <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)] leading-tight mb-3">
            NADIA'S BIRTHDAY
            <br />
            ADVENTURE
          </h1>
          <p className="font-bangla text-slate-200 text-sm md:text-base max-w-lg mx-auto font-normal">
            ENG101-এর প্রথম পরিচয় থেকে শুরু করে ডেলিভারি মিশন, রিকশার চক্কর, গ্র্যাজুয়েশন এবং জন্মদিনের মিষ্টি স্মৃতি।
          </p>
        </div>

        {/* Menu Buttons Cluster */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 items-center justify-center">
          {hasSaveGame && (
            <button
              onClick={() => {
                soundSystem.playInteract();
                onContinueGame();
              }}
              className="w-56 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bangla text-xs font-bold py-3 px-5 rounded-lg shadow-lg border border-emerald-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>চালিয়ে যাও ({highestChapterName})</span>
            </button>
          )}

          <button
            onClick={() => {
              soundSystem.playInteract();
              onStartNewGame();
            }}
            className="w-56 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bangla text-xs font-bold py-3 px-5 rounded-lg shadow-lg border border-sky-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>নতুন খেলা শুরু</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playInteract();
              onOpenScrapbook();
            }}
            className="w-56 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bangla text-xs font-bold py-3 px-5 rounded-lg shadow border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-pink-400" />
            <span>স্মৃতির স্ক্র্যাপবুক</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playInteract();
              onOpenSettings();
            }}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg shadow border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="সেটিংস"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flat Control Hints Bar */}
      <div className="relative z-20 text-center pb-2">
        <p className="font-bangla text-xs text-slate-400 tracking-wider">
          WASD / অ্যারো কি : হাঁটা বা চালানো &nbsp;·&nbsp; SPACE / ENTER / E : ইন্টারঅ্যাক্ট &nbsp;·&nbsp; ESC : পজ মেনু
        </p>
      </div>
    </div>
  );
};
