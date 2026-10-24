import React, { useEffect, useRef } from 'react';
import {
  drawBirthdayCake,
  drawIstiaqueSprite,
  drawMedhaSprite,
  drawMotherSprite,
  drawNadiaSprite,
  drawNishaAndTupush,
  drawPionaSprite,
  drawRickshaw,
  drawRickshawWithPassengers,
  drawVanshSprite
} from '../game/sprites';
import { CHAPTER_CONFIGS } from '../game/scenes';
import { soundSystem } from '../services/audio';
import {
  ChapterId,
  CharacterEntity,
  DialogueLine,
  InteractableObject,
  Particle
} from '../types/game';

interface GameCanvasProps {
  currentChapterId: ChapterId;
  onChapterComplete: (chapterId: ChapterId, memoryId: string) => void;
  onOpenDialogue: (dialogue: DialogueLine[], onFinish?: () => void) => void;
  isDialogueActive: boolean;
  onUpdateObjective: (text: string) => void;
  onUpdateMoney?: (amount: number | null) => void;
  virtualInput: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    action: boolean;
  };
  onTriggerPause: () => void;
  onOpenScrapbook: () => void;
}

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentChapterId,
  onChapterComplete,
  onOpenDialogue,
  isDialogueActive,
  onUpdateObjective,
  onUpdateMoney,
  virtualInput,
  onTriggerPause
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable refs to ensure smooth 60fps loop with zero React re-render hitching
  const chapterIdRef = useRef<ChapterId>(currentChapterId);
  chapterIdRef.current = currentChapterId;

  const isDialogueActiveRef = useRef<boolean>(isDialogueActive);
  isDialogueActiveRef.current = isDialogueActive;

  const virtualInputRef = useRef(virtualInput);
  virtualInputRef.current = virtualInput;

  const onChapterCompleteRef = useRef(onChapterComplete);
  onChapterCompleteRef.current = onChapterComplete;

  const onOpenDialogueRef = useRef(onOpenDialogue);
  onOpenDialogueRef.current = onOpenDialogue;

  const onUpdateObjectiveRef = useRef(onUpdateObjective);
  onUpdateObjectiveRef.current = onUpdateObjective;

  const onUpdateMoneyRef = useRef(onUpdateMoney);
  onUpdateMoneyRef.current = onUpdateMoney;

  // Player position history trail for smooth companion following
  const playerTrailRef = useRef<Array<{ x: number; y: number; dir: 'up' | 'down' | 'left' | 'right'; frame: number }>>([]);

  // Chapter 2 State (Handbag & Rickshaw Ride & Bus Push)
  const ch2StateRef = useRef({
    stage: 0, // 0: in shop, 1: waiting for rickshaw, 2: rickshaw arrived, 3: riding home, 4: at bus stop pushing crowd
    money: 2500,
    rickshawX: 1350,
    rickshawY: 410,
    rickshawTargetX: 680,
    rickshawArrived: false,
    isRidingHome: false,
    rideHomeX: 680,
    wheelRot: 0,
    bagThrust: 0, // Visual bag swing thrust timer
    pushedCount: 0, // Number of commuters pushed aside
    crowdPositions: [
      { x: 780, y: 390, id: 0, pushed: false, say: '' },
      { x: 830, y: 440, id: 1, pushed: false, say: '' },
      { x: 880, y: 360, id: 2, pushed: false, say: '' },
      { x: 920, y: 430, id: 3, pushed: false, say: '' },
      { x: 960, y: 380, id: 4, pushed: false, say: '' },
      { x: 1000, y: 440, id: 5, pushed: false, say: '' },
      { x: 1030, y: 360, id: 6, pushed: false, say: '' },
      { x: 1060, y: 430, id: 7, pushed: false, say: '' }
    ]
  });

  // Chapter 4 State: Fully Controllable Flyover Sky Ride!
  const ch4StateRef = useRef({
    rickshawX: 200,
    rickshawY: 410,
    speed: 5.5,
    maxSpeed: 10.5,
    distanceDriven: 0,
    flyoverProgress: 0, // 0% ramp -> 100% complete
    altitudeFeet: 25,
    wheelRot: 0,
    isFinished: false,
    boostTimer: 0
  });

  // Other chapter states
  const miscStateRef = useRef({
    ch1Stage: 0,
    ch3DoorOpen: false,
    ch3MotherInDoor: false,
    ch5Stage: 0, // 0: buying chips at tong; 1: chips bought, Nadia & driver plan; 2: return to rickshaw; 3: running through Hatirjheel with live dialogue
    ch5RickshawX: 220,
    ch5RickshawY: 440,
    ch5WheelRot: 0,
    ch5DialogueTriggered: false,
    ch5ChipsPurchased: false,
    ch5RickshawDetoured: false,
    ch6Stage: 0,
    ch7Part: 1 as 1 | 2 | 3, // 1: Scholarship & Research Lab, 2: Convocation Stage, 3: Baby Tupush & Family
    ch7ScholarshipDone: false,
    ch7GradDone: false,
    ch7TupushDone: false,
    ch8CandlesBlown: false,
    ch8WishedDone: false,
    ch8FriendsWished: false
  });

  // Player position & movement
  const playerRef = useRef<CharacterEntity>({
    id: 'istiaque',
    name: 'ইশতিয়াক',
    x: 180,
    y: 420,
    width: 32,
    height: 48,
    direction: 'down',
    isMoving: false,
    frame: 0,
    speed: 4.8,
    emotionEmote: 'none'
  });

  // Companion Nadia
  const nadiaRef = useRef<CharacterEntity>({
    id: 'nadia',
    name: 'নাদিয়া',
    x: 420,
    y: 420,
    width: 32,
    height: 48,
    direction: 'down',
    isMoving: false,
    frame: 0,
    speed: 4.5,
    emotionEmote: 'none'
  });

  const interactablesRef = useRef<InteractableObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastStepSoundRef = useRef<number>(0);
  const bellRungRef = useRef<boolean>(false);

  // Initialize Scene
  const initChapter = (chId: ChapterId) => {
    const curConfig = CHAPTER_CONFIGS[chId];
    if (!curConfig) return;

    soundSystem.playTheme(curConfig.musicTheme);
    onUpdateObjectiveRef.current(curConfig.objective);

    playerRef.current.x = curConfig.playerStartX;
    playerRef.current.y = curConfig.playerStartY;
    playerRef.current.direction = 'down';

    playerTrailRef.current = [];

    ch2StateRef.current = {
      stage: 0,
      money: 2500,
      rickshawX: 1350,
      rickshawY: 410,
      rickshawTargetX: 680,
      rickshawArrived: false,
      isRidingHome: false,
      rideHomeX: 680,
      wheelRot: 0,
      bagThrust: 0,
      pushedCount: 0,
      crowdPositions: [
        { x: 780, y: 390, id: 0, pushed: false, say: '' },
        { x: 830, y: 440, id: 1, pushed: false, say: '' },
        { x: 880, y: 360, id: 2, pushed: false, say: '' },
        { x: 920, y: 430, id: 3, pushed: false, say: '' },
        { x: 960, y: 380, id: 4, pushed: false, say: '' },
        { x: 1000, y: 440, id: 5, pushed: false, say: '' },
        { x: 1030, y: 360, id: 6, pushed: false, say: '' },
        { x: 1060, y: 430, id: 7, pushed: false, say: '' }
      ]
    };

    ch4StateRef.current = {
      rickshawX: 200,
      rickshawY: 410,
      speed: 5.5,
      maxSpeed: 10.5,
      distanceDriven: 0,
      flyoverProgress: 0,
      altitudeFeet: 25,
      wheelRot: 0,
      isFinished: false,
      boostTimer: 0
    };

    miscStateRef.current = {
      ch1Stage: 0,
      ch3DoorOpen: false,
      ch3MotherInDoor: false,
      ch5Stage: 0,
      ch5RickshawX: 220,
      ch5RickshawY: 440,
      ch5WheelRot: 0,
      ch5DialogueTriggered: false,
      ch5ChipsPurchased: false,
      ch5RickshawDetoured: false,
      ch6Stage: 0,
      ch7Part: 1 as 1 | 2 | 3,
      ch7ScholarshipDone: false,
      ch7GradDone: false,
      ch7TupushDone: false,
      ch8CandlesBlown: false,
      ch8WishedDone: false,
      ch8FriendsWished: false
    };

    bellRungRef.current = false;

    if (chId === 'CH1_ENG101_2022') {
      nadiaRef.current.x = 880;
      nadiaRef.current.y = 380;
      onUpdateMoneyRef.current?.(null);
    } else if (chId === 'CH2_HANDBAG_2023' || chId === 'CH3_HANDBAG_2023') {
      // Istiaque standing right next to Nadia in front of the Bag Stall!
      playerRef.current.x = 330;
      playerRef.current.y = 410;
      playerRef.current.direction = 'right';
      nadiaRef.current.x = 380;
      nadiaRef.current.y = 410;
      nadiaRef.current.direction = 'left';
      onUpdateMoneyRef.current?.(2500);
    } else if (chId === 'CH3_DELIVERY_2023' || chId === 'CH2_DELIVERY_2023') {
      onUpdateMoneyRef.current?.(null);
    } else if (chId === 'CH4_FLYOVER_2024') {
      onUpdateMoneyRef.current?.(null);
    } else if (chId === 'CH5_HATIRJHEEL_2025') {
      miscStateRef.current.ch5Stage = 0;
      miscStateRef.current.ch5ChipsPurchased = false;
      miscStateRef.current.ch5RickshawDetoured = false;
      miscStateRef.current.ch5RickshawX = 120;
      miscStateRef.current.ch5RickshawY = 440;
      miscStateRef.current.ch5WheelRot = 0;
      miscStateRef.current.ch5DialogueTriggered = false;
      // Istiaque beside parked rickshaw where Nadia and driver are waiting
      playerRef.current.x = 280;
      playerRef.current.y = 440;
      playerRef.current.direction = 'right';
      nadiaRef.current.x = 240;
      nadiaRef.current.y = 430;
      onUpdateMoneyRef.current?.(null);
    } else if (chId === 'CH6_RESTAURANT_2025') {
      nadiaRef.current.x = 460;
      nadiaRef.current.y = 440;
      onUpdateMoneyRef.current?.(null);
    } else if (chId === 'CH7_MILESTONES_2026') {
      miscStateRef.current.ch7Part = 1;
      playerRef.current.x = 580;
      playerRef.current.y = 390;
      playerRef.current.direction = 'right';
      nadiaRef.current.x = 670;
      nadiaRef.current.y = 390;
      nadiaRef.current.direction = 'left';
      onUpdateMoneyRef.current?.(null);
    } else if (chId === 'CH8_BIRTHDAY_FINALE') {
      // No walking! Istiaque standing right beside Nadia at the centerpiece birthday table
      playerRef.current.x = 560;
      playerRef.current.y = 395;
      playerRef.current.direction = 'right';
      playerRef.current.isMoving = false;
      nadiaRef.current.x = 650;
      nadiaRef.current.y = 395;
      nadiaRef.current.direction = 'left';
      nadiaRef.current.isMoving = false;
      onUpdateMoneyRef.current?.(null);
    }

    if (curConfig.initialDialogue && curConfig.initialDialogue.length > 0) {
      setTimeout(() => {
        onOpenDialogueRef.current(curConfig.initialDialogue!);
      }, 350);
    }
  };

  useEffect(() => {
    initChapter(currentChapterId);
  }, [currentChapterId]);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') {
        onTriggerPause();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    const handleBlur = () => {
      keysRef.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onTriggerPause]);

  // Confetti helper
  const triggerConfetti = (x: number, y: number, count = 50) => {
    soundSystem.playConfetti();
    const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#34d399', '#a855f7', '#f97316'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        shape: 'confetti',
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 15
      });
    }
  };

  // Interactables setup (in Bangla)
  const updateInteractables = () => {
    const chId = chapterIdRef.current;
    const interactables: InteractableObject[] = [];

    if (chId === 'CH1_ENG101_2022') {
      if (miscStateRef.current.ch1Stage === 0) {
        interactables.push({
          id: 'talk_nadia',
          x: 850,
          y: 350,
          width: 80,
          height: 80,
          promptText: 'নাদিয়ার সাথে কথা বলো',
          action: () => {
            onOpenDialogueRef.current([
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'হাই! তুমি কি ENG101-এর নাদিয়া?',
                emotion: 'happy'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'হ্যাঁ, হাই! তুমিও কি এই সেকশনে আছো?',
                emotion: 'neutral'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'হ্যাঁ! আর শুনলাম আমাদের বাসা একই দিকে—একসাথে ফেরা যায়?',
                emotion: 'happy'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'তাই নাকি? দারুণ তো! চলো ক্যাম্পাসের গেটের দিকে একসাথে রওনা দিই।',
                emotion: 'happy'
              }
            ], () => {
              miscStateRef.current.ch1Stage = 1;
              onUpdateObjectiveRef.current('নাদিয়াকে সাথে নিয়ে ক্যাম্পাসের গেটের দিকে এগিয়ে যাও।');
              soundSystem.playInteract();
            });
          }
        });
      } else {
        interactables.push({
          id: 'campus_exit',
          x: 1140,
          y: 400,
          width: 100,
          height: 120,
          promptText: 'একসাথে ক্যাম্পাস ত্যাগ করো',
          action: () => {
            onOpenDialogueRef.current([
              {
                speaker: 'narrator',
                speakerName: 'স্মৃতি আনলকড',
                text: 'আর এখান থেকেই শুরু হয়েছিল সবকিছু। ইস্ট ওয়েস্ট ইউনিভার্সিটির এক সাধারণ ক্লাসরুমের পরিচয় আজ কত বছরের অটুট বন্ধুত্ব।',
                emotion: 'happy'
              }
            ], () => {
              triggerConfetti(640, 360, 50);
              soundSystem.playSuccessChime();
              onChapterCompleteRef.current('CH1_ENG101_2022', 'mem_1_eng101');
            });
          }
        });
      }
    } else if (chId === 'CH2_HANDBAG_2023' || chId === 'CH3_HANDBAG_2023') {
      const st = ch2StateRef.current;
      if (st.stage === 0) {
        // Handbag Stall Interactable (Nadia & Istiaque standing right together in front of the stall)
        interactables.push({
          id: 'buy_handbag',
          x: 360,
          y: 390,
          width: 90,
          height: 80,
          promptText: 'ব্যাগটি পছন্দ করো ও কেনো',
          action: () => {
            onOpenDialogueRef.current([
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'ইশতিয়াক, এই ব্যাগটা একবার দেখো! কী দারুণ, এটা আমাদের নিতেই হবে!',
                emotion: 'happy'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'আমাদের পকেটের সব জমানো টাকা দিয়ে দিলাম... দেখি ব্যাগ কিনে কত টাকা বাঁচে!',
                emotion: 'thinking'
              },
              {
                speaker: 'narrator',
                speakerName: 'পকেটের অবস্থা',
                text: 'ব্যাগ কেনা সম্পন্ন! পকেটে অবশিষ্ট ঠিক ১১০ টাকা!',
                emotion: 'neutral'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'পকেটে বাকি মাত্র ১১০ টাকা! চলো রাস্তায় গিয়ে কোনো রিকশা আসে নাকি দেখি!',
                emotion: 'happy'
              }
            ], () => {
              st.stage = 1;
              st.money = 110;
              onUpdateMoneyRef.current?.(110);
              // Step to the roadside together
              playerRef.current.x = 480;
              playerRef.current.y = 420;
              nadiaRef.current.x = 530;
              nadiaRef.current.y = 420;
              onUpdateObjectiveRef.current('রাস্তায় রিকশার জন্য অপেক্ষা করো!');
              soundSystem.playInteract();
            });
          }
        });
      } else if (st.stage === 1 && st.rickshawArrived) {
        interactables.push({
          id: 'rickshaw_bargain',
          x: st.rickshawX + 40,
          y: st.rickshawY - 20,
          width: 120,
          height: 100,
          promptText: 'রিকশাচালক মামার সাথে দরদাম করো',
          action: () => {
            onOpenDialogueRef.current([
              {
                speaker: 'driver',
                speakerName: 'রিকশাচালক মামা',
                text: 'মামা, বাসায় যাইবেন? ১৮০ টাকা লাগব!',
                emotion: 'neutral'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'মামা, প্লিজ! আমরা ব্যাগ কিনে সব টাকা শেষ করে ফেলছি, পকেটে মাত্র ১১০ টাকা আছে! বাসায় যাব, নিয়ে যাবেন না?',
                emotion: 'panicking'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'মামা প্লিজ! এই ১১০ টাকাই আমাদের শেষ সম্বল, দয়া করে নিয়ে যান!',
                emotion: 'happy'
              },
              {
                speaker: 'driver',
                speakerName: 'রিকশাচালক মামা',
                text: 'আচ্ছা ছাত্র মানুষ, ওঠেন ওঠেন! ১১০ টাকাতেই বাসায় নিয়া যামু!',
                emotion: 'happy'
              }
            ], () => {
              st.stage = 2;
              onUpdateObjectiveRef.current('রিকশায় উঠে বসো এবং বাড়ি চলো!');
              soundSystem.playBell();
            });
          }
        });
      } else if (st.stage === 2) {
        interactables.push({
          id: 'hop_in_rickshaw',
          x: st.rickshawX + 40,
          y: st.rickshawY - 20,
          width: 120,
          height: 100,
          promptText: 'রিকশায় ওঠো!',
          action: () => {
            soundSystem.playInteract();
            // Dialogue perfectly matches getting on and setting off home
            onOpenDialogueRef.current([
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'চলেন মামা, বাসার দিকে টান দেন!',
                emotion: 'happy'
              },
              {
                speaker: 'driver',
                speakerName: 'রিকশাচালক মামা',
                text: 'আইচ্ছা মামা, ধরেন শক্ত কইরা! ১১০ টাকার স্পেশাল রাইড!',
                emotion: 'happy'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'সব টাকা শেষ করে পছন্দের ব্যাগটা কিনলাম, তাও আবার ১১০ টাকায় রাজার মতো রিকশায় চড়ে বাসায় ফিরছি!',
                emotion: 'happy'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'পকেট পুরো খালি, কিন্তু বাড়ি ফেরাটা জমজমাট!',
                emotion: 'happy'
              }
            ], () => {
              st.stage = 3;
              st.isRidingHome = true;
              st.rideHomeX = st.rickshawX;
              onUpdateObjectiveRef.current('নতুন ব্যাগ কোলে নিয়ে রিকশায় চড়ে বাড়ির দিকে যাও!');
            });
          }
        });
      } else if (st.stage === 4) {
        // Bus door interactable - strictly requires having pushed the commuters aside and standing right at the bus door!
        if (st.pushedCount >= 3 && playerRef.current.x >= 1010) {
          interactables.push({
            id: 'board_bus',
            x: 1070,
            y: 360,
            width: 75,
            height: 90,
            promptText: 'বাসে ওঠো!',
            action: () => {
              onOpenDialogueRef.current([
                {
                  speaker: 'narrator',
                  speakerName: 'বাস',
                  text: 'ভিড় ঠেলে বাসে উঠে পড়ল!',
                  emotion: 'happy'
                },
                {
                  speaker: 'istiaque',
                  speakerName: 'ইশতিয়াক',
                  text: 'উফফ, বাসে উঠতে পারলাম!',
                  emotion: 'happy'
                },
                {
                  speaker: 'nadia',
                  speakerName: 'নাদিয়া',
                  text: 'হাহাহা, ব্যাগটাই বাঁচিয়ে দিল!',
                  emotion: 'laughing'
                }
              ], () => {
                triggerConfetti(1070, 360, 60);
                soundSystem.playSuccessChime();
                onChapterCompleteRef.current(chId, 'mem_2_handbag');
              });
            }
          });
        }
      }
    } else if (chId === 'CH3_DELIVERY_2023' || chId === 'CH2_DELIVERY_2023') {
      const mst = miscStateRef.current;
      if (!mst.ch3DoorOpen) {
        interactables.push({
          id: 'knock_door',
          x: 740,
          y: 340,
          width: 80,
          height: 120,
          promptText: 'নাদিয়ার দরজায় নক করো',
          action: () => {
            soundSystem.playDoorKnock();
            setTimeout(() => {
              soundSystem.playDoorOpen();
              mst.ch3DoorOpen = true;
              mst.ch3MotherInDoor = true;
              onOpenDialogueRef.current([
                {
                  speaker: 'mother',
                  speakerName: 'নাদিয়ার আম্মু',
                  text: 'কে? নাদিয়ার কোনো পার্সেল নাকি?',
                  emotion: 'neutral'
                },
                {
                  speaker: 'istiaque',
                  speakerName: 'ইশতিয়াক',
                  text: 'জি আন্টি! নাদিয়ার জন্য স্পেশাল এক্সপ্রেস ফুড ডেলিভারি!',
                  emotion: 'happy'
                },
                {
                  speaker: 'mother',
                  speakerName: 'নাদিয়ার আম্মু',
                  text: 'আচ্ছা, ও কি আবার খাবার অর্ডার করল? তা ডেলিভারি বয় এত ভদ্রভাবে কথা বলে কেন?',
                  emotion: 'neutral'
                },
                {
                  speaker: 'istiaque',
                  speakerName: 'ইশতিয়াক',
                  text: 'প্রিমিয়াম কুরিয়ার সার্ভিস আন্টি! সম্পূর্ণ প্রিপেইড, কোনো টাকা দেওয়া লাগবে না!',
                  emotion: 'panicking'
                },
                {
                  speaker: 'mother',
                  speakerName: 'নাদিয়ার আম্মু',
                  text: 'হা হা, আচ্ছা দাঁড়াও ওকে ডাকছি। নাদিয়া! তোর খাবার পার্সেল এসেছে!',
                  emotion: 'happy'
                },
                {
                  speaker: 'nadia',
                  speakerName: 'নাদিয়া',
                  text: 'আমার পার্সেল চলে এসেছে! (ফিসফিসিয়ে: ইশতিয়াক! তুই সত্যি সত্যি ধরা না পড়ে চলে আসলি?!)',
                  emotion: 'happy'
                },
                {
                  speaker: 'narrator',
                  speakerName: 'মিশন সম্পন্ন',
                  text: 'আন্টি দরজা খুলেছিলেন, কিন্তু ইশতিয়াক ধরা পড়েনি। নাদিয়া পেয়েছিল ওর খাবার!',
                  emotion: 'happy'
                }
              ], () => {
                triggerConfetti(780, 380, 50);
                soundSystem.playSuccessChime();
                onChapterCompleteRef.current(chId, 'mem_3_delivery');
              });
            }, 600);
          }
        });
      }
    } else if (chId === 'CH4_FLYOVER_2024') {
      // Handled via interactive driving!
    } else if (chId === 'CH5_HATIRJHEEL_2025') {
      const mst = miscStateRef.current;
      if (mst.ch5Stage === 0 || !mst.ch5ChipsPurchased) {
        interactables.push({
          id: 'buy_chips',
          x: 630,
          y: 400,
          width: 80,
          height: 80,
          promptText: 'চিপস কেনো',
          action: () => {
            soundSystem.playInteract();
            onOpenDialogueRef.current([
              {
                speaker: 'shopkeeper',
                speakerName: 'টং মামা',
                text: 'এই যে ভাই, আপনার পছন্দের গরম মুচমুচে চিপস!',
                emotion: 'happy'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া (রিকশাচালক মামাকে)',
                text: 'মামা! ইশতিয়াক আসার আগেই চলেন সোজা না গিয়ে হাতিরঝিল ঘুরে যাই! মিষ্টি ঠান্ডা হাওয়া খেতে খেতে যাব!',
                emotion: 'happy'
              },
              {
                speaker: 'driver',
                speakerName: 'রিকশাচালক মামা',
                text: 'আচ্ছা আপা, চলেন হাতিরঝিল ঘুরে আসি! মামা রিকশায় উঠলেই গাড়ি হাতিরঝিলের রাস্তায় টান দিমু!',
                emotion: 'happy'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'চিপস তো পাইলাম! এবার রিকশায় ফেরা যাক।',
                emotion: 'happy'
              }
            ], () => {
              mst.ch5ChipsPurchased = true;
              mst.ch5Stage = 2;
              onUpdateObjectiveRef.current('চিপসের প্যাকেট নিয়ে রিকশায় ফিরে এসো ও ওঠো!');
            });
          }
        });
      } else if (mst.ch5Stage === 2) {
        interactables.push({
          id: 'board_hatirjheel_rickshaw',
          x: 240,
          y: 430,
          width: 90,
          height: 90,
          promptText: 'রিকশায় ওঠো!',
          action: () => {
            soundSystem.playInteract();
            mst.ch5Stage = 3;
            mst.ch5RickshawX = 120;
            mst.ch5DialogueTriggered = false;
            onUpdateObjectiveRef.current('ঝলমলে হাতিরঝিলের লেকপাড় ধরে রিকশায় চক্কর কাটো!');
          }
        });
      }
    } else if (chId === 'CH6_RESTAURANT_2025') {
      const mst = miscStateRef.current;
      if (mst.ch6Stage === 0) {
        interactables.push({
          id: 'talk_piona',
          x: 320,
          y: 420,
          width: 80,
          height: 80,
          promptText: 'পিওনার সাথে কথা বলো',
          action: () => {
            soundSystem.playPanic();
            onOpenDialogueRef.current([
              {
                speaker: 'piona',
                speakerName: 'পিওনা',
                text: 'ওয়াআআআ! তোমরা দুইজন বেতন পাইছো আর আমারে রেস্টুরেন্টে খাওয়াবা না?!',
                emotion: 'crying'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'পিওনা, এই নাটকীয় কান্নাকাটি বন্ধ কর! আর ইশতিয়াক, হাসা বন্ধ কর! দুইজনই একদম চুপ!',
                emotion: 'scolding'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'আচ্ছা আচ্ছা! আজকের বিল আমার! চলো সবাই ভেতরে গিয়ে পেট ভরে খাই!',
                emotion: 'happy'
              }
            ], () => {
              mst.ch6Stage = 1;
              onUpdateObjectiveRef.current('রেস্টুরেন্টে গিয়ে বিরিয়ানি উপভোগ করো!');
              soundSystem.playInteract();
            });
          }
        });
      } else {
        interactables.push({
          id: 'feast_table',
          x: 820,
          y: 380,
          width: 120,
          height: 90,
          promptText: 'রেস্টুরেন্টে জমিয়ে খাও',
          action: () => {
            onOpenDialogueRef.current([
              {
                speaker: 'piona',
                speakerName: 'পিওনা',
                text: 'ইশশশ বিরিয়ানিটা এত মজা! আমি তোমাদের মাফ করে দিলাম!',
                emotion: 'happy'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'দেখেছ? খাবার দিলেই ও একদম শান্ত হয়ে যায়।',
                emotion: 'laughing'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'পিওনার এই ড্রামার জন্যই খাবারটা আরও বেশি জমে উঠল!',
                emotion: 'happy'
              }
            ], () => {
              triggerConfetti(820, 380, 50);
              soundSystem.playSuccessChime();
              onChapterCompleteRef.current('CH6_RESTAURANT_2025', 'mem_6_restaurant');
            });
          }
        });
      }
    } else if (chId === 'CH7_MILESTONES_2026') {
      const part = miscStateRef.current.ch7Part || 1;

      if (part === 1) {
        interactables.push({
          id: 'study_scholarship',
          x: 625,
          y: 390,
          width: 140,
          height: 90,
          promptText: 'স্কলারশিপ অর্জন উদযাপন করো ও সমাবর্তনে যাও',
          action: () => {
            soundSystem.playInteract();
            onOpenDialogueRef.current([
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'প্রফেসর বললেন আমি যাতে এই সেমিস্টার থেকেই ওনার ল্যাবে রিসার্চ অ্যাসিস্ট্যান্ট হিসেবে কাজ শুরু করি!',
                emotion: 'happy'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'দারুণ খবর নাদিয়া! তুই সত্যিই এটা ডিজার্ভ করিস! স্কলারশিপ প্লাস আরএ—অসাধারণ অর্জন দোস্ত!',
                emotion: 'happy'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'চল এবার পরবর্তী বড় দিনে যাই—আমাদের সমাবর্তন মঞ্চে!',
                emotion: 'happy'
              }
            ], () => {
              triggerConfetti(640, 360, 50);
              soundSystem.playSuccessChime();
              miscStateRef.current.ch7Part = 2;
              playerRef.current.x = 580;
              playerRef.current.y = 390;
              nadiaRef.current.x = 660;
              nadiaRef.current.y = 390;
              onUpdateObjectiveRef.current('পর্ব ২/৩: গ্র্যাজুয়েশন ক্যাপ আকাশে ওড়াও ও সমাবর্তন উদযাপন করো!');
              setTimeout(() => {
                onOpenDialogueRef.current([
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'দেখেছিস দোস্ত? সেই ২০২২-এর প্রথম সেমিস্টারের নার্ভাস নাদিয়া আর আজ তুই ব্ল্যাক গাউন আর হুড পরে সমাবর্তন স্টেজে!',
                    emotion: 'happy'
                  },
                  {
                    speaker: 'nadia',
                    speakerName: 'নাদিয়া',
                    text: 'তুইও তো কম প্যারা খাস নাই রে! অ্যাসাইনমেন্ট জমার শেষ রাতে আমাদের সেই হাহাকার আর গ্রুপ স্টাডি... অবশেষে গ্র্যাজুয়েট হলাম আমরা!',
                    emotion: 'happy'
                  },
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'একদম! চারটা বছর যেন পলকে কেটে গেল। চল এক... দুই... তিন বলে ক্যাপ আকাশে উড়াই!',
                    emotion: 'happy'
                  }
                ]);
              }, 250);
            });
          }
        });
      } else if (part === 2) {
        interactables.push({
          id: 'grad_cap_toss',
          x: 620,
          y: 390,
          width: 140,
          height: 90,
          promptText: 'গ্র্যাজুয়েশন ক্যাপ আকাশে ওড়াও ও সমাবর্তন উদযাপন করো',
          action: () => {
            soundSystem.playSuccessChime();
            triggerConfetti(640, 300, 60);
            // Launch cap particles
            for (let c = 0; c < 3; c++) {
              particlesRef.current.push({
                x: 580 + c * 50,
                y: 340,
                vx: (Math.random() - 0.5) * 4,
                vy: -8 - Math.random() * 3,
                size: 14,
                color: '#09090b',
                alpha: 1,
                life: 0,
                maxLife: 50,
                shape: 'confetti',
                rotation: 0,
                vRot: 10
              });
            }
            onOpenDialogueRef.current([
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: '৩, ২, ১... হুররেইইই! ইস্ট ওয়েস্ট থেকে অফিসিয়ালি গ্র্যাজুয়েট!',
                emotion: 'happy'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: 'হ্যাপি গ্র্যাজুয়েশন ডে, নাদিয়া! গাউনে তোকে সেরা লাগছে রে! ডিগ্রি কমপ্লিট!',
                emotion: 'happy'
              },
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'চল এবার বাসায় যাই! নিশা আপু আর ছোট্ট তপুশ অপেক্ষা করছে!',
                emotion: 'happy'
              }
            ], () => {
              triggerConfetti(640, 360, 50);
              soundSystem.playSuccessChime();
              miscStateRef.current.ch7Part = 3;
              playerRef.current.x = 520;
              playerRef.current.y = 380;
              nadiaRef.current.x = 600;
              nadiaRef.current.y = 380;
              onUpdateObjectiveRef.current('পর্ব ৩/৩: পরিবারে নতুন সদস্য তপুশ ও নিশা আপুকে দেখে এসো!');
              setTimeout(() => {
                onOpenDialogueRef.current([
                  {
                    speaker: 'nisha',
                    speakerName: 'নিশা আপু',
                    text: 'নাদিয়া দেখ, তোর ছোট্ট ভাগ্নে তপুশ কেমন ড্যাবড্যাব করে তাকিয়ে হাসছে তোর দিকে!',
                    emotion: 'happy'
                  },
                  {
                    speaker: 'nadia',
                    speakerName: 'নাদিয়া',
                    text: 'ওলে বাবা রে! তপুশ সোনা, খালামণির আদর নে! মাশাল্লাহ কী কিউট পিচ্চিটা!',
                    emotion: 'happy'
                  },
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'তপুশ তো পুরো খালামণির মতোই মিষ্টি হইছে! চারটা বছরের এত অর্জন আর শেষে পরিবারের এই নতুন আনন্দ—২০২৬ সেরা বছর!',
                    emotion: 'happy'
                  }
                ]);
              }, 250);
            });
          }
        });
      } else if (part === 3) {
        interactables.push({
          id: 'meet_tupush',
          x: 600,
          y: 380,
          width: 160,
          height: 90,
          promptText: 'তপুশকে আদর করো ও স্মৃতির সমাপ্তি টানো',
          action: () => {
            soundSystem.playSuccessChime();
            onOpenDialogueRef.current([
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'তপুশ বড় হয়ে খালামণি আর মামার সব ক্যাম্পাসের পাগলামির গল্প শুনবে, তাই না সোনা?',
                emotion: 'happy'
              },
              {
                speaker: 'nisha',
                speakerName: 'নিশা আপু',
                text: 'হাহাহা একদম! এত সুন্দর অর্জন আর পরিবারের আনন্দ—সবাই মিলে মিষ্টি মুখ কর!',
                emotion: 'happy'
              },
              {
                speaker: 'istiaque',
                speakerName: 'ইশতিয়াক',
                text: '২০২২ থেকে ২০২৬—চার বছরের অবিশ্বাস্য জার্নি অবশেষে পূর্ণতা পেল।',
                emotion: 'happy'
              }
            ], () => {
              triggerConfetti(640, 360, 75);
              soundSystem.playSuccessChime();
              onChapterCompleteRef.current('CH7_MILESTONES_2026', 'mem_7_milestones');
            });
          }
        });
      }
    } else if (chId === 'CH8_BIRTHDAY_FINALE') {
      const mst = miscStateRef.current;

      // 1. Blow Candles & Make a Wish
      interactables.push({
        id: 'blow_candles',
        x: 610,
        y: 395,
        width: 100,
        height: 80,
        promptText: mst.ch8CandlesBlown ? '🎂 কেক ও মোমবাতি (নেভানো সম্পন্ন)' : '🎂 মোমবাতি নেভাও ও উইশ করো',
        action: () => {
          if (!mst.ch8CandlesBlown) {
            soundSystem.playBlowCandle();
            mst.ch8CandlesBlown = true;
            triggerConfetti(640, 340, 75);
            onOpenDialogueRef.current([
              {
                speaker: 'nadia',
                speakerName: 'নাদিয়া',
                text: 'আমি মনের মতো একটা দারুণ উইশ করে নিয়েছি! তোরা সবাই প্রতিটা জন্মদিনে এভাবে আমার পাশে থাকিস!',
                emotion: 'happy'
              },
              {
                speaker: 'piona',
                speakerName: 'পিওনা',
                text: 'উইশ তো হলো, এবার জলদি কেক কাটো! আমার জন্য সবচেয়ে বড় চকলেটের টুকরাটা কিন্তু!',
                emotion: 'happy'
              },
              {
                speaker: 'medha',
                speakerName: 'মেধা',
                text: 'হ্যাপি বার্থডে নাদিয়া! আজকের দিনটা শুধুই তোমার!',
                emotion: 'happy'
              }
            ]);
          }
        }
      });

      // 2. Friends' Birthday Wishes & Banter
      interactables.push({
        id: 'talk_friends',
        x: 480,
        y: 395,
        width: 100,
        height: 80,
        promptText: '🎈 বন্ধুদের শুভেচ্ছা ও আড্ডা',
        action: () => {
          soundSystem.playInteract();
          mst.ch8FriendsWished = true;
          triggerConfetti(480, 360, 45);
          onOpenDialogueRef.current([
            {
              speaker: 'medha',
              speakerName: 'মেধা',
              text: 'শুভ জন্মদিন নাদিয়া! তুই সবসময় আমাদের আড্ডার মধ্যমণি! জীবনে অনেক অনেক বড় হ!',
              emotion: 'happy'
            },
            {
              speaker: 'vansh',
              speakerName: 'ভাংশ',
              text: 'তোর ওই এনার্জেটিক হাসিটা কখনো হারাতে দিবি না দোস্ত! সামনে আরও অনেক রোমাঞ্চ!',
              emotion: 'happy'
            },
            {
              speaker: 'piona',
              speakerName: 'পিওনা',
              text: 'আর রেস্টুরেন্টে নিয়ে গিয়ে আমাকে যেন আর কান্না না করতে হয়, বেশি বেশি খাওয়াবি! হাহাহা!',
              emotion: 'happy'
            },
            {
              speaker: 'nadia',
              speakerName: 'নাদিয়া',
              text: 'তোরা সত্যিই সেরা রে! লাভ ইউ অল!',
              emotion: 'happy'
            }
          ]);
        }
      });

      // 3. Istiaque's Birthday Letter & Grand Finale
      interactables.push({
        id: 'read_letter',
        x: 670,
        y: 395,
        width: 100,
        height: 80,
        promptText: '💌 জন্মদিনের চিঠি ও ফিনালে',
        action: () => {
          soundSystem.playSuccessChime();
          triggerConfetti(640, 340, 85);
          onOpenDialogueRef.current([
            {
              speaker: 'istiaque',
              speakerName: 'ইশতিয়াক',
              text: 'শুভ জন্মদিন, নাদিয়া। ENG101-এ প্রথম দেখা থেকে শুরু করে ডেলিভারি মিশন, মিরপুরের ব্যাগ কেনা, ফ্লাইওভারের সেই উড়ন্ত রিকশা, হাতিরঝিলে চিপস খাওয়া আর সমাবর্তনের দিনগুলো—সব আজ আমাদের হৃদয়ে অমলিন।',
              emotion: 'happy'
            },
            {
              speaker: 'istiaque',
              speakerName: 'ইশতিয়াক',
              text: 'আমি আশা করি তোমার জীবনের আগামী অধ্যায় বয়ে নিয়ে আসবে অফুরন্ত আনন্দ, সাফল্য আর নতুন সব রোমাঞ্চ। তুমি অনেক কষ্ট করেছ, স্কলারশিপ পেয়েছ, গ্র্যাজুয়েশন শেষ করেছ এবং রিসার্চ অ্যাসিস্ট্যান্ট হিসেবে নতুন অধ্যায় শুরু করেছ।',
              emotion: 'happy'
            },
            {
              speaker: 'istiaque',
              speakerName: 'ইশতিয়াক',
              text: 'এই অসাধারণ স্মৃতিগুলোর অংশ হওয়ার জন্য ধন্যবাদ। Happy Birthday, Nadia! — ইশতিয়াক',
              emotion: 'happy'
            },
            {
              speaker: 'narrator',
              speakerName: 'নাদিয়ার বার্থডে অ্যাডভেঞ্চার',
              text: 'একই মানুষ। একই পাগলামি। সামনে আরও অনেক অনেক স্মৃতি। শুভ জন্মদিন, নাদিয়া!',
              emotion: 'happy'
            }
          ], () => {
            triggerConfetti(640, 360, 100);
            onChapterCompleteRef.current('CH8_BIRTHDAY_FINALE', 'mem_8_birthday');
          });
        }
      });
    }

    interactablesRef.current = interactables;
  };

  // Continuous 60fps Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;

          const chId = chapterIdRef.current;
          const isDialogue = isDialogueActiveRef.current;
          const virtual = virtualInputRef.current;
          const keys = keysRef.current;
          const player = playerRef.current;
          const nadia = nadiaRef.current;
          const st2 = ch2StateRef.current;
          const st4 = ch4StateRef.current;

          // --- CHAPTER 2 SIMULATION (Rickshaw arrival, Riding, and Bus pushing) ---
          if (chId === 'CH2_HANDBAG_2023' || chId === 'CH3_HANDBAG_2023') {
            if (st2.stage === 1) {
              if (st2.rickshawX > st2.rickshawTargetX) {
                st2.rickshawX -= 170 * dt;
                st2.wheelRot += 5 * dt;

                if (st2.rickshawX < 950 && !bellRungRef.current) {
                  soundSystem.playBell();
                  bellRungRef.current = true;
                }

                if (st2.rickshawX <= st2.rickshawTargetX) {
                  st2.rickshawX = st2.rickshawTargetX;
                  st2.rickshawArrived = true;
                  onUpdateObjectiveRef.current('রিকশাচালক মামার সাথে দরদাম করো (বাকি মাত্র ১১০ টাকা)!');
                }
              }
            } else if (st2.stage === 3 && st2.isRidingHome) {
              st2.rideHomeX -= 150 * dt;
              st2.wheelRot += 4.5 * dt;

              if (Math.floor(currentTime / 1800) % 2 === 0 && Math.random() < 0.015) {
                soundSystem.playBell();
              }

              if (st2.rideHomeX < 120) {
                st2.isRidingHome = false;
                onOpenDialogueRef.current([
                  {
                    speaker: 'driver',
                    speakerName: 'রিকশাচালক মামা',
                    text: 'মামা, ইস্ট ওয়েস্ট স্পেশাল বাসের স্টপেজে নামিয়ে দিলাম!',
                    emotion: 'happy'
                  },
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'ধন্যবাদ মামা! কিন্তু বাসের দরজার সামনে মানুষের কী উপচে পড়া ভিড়!',
                    emotion: 'panicking'
                  },
                  {
                    speaker: 'nadia',
                    speakerName: 'নাদিয়া',
                    text: 'ইশতিয়াক, এই নতুন ব্যাগটা কিন্তু ঢালের মতো শক্ত! এটা দিয়ে ভিড় ঠেলে পথ বানাও!',
                    emotion: 'laughing'
                  },
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'হা হা দারুণ বুদ্ধি! চল ব্যাগ দিয়ে গুঁতো মেরে পথ ক্লিয়ার করি!',
                    emotion: 'happy'
                  }
                ], () => {
                  st2.stage = 4;
                  player.x = 240;
                  player.y = 440;
                  nadia.x = 180;
                  nadia.y = 440;
                  onUpdateObjectiveRef.current('ব্যাগ দিয়ে ভিড় ঠেলে পথ বানিয়ে বাসের দরজায় পৌঁছাও!');
                });
              }
            } else if (st2.stage === 4) {
              // Decrement bag thrust animation timer
              st2.bagThrust = Math.max(0, st2.bagThrust - 35 * dt);

              // NADIA ALWAYS FOLLOWS ISTIAQUE RIGHT BEHIND HIM!
              if (playerTrailRef.current.length >= 14) {
                const target = playerTrailRef.current[Math.min(14, playerTrailRef.current.length - 1)];
                const tdx = target.x - nadia.x;
                const tdy = target.y - nadia.y;
                const dist = Math.hypot(tdx, tdy);
                if (dist > 10) {
                  nadia.isMoving = true;
                  nadia.x += (tdx / dist) * Math.min(dist, player.speed * 55 * dt);
                  nadia.y += (tdy / dist) * Math.min(dist, player.speed * 55 * dt);
                  nadia.direction = target.dir;
                  nadia.frame = target.frame;
                } else {
                  nadia.isMoving = false;
                }
              } else {
                const targetX = player.direction === 'left' ? player.x + 40 : player.direction === 'right' ? player.x - 40 : player.x;
                const targetY = player.direction === 'up' ? player.y + 35 : player.direction === 'down' ? player.y - 35 : player.y;
                const tdx = targetX - nadia.x;
                const tdy = targetY - nadia.y;
                const dist = Math.hypot(tdx, tdy);
                if (dist > 15) {
                  nadia.isMoving = true;
                  nadia.x += (tdx / dist) * Math.min(dist, player.speed * 55 * dt);
                  nadia.y += (tdy / dist) * Math.min(dist, player.speed * 55 * dt);
                  nadia.direction = player.direction;
                  nadia.frame = player.frame;
                } else {
                  nadia.isMoving = false;
                }
              }

              // PUSHING WITH THE HANDBAG: Auto-push when walking directly into commuters
              st2.crowdPositions.forEach(c => {
                const distToPlayer = Math.hypot(player.x - c.x, player.y - c.y);
                if (distToPlayer < 55 && !isDialogue) {
                  st2.bagThrust = 10;
                  soundSystem.playInteract();

                  if (c.y < 415) {
                    c.y = Math.max(300, c.y - 45);
                  } else {
                    c.y = Math.min(520, c.y + 45);
                  }
                  c.x = Math.max(720, Math.min(1150, c.x + (c.x > player.x ? 35 : -35)));
                  c.pushed = true;

                  for (let p = 0; p < 5; p++) {
                    particlesRef.current.push({
                      x: (player.x + c.x) / 2,
                      y: (player.y + c.y) / 2,
                      vx: (Math.random() - 0.5) * 5,
                      vy: (Math.random() - 0.5) * 5,
                      size: 3 + Math.random() * 3,
                      color: '#fbbf24',
                      alpha: 1,
                      life: 0,
                      maxLife: 20
                    });
                  }

                  const phrases = [
                    'বাপরে! ব্যাগের কী গুঁতো!',
                    'আরে সাবধানে ভাই! পথ দিচ্ছি!',
                    'ব্যাগ দিয়া পুরা রাস্তা ক্লিয়ার!',
                    'মাশাল্লাহ, কী শক্ত ব্যাগ!',
                    'সাইড দেন, উনাদের যাইতে দেন!'
                  ];
                  c.say = phrases[Math.floor(Math.random() * phrases.length)];
                  st2.pushedCount++;
                }
              });
            }
          }

          // --- CHAPTER 4 FULLY CONTROLLABLE FLYOVER SKY DRIVING SIMULATION ---
          if (chId === 'CH4_FLYOVER_2024') {
            if (!isDialogue && !st4.isFinished) {
              let steerX = 0;
              let steerY = 0;
              if (keys['w'] || keys['arrowup'] || virtual.up) steerY -= 1;
              if (keys['s'] || keys['arrowdown'] || virtual.down) steerY += 1;
              if (keys['a'] || keys['arrowleft'] || virtual.left) steerX -= 1;
              if (keys['d'] || keys['arrowright'] || virtual.right) steerX += 1;

              // Full Horizontal Steering on Canvas (moves rickshaw left/right!)
              st4.rickshawX += steerX * 4.5 * 60 * dt;
              st4.rickshawX = Math.max(120, Math.min(620, st4.rickshawX));

              // Vertical Lane Steering (lane changes across the elevated highway)
              st4.rickshawY += steerY * 3.8 * 60 * dt;
              st4.rickshawY = Math.max(300, Math.min(500, st4.rickshawY));

              // Pedal Boost & Bell
              const pedalPressed = keys[' '] || keys['enter'] || keys['e'] || virtual.action;
              if (pedalPressed) {
                keys[' '] = false;
                keys['enter'] = false;
                keys['e'] = false;
                st4.boostTimer = 1.2;
                st4.speed = Math.min(st4.maxSpeed, st4.speed + 2.5);
                soundSystem.playBell();

                for (let bp = 0; bp < 4; bp++) {
                  particlesRef.current.push({
                    x: st4.rickshawX - 30,
                    y: st4.rickshawY + 10 + (Math.random() - 0.5) * 15,
                    vx: -3 - Math.random() * 4,
                    vy: (Math.random() - 0.5) * 2,
                    size: 3 + Math.random() * 3,
                    color: '#38bdf8',
                    alpha: 1,
                    life: 0,
                    maxLife: 20
                  });
                }
              }

              if (st4.boostTimer > 0) {
                st4.boostTimer -= dt;
              } else {
                st4.speed = Math.max(5.5, st4.speed - 1.5 * dt);
              }

              // Progress advances with speed
              st4.distanceDriven += st4.speed * 60 * dt;
              st4.flyoverProgress = Math.min(100, (st4.distanceDriven / 1800) * 100);
              st4.wheelRot += st4.speed * 1.5 * dt;

              // Dynamic Altitude rises up to 65 ft in the sky!
              st4.altitudeFeet = Math.min(65, 25 + Math.floor(st4.flyoverProgress * 0.45));

              // Update objective percentage & speed in Bangla
              if (Math.floor(st4.distanceDriven) % 15 === 0) {
                const speedKm = Math.floor(st4.speed * 4.2);
                onUpdateObjectiveRef.current(`ফ্লাইওভারের ওপরে ড্রাইভ করো! (${Math.floor(st4.flyoverProgress)}% সম্পন্ন · গতি: ${speedKm} কিমি/ঘণ্টা)`);
              }

              // Finished flyover ride!
              if (st4.flyoverProgress >= 100 && !st4.isFinished) {
                st4.isFinished = true;
                st4.speed = 0;
                onOpenDialogueRef.current([
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'বাপরে বাপ! জীবনে প্রথমবার রিকশায় চড়ে আকাশে ওড়ার মতো অনুভূতি হলো! আমার তো কলিজা শুকিয়ে গেছিল!',
                    emotion: 'panicking'
                  },
                  {
                    speaker: 'nadia',
                    speakerName: 'নাদিয়া',
                    text: 'কিন্তু ভিউটা কত সুন্দর ছিল বলো! এমন ফুরফুরে বাতাস আর এমন ফ্লাইওভার রাইড জীবনে আর কখনো হবে না!',
                    emotion: 'calm'
                  },
                  {
                    speaker: 'narrator',
                    speakerName: 'উড়ন্ত রিকশার স্মৃতি',
                    text: 'একই ফ্লাইওভার রাইডে ইশতিয়াকের জীবনের ভয় আর নাদিয়ার আশ্চর্য শান্ত আনন্দ—এই স্মৃতি তাদের চিরকাল মনে রাখার মতো।',
                    emotion: 'happy'
                  }
                ], () => {
                  triggerConfetti(640, 360, 70);
                  soundSystem.playSuccessChime();
                  onChapterCompleteRef.current('CH4_FLYOVER_2024', 'mem_4_flyover');
                });
              }
            }
          }

          // --- CHAPTER 5 HATIRJHEEL RICKSHAW RIDE SIMULATION ---
          if (chId === 'CH5_HATIRJHEEL_2025') {
            const mst = miscStateRef.current;
            if (mst.ch5Stage === 3) {
              mst.ch5RickshawX += 135 * dt;
              mst.ch5WheelRot += 4.5 * dt;

              if (Math.floor(currentTime / 1800) % 2 === 0 && Math.random() < 0.015) {
                soundSystem.playBell();
              }

              // Trigger Hatirjheel ride dialogue while the rickshaw is running on the road!
              if (mst.ch5RickshawX >= 340 && !mst.ch5DialogueTriggered) {
                mst.ch5DialogueTriggered = true;
                onOpenDialogueRef.current([
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'চিপস তো নিলাম... মামা এইদিকে রিকশা ঘুরাচ্ছেন কেন?! এটা তো হাতিরঝিলের রাস্তা!',
                    emotion: 'panicking'
                  },
                  {
                    speaker: 'nadia',
                    speakerName: 'নাদিয়া',
                    text: 'হাহাহা! আমিই মামাকে বলেছি সোজা না গিয়ে হাতিরঝিল ঘুরে যেতে! চিপস খাও আর লেকের মিষ্টি হাওয়া উপভোগ করো!',
                    emotion: 'laughing'
                  },
                  {
                    speaker: 'driver',
                    speakerName: 'রিকশাচালক মামা',
                    text: 'রাতের হাতিরঝিলের বাতি আর বাতাস দুটিই অস্থির আপা-ভাই! মন ভালো হইয়া যাইব!',
                    emotion: 'happy'
                  },
                  {
                    speaker: 'istiaque',
                    speakerName: 'ইশতিয়াক',
                    text: 'প্রথমে একটু ভড়কে গিয়েছিলাম ঠিকই... কিন্তু সত্যি বলতে হাতিরঝিলের এই ডিতুরটা আমাদের সেরা এক স্মৃতি হয়ে থাকবে!',
                    emotion: 'happy'
                  },
                  {
                    speaker: 'narrator',
                    speakerName: 'স্মৃতির হাতিরঝিল',
                    text: 'অপ্রত্যাশিত ডিতুর, চিপসের প্যাকেট আর রাতের হাতিরঝিলের আলো—বন্ধুত্বের চিরসবুজ গল্প।',
                    emotion: 'happy'
                  }
                ], () => {
                  onUpdateObjectiveRef.current('ঝলমলে হাতিরঝিল পাড় হয়ে বাড়ি পৌঁছাও!');
                });
              }

              // Finished ride across Hatirjheel!
              if (mst.ch5RickshawX >= 1150 && mst.ch5DialogueTriggered) {
                mst.ch5Stage = 4;
                triggerConfetti(640, 360, 60);
                soundSystem.playSuccessChime();
                onChapterCompleteRef.current('CH5_HATIRJHEEL_2025', 'mem_5_hatirjheel');
              }
            }
          }

          // --- PLAYER MOVEMENT & INTERACTION ---
          if (chId === 'CH8_BIRTHDAY_FINALE') {
            // NO WALKING IN CHAPTER 8: Istiaque is standing right beside Nadia at the birthday centerpiece table!
            player.x = 560;
            player.y = 395;
            player.direction = 'right';
            player.isMoving = false;
            nadia.x = 650;
            nadia.y = 395;
            nadia.direction = 'left';
            nadia.isMoving = false;

            updateInteractables();
            const is1 = keys['1'];
            const is2 = keys['2'];
            const is3 = keys['3'];
            const isAction = keys[' '] || keys['enter'] || keys['e'] || virtual.action;

            if ((is1 || is2 || is3 || isAction) && !isDialogue) {
              keys[' '] = false;
              keys['enter'] = false;
              keys['e'] = false;
              keys['1'] = false;
              keys['2'] = false;
              keys['3'] = false;

              if (is1 && interactablesRef.current[0]) {
                interactablesRef.current[0].action();
              } else if (is2 && interactablesRef.current[1]) {
                interactablesRef.current[1].action();
              } else if (is3 && interactablesRef.current[2]) {
                interactablesRef.current[2].action();
              } else {
                // Sequential progression: candles -> friends -> letter
                const mst = miscStateRef.current;
                if (!mst.ch8CandlesBlown && interactablesRef.current[0]) {
                  interactablesRef.current[0].action();
                } else if (!mst.ch8FriendsWished && interactablesRef.current[1]) {
                  interactablesRef.current[1].action();
                } else if (interactablesRef.current[2]) {
                  interactablesRef.current[2].action();
                }
              }
            }
          } else if (chId !== 'CH4_FLYOVER_2024' && !(st2.stage === 3 && st2.isRidingHome) && !(chId === 'CH5_HATIRJHEEL_2025' && miscStateRef.current.ch5Stage >= 3)) {
            let vx = 0;
            let vy = 0;
            if (!isDialogue) {
              if (keys['w'] || keys['arrowup'] || virtual.up) vy -= 1;
              if (keys['s'] || keys['arrowdown'] || virtual.down) vy += 1;
              if (keys['a'] || keys['arrowleft'] || virtual.left) vx -= 1;
              if (keys['d'] || keys['arrowright'] || virtual.right) vx += 1;

              if (vx !== 0 || vy !== 0) {
                player.isMoving = true;
                if (vy < 0) player.direction = 'up';
                else if (vy > 0) player.direction = 'down';
                else if (vx < 0) player.direction = 'left';
                else if (vx > 0) player.direction = 'right';

                const len = Math.hypot(vx, vy);
                const moveSpeed = player.speed * 60 * dt;
                player.x += (vx / len) * moveSpeed;
                player.y += (vy / len) * moveSpeed;

                // Push to trail for followers
                playerTrailRef.current.unshift({
                  x: player.x,
                  y: player.y,
                  dir: player.direction,
                  frame: player.frame
                });
                if (playerTrailRef.current.length > 25) {
                  playerTrailRef.current.pop();
                }

                if (currentTime - lastStepSoundRef.current > 300) {
                  soundSystem.playStep();
                  lastStepSoundRef.current = currentTime;
                }

                player.frame = Math.floor(currentTime / 180) % 4;
              } else {
                player.isMoving = false;
                player.frame = 0;
              }

              player.x = Math.max(60, Math.min(CANVAS_WIDTH - 80, player.x));
              player.y = Math.max(260, Math.min(CANVAS_HEIGHT - 90, player.y));

              // Companion Nadia follow logic in Chapter 1
              if (chId === 'CH1_ENG101_2022' && miscStateRef.current.ch1Stage === 1) {
                const dx = player.x - 45 - nadia.x;
                const dy = player.y - nadia.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 50) {
                  nadia.isMoving = true;
                  nadia.x += (dx / dist) * player.speed * 50 * dt;
                  nadia.y += (dy / dist) * player.speed * 50 * dt;
                  nadia.direction = player.direction;
                  nadia.frame = player.frame;
                } else {
                  nadia.isMoving = false;
                }
              }
            } else {
              player.isMoving = false;
            }

            // Interactable actions & Handbag Push key handler
            updateInteractables();
            const actionPressed = keys[' '] || keys['enter'] || keys['e'] || virtual.action;
            if (actionPressed && !isDialogue) {
              // IN CHAPTER 2 STAGE 4: If still in the crowd, pressing action explicitly swings the handbag!
              if ((chId === 'CH2_HANDBAG_2023' || chId === 'CH3_HANDBAG_2023') && st2.stage === 4 && (player.x < 1010 || st2.pushedCount < 3)) {
                keys[' '] = false;
                keys['enter'] = false;
                keys['e'] = false;
                st2.bagThrust = 12;
                soundSystem.playInteract();

                st2.crowdPositions.forEach(c => {
                  const distToPlayer = Math.hypot(player.x - c.x, player.y - c.y);
                  if (distToPlayer < 75) {
                    if (c.y < 415) {
                      c.y = Math.max(300, c.y - 45);
                    } else {
                      c.y = Math.min(520, c.y + 45);
                    }
                    c.x = Math.max(720, Math.min(1150, c.x + (c.x > player.x ? 35 : -35)));
                    c.pushed = true;

                    for (let p = 0; p < 5; p++) {
                      particlesRef.current.push({
                        x: (player.x + c.x) / 2,
                        y: (player.y + c.y) / 2,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        size: 3 + Math.random() * 3,
                        color: '#fbbf24',
                        alpha: 1,
                        life: 0,
                        maxLife: 20
                      });
                    }

                    const phrases = [
                      'বাপরে! ব্যাগের কী গুঁতো!',
                      'আরে সাবধানে ভাই! পথ দিচ্ছি!',
                      'ব্যাগ দিয়া পুরা রাস্তা ক্লিয়ার!',
                      'মাশাল্লাহ, কী শক্ত ব্যাগ!',
                      'সাইড দেন, উনাদের যাইতে দেন!'
                    ];
                    c.say = phrases[Math.floor(Math.random() * phrases.length)];
                    st2.pushedCount++;
                  }
                });
              } else {
                // Normal interactables
                for (const obj of interactablesRef.current) {
                  const dist = Math.hypot(player.x - obj.x, player.y - obj.y);
                  if (dist < 80) {
                    keys[' '] = false;
                    keys['enter'] = false;
                    keys['e'] = false;
                    obj.action();
                    break;
                  }
                }
              }
            }
          }

          // --- RENDER ENVIRONMENT ---
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          renderSceneEnvironment(ctx, chId, st2, st4, miscStateRef.current, currentTime);

          // --- DEPTH-SORTED RENDER LIST ---
          const renderList: Array<{ y: number; render: () => void }> = [];

          if (chId === 'CH1_ENG101_2022') {
            renderList.push({
              y: nadia.y,
              render: () => drawNadiaSprite(ctx, nadia.x, nadia.y, nadia.direction, nadia.frame, nadia.isMoving, 'casual', 'happy')
            });
          } else if (chId === 'CH2_HANDBAG_2023' || chId === 'CH3_HANDBAG_2023') {
            if (st2.stage === 3 && st2.isRidingHome) {
              renderList.push({
                y: st2.rickshawY,
                render: () => {
                  drawRickshawWithPassengers(ctx, st2.rideHomeX, st2.rickshawY, 1.35, st2.wheelRot, true);
                }
              });
            } else {
              renderList.push({
                y: nadia.y,
                render: () => drawNadiaSprite(ctx, nadia.x, nadia.y, nadia.direction, nadia.frame, nadia.isMoving, 'casual', 'happy')
              });

              if (st2.stage >= 1 && st2.stage < 4) {
                renderList.push({
                  y: st2.rickshawY,
                  render: () => drawRickshaw(ctx, st2.rickshawX, st2.rickshawY, true, 1.25, st2.wheelRot)
                });
              }

              if (st2.stage === 4) {
                st2.crowdPositions.forEach(c => {
                  renderList.push({
                    y: c.y,
                    render: () => {
                      drawIstiaqueSprite(ctx, c.x, c.y, 'down', 0, false, 'neutral');
                      if (c.say) {
                        ctx.save();
                        ctx.fillStyle = '#0f172a';
                        ctx.strokeStyle = '#f59e0b';
                        ctx.lineWidth = 1.5;
                        ctx.font = '11px "Hind Siliguri", sans-serif';
                        const m = ctx.measureText(c.say);
                        ctx.fillRect(c.x - m.width / 2 - 4, c.y - 28, m.width + 8, 20);
                        ctx.strokeRect(c.x - m.width / 2 - 4, c.y - 28, m.width + 8, 20);
                        ctx.fillStyle = '#fef08a';
                        ctx.fillText(c.say, c.x - m.width / 2, c.y - 14);
                        ctx.restore();
                      }
                    }
                  });
                });
              }
            }
          } else if (chId === 'CH3_DELIVERY_2023' || chId === 'CH2_DELIVERY_2023') {
            if (miscStateRef.current.ch3MotherInDoor) {
              renderList.push({
                y: 350,
                render: () => drawMotherSprite(ctx, 765, 345, 0, 'happy')
              });
            }
          } else if (chId === 'CH4_FLYOVER_2024') {
            // Interactive Flyover Rickshaw with Nadia & Istiaque!
            renderList.push({
              y: st4.rickshawY,
              render: () => {
                const flyoverIncline = st4.flyoverProgress < 12 ? -0.09 : 0;
                ctx.save();
                ctx.translate(st4.rickshawX, st4.rickshawY);
                ctx.rotate(flyoverIncline);

                // Rickshaw
                drawRickshaw(ctx, 0, 0, true, 1.35, st4.wheelRot);

                // Nadia calm enjoying the sky
                drawNadiaSprite(ctx, 22, 2, 'down', 0, false, 'casual', 'calm');

                // Istiaque panicking
                drawIstiaqueSprite(ctx, 48, 2, 'down', 0, false, 'panicking');

                // Funny live dialog bubbles floating above while driving!
                ctx.save();
                ctx.font = 'bold 11px "Hind Siliguri", sans-serif';

                // Nadia speech bubble
                const nText = 'কী সুন্দর বাতাস!';
                const nm = ctx.measureText(nText);
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.fillRect(14 - nm.width / 2, -26, nm.width + 12, 18);
                ctx.strokeRect(14 - nm.width / 2, -26, nm.width + 12, 18);
                ctx.fillStyle = '#fef08a';
                ctx.fillText(nText, 20 - nm.width / 2, -13);

                // Istiaque panic speech bubble
                const iText = 'মামাআআ আস্তে চালান!';
                const im = ctx.measureText(iText);
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#f87171';
                ctx.lineWidth = 1.5;
                ctx.fillRect(58 - im.width / 2, -26, im.width + 12, 18);
                ctx.strokeRect(58 - im.width / 2, -26, im.width + 12, 18);
                ctx.fillStyle = '#fca5a5';
                ctx.fillText(iText, 64 - im.width / 2, -13);

                ctx.restore();
                ctx.restore();
              }
            });
          } else if (chId === 'CH5_HATIRJHEEL_2025') {
            const mst = miscStateRef.current;
            if (mst.ch5Stage === 3) {
              renderList.push({
                y: 450,
                render: () => {
                  drawRickshawWithPassengers(ctx, mst.ch5RickshawX, 410, 1.35, mst.ch5WheelRot, false);
                  // Istiaque holding chips bag in the rickshaw
                  ctx.fillStyle = '#f59e0b';
                  ctx.fillRect(mst.ch5RickshawX + 44 * 1.35, 410 + 20 * 1.35, 14, 16);
                  ctx.fillStyle = '#dc2626';
                  ctx.fillRect(mst.ch5RickshawX + 46 * 1.35, 410 + 23 * 1.35, 10, 8);
                }
              });
            } else {
              renderList.push({
                y: 440,
                render: () => {
                  drawRickshaw(ctx, 220, 390, true, 1.25);
                  drawNadiaSprite(ctx, 240, 380, 'down', 0, false, 'casual', 'happy');
                }
              });
            }
          } else if (chId === 'CH6_RESTAURANT_2025') {
            if (miscStateRef.current.ch6Stage === 0) {
              renderList.push({
                y: 420,
                render: () => drawPionaSprite(ctx, 330, 410, 0, true, false)
              });
              renderList.push({
                y: 440,
                render: () => drawNadiaSprite(ctx, nadia.x, nadia.y, 'left', 0, false, 'casual', 'scolding')
              });
            } else {
              renderList.push({
                y: 380,
                render: () => {
                  drawPionaSprite(ctx, 760, 360, 0, false, true);
                  drawNadiaSprite(ctx, 890, 350, 'left', 0, false, 'casual', 'happy');
                }
              });
            }
          } else if (chId === 'CH7_MILESTONES_2026') {
            const part = miscStateRef.current.ch7Part || 1;
            if (part === 1) {
              renderList.push({
                y: nadia.y,
                render: () => drawNadiaSprite(ctx, nadia.x, nadia.y, 'left', 0, false, 'blazer', 'happy')
              });
            } else if (part === 2) {
              renderList.push({
                y: nadia.y,
                render: () => drawNadiaSprite(ctx, nadia.x, nadia.y, 'left', 0, false, 'graduation', 'happy')
              });
            } else if (part === 3) {
              renderList.push({
                y: 380,
                render: () => drawNishaAndTupush(ctx, 680, 350)
              });
              renderList.push({
                y: nadia.y,
                render: () => drawNadiaSprite(ctx, nadia.x, nadia.y, 'right', 0, false, 'casual', 'happy')
              });
            }
          } else if (chId === 'CH8_BIRTHDAY_FINALE') {
            renderList.push({
              y: 375,
              render: () => drawBirthdayCake(ctx, 610, 335, miscStateRef.current.ch8CandlesBlown)
            });
            renderList.push({
              y: 395,
              render: () => drawNadiaSprite(ctx, 650, 370, 'left', 0, false, 'blazer', 'happy')
            });
            renderList.push({
              y: 390,
              render: () => drawMedhaSprite(ctx, 430, 365)
            });
            renderList.push({
              y: 390,
              render: () => drawVanshSprite(ctx, 740, 365)
            });
            renderList.push({
              y: 410,
              render: () => drawPionaSprite(ctx, 495, 385, 0, false, false)
            });
          }

          // Player Istiaque (when not in rickshaw)
          if (chId !== 'CH4_FLYOVER_2024' && !(st2.stage === 3 && st2.isRidingHome) && !(chId === 'CH5_HATIRJHEEL_2025' && miscStateRef.current.ch5Stage >= 3)) {
            renderList.push({
              y: player.y,
              render: () => {
                let held: 'handbag' | 'chips' | 'parcel' | undefined = undefined;
                if (chId === 'CH3_DELIVERY_2023' || chId === 'CH2_DELIVERY_2023') held = 'parcel';
                else if (chId === 'CH2_HANDBAG_2023' && st2.stage >= 1) held = 'handbag';
                else if (chId === 'CH5_HATIRJHEEL_2025' && miscStateRef.current.ch5ChipsPurchased) held = 'chips';

                const isGraduationOutfit = (chId === 'CH7_MILESTONES_2026' && miscStateRef.current.ch7Part === 2);
                drawIstiaqueSprite(
                  ctx,
                  player.x,
                  player.y,
                  player.direction,
                  player.frame,
                  player.isMoving,
                  'happy',
                  held,
                  isGraduationOutfit ? 'graduation' : 'normal'
                );

                // Visual Bag Thrust Arc when pushing commuters
                if (st2.stage === 4 && st2.bagThrust > 0) {
                  ctx.save();
                  ctx.strokeStyle = '#f43f5e';
                  ctx.lineWidth = 3.5;
                  ctx.beginPath();
                  const pushDir = player.direction === 'left' ? -1 : 1;
                  ctx.arc(player.x + pushDir * 22, player.y + 14, 25, -0.7, 0.7, pushDir < 0);
                  ctx.stroke();
                  ctx.restore();
                }
              }
            });
          }

          renderList.sort((a, b) => a.y - b.y);
          renderList.forEach(item => item.render());

          // Top Milestone Stage Pills for Chapter 7
          if (chId === 'CH7_MILESTONES_2026') {
            const part = miscStateRef.current.ch7Part || 1;
            const parts = [
              { num: 1, title: 'পর্ব ১: স্কলারশিপ ও আরএ' },
              { num: 2, title: 'পর্ব ২: সমাবর্তন ২০২৬' },
              { num: 3, title: 'পর্ব ৩: তপুশ ও পরিবার' }
            ];

            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.fillRect(CANVAS_WIDTH / 2 - 280, 16, 560, 36);
            ctx.strokeRect(CANVAS_WIDTH / 2 - 280, 16, 560, 36);

            parts.forEach((p, idx) => {
              const px = CANVAS_WIDTH / 2 - 250 + idx * 185;
              const isCurrent = p.num === part;
              const isDone = p.num < part;
              ctx.fillStyle = isCurrent ? '#fbbf24' : isDone ? '#34d399' : '#94a3b8';
              ctx.font = isCurrent ? 'bold 13px "Hind Siliguri", sans-serif' : '12px "Hind Siliguri", sans-serif';
              ctx.textAlign = 'left';
              ctx.fillText(`${isDone ? '✓ ' : ''}${p.title}${idx < 2 ? '  ➔' : ''}`, px, 39);
            });
            ctx.restore();
          }

          // Bottom Finale Action Cards for Chapter 8 (No walking needed!)
          if (chId === 'CH8_BIRTHDAY_FINALE' && !isDialogue) {
            const mst = miscStateRef.current;
            const buttons = [
              { key: '১', label: mst.ch8CandlesBlown ? '🎂 কেক ও মোমবাতি (সম্পন্ন)' : '🎂 মোমবাতি নেভাও ও উইশ করো', active: !mst.ch8CandlesBlown, x: 260 },
              { key: '২', label: '🎈 বন্ধুদের শুভেচ্ছা ও আড্ডা', active: !mst.ch8FriendsWished, x: 640 },
              { key: '৩', label: '💌 জন্মদিনের চিঠি ও ফিনালে', active: true, x: 1020 }
            ];

            buttons.forEach(btn => {
              ctx.save();
              ctx.fillStyle = btn.active ? 'rgba(15, 23, 42, 0.94)' : 'rgba(30, 41, 59, 0.8)';
              ctx.strokeStyle = btn.active ? '#f59e0b' : '#64748b';
              ctx.lineWidth = 2;
              const bw = 330;
              const bh = 44;
              const by = CANVAS_HEIGHT - 65;
              ctx.fillRect(btn.x - bw / 2, by, bw, bh);
              ctx.strokeRect(btn.x - bw / 2, by, bw, bh);

              ctx.fillStyle = btn.active ? '#fef08a' : '#94a3b8';
              ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(`[${btn.key} / ট্যাপ] ${btn.label}`, btn.x, by + 28);
              ctx.restore();
            });
          }

          // Standard interaction prompts in Bangla (for other chapters)
          if (chId !== 'CH8_BIRTHDAY_FINALE') {
            interactablesRef.current.forEach(obj => {
              const dist = Math.hypot(player.x - obj.x, player.y - obj.y);
              if (dist < 110 && !isDialogue && !(st2.stage === 3 && st2.isRidingHome)) {
                const promptY = obj.y - 45 + Math.sin(currentTime / 200) * 4;
                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;

                ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
                const txt = `[E / ট্যাপ] ${obj.promptText}`;
                const m = ctx.measureText(txt);
                const pad = 12;
                ctx.fillRect(obj.x - m.width / 2 - pad, promptY - 14, m.width + pad * 2, 28);
                ctx.strokeRect(obj.x - m.width / 2 - pad, promptY - 14, m.width + pad * 2, 28);

                ctx.fillStyle = '#38bdf8';
                ctx.textAlign = 'left';
                ctx.fillText(txt, obj.x - m.width / 2, promptY + 5);
                ctx.restore();
              }
            });
          }

          // Particles
          particlesRef.current.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12;
            p.life++;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
            if (p.rotation !== undefined && p.vRot) p.rotation += p.vRot;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            if (p.rotation) ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
            ctx.restore();

            if (p.life >= p.maxLife) {
              particlesRef.current.splice(idx, 1);
            }
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain pixelated cursor-crosshair select-none"
      />
    </div>
  );
};

