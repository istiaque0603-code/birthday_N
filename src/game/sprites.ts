/**
 * Procedural Pixel-Art Sprite Renderer for "Nadia's Birthday Adventure"
 * Generates high-fidelity retro sprites, portraits, and environmental props.
 */

import { Emotion, SpeakerId } from '../types/game';

// Color Palette Constants
export const PALETTE = {
  // Skin tones
  SKIN_LIGHT: '#ffd1b3',
  SKIN_MED: '#f4b896',
  SKIN_SHADOW: '#d99b79',
  SKIN_WARM: '#eab690',
  
  // Nadia's Palette
  NADIA_HAIR: '#1a181b',
  NADIA_HAIR_HIGHLIGHT: '#353038',
  NADIA_BLAZER: '#111317',
  NADIA_BLAZER_SHADOW: '#08090b',
  NADIA_SHIRT: '#ffffff',
  NADIA_SHIRT_SHADOW: '#e2e8f0',
  NADIA_TEAL_SWEATER: '#0d9488',
  NADIA_TEAL_SHADOW: '#0f766e',
  NADIA_LIP: '#e17070',

  // Istiaque's Palette
  ISTIAQUE_HAIR: '#262626',
  ISTIAQUE_HAIR_LIGHT: '#3f3f46',
  ISTIAQUE_JACKET: '#1e3a8a',
  ISTIAQUE_JACKET_SHADOW: '#172554',
  ISTIAQUE_SHIRT: '#f8fafc',
  ISTIAQUE_PANTS: '#475569',
  ISTIAQUE_SHOES: '#0f172a',

  // Mother
  MOTHER_SARI: '#991b1b',
  MOTHER_SARI_GOLD: '#f59e0b',
  MOTHER_HAIR: '#27272a',

  // Piona
  PIONA_HAIR: '#451a03',
  PIONA_DRESS: '#f43f5e',
  PIONA_DRESS_LIGHT: '#fb7185',

  // Medha & Vansh
  MEDHA_DRESS: '#7c3aed',
  MEDHA_HAIR: '#1c1917',
  VANSH_JACKET: '#059669',
  VANSH_HAIR: '#292524',

  // Nisha & Tupush
  NISHA_DRESS: '#d97706',
  TUPUSH_BLANKET: '#38bdf8',
  TUPUSH_SKIN: '#fed7aa',

  // Rickshaw
  RICKSHAW_HOOD_YELLOW: '#eab308',
  RICKSHAW_HOOD_RED: '#dc2626',
  RICKSHAW_FRAME: '#0284c7',
  RICKSHAW_WHEEL: '#475569',
  DRIVER_LUNGI: '#0284c7',
  DRIVER_GAMCHA: '#ef4444',

  // Birthday Party
  CAKE_FROSTING: '#fdf2f8',
  CAKE_CHOCOLATE: '#78350f',
  CAKE_BERRY: '#ec4899',
  CANDLE_GOLD: '#fbbf24',
  FLAME_ORANGE: '#f97316',
  FLAME_YELLOW: '#fef08a'
};

// Offscreen canvas cache to ensure fast 60fps rendering
const spriteCache = new Map<string, HTMLCanvasElement>();

function getOrCreateCanvas(key: string, width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  if (spriteCache.has(key)) {
    return spriteCache.get(key)!;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx);
  spriteCache.set(key, canvas);
  return canvas;
}

// Draw a single pixel block
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/**
 * Draw Nadia character sprite (32x48 base grid)
 */
