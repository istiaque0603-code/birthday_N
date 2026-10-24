import React, { useState } from 'react';
import { X, Lock, Sparkles, Calendar, BookOpen, Quote, Award } from 'lucide-react';
import { INITIAL_MEMORIES } from '../services/storage';
import { soundSystem } from '../services/audio';

interface MemoryScrapbookProps {
  unlockedMemoryIds: string[];
  onClose: () => void;
}

export const MemoryScrapbook: React.FC<MemoryScrapbookProps> = ({
  unlockedMemoryIds,
  onClose
}) => {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>(INITIAL_MEMORIES[0].id);

  const memoriesWithStatus = INITIAL_MEMORIES.map(m => ({
    ...m,
    unlocked: unlockedMemoryIds.includes(m.id)
  }));

  const selectedMemory = memoriesWithStatus.find(m => m.id === selectedMemoryId) || memoriesWithStatus[0];
  const unlockedCount = memoriesWithStatus.filter(m => m.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-hidden">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-pink-400" />
            <div>
              <h2 className="font-bangla text-base md:text-lg font-bold text-amber-300">
                নাদিয়ার বন্ধুত্বের স্মৃতি অ্যালবাম
              </h2>
              <span className="font-bangla text-xs text-slate-400">
                সংগৃহীত স্মৃতি: {unlockedCount} / {INITIAL_MEMORIES.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundSystem.playInteract();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Memory List Grid */}
          <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-800 p-4 overflow-y-auto flex flex-col gap-2.5">
            {memoriesWithStatus.map(mem => (
              <div
                key={mem.id}
                onClick={() => {
                  soundSystem.playInteract();
                  setSelectedMemoryId(mem.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedMemoryId === mem.id
                    ? 'bg-sky-950/60 border-sky-400 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    mem.unlocked
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {mem.unlocked ? <Sparkles className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bangla text-xs text-sky-400 font-bold">
                        {mem.year}
                      </span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="font-bangla text-xs md:text-sm text-slate-200 font-bold truncate max-w-[200px]">
                        {mem.unlocked ? mem.title : 'লক করা স্মৃতি'}
                      </span>
                    </div>
                    <span className="font-bangla text-xs text-slate-400 line-clamp-1">
                      {mem.unlocked ? mem.subtitle : 'আনলক করতে মূল অ্যাডভেঞ্চার খেলুন।'}
                    </span>
                  </div>
                </div>

                {mem.unlocked && (
                  <span className="font-bangla text-[11px] text-emerald-400 border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 rounded font-bold">
                    আনলকড
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Right: Selected Memory Detail & Photo Tribute */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between bg-slate-950/30">
            {selectedMemory.unlocked ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bangla text-amber-400">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedMemory.year} · {selectedMemory.subtitle}</span>
                  </div>
                  <span className="font-bangla text-xs text-emerald-400 font-bold">
                    স্মারক সংগৃহীত
                  </span>
                </div>

                <h3 className="font-bangla text-lg md:text-xl font-bold text-slate-100">
                  {selectedMemory.title}
                </h3>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-inner">
                  <span className="font-bangla text-xs text-sky-400 font-bold block mb-1">
                    বিশেষ স্মারক:
                  </span>
                  <div className="flex items-center gap-2 text-slate-200 font-bangla text-sm font-bold">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{selectedMemory.keepsakeName}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-bangla text-slate-300 text-sm leading-relaxed">
                    {selectedMemory.description}
                  </p>

                  <div className="bg-slate-950/70 border-l-4 border-amber-400 p-3 rounded-r-lg">
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="font-bangla text-xs md:text-sm text-amber-200 italic">
                        {selectedMemory.quote}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nadia's Portrait Tribute Card */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
                  <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-amber-400/60 shadow-lg shrink-0 bg-slate-950">
                    <img
                      src="/assets/aistudio/WhatsApp_Image_2026-10-24_at_10.50.27_PM_4fc5c0ab.jpeg"
                      alt="Nadia"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-bangla text-sm text-amber-300 font-bold block mb-0.5">
                      নাদিয়া · বার্থডে গার্ল
                    </span>
                    <p className="font-bangla text-xs text-slate-300 leading-relaxed">
                      ENG101-এর প্রথম পরিচয় থেকে আজকের গর্বিত রিসার্চ অ্যাসিস্ট্যান্ট। সর্বদা মার্জিত, বুদ্ধিমান এবং রোমাঞ্চে ভরা এক দারুণ বন্ধু!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Lock className="w-12 h-12 mb-3 stroke-1 text-slate-600" />
                <h4 className="font-bangla text-sm text-slate-400 mb-1 font-bold">স্মৃতি লক করা</h4>
                <p className="font-bangla text-xs max-w-xs">
                  {selectedMemory.year} সালের এই মধুর স্মৃতি আনলক করতে মূল গেমটি খেলুন!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
