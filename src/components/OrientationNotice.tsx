import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

export const OrientationNotice: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // If mobile width < 768 and height > width
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-8 max-w-sm flex flex-col items-center shadow-2xl">
        <Smartphone className="w-16 h-16 text-amber-400 animate-spin mb-4" style={{ animationDuration: '4s' }} />
        <h3 className="font-bangla text-base md:text-lg font-bold text-amber-300 mb-2">দয়া করে ফোনটি আড়াআড়ি (ল্যান্ডস্কেপ) করুন</h3>
        <p className="font-bangla text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
          “নাদিয়ার বার্থডে অ্যাডভেঞ্চার” একটি রেট্রো আর্কেড ল্যান্ডস্কেপ গেম। আনন্দের সাথে খেলতে আপনার ফোনটি আড়াআড়ি ঘুরিয়ে নিন!
        </p>
        <span className="font-bangla text-xs text-sky-400 font-bold tracking-wider">
          ↺ ল্যান্ডস্কেপ মোডে ঘোরান
        </span>
      </div>
    </div>
  );
};
