import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sparkles, Calendar } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundSystem } from '../services/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  onResetProgress
}) => {
  const [current, setCurrent] = useState<GameSettings>({ ...settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleMute = () => {
    const nextMuted = !current.musicMuted;
    const updated = { ...current, musicMuted: nextMuted, sfxMuted: nextMuted };
    setCurrent(updated);
    soundSystem.setMuted(nextMuted);
    onSave(updated);
  };

  const handleVolumeChange = (val: number) => {
    const updated = { ...current, musicVolume: val, sfxVolume: val };
    setCurrent(updated);
    soundSystem.setMusicVolume(val);
    soundSystem.setSfxVolume(val);
    onSave(updated);
  };

  const handleScanlineToggle = () => {
    const updated = { ...current, scanlines: !current.scanlines };
    setCurrent(updated);
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h2 className="font-bangla text-base md:text-lg font-bold text-amber-400">সেটিংস ও নিয়ন্ত্রণ</h2>
          <button
            onClick={() => {
              soundSystem.playInteract();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Audio volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bangla text-xs text-slate-200 font-bold">শব্দের ভলিউম</span>
              <button
                onClick={handleToggleMute}
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-bangla cursor-pointer"
              >
                {current.musicMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                <span>{current.musicMuted ? 'নিঃশব্দ (Muted)' : 'চালু (Active)'}</span>
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={current.musicMuted ? 0 : current.musicVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              disabled={current.musicMuted}
              className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Retro Scanlines Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
            <div>
              <span className="font-bangla text-xs text-slate-200 font-bold block">রেট্রো সিআরটি স্ক্যানলাইন</span>
              <span className="font-bangla text-[11px] text-slate-400">আর্কেড গেমের মতো ভিন্টেজ এফেক্ট</span>
            </div>
            <button
              onClick={handleScanlineToggle}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                current.scanlines ? 'bg-sky-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                current.scanlines ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Birthday Date Configuration */}
          <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
            <div>
              <span className="font-bangla text-xs text-slate-200 font-bold block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>জন্মদিনের তারিখ</span>
              </span>
              <span className="font-bangla text-[11px] text-slate-400">নাদিয়ার বিশেষ দিন</span>
            </div>
            <span className="font-bangla text-xs text-amber-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-bold">
              {current.birthdayDate || '১৮ নভেম্বর'}
            </span>
          </div>

          {/* Reset progress */}
          <div className="pt-4 border-t border-slate-800/80">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bangla font-bold transition-colors cursor-pointer"
              >
                অ্যাডভেঞ্চারের অগ্রগতি রিসেট করুন
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bangla font-bold cursor-pointer"
                >
                  হ্যাঁ, রিসেট করুন
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bangla cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