export function drawNadiaSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'down' | 'up' | 'left' | 'right',
  frame: number,
  isMoving: boolean,
  outfit: 'blazer' | 'casual' | 'graduation' = 'blazer',
  emotion: Emotion = 'neutral'
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  const bob = isMoving ? (frame % 2 === 0 ? -2 : 0) : Math.sin(Date.now() / 400) * 1;
  const legOffset = isMoving ? (frame % 4 < 2 ? -2 : 2) : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(16, 46, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // LEGS / SHOES
  const shoeColor = PALETTE.NADIA_BLAZER;
  if (direction === 'up') {
    px(ctx, 11 + legOffset, 39, 4, 7, PALETTE.SKIN_SHADOW);
    px(ctx, 17 - legOffset, 39, 4, 7, PALETTE.SKIN_SHADOW);
    px(ctx, 10 + legOffset, 44, 5, 3, shoeColor);
    px(ctx, 17 - legOffset, 44, 5, 3, shoeColor);
  } else {
    px(ctx, 11 + legOffset, 39, 4, 6, outfit === 'blazer' ? PALETTE.NADIA_BLAZER : PALETTE.SKIN_LIGHT);
    px(ctx, 17 - legOffset, 39, 4, 6, outfit === 'blazer' ? PALETTE.NADIA_BLAZER : PALETTE.SKIN_LIGHT);
    px(ctx, 10 + legOffset, 44, 5, 3, shoeColor);
    px(ctx, 17 - legOffset, 44, 5, 3, shoeColor);
  }

  // TORSO / BODY (with bob)
  const bodyY = 22 + bob;

  if (outfit === 'blazer') {
    // Sharp Black Blazer with White Shirt (matching reference photo!)
    px(ctx, 9, bodyY, 14, 18, PALETTE.NADIA_BLAZER);
    px(ctx, 8, bodyY + 2, 2, 12, PALETTE.NADIA_BLAZER_SHADOW); // left arm
    px(ctx, 22, bodyY + 2, 2, 12, PALETTE.NADIA_BLAZER_SHADOW); // right arm

    if (direction !== 'up') {
      // White shirt collar V-neck
      px(ctx, 14, bodyY, 4, 9, PALETTE.NADIA_SHIRT);
      px(ctx, 13, bodyY, 2, 4, PALETTE.NADIA_SHIRT_SHADOW);
      px(ctx, 17, bodyY, 2, 4, PALETTE.NADIA_SHIRT_SHADOW);
      // Blazer Lapels
      px(ctx, 11, bodyY + 1, 3, 10, PALETTE.NADIA_BLAZER);
      px(ctx, 18, bodyY + 1, 3, 10, PALETTE.NADIA_BLAZER);
      // Blazer single button
      px(ctx, 15, bodyY + 11, 2, 2, '#4b5563');
    }
  } else if (outfit === 'graduation') {
    // Academic gown
    px(ctx, 8, bodyY, 16, 20, '#09090b');
    // Gold & Cyan stole
    px(ctx, 12, bodyY, 3, 16, '#0284c7');
    px(ctx, 17, bodyY, 3, 16, '#f59e0b');
  } else {
    // Casual university teal top & skirt
    px(ctx, 10, bodyY, 12, 11, PALETTE.NADIA_TEAL_SWEATER);
    px(ctx, 9, bodyY + 11, 14, 7, '#334155'); // skirt
    px(ctx, 14, bodyY, 4, 3, PALETTE.NADIA_SHIRT); // collar
  }

  // HEAD & HAIR (with bob)
  const headY = 6 + bob;

  if (direction === 'up') {
    // Head from back: center-parted long hair cascading down
    px(ctx, 9, headY, 14, 16, PALETTE.NADIA_HAIR);
    // Long hair down back
    px(ctx, 7, headY + 6, 18, 18, PALETTE.NADIA_HAIR);
    px(ctx, 8, headY + 24, 16, 6, PALETTE.NADIA_HAIR);
    // Subtle hair shine
    px(ctx, 11, headY + 8, 3, 12, PALETTE.NADIA_HAIR_HIGHLIGHT);
    px(ctx, 18, headY + 8, 3, 12, PALETTE.NADIA_HAIR_HIGHLIGHT);
  } else {
    // FACE
    px(ctx, 10, headY + 4, 12, 12, PALETTE.SKIN_LIGHT);
    px(ctx, 11, headY + 15, 10, 2, PALETTE.SKIN_SHADOW); // chin shadow
    px(ctx, 14, headY + 16, 4, 4, PALETTE.SKIN_LIGHT); // neck

    // HAIR: Center-parted long straight hair
    px(ctx, 8, headY, 16, 6, PALETTE.NADIA_HAIR); // top crown
    // Center parting slit
    px(ctx, 15, headY, 2, 4, PALETTE.NADIA_HAIR_HIGHLIGHT);
    // Left & right hair curtains framing face
    px(ctx, 7, headY + 4, 4, 18, PALETTE.NADIA_HAIR);
    px(ctx, 21, headY + 4, 4, 18, PALETTE.NADIA_HAIR);
    // Lower cascading ends
    px(ctx, 8, headY + 22, 4, 7, PALETTE.NADIA_HAIR);
    px(ctx, 20, headY + 22, 4, 7, PALETTE.NADIA_HAIR);

    // EYES & EXPRESSION
    if (emotion === 'calm') {
      // Serene closed-eye zen curve (on flyover ride)
      px(ctx, 11, headY + 8, 3, 1, '#1e293b');
      px(ctx, 18, headY + 8, 3, 1, '#1e293b');
      px(ctx, 14, headY + 12, 4, 1, PALETTE.NADIA_LIP); // calm smile
    } else if (emotion === 'surprised') {
      // Wide open eyes
      px(ctx, 11, headY + 7, 3, 4, '#ffffff');
      px(ctx, 12, headY + 8, 2, 2, '#1e293b');
      px(ctx, 18, headY + 7, 3, 4, '#ffffff');
      px(ctx, 18, headY + 8, 2, 2, '#1e293b');
      px(ctx, 14, headY + 12, 4, 3, PALETTE.NADIA_LIP); // 'O' mouth
    } else if (emotion === 'scolding') {
      // Scolding furrowed eyebrows
      px(ctx, 11, headY + 6, 4, 2, '#1e293b');
      px(ctx, 17, headY + 6, 4, 2, '#1e293b');
      px(ctx, 12, headY + 8, 2, 2, '#1e293b');
      px(ctx, 18, headY + 8, 2, 2, '#1e293b');
      px(ctx, 14, headY + 12, 4, 2, PALETTE.NADIA_LIP);
    } else {
      // Natural gentle eyes with highlight (as in photo)
      px(ctx, 11, headY + 8, 3, 2, '#1e293b');
      px(ctx, 13, headY + 7, 1, 1, '#ffffff'); // shine
      px(ctx, 18, headY + 8, 3, 2, '#1e293b');
      px(ctx, 20, headY + 7, 1, 1, '#ffffff'); // shine
      // Subtle gentle smile
      px(ctx, 14, headY + 12, 4, 2, PALETTE.NADIA_LIP);
      // Soft cheeks blush
      px(ctx, 10, headY + 10, 2, 2, '#fda4af');
      px(ctx, 20, headY + 10, 2, 2, '#fda4af');
    }

    // Graduation Mortarboard cap if graduation outfit
    if (outfit === 'graduation') {
      px(ctx, 6, headY - 4, 20, 4, '#09090b');
      px(ctx, 10, headY - 8, 12, 4, '#18181b');
      px(ctx, 15, headY - 8, 2, 2, '#f59e0b');
      px(ctx, 17, headY - 6, 1, 8, '#f59e0b'); // golden tassel
    }
  }

  ctx.restore();
}

