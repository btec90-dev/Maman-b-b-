import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  isDeviceFrame: boolean;
  onToggleFrame: () => void;
  brandTitle?: string;
}

export const PhoneFrame: React.FC<Props> = ({
  children,
  isDeviceFrame,
  onToggleFrame,
}) => {
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!isDeviceFrame) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-900/90 dark:bg-black py-4 sm:py-8 px-2 flex flex-col items-center justify-center transition-colors">
      {/* Top Floating Device Control Bar */}
      <div className="w-full max-w-[440px] flex items-center justify-between mb-3 px-2 text-stone-300 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-rose-300">Google Pixel 8 Pro</span>
          <span className="text-stone-500">·</span>
          <span className="text-stone-400">Material You M3</span>
        </div>
        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-3 py-1 bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 rounded-lg transition-colors cursor-pointer text-xs"
          title="Switch to Full Width Mode"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Full Width</span>
        </button>
      </div>

      {/* Realistic Pixel Smartphone Chassis */}
      <div className="relative w-full max-w-[412px] h-[870px] bg-[#FAF8F5] dark:bg-stone-950 rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_12px_#1c1917,0_0_0_14px_#292524] overflow-hidden flex flex-col border border-stone-800/50">
        {/* Top Status Bar */}
        <div className="relative z-30 shrink-0 h-11 px-6 pt-2 flex items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300 select-none bg-inherit">
          <span className="tracking-tight text-[13px] font-semibold">{time}</span>

          {/* Front Camera Punch-Hole */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 rounded-full bg-black/90 border border-stone-700/60 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/40" />
          </div>

          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold tabular-nums">98%</span>
              <Battery className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>

        {/* Scrollable Device App Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
          {children}
        </div>

        {/* Android Material 3 Gesture Navigation Pill */}
        <div className="shrink-0 h-5 pb-1 flex items-center justify-center bg-inherit select-none z-30">
          <div className="w-28 h-1 rounded-full bg-stone-400/60 dark:bg-stone-600/60" />
        </div>
      </div>
    </div>
  );
};
