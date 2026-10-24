/**
 * Chapter Definitions & Scenario Data for "Nadia's Birthday Adventure"
 */

import { ChapterId, DialogueLine, InteractableObject } from '../types/game';

export interface SceneConfig {
  id: ChapterId;
  year: string;
  title: string;
  locationName: string;
  objective: string;
  bgType: 'classroom' | 'delivery_street' | 'handbag_shop' | 'flyover' | 'hatirjheel' | 'restaurant' | 'milestones' | 'birthday_hall';
  playerStartX: number;
  playerStartY: number;
  playerHoldingItem?: 'handbag' | 'chips' | 'parcel';
  musicTheme: string;
  initialDialogue?: DialogueLine[];
  memoryId: string;
}

export const CHAPTER_CONFIGS: Record<ChapterId, SceneConfig> = {
  CH1_ENG101_2022: {
    id: 'CH1_ENG101_2022',
    year: '২০২২',
    title: 'শুরুর গল্প: ENG101',
    locationName: 'ইস্ট ওয়েস্ট ইউনিভার্সিটি ক্যাম্পাস',
    objective: 'ENG101 ক্লাসরুমে ঘুরে নাদিয়ার সাথে কথা বলো।',
    bgType: 'classroom',
    playerStartX: 120,
    playerStartY: 440,
    musicTheme: 'campus',
    memoryId: 'mem_1_eng101',
    initialDialogue: [
      {
        speaker: 'narrator',
        speakerName: 'ফল ২০২২',
        text: 'ইস্ট ওয়েস্ট ইউনিভার্সিটিতে প্রথম সেমিস্টার। রুম ৩০৪: ENG101।',
        emotion: 'neutral'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'নতুন সেমিস্টার, নতুন সব মুখ। দেখি কে কোথায় বসেছে...',
        emotion: 'neutral'
      }
    ]
  },

  CH2_HANDBAG_2023: {
    id: 'CH2_HANDBAG_2023',
    year: '২০২৩',
    title: 'ব্যাগ, শেষ ১১০ টাকা ও রিকশায় ফেরা',
    locationName: 'ধানমন্ডি বুটিক ও রিকশা রোড',
    objective: 'ব্যাগ স্টল থেকে সুন্দর ব্যাগটি পছন্দ করো ও কেনো!',
    bgType: 'handbag_shop',
    playerStartX: 330,
    playerStartY: 410,
    musicTheme: 'rush',
    memoryId: 'mem_2_handbag',
    initialDialogue: [
      {
        speaker: 'nadia',
        speakerName: 'নাদিয়া',
        text: 'ইশতিয়াক, এই ব্যাগ স্টলটা দেখো! এই লালচে ব্যাগটা কী চমৎকার, এটা আমাদের নিতেই হবে!',
        emotion: 'happy'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'আমাদের পকেটের সব জমানো টাকা শেষ হয়ে যাবে... দেখি ব্যাগ কিনে কত টাকা বাঁচে!',
        emotion: 'thinking'
      }
    ]
  },

  CH3_DELIVERY_2023: {
    id: 'CH3_DELIVERY_2023',
    year: '২০২৩',
    title: 'গোপন ডেলিভারি মিশন',
    locationName: 'নাদিয়ার বাসার দরজা',
    objective: 'ধরা না পড়ে খাবার পার্সেলটি নাদিয়ার কাছে পৌঁছে দাও!',
    bgType: 'delivery_street',
    playerStartX: 140,
    playerStartY: 460,
    playerHoldingItem: 'parcel',
    musicTheme: 'stealth',
    memoryId: 'mem_3_delivery',
    initialDialogue: [
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'নাদিয়া বলেছে ওর নাকি বাসায় বসে ভীষণ ক্ষুধা লাগছে। এবার হবে আন্ডারকভার ডেলিভারি মিশন!',
        emotion: 'happy'
      },
      {
        speaker: 'narrator',
        speakerName: 'মিশন',
        text: 'নাদিয়ার বাসার দরজায় এগিয়ে গিয়ে নক করো এবং পার্সেলটি ডেলিভার করো।',
        emotion: 'neutral'
      }
    ]
  },

  CH4_FLYOVER_2024: {
    id: 'CH4_FLYOVER_2024',
    year: '২০২৪',
    title: 'উড়ন্ত রিকশা: ফ্লাইওভারের চক্কর',
    locationName: 'ঢাকার ফ্লাইওভারের ওপর',
    objective: 'রিকশা ড্রাইভ করে ফ্লাইওভারের ওপরে ওঠো এবং নিরাপদে চালিয়ে যাও!',
    bgType: 'flyover',
    playerStartX: 180,
    playerStartY: 460,
    musicTheme: 'rush',
    memoryId: 'mem_4_flyover',
    initialDialogue: [
      {
        speaker: 'nadia',
        speakerName: 'নাদিয়া',
        text: 'মামা, রিকশা কি ফ্লাইওভারের ওপর দিয়ে নিয়ে যাওয়া যাবে?',
        emotion: 'happy'
      },
      {
        speaker: 'driver',
        speakerName: 'রিকশাচালক মামা',
        text: 'আরে আপা, সবাই যায়! সোজা ফ্লাইওভারেই টান মারমু!',
        emotion: 'neutral'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'মামাআআ! রিকশা তো আকাশে ওড়ার জিনিস না! ফ্লাইওভারে কেন?!',
        emotion: 'panicking'
      }
    ]
  },

  CH5_HATIRJHEEL_2025: {
    id: 'CH5_HATIRJHEEL_2025',
    year: '২০২৫',
    title: 'চিপস ও হাতিরঝিলের অপ্রত্যাশিত চক্কর',
    locationName: 'ঢাকা রোড ও হাতিরঝিল',
    objective: 'টংয়ের দোকানে গিয়ে চিপস কিনে আনো!',
    bgType: 'hatirjheel',
    playerStartX: 280,
    playerStartY: 440,
    musicTheme: 'hatirjheel',
    memoryId: 'mem_5_hatirjheel',
    initialDialogue: [
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'মামা, একটু দাঁড়ান, আমি টং থেকে চিপস কিনে আনছি!',
        emotion: 'neutral'
      },
      {
        speaker: 'nadia',
        speakerName: 'নাদিয়া',
        text: 'যাও যাও, ভালো চিপস নিয়ে আসো!',
        emotion: 'happy'
      }
    ]
  },

  CH6_RESTAURANT_2025: {
    id: 'CH6_RESTAURANT_2025',
    year: '২০২৫',
    title: 'পিওনার রেস্টুরেন্ট ড্রামা',
    locationName: 'রেস্টুরেন্ট, ঢাকা',
    objective: 'পিওনার কান্না থামাও, নাদিয়ার বকা হজম করো এবং একসাথে বিরিয়ানি খাও!',
    bgType: 'restaurant',
    playerStartX: 160,
    playerStartY: 440,
    musicTheme: 'restaurant',
    memoryId: 'mem_6_restaurant',
    initialDialogue: [
      {
        speaker: 'piona',
        speakerName: 'পিওনা',
        text: 'ওয়াআআআ! তোমরা দুইজন বেতন পাইছো আর আমারে রেস্টুরেন্টে খাওয়াবা না?!',
        emotion: 'crying'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'পিওনা, আস্তে! আশপাশের সব মানুষ তাকিয়ে দেখতেছে তো!',
        emotion: 'panicking'
      },
      {
        speaker: 'nadia',
        speakerName: 'নাদিয়া',
        text: 'পিওনা, নাটক বন্ধ কর! আর ইশতিয়াক, তুমি হাসা বন্ধ কর! দুইজনই একদম চুপ!',
        emotion: 'scolding'
      }
    ]
  },

  CH7_MILESTONES_2026: {
    id: 'CH7_MILESTONES_2026',
    year: '২০২৫–২০২৬',
    title: 'স্কলারশিপ, গ্র্যাজুয়েশন এবং তপুশ',
    locationName: 'বিশ্ববিদ্যালয় ও পরিবার',
    objective: 'পর্ব ১/৩: নাদিয়ার স্কলারশিপের দারুণ অর্জন সেলিব্রেট করো!',
    bgType: 'milestones',
    playerStartX: 580,
    playerStartY: 390,
    musicTheme: 'graduation',
    memoryId: 'mem_7_milestones',
    initialDialogue: [
      {
        speaker: 'nadia',
        speakerName: 'নাদিয়া',
        text: 'ইশতিয়াক! তুই বিশ্বাস করবি না, স্কলারশিপের কনফার্মেশন মেইলটা ফাইনালি এসে গেছে রে!',
        emotion: 'happy'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'কী বলিস দোস্ত?! ওয়াও কংগ্রাটস! এত মাসের নির্ঘুম রাত আর খাটনি অবশেষে সার্থক হইলো! আজকের মিষ্টি কিন্তু তোর খাওয়ানো লাগবে!',
        emotion: 'happy'
      },
      {
        speaker: 'nadia',
        speakerName: 'নাদিয়া',
        text: 'হাহাহা অবশ্যই! তুই আর বন্ধুরা পাশে না থাকলে তো ডেডলাইনের আগেই হাল ছেড়ে দিতাম রে!',
        emotion: 'happy'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'চল তাহলে! লেটারটা দেখি আর ধামাকা সেলিব্রেশন করি!',
        emotion: 'happy'
      }
    ]
  },

  CH8_BIRTHDAY_FINALE: {
    id: 'CH8_BIRTHDAY_FINALE',
    year: '১৮ নভেম্বর',
    title: 'শুভ জন্মদিন, নাদিয়া!',
    locationName: 'জন্মদিনের জমকালো আয়োজন',
    objective: 'নাদিয়াকে জন্মদিনের সেরা শুভেচ্ছা জানাও, মোমবাতি নেভাও এবং বন্ধুদের সাথে আনন্দ করো!',
    bgType: 'birthday_hall',
    playerStartX: 570,
    playerStartY: 395,
    musicTheme: 'birthday',
    memoryId: 'mem_8_birthday',
    initialDialogue: [
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'শুভ জন্মদিন, নাদিয়া! 🎉🎂 Happy Birthday!',
        emotion: 'happy'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: '২০২২ সালের সেই প্রথম ক্লাসের দিন থেকে শুরু করে—মিরপুরের ভিড়ে ব্যাগ দিয়ে গুঁতো মেরে পথ বানানো, পার্সেল ডেলিভারির মিশন, ফ্লাইওভারের সেই পাগল করা রিকশা রাইড, আর হাতিরঝিলে চিপস খেতে খেতে রাত পার করা... প্রতিটা দিন তোর বন্ধুত্বেই সেরা ছিল!',
        emotion: 'happy'
      },
      {
        speaker: 'istiaque',
        speakerName: 'ইশতিয়াক',
        text: 'তুই সবসময় এভাবে প্রাণ খুলে হাসিস। তুই অনেক পরিশ্রমী আর অসাধারণ একজন মানুষ। জীবনের সব স্বপ্ন, সব বড় বড় ইচ্ছা যেন সহজে ছুঁতে পারিস!',
        emotion: 'happy'
      },
      {
        speaker: 'nadia',
        speakerName: 'নাদিয়া',
        text: 'ইশতিয়াক... থ্যাংক ইউ সো মাচ! সত্যি বলছি, তোদের মতো বন্ধু পাশে না থাকলে আমার এই চারটা বছর কখনো এতটা সুন্দর আর স্পেশাল হতো না!',
        emotion: 'happy'
      },
      {
        speaker: 'medha',
        speakerName: 'মেধা',
        text: 'হ্যাপি বার্থডে নাদিয়া! এবার জলদি মোমবাতি নেভাও আর কেক কাটো!',
        emotion: 'happy'
      },
      {
        speaker: 'vansh',
        speakerName: 'ভাংশ',
        text: 'আজ সারারাত জমিয়ে সেলিব্রেশন হবে! শুভ জন্মদিন দোস্ত!',
        emotion: 'happy'
      },
      {
        speaker: 'piona',
        speakerName: 'পিওনা',
        text: 'আর আমি কিন্তু কেকের সবচেয়ে বড় চকলেটের টুকরাটা খাবো, হাহাহা!',
        emotion: 'happy'
      }
    ]
  },
  CH2_DELIVERY_2023: null as unknown as SceneConfig, // alias assigned below
  CH3_HANDBAG_2023: null as unknown as SceneConfig   // alias assigned below
};

CHAPTER_CONFIGS.CH2_DELIVERY_2023 = CHAPTER_CONFIGS.CH3_DELIVERY_2023;
CHAPTER_CONFIGS.CH3_HANDBAG_2023 = CHAPTER_CONFIGS.CH2_HANDBAG_2023;

