import { ChapterId, GameSettings, MemoryItem } from '../types/game';

const SAVE_KEY = 'nadias_birthday_adventure_save_v1';
const SETTINGS_KEY = 'nadias_birthday_adventure_settings_v1';

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_1_eng101',
    chapterId: 'CH1_ENG101_2022',
    year: '২০২২',
    title: 'শুরুর গল্প: ENG101',
    subtitle: 'ইস্ট ওয়েস্ট ইউনিভার্সিটি ক্যাম্পাস',
    description: 'যেখানে ২০২২ সালে ENG101 ক্লাসে প্রথম দেখা হয়েছিল ইশতিয়াক ও নাদিয়ার। এক সাধারণ ক্লাস থেকে তৈরি হওয়া অসাধারণ বন্ধুত্বের সূচনা।',
    keepsakeName: 'ENG101 কম্পোজিশন নোটবুক',
    unlocked: false,
    iconType: 'classroom',
    quote: '“আমরা দুইজনই একই রুটে যাই, একসাথে রওনা দেব?”'
  },
  {
    id: 'mem_2_handbag',
    chapterId: 'CH2_HANDBAG_2023',
    year: '২০২৩',
    title: 'ব্যাগ, শেষ ১১০ টাকা ও রিকশায় ফেরা',
    subtitle: 'ধানমন্ডি বুটিক ও রিকশা রোড',
    description: 'পকেটের প্রায় সব টাকা দিয়ে ব্যাগ কেনা হলো, অবশিষ্ট রইল মাত্র ১১০ টাকা! মামার সাথে দরদাম করে রিকশায় বাড়ি ফেরা এবং সেই ব্যাগ দিয়ে বাসের ভিড় ঠেলে ওঠার স্মৃতি।',
    keepsakeName: 'কিংবদন্তি শিল্ড ব্যাগ',
    unlocked: false,
    iconType: 'handbag',
    quote: '“পকেটে বাকি মাত্র ১১০ টাকা। রিকশায় রাজকীয় ফেরা আর বাসের ভিড় কাটার ব্যাগ!”'
  },
  {
    id: 'mem_3_delivery',
    chapterId: 'CH3_DELIVERY_2023',
    year: '২০২৩',
    title: 'গোপন ডেলিভারি মিশন',
    subtitle: 'নাদিয়ার বাসার দরজা',
    description: 'নাদিয়ার ক্ষুধা লাগলে ইশতিয়াক ডেলিভারি বয় সেজে ওর বাসায় পার্সেল নিয়ে যায়। আন্টি দরজা খুললেও ধরা না পড়ে সফলভাবে পার্সেল পৌঁছে দেওয়ার সেই স্মৃতি!',
    keepsakeName: 'গোপন ফুড ডেলিভারি পার্সেল',
    unlocked: false,
    iconType: 'parcel',
    quote: '“আন্টি দরজা খুলেছিলেন, কিন্তু ইশতিয়াক ধরা পড়েনি। নাদিয়া পেয়েছিল ওর খাবার!”'
  },
  {
    id: 'mem_4_flyover',
    chapterId: 'CH4_FLYOVER_2024',
    year: '২০২৪',
    title: 'উড়ন্ত রিকশা: ফ্লাইওভারের চক্কর',
    subtitle: 'ঢাকার আকাশছোঁয়া ফ্লাইওভার',
    description: 'রিকশায় চড়ে সোজা ফ্লাইওভারের ওপরে ওঠা। ইশতিয়াকের ভয়ে রিকশার রড আঁকড়ে ধরা, আর নাদিয়ার আশ্চর্য শান্ত হয়ে ফুরফুরে বাতাসের আনন্দ নেওয়া!',
    keepsakeName: 'ফ্লাইওভার রিকশার কাঁসার বেল',
    unlocked: false,
    iconType: 'flyover',
    quote: '“৬০ ফুট ওপরে ইশতিয়াকের জীবনের ভয়, আর নাদিয়ার মুখে রাজ্যের প্রশান্তি।”'
  },
  {
    id: 'mem_5_hatirjheel',
    chapterId: 'CH5_HATIRJHEEL_2025',
    year: '২০২৫',
    title: 'চিপস ও হাতিরঝিলের অপ্রত্যাশিত চক্কর',
    subtitle: 'হাতিরঝিল লেকপাড়',
    description: 'ইশতিয়াক নেমেছিল ৩০ সেকেন্ডের জন্য চিপস কিনতে। ফিরে এসে দেখে নাদিয়া মামাকে পটিয়ে রিকশা হাতিরঝিলের দিকে ঘুরিয়ে দিয়েছে! রাতের ঝলমলে লেকপাড়ে চিপস খাওয়া আর আনন্দ।',
    keepsakeName: 'মুচমুচে আলুর চিপস প্যাকেট',
    unlocked: false,
    iconType: 'chips',
    quote: '“চিপস কিনতে গিয়ে সোজা হাতিরঝিলের নৈসর্গিক ট্যুর!”'
  },
  {
    id: 'mem_6_restaurant',
    chapterId: 'CH6_RESTAURANT_2025',
    year: '২০২৫',
    title: 'পিওনার রেস্টুরেন্ট ড্রামা',
    subtitle: 'ঢাকার রেস্টুরেন্ট',
    description: 'বেতন পাওয়ার পর নাদিয়ার বোন পিওনার রেস্টুরেন্টে খাওয়ার জন্য নাটকীয় কান্নাকাটি। নাদিয়ার বকাঝকা এবং শেষমেশ জমিয়ে ভূরিভোজ!',
    keepsakeName: 'রেস্টুরেন্টের স্পেশাল বিরিয়ানি প্ল্যাটার',
    unlocked: false,
    iconType: 'restaurant',
    quote: '“পিওনার খাবার চাওয়ার কান্না, নাদিয়ার গম্ভীর বকা, আর শেষে সবার মহাভোজ!”'
  },
  {
    id: 'mem_7_milestones',
    chapterId: 'CH7_MILESTONES_2026',
    year: '২০২৫–২০২৬',
    title: 'স্কলারশিপ, গ্র্যাজুয়েশন এবং তপুশ',
    subtitle: 'ক্যাম্পাস ও পারিবারিক অর্জন',
    description: 'কঠোর পরিশ্রমে নাদিয়ার স্কলারশিপ অর্জন। ২০২৬ সালে দুজনের একসাথে সমাবর্তন ও গ্র্যাজুয়েশন। বোন নিশার কোল আলো করে আসা ফুটফুটে তপুশ এবং রিসার্চ অ্যাসিস্ট্যান্ট হিসেবে নাদিয়ার কর্মজীবন শুরু।',
    keepsakeName: 'কনভোকেশন ক্যাপ ও রিসার্চার ব্যাজ',
    unlocked: false,
    iconType: 'graduation',
    quote: '“মেধা, পরিশ্রম, পরিবারে নতুন অতিথির আগমন আর উজ্জ্বল ভবিষ্যৎ।”'
  },
  {
    id: 'mem_8_birthday',
    chapterId: 'CH8_BIRTHDAY_FINALE',
    year: '১৮ নভেম্বর',
    title: 'শুভ জন্মদিন, নাদিয়া!',
    subtitle: '২০২২ থেকে ২০২৬-এর বন্ধুত্বের গল্প',
    description: 'নাদিয়া, ইশতিয়াক, কাছের বন্ধু মেধা ও ভাংশ, এবং ছোট বোন পিওনা। পুরোনো সব স্মৃতির পাতা উল্টে সামনে আরও হাজারো নতুন অ্যাডভেঞ্চারের প্রত্যাশা।',
    keepsakeName: 'জন্মদিনের কেক ও ফ্রেন্ডশিপ স্ক্র্যাপবুক',
    unlocked: false,
    iconType: 'cake',
    quote: '“একই মানুষ। একই পাগলামি। সামনে আরও অনেক স্মৃতি। শুভ জন্মদিন, নাদিয়া!”'
  }
];