/**
 * Draw Istiaque character sprite (controllable player, 32x48 base grid)
 */
export function drawIstiaqueSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'down' | 'up' | 'left' | 'right' = 'down',
  frame: number = 0,
  isMoving: boolean = false,
  emotion: Emotion = 'neutral',
  holdingItem?: 'handbag' | 'chips' | 'parcel',
  outfit?: 'normal' | 'graduation'
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  const bob = isMoving ? (frame % 2 === 0 ? -2 : 0) : Math.sin(Date.now() / 400) * 1;
  const legOffset = isMoving ? (frame % 4 < 2 ? -2 : 2) : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(16, 46, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // LEGS / SHOES
  px(ctx, 11 + legOffset, 38, 4, 7, outfit === 'graduation' ? '#09090b' : PALETTE.ISTIAQUE_PANTS);
  px(ctx, 17 - legOffset, 38, 4, 7, outfit === 'graduation' ? '#09090b' : PALETTE.ISTIAQUE_PANTS);
  px(ctx, 10 + legOffset, 44, 5, 3, PALETTE.ISTIAQUE_SHOES);
  px(ctx, 17 - legOffset, 44, 5, 3, PALETTE.ISTIAQUE_SHOES);

  // TORSO / JACKET OR GRADUATION GOWN
  const bodyY = 22 + bob;
  if (outfit === 'graduation') {
    // Black graduation gown with gold stole
    px(ctx, 8, bodyY - 1, 16, 19, '#09090b');
    px(ctx, 6, bodyY + 1, 3, 14, '#18181b'); // robe sleeve
    px(ctx, 23, bodyY + 1, 3, 14, '#18181b');
    if (direction !== 'up') {
      // Golden university stole
      px(ctx, 11, bodyY, 3, 16, '#f59e0b');
      px(ctx, 18, bodyY, 3, 16, '#f59e0b');
      px(ctx, 14, bodyY, 4, 4, '#dc2626'); // red EWU crest ribbon
    }
  } else {
    px(ctx, 9, bodyY, 14, 17, PALETTE.ISTIAQUE_JACKET);
    px(ctx, 7, bodyY + 2, 3, 11, PALETTE.ISTIAQUE_JACKET_SHADOW); // arms
    px(ctx, 22, bodyY + 2, 3, 11, PALETTE.ISTIAQUE_JACKET_SHADOW);

    if (direction !== 'up') {
      // Inner shirt
      px(ctx, 14, bodyY + 2, 4, 10, PALETTE.ISTIAQUE_SHIRT);
    }
  }

  // HELD ITEMS
  if (holdingItem === 'handbag') {
    // The famous handbag being carried proudly!
    px(ctx, 21, bodyY + 6, 9, 8, '#be185d'); // stylish rose-red bag
    px(ctx, 23, bodyY + 2, 5, 4, '#f59e0b'); // gold handles
    px(ctx, 24, bodyY + 9, 3, 2, '#fbbf24'); // buckle
  } else if (holdingItem === 'chips') {
    // Crunchy chips packet
    px(ctx, 22, bodyY + 5, 7, 9, '#ef4444');
    px(ctx, 23, bodyY + 7, 5, 4, '#fbbf24');
  } else if (holdingItem === 'parcel') {
    // Delivery brown parcel box
    px(ctx, 11, bodyY + 6, 10, 9, '#b45309');
    px(ctx, 15, bodyY + 6, 2, 9, '#fef08a'); // tape
  }

  // HEAD
  const headY = 6 + bob;

  if (direction === 'up') {
    // Back of head
    px(ctx, 10, headY, 12, 15, PALETTE.ISTIAQUE_HAIR);
    px(ctx, 9, headY + 1, 14, 6, PALETTE.ISTIAQUE_HAIR);
  } else {
    // Face
    px(ctx, 10, headY + 4, 12, 12, PALETTE.SKIN_WARM);
    px(ctx, 13, headY + 16, 6, 3, PALETTE.SKIN_SHADOW); // neck

    // Hair
    px(ctx, 9, headY, 14, 6, PALETTE.ISTIAQUE_HAIR);
    px(ctx, 8, headY + 2, 3, 8, PALETTE.ISTIAQUE_HAIR);
    px(ctx, 21, headY + 2, 3, 6, PALETTE.ISTIAQUE_HAIR);
    px(ctx, 12, headY + 1, 5, 2, PALETTE.ISTIAQUE_HAIR_LIGHT); // shine

    // EYES & EMOTION
    if (emotion === 'panicking') {
      // Exaggerated sweat-drop panic eyes
      px(ctx, 11, headY + 7, 3, 4, '#ffffff');
      px(ctx, 12, headY + 8, 2, 2, '#1e293b');
      px(ctx, 18, headY + 7, 3, 4, '#ffffff');
      px(ctx, 18, headY + 8, 2, 2, '#1e293b');
      // Screaming open mouth
      px(ctx, 13, headY + 12, 6, 4, '#991b1b');
      px(ctx, 14, headY + 13, 4, 2, '#ffffff'); // teeth
      // Flying sweat drops
      px(ctx, 6, headY + 2, 3, 4, '#38bdf8');
      px(ctx, 23, headY + 1, 3, 4, '#38bdf8');
    } else if (emotion === 'happy') {
      px(ctx, 11, headY + 8, 3, 2, '#1e293b');
      px(ctx, 18, headY + 8, 3, 2, '#1e293b');
      px(ctx, 13, headY + 12, 6, 3, '#1e293b');
      px(ctx, 14, headY + 12, 4, 2, '#ffffff');
    } else {
      px(ctx, 11, headY + 8, 3, 2, '#1e293b');
      px(ctx, 18, headY + 8, 3, 2, '#1e293b');
      px(ctx, 14, headY + 13, 4, 1, '#1e293b');
    }

    // Graduation Mortarboard cap if graduation outfit
    if (outfit === 'graduation') {
      px(ctx, 6, headY - 4, 20, 4, '#09090b');
      px(ctx, 10, headY - 8, 12, 4, '#18181b');
      px(ctx, 15, headY - 8, 2, 2, '#f59e0b');
      px(ctx, 17, headY - 6, 1, 8, '#f59e0b'); // golden tassel
    }
  }

  ctx.restore();
}