// Render Detailed Pixel Environments
function renderSceneEnvironment(
  ctx: CanvasRenderingContext2D,
  chapterId: ChapterId,
  ch2State: { stage: number; isRidingHome: boolean; rideHomeX: number },
  ch4State: { flyoverProgress: number; rickshawX: number; rickshawY: number; speed: number; altitudeFeet?: number },
  miscState: { ch3DoorOpen: boolean; ch5ChipsPurchased: boolean; ch5Stage?: number },
  time: number
) {
  switch (chapterId) {
    case 'CH1_ENG101_2022': {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 240, CANVAS_WIDTH, CANVAS_HEIGHT - 240);
      ctx.fillStyle = '#451a03';
      for (let y = 240; y < CANVAS_HEIGHT; y += 40) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 2);
      }
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 240);

      ctx.fillStyle = '#14532d';
      ctx.fillRect(180, 40, 420, 150);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 8;
      ctx.strokeRect(180, 40, 420, 150);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillText('ENG101: রিটোরিক অ্যান্ড কম্পোজিশন', 200, 75);
      ctx.font = '13px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('• সেকশন ৪ · রুম ৩০৪', 200, 110);
      ctx.fillText('• প্রথম অ্যাসাইনমেন্ট জমা: শুক্রবার', 200, 135);
      ctx.fillText('• ইস্ট ওয়েস্ট ইউনিভার্সিটি', 200, 160);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(720, 40, 220, 140);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 6;
      ctx.strokeRect(720, 40, 220, 140);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(810, 140, 50, 0, Math.PI * 2);
      ctx.arc(860, 150, 45, 0, Math.PI * 2);
      ctx.fill();

      const deskRows = [
        { x: 220, y: 340 }, { x: 420, y: 340 }, { x: 620, y: 340 }, { x: 820, y: 340 },
        { x: 220, y: 480 }, { x: 420, y: 480 }, { x: 620, y: 480 }
      ];
      deskRows.forEach(d => {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(d.x, d.y, 85, 38);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(d.x + 8, d.y + 38, 8, 16);
        ctx.fillRect(d.x + 68, d.y + 38, 8, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(d.x + 20, d.y + 8, 20, 22);
      });

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1160, 220, 80, 160);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '13px "Hind Siliguri", sans-serif';
      ctx.fillText('ক্যাম্পাস গেট →', 1090, 200);
      break;
    }

    case 'CH2_HANDBAG_2023':
    case 'CH3_HANDBAG_2023': {
      // Sky & City Backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 360);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#93c5fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, 360);

      // Distant buildings
      ctx.fillStyle = '#64748b';
      for (let b = 0; b < 16; b++) {
        const bh = 70 + ((b * 41) % 80);
        ctx.fillRect(b * 80, 360 - bh, 75, bh);
      }

      // Main Road & Sidewalk
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 340, CANVAS_WIDTH, 20); // Curb
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 360, CANVAS_WIDTH, 360); // Asphalt road

      // Road dividing dashed lines
      ctx.fillStyle = '#ffffff';
      for (let x = 0; x < CANVAS_WIDTH; x += 90) {
        ctx.fillRect(x, 520, 45, 6);
      }

      // --- DETAILED BAG STALL (Where Nadia & Istiaque stand side by side) ---
      // Stall structure (x: 220 to 480, y: 190 to 380)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(220, 240, 260, 120); // Stall back wall & counter
      ctx.fillStyle = '#b45309';
      ctx.fillRect(230, 250, 240, 60); // Display cavity

      // Striped awning canopy
      for (let s = 0; s < 13; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#dc2626' : '#fef3c7';
        ctx.fillRect(210 + s * 22, 190, 22, 50);
        // Scalloped awning bottom
        ctx.beginPath();
        ctx.arc(221 + s * 22, 240, 11, 0, Math.PI);
        ctx.fill();
      }

      // Stall signboard
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(230, 175, 240, 24);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(230, 175, 240, 24);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
      ctx.fillText('ঢাকা বুটিক: লেডিস হ্যান্ডব্যাগ স্টল', 255, 191);

      // Shelves in stall
      ctx.fillStyle = '#92400e';
      ctx.fillRect(235, 275, 230, 6);
      ctx.fillRect(235, 305, 230, 6);

      // Displayed handbags on shelves
      const shelfBags = [
        { x: 245, y: 255, color: '#d97706' }, // tan satchel
        { x: 285, y: 255, color: '#047857' }, // olive tote
        { x: 420, y: 255, color: '#4338ca' }, // indigo clutch
        { x: 250, y: 285, color: '#7c3aed' }, // violet shoulder bag
        { x: 425, y: 285, color: '#0284c7' }  // sky handbag
      ];
      shelfBags.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, 24, 18);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(b.x + 8, b.y - 4, 8, 4); // handles
      });

      // CENTERPIECE LUXURY ROSE-RED HANDBAG (The chosen one!)
      ctx.save();
      // Spotlight glow behind featured bag
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.beginPath();
      ctx.arc(360, 280, 32, 0, Math.PI * 2);
      ctx.fill();

      // The rose-red handbag
      ctx.fillStyle = '#be185d';
      ctx.fillRect(342, 268, 36, 26);
      // Gold strap & lock
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(352, 260, 16, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(357, 278, 6, 6);

      // Glowing Price Tag: ৳২,৩৯০
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(336, 298, 48, 16);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(336, 298, 48, 16);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
      ctx.fillText('৳২,৩৯০', 342, 310);
      ctx.restore();

      // Stall wooden front counter
      ctx.fillStyle = '#78350f';
      ctx.fillRect(220, 318, 260, 42);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(220, 318, 260, 4);

      // Friendly Shopkeeper standing at stall
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(450, 280, 16, 16); // head
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(448, 278, 20, 6); // hair
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(446, 296, 24, 22); // shirt

      // Roadside Trees & Streetlamps
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(580, 290, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(576, 310, 8, 45);

      // Road navigation signage
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(630, 250, 160, 50);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(630, 250, 160, 50);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px "Hind Siliguri", sans-serif';
      ctx.fillText('← শপিং বুটিক স্টল', 645, 270);
      ctx.fillText('বাসায় ফেরার রিকশা ও বাস →', 638, 288);

      // --- REALISTIC, PROMINENT EAST WEST UNIVERSITY STUDENT BUS ---
      // (Directly on the road surface at x: 820 to 1250, y: 220 to 455)
      ctx.save();
      const busX = 820;
      const busY = 220;

      // Bus Headlight beams casting light on tarmac
      const lightGrad = ctx.createLinearGradient(busX, 390, busX - 180, 430);
      lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.moveTo(busX, 385);
      ctx.lineTo(busX - 180, 440);
      ctx.lineTo(busX - 180, 360);
      ctx.closePath();
      ctx.fill();

      // Bus Main Body (EWU Crimson Red)
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(busX, busY + 20, 430, 200);

      // Bus Roof rounded edge
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(busX + 10, busY, 410, 22);
      ctx.beginPath();
      ctx.arc(busX + 15, busY + 20, 15, Math.PI, Math.PI * 1.5);
      ctx.arc(busX + 415, busY + 20, 15, Math.PI * 1.5, Math.PI * 2);
      ctx.fill();

      // White university racing stripe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(busX, busY + 115, 430, 20);

      // Top Destination Board
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(busX + 60, busY + 10, 300, 22);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(busX + 60, busY + 10, 300, 22);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
      ctx.fillText('আফতাবনগর ⇄ ধানমন্ডি (শিক্ষার্থী স্পেশাল)', busX + 75, busY + 25);

      // Bold Bus Side Branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillText('ইস্ট ওয়েস্ট ইউনিভার্সিটি স্পেশাল বাস (EWU)', busX + 50, busY + 165);

      // Large Glass Passenger Windows with frames
      const winCols = [busX + 20, busX + 115, busX + 210, busX + 305];
      winCols.forEach(wx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(wx - 2, busY + 40, 84, 64); // window border
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(wx, busY + 42, 80, 60); // tinted glass

        // Student silhouettes seated inside!
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.arc(wx + 25, busY + 68, 12, 0, Math.PI * 2);
        ctx.arc(wx + 55, busY + 68, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(wx + 15, busY + 80, 20, 22);
        ctx.fillRect(wx + 45, busY + 80, 20, 22);
      });

      // Bus Front Windshield & Headlights
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(busX, busY + 42, 16, 60); // windshield edge
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(busX, busY + 180, 12, 18); // headlight
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(busX + 2, busY + 183, 8, 12);

      // OPEN BUS DOUBLE BOARDING DOORS (Where players enter at x: 1060 to 1125!)
      const doorX = busX + 250;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(doorX, busY + 60, 65, 160); // door opening cavity
      // Entry steps leading into bus
      ctx.fillStyle = '#334155';
      ctx.fillRect(doorX + 5, busY + 150, 55, 18);
      ctx.fillRect(doorX + 5, busY + 180, 55, 18);
      ctx.fillRect(doorX + 5, busY + 210, 55, 12);
      // Yellow hazard edge on bus boarding steps
      ctx.fillStyle = '#eab308';
      ctx.fillRect(doorX + 5, busY + 150, 55, 4);
      ctx.fillRect(doorX + 5, busY + 180, 55, 4);
      // Open door folding leaves on left and right
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(doorX - 8, busY + 60, 10, 160);
      ctx.fillRect(doorX + 63, busY + 60, 10, 160);
      // Chrome handrail at bus entrance
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(doorX + 50, busY + 100, 4, 110);

      // Bus Entrance Sign
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
      ctx.fillText('প্রবেশপথ ▲', doorX + 10, busY + 52);

      // BIG REALISTIC BUS WHEELS (Resting right on tarmac road!)
      const wheelCenters = [busX + 90, busX + 350];
      wheelCenters.forEach(wc => {
        // Wheel arch cut into bus body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(wc, busY + 220, 36, Math.PI, 0);
        ctx.fill();

        // Heavy duty black rubber tire
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(wc, busY + 220, 32, 0, Math.PI * 2);
        ctx.fill();

        // Silver steel rim
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(wc, busY + 220, 19, 0, Math.PI * 2);
        ctx.fill();

        // Chrome hubcap
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(wc, busY + 220, 9, 0, Math.PI * 2);
        ctx.fill();

        // Lug nuts
        ctx.fillStyle = '#334155';
        for (let l = 0; l < 6; l++) {
          const la = (l / 6) * Math.PI * 2;
          ctx.fillRect(wc + Math.cos(la) * 14 - 1.5, busY + 220 + Math.sin(la) * 14 - 1.5, 3, 3);
        }
      });

      // Bus Conductor / Helper waving at students
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(doorX + 78, busY + 120, 14, 14); // head
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(doorX + 76, busY + 134, 18, 22); // blue shirt
      ctx.fillStyle = '#334155';
      ctx.fillRect(doorX + 78, busY + 156, 14, 25); // pants

      ctx.restore();
      break;
    }

    case 'CH3_DELIVERY_2023':
    case 'CH2_DELIVERY_2023': {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 200);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 80, 300, 120);
      ctx.fillRect(100, 40, 180, 160);

      ctx.fillStyle = '#991b1b';
      ctx.fillRect(360, 140, 820, 220);
      ctx.fillStyle = '#7f1d1d';
      for (let by = 140; by < 360; by += 20) {
        ctx.fillRect(360, by, 820, 2);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(740, 200, 120, 180);

      if (miscState.ch3DoorOpen) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(745, 205, 110, 170);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(710, 205, 35, 170);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(740, 280, 4, 12);
      } else {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(745, 205, 110, 170);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(835, 290, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(865, 260, 8, 14);
      }

      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 360, CANVAS_WIDTH, 360);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 360, CANVAS_WIDTH, 6);
      break;
    }

    case 'CH4_FLYOVER_2024': {
      // CONTROLLABLE FLYOVER WITH PROMINENT RAMP & ELEVATED HIGHWAY!
      const progress = ch4State.flyoverProgress;

      // Dynamic Sky: transitions to breezy high-altitude blue
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#93c5fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, 420);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let c = 0; c < 5; c++) {
        const cx = (CANVAS_WIDTH + c * 280 - (time / 25) % (CANVAS_WIDTH + 300)) % CANVAS_WIDTH;
        ctx.beginPath();
        ctx.arc(cx, 80 + (c * 20) % 60, 35, 0, Math.PI * 2);
        ctx.arc(cx + 30, 75 + (c * 20) % 60, 45, 0, Math.PI * 2);
        ctx.arc(cx + 60, 80 + (c * 20) % 60, 35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant City Skyline (drops lower as you climb flyover!)
      const dropDown = progress >= 20 ? Math.min(100, (progress - 20) * 2.5) : 0;
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 20; i++) {
        const bh = 50 + ((i * 37) % 70);
        ctx.fillRect(i * 70, 320 - bh + dropDown, 65, bh);
      }

      // Flyover Bridge Deck & Sky Highway Environment
      if (progress < 8) {
        // Dramatic Ascending Ramp onto the Flyover!
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 360, CANVAS_WIDTH, 360);

        // Huge Overhead Highway Sign spanning across
        ctx.fillStyle = '#065f46';
        ctx.fillRect(520, 140, 480, 85);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(520, 140, 480, 85);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
        ctx.fillText('▲ কুড়িল ও মহাখালী এলিভেটেড ফ্লাইওভার', 550, 178);
        ctx.font = '14px "Hind Siliguri", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('সর্বোচ্চ উচ্চতা ৬০ ফুট · সোজা ওপরে উঠুন!', 620, 208);

        // Ascending flyover ramp with chevron hazard stripes
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(350, 460);
        ctx.lineTo(CANVAS_WIDTH, 310);
        ctx.lineTo(CANVAS_WIDTH, 420);
        ctx.lineTo(350, 520);
        ctx.fill();

        // Warning yellow hazard stripes on ramp edge
        ctx.fillStyle = '#eab308';
        for (let r = 0; r < 8; r++) {
          ctx.fillRect(400 + r * 100, 420 - r * 18, 35, 12);
        }

        // Giant bridge support pillars
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(750, 360, 55, 240);
        ctx.fillRect(1100, 310, 55, 290);
      } else {
        // High Elevated Flyover Highway in the sky!
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 280, CANVAS_WIDTH, 440);

        // Elevated Viaduct Concrete Bridge Edge
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 270, CANVAS_WIDTH, 14);

        // Steel Highway Guardrails / Crash Barriers
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 260, CANVAS_WIDTH, 12);
        ctx.fillStyle = '#ffffff';
        for (let bx = 0; bx < CANVAS_WIDTH; bx += 40) {
          ctx.fillRect(bx, 262, 16, 8);
        }

        // Distant City Skyline & Trees Far Below Between Pillars
        ctx.fillStyle = '#475569';
        for (let p = 0; p < 4; p++) {
          const px = (CANVAS_WIDTH + p * 360 - (time / 8) % (CANVAS_WIDTH + 400)) % CANVAS_WIDTH;
          ctx.fillRect(px, 500, 45, 220); // Bridge piers
        }

        // Modern Flyover Streetlights
        for (let l = 0; l < 4; l++) {
          const lx = (CANVAS_WIDTH + l * 340 - (time / 10) % (CANVAS_WIDTH + 400)) % CANVAS_WIDTH;
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(lx, 130, 10, 140);
          ctx.beginPath();
          ctx.arc(lx + 20, 130, 20, Math.PI, 0);
          ctx.stroke();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(lx + 15, 130, 14, 8);
        }

        // Overhead Green Highway Signboards Whizzing By
        const signX = (CANVAS_WIDTH + 400 - (time / 6) % (CANVAS_WIDTH + 700)) % (CANVAS_WIDTH + 400);
        if (signX > -300 && signX < CANVAS_WIDTH) {
          ctx.fillStyle = '#065f46';
          ctx.fillRect(signX, 100, 320, 60);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.strokeRect(signX, 100, 320, 60);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
          ctx.fillText('কুড়িল ফ্লাইওভার · মহাখালী ৩ কিমি', signX + 25, 128);
          ctx.font = '12px "Hind Siliguri", sans-serif';
          ctx.fillStyle = '#fef08a';
          ctx.fillText('এলিভেটেড এক্সপ্রেসওয়ে · উচ্চতা ৬০ ফুট', signX + 35, 148);
        }

        // Highway Yellow Dashed Lane Lines
        ctx.fillStyle = '#f59e0b';
        for (let x = (time / 3) % 100; x < CANVAS_WIDTH; x += 100) {
          ctx.fillRect(x, 430, 50, 8);
        }

        // Fast wind speed streaks across sky
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let w = 0; w < 14; w++) {
          const wx = (CANVAS_WIDTH + (w * 110) - (time / 1.2) % (CANVAS_WIDTH + 200)) % CANVAS_WIDTH;
          ctx.fillRect(wx, 150 + (w * 22) % 180, 70, 2.5);
        }
      }

      // Flyover Altitude, Speed & Progress HUD Indicator
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(40, 75, 310, 68);
      ctx.strokeRect(40, 75, 310, 68);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.fillText(`উচ্চতা: ${progress < 8 ? '২৫ ফুট' : '৬০ ফুট (আকাশের ওপরে!)'}`, 55, 98);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px "Hind Siliguri", sans-serif';
      ctx.fillText(`গতি: ${Math.floor(ch4State.speed * 4.2)} কিমি/ঘণ্টা · ফ্লাইওভার পারাপার`, 55, 118);

      // Progress bar
      ctx.fillStyle = '#334155';
      ctx.fillRect(55, 125, 275, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(55, 125, (275 * progress) / 100, 10);

      // On-Screen Bottom Control Hint Bar for Chapter 4
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(CANVAS_WIDTH / 2 - 270, CANVAS_HEIGHT - 48, 540, 32);
      ctx.strokeRect(CANVAS_WIDTH / 2 - 270, CANVAS_HEIGHT - 48, 540, 32);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
      ctx.fillText('[W / S: লেন পরিবর্তন · A / D: ডানে-বামে · SPACE: প্যাডেল বুস্ট ও বেল]', CANVAS_WIDTH / 2 - 245, CANVAS_HEIGHT - 28);

      ctx.restore();
      break;
    }

    case 'CH5_HATIRJHEEL_2025': {
      if (miscState.ch5Stage && miscState.ch5Stage >= 3) {
        // --- STAGE 3: RUNNING RICKSHAW ON ILLUMINATED HATIRJHEEL ROAD ---
        // Deep starry midnight sky
        const nightGrad = ctx.createLinearGradient(0, 0, 0, 260);
        nightGrad.addColorStop(0, '#020617');
        nightGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = nightGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, 260);

        // Twinkling night stars
        ctx.fillStyle = '#f8fafc';
        for (let s = 0; s < 45; s++) {
          const sx = (s * 41 + 13) % CANVAS_WIDTH;
          const sy = (s * 29 + 7) % 180;
          const sparkle = Math.sin(time / 250 + s) * 0.5 + 0.5;
          ctx.globalAlpha = 0.4 + sparkle * 0.6;
          ctx.fillRect(sx, sy, s % 3 === 0 ? 3 : 2, s % 3 === 0 ? 3 : 2);
        }
        ctx.globalAlpha = 1.0;

        // Distant illuminated Dhaka skyline across the lake
        ctx.fillStyle = '#1e293b';
        for (let b = 0; b < 24; b++) {
          const bh = 40 + ((b * 31) % 65);
          ctx.fillRect(b * 55, 230 - bh, 48, bh);
          // Glowing apartment windows
          if (b % 2 === 0) {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(b * 55 + 12, 230 - bh + 15, 6, 8);
            ctx.fillRect(b * 55 + 26, 230 - bh + 25, 6, 8);
            ctx.fillStyle = '#1e293b';
          }
        }

        // --- GLOWING HATIRJHEEL BRIDGE NEON ARCHES ---
        // Main cyan arch
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(640, 240, 320, Math.PI, 0);
        ctx.stroke();

        // Secondary magenta/pink neon arch
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(640, 240, 280, Math.PI, 0);
        ctx.stroke();

        // Bridge vertical neon suspension cables
        for (let a = 0; a < 18; a++) {
          const ang = Math.PI + (a / 17) * Math.PI;
          const lx = 640 + Math.cos(ang) * 320;
          const ly = 240 + Math.sin(ang) * 320;

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, 240);
          ctx.stroke();

          // Glowing neon bulbs
          ctx.fillStyle = a % 2 === 0 ? '#fef08a' : '#38bdf8';
          ctx.fillRect(lx - 3, ly - 3, 6, 6);
        }

        // --- HATIRJHEEL LAKE WATER WITH ANIMATED REFLECTIONS ---
        const waterGrad = ctx.createLinearGradient(0, 230, 0, 350);
        waterGrad.addColorStop(0, '#0284c7');
        waterGrad.addColorStop(1, '#082f49');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, 230, CANVAS_WIDTH, 120);

        // Water ripples & neon reflections
        for (let r = 0; r < 24; r++) {
          const rx = (r * 65 + (time / 15)) % CANVAS_WIDTH;
          const ry = 245 + (r * 8) % 95;
          ctx.fillStyle = r % 3 === 0 ? 'rgba(56, 189, 248, 0.4)' : r % 3 === 1 ? 'rgba(244, 63, 94, 0.35)' : 'rgba(254, 240, 138, 0.3)';
          ctx.fillRect(rx, ry, 50 + (r % 4) * 15, 3);
        }

        // Lakeside promenade railing
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, 345, CANVAS_WIDTH, 6);
        for (let p = 0; p < CANVAS_WIDTH; p += 40) {
          ctx.fillRect(p, 345, 6, 15);
        }

        // Wide Asphalt Road for the Rickshaw Ride
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 360, CANVAS_WIDTH, 360);

        // Moving Yellow Lane Markers (shows rickshaw running along the road!)
        ctx.fillStyle = '#f59e0b';
        const markerOffset = (time / 2.5) % 110;
        for (let x = -100; x < CANVAS_WIDTH + 100; x += 110) {
          ctx.fillRect(x - markerOffset, 510, 55, 8);
        }

        // Modern streetlights casting pools of light
        for (let l = 0; l < 4; l++) {
          const lx = (l * 380 - (time / 6) % 400 + 400) % CANVAS_WIDTH;
          // Pole
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(lx, 260, 8, 100);
          ctx.beginPath();
          ctx.arc(lx + 15, 260, 16, Math.PI, 0);
          ctx.stroke();

          // Lamp glow cone
          ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
          ctx.beginPath();
          ctx.moveTo(lx + 15, 260);
          ctx.lineTo(lx - 50, 430);
          ctx.lineTo(lx + 80, 430);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.fillRect(lx + 10, 260, 12, 6);
        }

        // Overhead Promenade Neon Signboard
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(CANVAS_WIDTH / 2 - 210, 60, 420, 40);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(CANVAS_WIDTH / 2 - 210, 60, 420, 40);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.fillText('★ হাতিরঝিল লেক ড্রাইভওয়ে (Hatirjheel Promenade) ★', CANVAS_WIDTH / 2 - 190, 85);
      } else {
        // --- STAGE 0-2: STREET WITH TONG SHOP (Istiaque buying chips) ---
        // Twilight sky
        const duskGrad = ctx.createLinearGradient(0, 0, 0, 360);
        duskGrad.addColorStop(0, '#0369a1');
        duskGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = duskGrad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, 360);

        // Distant trees & streetlights
        ctx.fillStyle = '#15803d';
        for (let t = 0; t < 8; t++) {
          ctx.beginPath();
          ctx.arc(80 + t * 160, 310, 35, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sidewalk & Road
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 340, CANVAS_WIDTH, 20); // Curb
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 360, CANVAS_WIDTH, 360); // Road

        // Static dashed lines
        ctx.fillStyle = '#ffffff';
        for (let x = 0; x < CANVAS_WIDTH; x += 90) {
          ctx.fillRect(x, 520, 45, 6);
        }

        // Navigation sign
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(180, 260, 180, 50);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(180, 260, 180, 50);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '11px "Hind Siliguri", sans-serif';
        ctx.fillText('← রিকশা স্ট্যান্ড (নাদিয়া ও মামা)', 190, 280);
        ctx.fillText('টং মামার চিপসের দোকান →', 205, 298);

        // --- AUTHENTIC TONG TEA & CHIPS STALL (x: 560 to 760, y: 240 to 360) ---
        // Tin roof awning
        ctx.fillStyle = '#64748b';
        ctx.fillRect(550, 220, 200, 35);
        ctx.fillStyle = '#334155';
        for (let tr = 550; tr < 750; tr += 15) {
          ctx.fillRect(tr, 220, 3, 35); // corrugated roof ridges
        }

        // Wooden stall walls & counter
        ctx.fillStyle = '#78350f';
        ctx.fillRect(560, 255, 180, 95);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(570, 265, 160, 45); // inner shelf

        // Stall Signboard
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(565, 200, 170, 22);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(565, 200, 170, 22);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
        ctx.fillText('টং মামার গরম চা ও চিপস স্টল', 575, 215);

        // Hanging strings of colorful chips packets!
        const chipColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
        for (let str = 0; str < 4; str++) {
          const sx = 580 + str * 35;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx + 8, 245);
          ctx.lineTo(sx + 8, 290);
          ctx.stroke();

          // 2 packets per string
          ctx.fillStyle = chipColors[str];
          ctx.fillRect(sx, 252, 16, 18);
          ctx.fillRect(sx, 274, 16, 18);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(sx + 3, 256, 10, 4);
          ctx.fillRect(sx + 3, 278, 10, 4);
        }

        // Steaming tea kettle on burner
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(705, 280, 16, 14); // kettle body
        ctx.fillRect(718, 276, 6, 6); // spout
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(708, 274, 10, 3); // lid

        // Steam wisps
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const steam = (time / 80) % 15;
        ctx.fillRect(722, 270 - steam, 3, 4);

        // Glass cookie jars & bananas
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(575, 305, 12, 10); // banana bunch
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(690, 300, 12, 16); // cookie jar

        // Tong Counter front
        ctx.fillStyle = '#451a03';
        ctx.fillRect(560, 316, 180, 34);

        // Tong Mama sprite standing behind counter
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(645, 268, 16, 16); // head
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(643, 265, 20, 6); // hair
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(641, 284, 24, 24); // red lungi-clad shirt
        // White gamcha
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(643, 282, 20, 4);
      }
      break;
    }

    case 'CH6_RESTAURANT_2025': {
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 260);
      ctx.fillStyle = '#991b1b';
      for (let y = 0; y < 260; y += 30) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 4);
      }

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillText('★ স্পেশাল বিরিয়ানি ও গ্রিল ফেস্ট ★', 440, 60);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 260, CANVAS_WIDTH, 460);
      ctx.fillStyle = '#0f172a';
      for (let cy = 260; cy < CANVAS_HEIGHT; cy += 40) {
        for (let cx = 0; cx < CANVAS_WIDTH; cx += 80) {
          if ((cy / 40) % 2 === 0) {
            ctx.fillRect(cx, cy, 40, 40);
          } else {
            ctx.fillRect(cx + 40, cy, 40, 40);
          }
        }
      }

      ctx.fillStyle = '#b45309';
      ctx.fillRect(720, 380, 240, 90);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(730, 375, 220, 20);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(780, 385, 25, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(880, 385, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(768, 380, 24, 7);
      ctx.fillRect(868, 380, 24, 7);
      break;
    }

    case 'CH7_MILESTONES_2026': {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 260, CANVAS_WIDTH, 460);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, 20, 360, 240);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(40, 60, 320, 160);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillText('২০২৫: স্কলারশিপ অর্জন ও সাধনা', 60, 50);

      ctx.fillStyle = '#14532d';
      ctx.fillRect(440, 20, 400, 240);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
      ctx.fillText('কনভোকেশন ২০২৬', 550, 60);
      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillText('★ ইস্ট ওয়েস্ট ইউনিভার্সিটি সমাবর্তন ★', 500, 90);

      ctx.fillStyle = '#312e81';
      ctx.fillRect(900, 20, 360, 240);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillText('২০২৬: পরিবারে নতুন অতিথি তপুশ', 940, 50);

      ctx.fillStyle = '#b45309';
      ctx.fillRect(1080, 320, 90, 60);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(1090, 310, 70, 20);
      break;
    }

    case 'CH8_BIRTHDAY_FINALE': {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 260);

      ctx.fillStyle = '#e11d48';
      ctx.fillRect(240, 30, 800, 70);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.strokeRect(240, 30, 800, 70);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
      ctx.fillText('★ শুভ জন্মদিন, নাদিয়া! ★', 430, 75);

      for (let l = 0; l < 40; l++) {
        const lx = 40 + l * 30;
        const ly = 120 + Math.sin(l * 0.5) * 20;
        const lightColors = ['#f43f5e', '#38bdf8', '#fbbf24', '#34d399', '#c084fc'];
        ctx.fillStyle = lightColors[l % lightColors.length];
        ctx.beginPath();
        ctx.arc(lx, ly, 4 + Math.sin(time / 200 + l) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 260, CANVAS_WIDTH, 460);
      ctx.fillStyle = '#78350f';
      for (let y = 260; y < CANVAS_HEIGHT; y += 30) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 2);
      }

      const pedestals = [
        { x: 160, label: 'ENG101' },
        { x: 280, label: 'হ্যান্ডব্যাগ' },
        { x: 380, label: 'পার্সেল' },
        { x: 920, label: 'হাতিরঝিল' },
        { x: 1040, label: 'গ্র্যাজুয়েশন' },
        { x: 1140, label: 'তপুশ' }
      ];
      pedestals.forEach(p => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(p.x, 260, 60, 45);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px "Hind Siliguri", sans-serif';
        ctx.fillText(p.label, p.x - 5, 250);
      });

      ctx.fillStyle = '#b45309';
      ctx.fillRect(520, 370, 240, 70);
      ctx.fillStyle = '#be123c';
      ctx.fillRect(510, 365, 260, 16);
      break;
    }
  }
}