export interface SaveData {
  currentChapterId: ChapterId;
  highestChapterIndex: number;
  unlockedMemories: string[];
  lastSavedAt: number;
}

export const CHAPTER_SEQUENCE: ChapterId[] = [
  'CH1_ENG101_2022',
  'CH2_HANDBAG_2023',
  'CH3_DELIVERY_2023',
  'CH4_FLYOVER_2024',
  'CH5_HATIRJHEEL_2025',
  'CH6_RESTAURANT_2025',
  'CH7_MILESTONES_2026',
  'CH8_BIRTHDAY_FINALE'
];

export function loadGameSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let chId: ChapterId = parsed.currentChapterId || 'CH1_ENG101_2022';
      // Normalize legacy IDs
      if (chId === 'CH2_DELIVERY_2023') chId = 'CH3_DELIVERY_2023';
      if (chId === 'CH3_HANDBAG_2023') chId = 'CH2_HANDBAG_2023';

      return {
        currentChapterId: chId,
        highestChapterIndex: parsed.highestChapterIndex ?? 0,
        unlockedMemories: parsed.unlockedMemories || [],
        lastSavedAt: parsed.lastSavedAt || Date.now()
      };
    }
  } catch {}

  return {
    currentChapterId: 'CH1_ENG101_2022',
    highestChapterIndex: 0,
    unlockedMemories: [],
    lastSavedAt: Date.now()
  };
}

export function saveGameProgress(chapterId: ChapterId, memoryToUnlock?: string) {
  try {
    const prev = loadGameSave();
    const chapterIdx = CHAPTER_SEQUENCE.indexOf(chapterId);
    const newHighest = Math.max(prev.highestChapterIndex, chapterIdx);

    const memorySet = new Set(prev.unlockedMemories);
    if (memoryToUnlock) {
      memorySet.add(memoryToUnlock);
    }

    const data: SaveData = {
      currentChapterId: chapterId,
      highestChapterIndex: newHighest,
      unlockedMemories: Array.from(memorySet),
      lastSavedAt: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {}
}

export function resetGameSave(): SaveData {
  const initial: SaveData = {
    currentChapterId: 'CH1_ENG101_2022',
    highestChapterIndex: 0,
    unlockedMemories: [],
    lastSavedAt: Date.now()
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(initial));
  return initial;
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  musicMuted: false,
  sfxMuted: false,
  scanlines: true,
  touchControls: true,
  birthdayDate: 'November 18'
};

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveGameSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
