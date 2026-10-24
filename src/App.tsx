/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChapterId,
  DialogueLine,
  GameState,
  GameSettings
} from './types/game';
import {
  CHAPTER_SEQUENCE,
  loadGameSave,
  saveGameProgress,
  resetGameSave,
  loadGameSettings,
  saveGameSettings,
  INITIAL_MEMORIES
} from './services/storage';
import { CHAPTER_CONFIGS } from './game/scenes';
import { soundSystem } from './services/audio';

import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { DialogueBox } from './components/DialogueBox';
import { TitleScreen } from './components/TitleScreen';
import { PauseMenu } from './components/PauseMenu';
import { MemoryScrapbook } from './components/MemoryScrapbook';
import { SettingsModal } from './components/SettingsModal';
import { ChapterCompleteModal } from './components/ChapterCompleteModal';
import { VirtualGamepad } from './components/VirtualGamepad';
import { OrientationNotice } from './components/OrientationNotice';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [currentChapterId, setCurrentChapterId] = useState<ChapterId>('CH1_ENG101_2022');
  const [unlockedMemories, setUnlockedMemories] = useState<string[]>([]);
  const [highestChapterIndex, setHighestChapterIndex] = useState<number>(0);
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings());

  // HUD & Narrative State
  const [currentObjective, setCurrentObjective] = useState<string>('');
  const [moneyLeft, setMoneyLeft] = useState<number | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [dialogueOnFinish, setDialogueOnFinish] = useState<(() => void) | null>(null);

  // Chapter completion modal
  const [completedInfo, setCompletedInfo] = useState<{ chapterId: ChapterId; memoryId: string } | null>(null);

  // Virtual touch gamepad state
  const [virtualInput, setVirtualInput] = useState<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    action: boolean;
  }>({
    up: false,
    down: false,
    left: false,
    right: false,
    action: false
  });

  // Load initial progress on mount
  useEffect(() => {
    const save = loadGameSave();
    setCurrentChapterId(save.currentChapterId);
    setUnlockedMemories(save.unlockedMemories);
    setHighestChapterIndex(save.highestChapterIndex);
  }, []);

  // Title music
  useEffect(() => {
    if (gameState === 'TITLE_MENU') {
      soundSystem.playTheme('title');
    }
  }, [gameState]);

  // Start new game
  const handleStartNewGame = useCallback(() => {
    setCurrentChapterId('CH1_ENG101_2022');
    setGameState('PLAYING');
    saveGameProgress('CH1_ENG101_2022');
  }, []);

  // Continue existing game
  const handleContinueGame = useCallback(() => {
    const save = loadGameSave();
    setCurrentChapterId(save.currentChapterId);
    setGameState('PLAYING');
  }, []);

  // Trigger dialogue
  const handleOpenDialogue = useCallback((dialogue: DialogueLine[], onFinish?: () => void) => {
    setActiveDialogue(dialogue);
    setDialogueOnFinish(() => onFinish || null);
  }, []);

  const handleDialogueComplete = useCallback(() => {
    const callback = dialogueOnFinish;
    setActiveDialogue(null);
    setDialogueOnFinish(null);
    if (callback) {
      callback();
    }
  }, [dialogueOnFinish]);

  // Handle Chapter Completed
  const handleChapterComplete = useCallback((chapterId: ChapterId, memoryId: string) => {
    setUnlockedMemories(prev => {
      const next = Array.from(new Set([...prev, memoryId]));
      saveGameProgress(chapterId, memoryId);
      return next;
    });

    const chapterIdx = CHAPTER_SEQUENCE.indexOf(chapterId);
    setHighestChapterIndex(prev => Math.max(prev, chapterIdx));
    setCompletedInfo({ chapterId, memoryId });
    setGameState('CHAPTER_SUMMARY');
  }, []);

  // Next chapter progression
  const handleNextChapter = useCallback(() => {
    if (!completedInfo) return;
    const currentIdx = CHAPTER_SEQUENCE.indexOf(completedInfo.chapterId);
    if (currentIdx < CHAPTER_SEQUENCE.length - 1) {
      const nextId = CHAPTER_SEQUENCE[currentIdx + 1];
      setCurrentChapterId(nextId);
      saveGameProgress(nextId);
      setCompletedInfo(null);
      setGameState('PLAYING');
    } else {
      // Reached finale, stay on celebration or open scrapbook
      setCompletedInfo(null);
      setGameState('PLAYING');
    }
  }, [completedInfo]);

  // Restart current chapter
  const handleRestartChapter = useCallback(() => {
    setGameState('PLAYING');
    // Force re-render of chapter
    const current = currentChapterId;
    setCurrentChapterId('CH1_ENG101_2022');
    setTimeout(() => setCurrentChapterId(current), 10);
  }, [currentChapterId]);

  // Reset entire game progress
  const handleResetProgress = useCallback(() => {
    const initial = resetGameSave();
    setCurrentChapterId(initial.currentChapterId);
    setUnlockedMemories(initial.unlockedMemories);
    setHighestChapterIndex(initial.highestChapterIndex);
    setGameState('TITLE_MENU');
  }, []);

  // Virtual Gamepad handlers
  const handleDirectionChange = useCallback((dir: 'up' | 'down' | 'left' | 'right', active: boolean) => {
    setVirtualInput(prev => ({ ...prev, [dir]: active }));
  }, []);

  const handleActionTrigger = useCallback(() => {
    setVirtualInput(prev => ({ ...prev, action: true }));
    setTimeout(() => {
      setVirtualInput(prev => ({ ...prev, action: false }));
    }, 120);
  }, []);

  const handleUpdateObjective = useCallback((text: string) => {
    setCurrentObjective(text);
  }, []);

  const handleUpdateMoney = useCallback((amt: number | null) => {
    setMoneyLeft(amt);
  }, []);

  const handleTriggerPause = useCallback(() => {
    setGameState('PAUSED');
  }, []);

  const handleOpenScrapbook = useCallback(() => {
    setGameState('SCRAPBOOK');
  }, []);

  const currentChapterConfig = CHAPTER_CONFIGS[currentChapterId];
  const highestChapterName = CHAPTER_CONFIGS[CHAPTER_SEQUENCE[highestChapterIndex]]?.title || 'Chapter 1';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans-clean select-none">
      {/* Mobile Orientation Warning */}
      <OrientationNotice />

      {/* Retro CRT Scanlines Effect */}
      {settings.scanlines && (
        <div className="scanlines absolute inset-0 z-40 pointer-events-none opacity-40" />
      )}

      {/* Main Game State Machine */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          hasSaveGame={highestChapterIndex > 0 || unlockedMemories.length > 0}
          highestChapterName={highestChapterName}
          onOpenScrapbook={handleOpenScrapbook}
          onOpenSettings={() => setGameState('SETTINGS')}
        />
      )}

      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'CHAPTER_SUMMARY') && (
        <div className="relative w-full h-full">
          {/* Top HUD */}
          <GameHUD
            currentChapterId={currentChapterId}
            objective={currentObjective}
            moneyLeft={moneyLeft}
            unlockedMemoriesCount={unlockedMemories.length}
            totalMemoriesCount={INITIAL_MEMORIES.length}
            isMuted={soundSystem.getMuted()}
            onToggleMute={() => {
              const next = !soundSystem.getMuted();
              soundSystem.setMuted(next);
              setSettings(s => {
                const updated = { ...s, musicMuted: next, sfxMuted: next };
                saveGameSettings(updated);
                return updated;
              });
            }}
            onPause={handleTriggerPause}
            onOpenScrapbook={handleOpenScrapbook}
          />

          {/* Interactive Game Canvas Engine */}
          <GameCanvas
            currentChapterId={currentChapterId}
            onChapterComplete={handleChapterComplete}
            onOpenDialogue={handleOpenDialogue}
            isDialogueActive={activeDialogue !== null}
            onUpdateObjective={handleUpdateObjective}
            onUpdateMoney={handleUpdateMoney}
            virtualInput={virtualInput}
            onTriggerPause={handleTriggerPause}
            onOpenScrapbook={handleOpenScrapbook}
          />

          {/* Typewriter Dialogue Box */}
          {activeDialogue && (
            <DialogueBox
              dialogues={activeDialogue}
              onComplete={handleDialogueComplete}
            />
          )}

          {/* Mobile Virtual Controls */}
          {settings.touchControls && !activeDialogue && gameState === 'PLAYING' && (
            <VirtualGamepad
              onDirectionChange={handleDirectionChange}
              onActionTrigger={handleActionTrigger}
            />
          )}
        </div>
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={() => setGameState('PLAYING')}
          onRestartChapter={handleRestartChapter}
          onOpenScrapbook={() => setGameState('SCRAPBOOK')}
          onQuitToTitle={() => setGameState('TITLE_MENU')}
          isMuted={soundSystem.getMuted()}
          onToggleMute={() => {
            const next = !soundSystem.getMuted();
            soundSystem.setMuted(next);
            setSettings(s => {
              const updated = { ...s, musicMuted: next, sfxMuted: next };
              saveGameSettings(updated);
              return updated;
            });
          }}
        />
      )}

      {/* Chapter Complete Celebration Modal */}
      {gameState === 'CHAPTER_SUMMARY' && completedInfo && (
        <ChapterCompleteModal
          completedChapterId={completedInfo.chapterId}
          memoryId={completedInfo.memoryId}
          onNextChapter={handleNextChapter}
          onOpenScrapbook={() => setGameState('SCRAPBOOK')}
        />
      )}

      {/* Memory Scrapbook Album */}
      {gameState === 'SCRAPBOOK' && (
        <MemoryScrapbook
          unlockedMemoryIds={unlockedMemories}
          onClose={() => {
            if (currentObjective) {
              setGameState('PLAYING');
            } else {
              setGameState('TITLE_MENU');
            }
          }}
        />
      )}

      {/* Settings Modal */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            saveGameSettings(newSettings);
          }}
          onClose={() => setGameState('TITLE_MENU')}
          onResetProgress={handleResetProgress}
        />
      )}
    </div>
  );
}
