import React from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { INITIAL_MEMORIES } from '../services/storage';
import { ChapterId } from '../types/game';
import { soundSystem } from '../services/audio';

interface ChapterCompleteModalProps {
  completedChapterId: ChapterId;
  memoryId: string;
  onNextChapter: () => void;
  onOpenScrapbook: () => void;
}

export const ChapterCompleteModal: React.FC<ChapterCompleteModalProps> = ({
  completedChapterId,
  memoryId,
  onNextChapter,
  onOpenScrapbook
}) => {
  const memory = INITIAL_MEMORIES.find(m => m.id === memoryId);
  const isFinalChapter = completedChapterId === 'CH8_BIRTHDAY_FINALE';

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Confetti badge */}
        <div className="w-14 h-14 bg-amber-500/20 border-2 border-amber-400 rounded-full flex items-center justify-center text-amber-300 mb-4 animate-bounce">
          <Sparkles className="w-7 h-7" />
        </div>

        <span className="font-bangla text-sm text-amber-400 font-bold mb-1">
          {isFinalChapter ? 'অ্যাডভেঞ্চার সফলভাবে সম্পন্ন!' : 'অধ্যায় সম্পন্ন!'}
        </span>
        <h2 className="font-bangla text-2xl font-bold text-slate-100 mb-3">
          {memory ? memory.title : 'স্মৃতি আনলকড'}
        </h2>

        {memory && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 w-full mb-6 text-left">
            <span className="font-bangla text-xs text-sky-400 font-bold block mb-1">
              স্ক্র্যাপবুকে যুক্ত হওয়া স্মারক:
            </span>
            <span className="font-bangla text-sm font-bold text-amber-300 block mb-2">
              ★ {memory.keepsakeName}
            </span>
            <p className="font-bangla text-xs text-slate-300 leading-relaxed italic">
              {memory.quote}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => {
              soundSystem.playInteract();
              onNextChapter();
            }}
            className="flex-1 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bangla text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg border border-sky-400 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>{isFinalChapter ? 'পুনরায় উদযাপন' : 'পরবর্তী অধ্যায়'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundSystem.playInteract();
              onOpenScrapbook();
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bangla text-sm font-bold py-3.5 px-4 rounded-xl shadow border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <BookOpen className="w-4 h-4 text-pink-400" />
            <span>স্ক্র্যাপবুক</span>
          </button>
        </div>
      </div>
    </div>
  );
};
