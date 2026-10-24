import React from 'react';
import { Play, RotateCcw, BookOpen, Volume2, VolumeX, Home } from 'lucide-react';
import { soundSystem } from '../services/audio';

interface PauseMenuProps {
  onResume: () => void;
  onRestartChapter: () => void;
  onOpenScrapbook: () => void;
  onQuitToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestartChapter,
  onOpenScrapbook,
  onQuitToTitle,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center">
        <h2 className="font-bangla text-xl font-bold text-amber-400 mb-6">খেলা সাময়িক স্থগিত</h2>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              soundSystem.playInteract();
              onResume();
            }}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bangla text-sm font-bold py-3 px-4 rounded-lg shadow border border-sky-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>খেলা চালিয়ে যাও</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playInteract();
              onRestartChapter();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bangla text-sm font-bold py-3 px-4 rounded-lg shadow border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>অধ্যায়টি আবার খেলো</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playInteract();
              onOpenScrapbook();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bangla text-sm font-bold py-3 px-4 rounded-lg shadow border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-pink-400" />
            <span>স্মৃতির স্ক্র্যাপবুক</span>
          </button>

          <button
            onClick={() => {
              onToggleMute();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bangla text-sm font-bold py-3 px-4 rounded-lg shadow border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'সাউন্ড: বন্ধ' : 'সাউন্ড: চালু'}</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playInteract();
              onQuitToTitle();
            }}
            className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bangla text-sm font-bold py-3 px-4 rounded-lg shadow border border-rose-800/60 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            <Home className="w-4 h-4" />
            <span>মূল মেনু</span>
          </button>
        </div>
      </div>
    </div>
  );
};
