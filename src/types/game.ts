export type GameState = 
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'SCRAPBOOK'
  | 'SETTINGS'
  | 'CHAPTER_SUMMARY'
  | 'FINALE_LETTER';

export type ChapterId = 
  | 'CH1_ENG101_2022'
  | 'CH2_HANDBAG_2023'
  | 'CH3_DELIVERY_2023'
  | 'CH2_DELIVERY_2023'
  | 'CH3_HANDBAG_2023'
  | 'CH4_FLYOVER_2024'
  | 'CH5_HATIRJHEEL_2025'
  | 'CH6_RESTAURANT_2025'
  | 'CH7_MILESTONES_2026'
  | 'CH8_BIRTHDAY_FINALE';

export type SpeakerId = 
  | 'istiaque'
  | 'nadia'
  | 'mother'
  | 'piona'
  | 'medha'
  | 'vansh'
  | 'nisha'
  | 'driver'
  | 'narrator'
  | 'student'
  | 'shopkeeper';

export type Emotion = 
  | 'neutral'
  | 'happy'
  | 'surprised'
  | 'panicking'
  | 'crying'
  | 'proud'
  | 'laughing'
  | 'calm'
  | 'scolding'
  | 'thinking';

export interface DialogueChoice {
  text: string;
  nextDialogueIndex?: number;
  triggerEvent?: string;
  responsePreview?: string;
}

export interface DialogueLine {
  speaker: SpeakerId;
  speakerName: string;
  text: string;
  emotion: Emotion;
  choices?: DialogueChoice[];
  onComplete?: () => void;
}

export interface MemoryItem {
  id: string;
  chapterId: ChapterId;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  keepsakeName: string;
  unlocked: boolean;
  unlockedAt?: number;
  iconType: 'classroom' | 'parcel' | 'handbag' | 'flyover' | 'chips' | 'restaurant' | 'graduation' | 'cake';
  quote: string;
}

export interface CharacterEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'down' | 'up' | 'left' | 'right';
  isMoving: boolean;
  frame: number;
  speed: number;
  emotionEmote?: Emotion | 'exclamation' | 'heart' | 'sweat' | 'question' | 'none';
  emoteTimer?: number;
  customSpriteKey?: string;
}

export interface InteractableObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  promptText: string;
  icon?: string;
  highlighted?: boolean;
  action: () => void;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'pixel' | 'star' | 'heart' | 'confetti';
  rotation?: number;
  vRot?: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  scanlines: boolean;
  touchControls: boolean;
  birthdayDate: string; // e.g. "November 18"
}
