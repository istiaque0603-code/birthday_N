import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface VirtualGamepadProps {
  onDirectionChange: (dir: 'up' | 'down' | 'left' | 'right', active: boolean) => void;
  onActionTrigger: () => void;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({
  onDirectionChange,
  onActionTrigger
}) => {
  const handleTouchStart = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDirectionChange(dir, true);
  };

  const handleTouchEnd = (dir: 'up' | 'down' | 'left' | 'right') => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDirectionChange(dir, false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between items-end p-6 md:hidden">
      {/* 4-Way Directional Pad */}
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1 w-36 h-36 bg-slate-900/60 p-2 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div />
        <button
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleTouchEnd('up')}
          onMouseDown={handleTouchStart('up')}
          onMouseUp={handleTouchEnd('up')}
          className="bg-slate-800/80 active:bg-sky-500 rounded-lg flex items-center justify-center text-slate-200 active:text-white border border-slate-600/60"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <div />

        <button
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onMouseDown={handleTouchStart('left')}
          onMouseUp={handleTouchEnd('left')}
          className="bg-slate-800/80 active:bg-sky-500 rounded-lg flex items-center justify-center text-slate-200 active:text-white border border-slate-600/60"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="bg-slate-950/60 rounded-md flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
        </div>
        <button
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onMouseDown={handleTouchStart('right')}
          onMouseUp={handleTouchEnd('right')}
          className="bg-slate-800/80 active:bg-sky-500 rounded-lg flex items-center justify-center text-slate-200 active:text-white border border-slate-600/60"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div />
        <button
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleTouchEnd('down')}
          onMouseDown={handleTouchStart('down')}
          onMouseUp={handleTouchEnd('down')}
          className="bg-slate-800/80 active:bg-sky-500 rounded-lg flex items-center justify-center text-slate-200 active:text-white border border-slate-600/60"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div />
      </div>

      {/* Action / Interact Button */}
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onActionTrigger();
          }}
          onClick={onActionTrigger}
          className="w-20 h-20 bg-amber-500/90 active:bg-amber-400 rounded-full border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-slate-950 font-bangla text-xs font-bold active:scale-95 transition-transform"
        >
          <Sparkles className="w-5 h-5 fill-slate-950 mb-0.5" />
          <span>অ্যাকশন</span>
        </button>
      </div>
    </div>
  );
};