/**
 * Draw Nadia's Mother Sprite (appears in 2023 Delivery Scene)
 */
export function drawMotherSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  emotion: Emotion = 'neutral'
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(16, 46, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red & Gold Sari
  px(ctx, 8, 20, 16, 26, PALETTE.MOTHER_SARI);
  px(ctx, 7, 24, 4, 14, PALETTE.MOTHER_SARI);
  px(ctx, 21, 24, 4, 14, PALETTE.MOTHER_SARI);
  // Gold sari border (Aanchal)
  px(ctx, 10, 20, 4, 25, PALETTE.MOTHER_SARI_GOLD);
  px(ctx, 14, 43, 10, 3, PALETTE.MOTHER_SARI_GOLD);

  // Face & Hair
  px(ctx, 10, 8, 12, 12, PALETTE.SKIN_WARM);
  px(ctx, 9, 5, 14, 6, PALETTE.MOTHER_HAIR);
  px(ctx, 8, 8, 3, 8, PALETTE.MOTHER_HAIR);
  px(ctx, 21, 8, 3, 8, PALETTE.MOTHER_HAIR);
  px(ctx, 13, 3, 6, 4, PALETTE.MOTHER_HAIR); // bun

  // Eyes & Gold Bindi
  px(ctx, 15, 8, 2, 2, '#b91c1c'); // Red bindi
  px(ctx, 12, 11, 2, 2, '#18181b');
  px(ctx, 18, 11, 2, 2, '#18181b');
  // Gentle motherly smile
  px(ctx, 14, 15, 4, 2, '#991b1b');

  ctx.restore();
}

