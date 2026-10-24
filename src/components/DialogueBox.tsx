import React, { useEffect, useState, useRef } from 'react';
import { DialogueLine } from '../types/game';
import { getSpeakerPortraitCanvas } from '../game/sprites';
import { soundSystem } from '../services/audio';

interface DialogueBoxProps {
  dialogues: DialogueLine[];
  onComplete: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogues,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const portraitContainerRef = useRef<HTMLDivElement | null>(null);

  const currentLine = dialogues[currentIndex];

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText('');
    setIsTyping(true);

    let charIdx = 0;
    const fullText = currentLine.text;

    const interval = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));

      // Play soft speech blip
      if (charIdx % 3 === 0) {
        const pitch = currentLine.speaker === 'nadia' ? 520 :
                      currentLine.speaker === 'piona' ? 620 :
                      currentLine.speaker === 'mother' ? 440 : 380;
        soundSystem.playBlip(pitch);
      }

      if (charIdx >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [currentIndex, currentLine]);

  // Update portrait canvas
  useEffect(() => {
    if (!currentLine || !portraitContainerRef.current) return;
    const canvas = getSpeakerPortraitCanvas(currentLine.speaker, currentLine.emotion);
    portraitContainerRef.current.innerHTML = '';
    canvas.className = 'w-20 h-20 pixelated rounded-lg shadow-inner';
    portraitContainerRef.current.appendChild(canvas);
  }, [currentLine]);

  const handleAdvance = () => {
    if (isTyping) {
      // Instant reveal
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }

    if (currentLine.choices && currentLine.choices.length > 0) {
      // Must pick a choice
      return;
    }

    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      currentLine.onComplete?.();
      onComplete();
    }
  };

  const handleChoiceSelect = (choiceIdx: number) => {
    soundSystem.playInteract();
    const choice = currentLine.choices?.[choiceIdx];
    if (choice?.nextDialogueIndex !== undefined) {
      setCurrentIndex(choice.nextDialogueIndex);
    } else if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      currentLine.onComplete?.();
      onComplete();
    }
  };

  const EMOTION_MAP: Record<string, string> = {
    happy: 'আনন্দিত',
    neutral: 'স্বাভাবিক',
    thinking: 'ভাবুক',
    panicking: 'আতঙ্কিত',
    laughing: 'হাসিখুশি',
    calm: 'শান্ত',
    scolding: 'রাগান্বিত'
  };

  const emotionBangla = EMOTION_MAP[currentLine.emotion] || currentLine.emotion;

  return (
    <div
      onClick={handleAdvance}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-30 select-none cursor-pointer"
    >
      <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-sm flex gap-4 items-start relative">
        {/* Speaker Portrait Frame */}
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          <div
            ref={portraitContainerRef}
            className="w-20 h-20 bg-slate-950 border border-slate-700 rounded-lg overflow-hidden flex items-center justify-center shadow-md"
          />
          <span className="font-bangla text-[11px] text-sky-400 font-semibold tracking-wide">
            {emotionBangla}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col justify-between min-h-[5.5rem]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-bangla text-base text-amber-300 font-bold">
                {currentLine.speakerName}
              </span>
            </div>
            <p className="font-bangla text-slate-100 text-sm md:text-base leading-relaxed font-normal">
              {displayedText}
            </p>
          </div>

          {/* Dialogue Choices if any */}
          {currentLine.choices && currentLine.choices.length > 0 && !isTyping && (
            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              {currentLine.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoiceSelect(i);
                  }}
                  className="bg-slate-800 hover:bg-sky-600 text-sky-200 hover:text-white border border-sky-500/40 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium font-bangla transition-colors shadow"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}

          {/* Advance Prompt Hint */}
          {!currentLine.choices && (
            <div className="self-end mt-1 text-xs font-bangla text-slate-400 animate-pulse flex items-center gap-1">
              <span>{currentIndex < dialogues.length - 1 ? 'এগিয়ে যেতে ট্যাপ বা SPACE চাপুন ▶' : 'শেষ করতে ট্যাপ বা SPACE চাপুন ▶'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