/**
 * Draw Piona Sprite (Sister, appears in 2025 Restaurant & 2026 Birthday Finale)
 */
export function drawPionaSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  isCrying: boolean = false,
  isEating: boolean = false
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(14, 42, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const bob = isCrying ? Math.sin(Date.now() / 80) * 3 : 0;
  const bodyY = 18 + bob;

  // Pink outfit
  px(ctx, 8, bodyY, 12, 16, PALETTE.PIONA_DRESS);
  px(ctx, 6, bodyY + 12, 16, 7, PALETTE.PIONA_DRESS_LIGHT);

  // Legs
  px(ctx, 9, 36, 3, 6, PALETTE.SKIN_LIGHT);
  px(ctx, 16, 36, 3, 6, PALETTE.SKIN_LIGHT);
  px(ctx, 8, 41, 5, 3, '#9d174d');
  px(ctx, 15, 41, 5, 3, '#9d174d');

  // Head
  const headY = 4 + bob;
  px(ctx, 9, headY + 4, 10, 10, PALETTE.SKIN_LIGHT);
  px(ctx, 8, headY, 12, 5, PALETTE.PIONA_HAIR);
  px(ctx, 6, headY + 3, 4, 8, PALETTE.PIONA_HAIR); // twin bunches
  px(ctx, 18, headY + 3, 4, 8, PALETTE.PIONA_HAIR);

  if (isCrying) {
    // Comedic dramatic anime waterfall tears!
    px(ctx, 10, headY + 7, 2, 2, '#1e293b');
    px(ctx, 16, headY + 7, 2, 2, '#1e293b');
    px(ctx, 11, headY + 10, 6, 4, '#be123c'); // open wailing mouth
    // Tear streams
    const streamLen = 10 + Math.sin(Date.now() / 100) * 4;
    px(ctx, 3, headY + 7, Math.floor(streamLen), 3, '#38bdf8');
    px(ctx, 18, headY + 7, Math.floor(streamLen), 3, '#38bdf8');
  } else if (isEating) {
    // Super happy eating face
    px(ctx, 10, headY + 7, 2, 1, '#1e293b');
    px(ctx, 16, headY + 7, 2, 1, '#1e293b');
    px(ctx, 12, headY + 9, 4, 2, '#be123c'); // happy chew
    // Biryani plate in hands
    px(ctx, 8, bodyY + 6, 12, 5, '#fef08a');
    px(ctx, 10, bodyY + 5, 8, 3, '#d97706'); // spices
  } else {
    px(ctx, 10, headY + 7, 2, 2, '#1e293b');
    px(ctx, 16, headY + 7, 2, 2, '#1e293b');
    px(ctx, 12, headY + 11, 4, 2, '#be123c');
  }

  ctx.restore();
}

/**
 * Draw Medha Sprite (Best Friend in Chapter 8 Finale)
 */
export function drawMedhaSprite(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(14, 46, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Purple stylish party gown
  px(ctx, 8, 20, 14, 24, PALETTE.MEDHA_DRESS);
  px(ctx, 10, 43, 4, 3, '#4c1d95');
  px(ctx, 16, 43, 4, 3, '#4c1d95');

  // Head & Stylish Glasses
  px(ctx, 9, 8, 12, 12, PALETTE.SKIN_LIGHT);
  px(ctx, 8, 4, 14, 6, PALETTE.MEDHA_HAIR);
  px(ctx, 7, 7, 3, 14, PALETTE.MEDHA_HAIR);
  px(ctx, 20, 7, 3, 14, PALETTE.MEDHA_HAIR);

  // Red/Gold Frame Glasses
  px(ctx, 10, 10, 4, 4, '#b45309');
  px(ctx, 16, 10, 4, 4, '#b45309');
  px(ctx, 11, 11, 2, 2, '#1e293b');
  px(ctx, 17, 11, 2, 2, '#1e293b');
  px(ctx, 14, 11, 2, 1, '#b45309'); // bridge
  px(ctx, 13, 16, 4, 2, '#be185d');

  ctx.restore();
}

/**
 * Draw Vansh Sprite (Best Friend - Girl - in Chapter 8 Finale)
 */
export function drawVanshSprite(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(14, 46, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Emerald blazer & chic pants
  px(ctx, 8, 20, 14, 15, PALETTE.VANSH_JACKET);
  px(ctx, 12, 22, 6, 8, '#ffffff'); // inner tee
  px(ctx, 9, 35, 4, 8, '#1e293b'); // pants
  px(ctx, 17, 35, 4, 8, '#1e293b');
  px(ctx, 8, 43, 5, 3, '#0f172a');
  px(ctx, 17, 43, 5, 3, '#0f172a');

  // Head & Short Bob Hair
  px(ctx, 9, 8, 12, 12, PALETTE.SKIN_LIGHT);
  px(ctx, 8, 4, 14, 6, PALETTE.VANSH_HAIR);
  px(ctx, 7, 8, 3, 7, PALETTE.VANSH_HAIR);
  px(ctx, 20, 8, 3, 7, PALETTE.VANSH_HAIR);

  // Energetic friendly smile
  px(ctx, 11, 12, 2, 2, '#1e293b');
  px(ctx, 17, 12, 2, 2, '#1e293b');
  px(ctx, 13, 15, 4, 2, '#e11d48');

  ctx.restore();
}

/**
 * Draw Nisha & Baby Tupush Sprite (2026 Chapter)
 */
export function drawNishaAndTupush(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(18, 46, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nisha
  px(ctx, 8, 20, 16, 24, PALETTE.NISHA_DRESS);
  px(ctx, 9, 8, 12, 12, PALETTE.SKIN_WARM);
  px(ctx, 8, 4, 14, 6, '#1c1917');
  px(ctx, 7, 7, 3, 14, '#1c1917');
  px(ctx, 11, 12, 2, 2, '#1c1917');
  px(ctx, 17, 12, 2, 2, '#1c1917');
  px(ctx, 13, 16, 4, 2, '#dc2626');

  // Baby Tupush in swaddle arms!
  px(ctx, 16, 24, 12, 14, PALETTE.TUPUSH_BLANKET);
  px(ctx, 18, 22, 8, 8, PALETTE.TUPUSH_SKIN); // baby head
  px(ctx, 20, 24, 2, 1, '#1c1917'); // sleeping baby eyes
  px(ctx, 24, 24, 2, 1, '#1c1917');
  px(ctx, 22, 26, 2, 2, '#f43f5e'); // pacifier

  ctx.restore();
}

/**
 * Draw Dhaka Cycle Rickshaw
 */
export function drawRickshaw(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  includeDriver = true,
  scale = 1,
  wheelRotation = 0
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.scale(scale, scale);

  // Rickshaw Body & Wheels
  // Back wheels
  ctx.fillStyle = PALETTE.RICKSHAW_WHEEL;
  ctx.beginPath();
  ctx.arc(14, 40, 14, 0, Math.PI * 2);
  ctx.arc(66, 40, 14, 0, Math.PI * 2);
  ctx.fill();

  // Wheel spokes
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  [14, 66].forEach(wx => {
    ctx.beginPath();
    ctx.moveTo(wx + Math.cos(wheelRotation) * 12, 40 + Math.sin(wheelRotation) * 12);
    ctx.lineTo(wx - Math.cos(wheelRotation) * 12, 40 - Math.sin(wheelRotation) * 12);
    ctx.moveTo(wx + Math.cos(wheelRotation + Math.PI / 2) * 12, 40 + Math.sin(wheelRotation + Math.PI / 2) * 12);
    ctx.lineTo(wx - Math.cos(wheelRotation + Math.PI / 2) * 12, 40 - Math.sin(wheelRotation + Math.PI / 2) * 12);
    ctx.stroke();
  });

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(14, 40, 4, 0, Math.PI * 2);
  ctx.arc(66, 40, 4, 0, Math.PI * 2);
  ctx.fill();

  // Decorated Passenger Seat & Hood
  px(ctx, 22, 22, 40, 14, '#b91c1c'); // red cushioned bench
  px(ctx, 18, 12, 44, 12, PALETTE.RICKSHAW_HOOD_YELLOW); // colorful canopy
  px(ctx, 16, 8, 40, 6, PALETTE.RICKSHAW_HOOD_RED);
  // Brass bells & art plate
  px(ctx, 28, 34, 28, 6, '#0284c7');

  if (includeDriver) {
    // Cycle Frame & Front Wheel
    ctx.fillStyle = PALETTE.RICKSHAW_WHEEL;
    ctx.beginPath();
    ctx.arc(94, 42, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(94 + Math.cos(wheelRotation) * 10, 42 + Math.sin(wheelRotation) * 10);
    ctx.lineTo(94 - Math.cos(wheelRotation) * 10, 42 - Math.sin(wheelRotation) * 10);
    ctx.stroke();

    // Driver (Mama)
    const bob = Math.sin(Date.now() / 150) * 2;
    px(ctx, 74, 16 + bob, 10, 14, '#15803d'); // green shirt
    px(ctx, 72, 30, 12, 10, PALETTE.DRIVER_LUNGI); // lungi
    px(ctx, 76, 8 + bob, 8, 8, PALETTE.SKIN_WARM); // head
    px(ctx, 74, 6 + bob, 10, 3, '#27272a'); // hair
    px(ctx, 74, 14 + bob, 10, 3, PALETTE.DRIVER_GAMCHA); // red gamcha around neck
    px(ctx, 88, 22, 4, 12, '#94a3b8'); // handlebar
  }

  ctx.restore();
}

/**
 * Draw Rickshaw with Nadia & Istiaque seated inside heading home!
 */
export function drawRickshawWithPassengers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1.2,
  wheelRotation = 0,
  hasHandbag = true
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.scale(scale, scale);

  // Rickshaw base
  drawRickshaw(ctx, 0, 0, true, 1, wheelRotation);

  // Passengers seated on the passenger bench
  // Nadia (left seat)
  drawNadiaSprite(ctx, 16, 2, 'down', 0, false, 'casual', 'happy');

  // Istiaque (right seat)
  drawIstiaqueSprite(ctx, 36, 2, 'down', 0, false, 'happy');

  // Nadia holding the handbag proudly on her lap!
  if (hasHandbag) {
    px(ctx, 28, 22, 10, 8, '#be185d'); // stylish rose-red handbag
    px(ctx, 30, 18, 6, 4, '#f59e0b'); // gold handles
    px(ctx, 32, 24, 2, 2, '#fbbf24'); // gold lock
  }

  ctx.restore();
}

/**
 * Draw 3-Tier Birthday Cake with Animated Flickering Candles
 */
export function drawBirthdayCake(ctx: CanvasRenderingContext2D, x: number, y: number, candlesBlown: boolean = false) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Plate
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(32, 44, 32, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bottom tier
  px(ctx, 12, 28, 40, 14, PALETTE.CAKE_CHOCOLATE);
  px(ctx, 12, 26, 40, 4, PALETTE.CAKE_FROSTING);
  // Strawberries
  px(ctx, 16, 24, 4, 3, PALETTE.CAKE_BERRY);
  px(ctx, 26, 24, 4, 3, PALETTE.CAKE_BERRY);
  px(ctx, 36, 24, 4, 3, PALETTE.CAKE_BERRY);
  px(ctx, 44, 24, 4, 3, PALETTE.CAKE_BERRY);

  // Top tier
  px(ctx, 20, 16, 24, 10, '#fbcfe8');
  px(ctx, 20, 14, 24, 3, PALETTE.CAKE_FROSTING);

  // Candles
  const candlePositions = [24, 31, 38];
  candlePositions.forEach((cx, idx) => {
    px(ctx, cx, 8, 3, 6, PALETTE.CANDLE_GOLD);
    px(ctx, cx + 1, 6, 1, 2, '#475569'); // wick

    if (!candlesBlown) {
      // Flickering flame
      const flicker = Math.sin(Date.now() / 100 + idx * 2) * 1.5;
      px(ctx, cx - 1 + flicker, 2, 5, 4, PALETTE.FLAME_ORANGE);
      px(ctx, cx + flicker, 3, 3, 2, PALETTE.FLAME_YELLOW);
    } else {
      // Smoke wisps
      const smokeOffset = (Date.now() / 80) % 8;
      px(ctx, cx + 1, 4 - smokeOffset, 2, 2, 'rgba(203, 213, 225, 0.6)');
    }
  });

  ctx.restore();
}

/**
 * Generate Dialogue Character Portrait (80x80 crisp canvas scaled in UI)
 */
export function getSpeakerPortraitCanvas(speaker: SpeakerId, emotion: Emotion = 'neutral'): HTMLCanvasElement {
  const cacheKey = `portrait_${speaker}_${emotion}`;
  return getOrCreateCanvas(cacheKey, 80, 80, (ctx) => {
    // Rich gradient background for portrait frame
    const grad = ctx.createLinearGradient(0, 0, 80, 80);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 80, 80);

    // Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 78, 78);

    ctx.save();
    ctx.scale(1.8, 1.8);
    ctx.translate(6, 4);

    switch (speaker) {
      case 'nadia':
        drawNadiaSprite(ctx, 0, 0, 'down', 0, false, 'blazer', emotion);
        break;
      case 'istiaque':
        drawIstiaqueSprite(ctx, 0, 0, 'down', 0, false, emotion);
        break;
      case 'mother':
        drawMotherSprite(ctx, 0, 0, 0, emotion);
        break;
      case 'piona':
        drawPionaSprite(ctx, 0, 0, 0, emotion === 'crying', emotion === 'happy');
        break;
      case 'medha':
        drawMedhaSprite(ctx, 0, 0);
        break;
      case 'vansh':
        drawVanshSprite(ctx, 0, 0);
        break;
      case 'nisha':
        drawNishaAndTupush(ctx, -2, 0);
        break;
      case 'driver':
        drawRickshaw(ctx, -20, 0, true, 0.7);
        break;
      default:
        drawIstiaqueSprite(ctx, 0, 0, 'down', 0, false, 'neutral');
    }

    ctx.restore();
  });
}
