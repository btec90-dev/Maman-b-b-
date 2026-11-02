import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Eye, Layers, RotateCw, ZoomIn, ZoomOut, Sparkles, Heart } from 'lucide-react';
import { WeekDetail } from '../types';

interface Props {
  weekData: WeekDetail;
  isTwin: boolean;
  babyName?: string;
  babyNameTwin?: string;
}

export const VisualBabyModel: React.FC<Props> = ({
  weekData,
  isTwin,
  babyName = 'Baby',
  babyNameTwin = 'Baby B',
}) => {
  const [viewMode, setViewMode] = useState<'artistic' | 'natural' | 'ultrasound' | 'skeletal'>('artistic');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlayingHeartbeat, setIsPlayingHeartbeat] = useState(false);
  const [bpm] = useState(Math.round(135 + ((40 - weekData.week) * 0.4)));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);

  // Gentle acoustic heartbeat synthesis
  const toggleHeartbeat = () => {
    if (isPlayingHeartbeat) {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      setIsPlayingHeartbeat(false);
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playLubDub = () => {
        if (!ctx) return;
        const now = ctx.currentTime;

        // Lub (1st sound)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(65, now);
        osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // Dub (2nd sound slightly softer, 120ms later)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(55, now + 0.13);
        osc2.frequency.exponentialRampToValueAtTime(30, now + 0.24);
        gain2.gain.setValueAtTime(0.22, now + 0.13);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.13);
        osc2.stop(now + 0.28);
      };

      playLubDub();
      const intervalMs = (60 / bpm) * 1000;
      heartbeatTimerRef.current = window.setInterval(playLubDub, intervalMs);
      setIsPlayingHeartbeat(true);
    } catch {
      setIsPlayingHeartbeat(false);
    }
  };

  useEffect(() => {
    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Visual size scale based on week
  const scale = Math.min(1.4, Math.max(0.55, 0.45 + (weekData.week / 40) * 0.75)) * zoomLevel;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-rose-50/70 via-stone-50 to-sage-50/60 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 border border-stone-200/80 dark:border-stone-800 shadow-sm transition-all">
      {/* Top Header Information Overlay */}
      <div className="relative z-10 px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400">
              Trimester {weekData.trimester} · Week {weekData.week}
            </span>
            {isTwin && (
              <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">
                Twin Pregnancy
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-0.5">
            {isTwin ? `${babyName} & ${babyNameTwin}` : babyName}
          </h2>
        </div>

        {/* Heartbeat pulse and audio toggle */}
        <button
          onClick={toggleHeartbeat}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
            isPlayingHeartbeat
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20 animate-pulse'
              : 'bg-white/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
          }`}
          title="Toggle fetal heartbeat acoustic simulation"
        >
          <Heart className={`w-3.5 h-3.5 ${isPlayingHeartbeat ? 'fill-white text-white' : 'text-rose-500 fill-rose-500/30'}`} />
          <span className="tabular-nums font-mono">{bpm} BPM</span>
          {isPlayingHeartbeat ? <Volume2 className="w-3.5 h-3.5 ml-0.5" /> : <VolumeX className="w-3.5 h-3.5 ml-0.5" />}
        </button>
      </div>

      {/* Main 3D / Fetal Visual Stage Canvas Area */}
      <div className="relative w-full h-[270px] sm:h-[300px] flex items-center justify-center overflow-hidden select-none">
        {/* Soft Amniotic Fluid Radiant Glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            viewMode === 'artistic'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/50 via-amber-100/25 to-transparent dark:from-amber-950/30 dark:via-stone-900/50 dark:to-transparent'
              : viewMode === 'ultrasound'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 via-stone-950 to-black opacity-95'
              : viewMode === 'skeletal'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/60 via-stone-900 to-black opacity-90'
              : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-200/40 via-amber-100/20 to-transparent dark:from-rose-950/20 dark:via-stone-900/40 dark:to-transparent'
          }`}
        />

        {/* Amniotic Membrane Boundary Ring */}
        <div
          className={`absolute w-64 h-64 rounded-full pointer-events-none transition-all duration-700 ${
            viewMode === 'artistic'
              ? 'border-2 border-amber-300/50 dark:border-amber-600/40 shadow-[0_0_50px_rgba(191,128,66,0.2)] animate-pulse'
              : viewMode === 'ultrasound'
              ? 'border-2 border-stone-700/40 shadow-[0_0_40px_rgba(255,255,255,0.05)]'
              : 'border border-rose-300/40 dark:border-rose-700/20 shadow-[0_0_50px_rgba(244,162,97,0.15)] animate-pulse'
          }`}
          style={{ animationDuration: '4s' }}
        />

        {/* Visual Content: Either Artistic Illustration or 3D Dynamic SVG */}
        {viewMode === 'artistic' ? (
          <div className="relative flex items-center justify-center">
            {isTwin ? (
              <div className="flex items-center justify-center -space-x-8">
                {/* Twin A artistic belly */}
                <div
                  className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-amber-300/60 dark:border-amber-600/50 shadow-[0_0_40px_rgba(191,128,66,0.3)] transition-transform duration-300"
                  style={{ transform: `scale(${scale * 0.9}) rotate(${rotationAngle - 6}deg)` }}
                >
                  <img
                    src="/src/assets/images/baby_in_belly_1793579983507.jpg"
                    alt={`Artistic baby in belly - Twin A (Week ${weekData.week})`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-amber-500/10 pointer-events-none" />
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-amber-200 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                    Twin A · {babyName}
                  </span>
                </div>

                {/* Twin B artistic belly */}
                <div
                  className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-amber-300/60 dark:border-amber-600/50 shadow-[0_0_40px_rgba(191,128,66,0.3)] transition-transform duration-300"
                  style={{ transform: `scale(${scale * 0.9}) rotate(${rotationAngle + 8}deg)` }}
                >
                  <img
                    src="/src/assets/images/baby_in_belly_1793579983507.jpg"
                    alt={`Artistic baby in belly - Twin B (Week ${weekData.week})`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-amber-500/10 pointer-events-none" />
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-amber-200 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                    Twin B · {babyNameTwin}
                  </span>
                </div>
              </div>
            ) : (
              /* Single baby artistic belly */
              <div
                className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-amber-300/70 dark:border-amber-600/60 shadow-[0_0_50px_rgba(191,128,66,0.25)] transition-transform duration-300"
                style={{ transform: `scale(${scale}) rotate(${rotationAngle}deg)` }}
              >
                <img
                  src="/src/assets/images/baby_in_belly_1793579983507.jpg"
                  alt={`Artistic baby in belly illustration for Week ${weekData.week}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-500/10 pointer-events-none" />
                <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold tracking-wide bg-stone-900/80 backdrop-blur-md text-amber-200 px-3 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    <span>Week {weekData.week} · Artistic Belly View</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Dynamic Fetal SVG Visual Representation with 3D Rotate Transform */
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${scale}) rotate(${rotationAngle}deg)`,
            }}
          >
            {isTwin ? (
              /* Twin Babies Render: Twin A and Twin B nestled together */
              <div className="flex items-center justify-center -space-x-12">
                {/* Twin A */}
                <div className="transform -rotate-6">
                  <FetalSvgFigure week={weekData.week} viewMode={viewMode} isTwinSide="left" />
                  <span className="absolute bottom-2 left-6 text-[10px] font-semibold text-rose-500/80 bg-white/70 dark:bg-stone-800/80 px-1.5 py-0.5 rounded-full">
                    Twin A
                  </span>
                </div>
                {/* Twin B */}
                <div className="transform rotate-12 translate-y-3">
                  <FetalSvgFigure week={weekData.week} viewMode={viewMode} isTwinSide="right" />
                  <span className="absolute bottom-1 right-6 text-[10px] font-semibold text-rose-500/80 bg-white/70 dark:bg-stone-800/80 px-1.5 py-0.5 rounded-full">
                    Twin B
                  </span>
                </div>
              </div>
            ) : (
              /* Single Baby Render */
              <FetalSvgFigure week={weekData.week} viewMode={viewMode} />
            )}

            {/* Ultrasound Biometric Calipers Overlay */}
            {viewMode === 'ultrasound' && (
              <div className="absolute inset-0 pointer-events-none font-mono text-[9px] text-emerald-400/90">
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span>+ CRL: {weekData.lengthCm}cm</span>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <span>+ EFW: {weekData.weightG}g</span>
                </div>
                {/* Sonogram Grid Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-emerald-500/20" />
                <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-emerald-500/20" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Controls Bar: View Modes, Rotation, Zoom */}
      <div className="px-4 py-3 bg-white/70 dark:bg-stone-900/80 backdrop-blur-md border-t border-stone-200/70 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Layer Mode Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('artistic')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'artistic'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Artistic Belly</span>
          </button>
          <button
            onClick={() => setViewMode('natural')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'natural'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Natural
          </button>
          <button
            onClick={() => setViewMode('ultrasound')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'ultrasound'
                ? 'bg-stone-900 text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Ultrasound
          </button>
          <button
            onClick={() => setViewMode('skeletal')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'skeletal'
                ? 'bg-indigo-900 text-indigo-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Skeletal
          </button>
        </div>

        {/* 3D Rotate & Zoom Controls */}
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <button
            onClick={() => setRotationAngle((prev) => (prev <= -30 ? 30 : prev - 15))}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors"
            title="Rotate Left"
          >
            <RotateCw className="w-4 h-4 transform -scale-x-100" />
          </button>
          <span className="font-mono text-[11px] tabular-nums text-stone-600 dark:text-stone-300">
            {rotationAngle}°
          </span>
          <button
            onClick={() => setRotationAngle((prev) => (prev >= 30 ? -30 : prev + 15))}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-0.5" />

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// SVG Figure Renderer with anatomical accuracy for each stage
const FetalSvgFigure: React.FC<{
  week: number;
  viewMode: 'natural' | 'ultrasound' | 'skeletal';
  isTwinSide?: 'left' | 'right';
}> = ({ week, viewMode, isTwinSide }) => {
  // Color tokens depending on the chosen view mode
  const skinFill =
    viewMode === 'ultrasound'
      ? 'url(#ultrasoundNoise)'
      : viewMode === 'skeletal'
      ? '#2e2a4a'
      : '#f8c2b5';

  const skinStroke =
    viewMode === 'ultrasound'
      ? '#ffffff'
      : viewMode === 'skeletal'
      ? '#818cf8'
      : '#e29b8c';

  const cordColor =
    viewMode === 'ultrasound'
      ? '#a8a29e'
      : viewMode === 'skeletal'
      ? '#6366f1'
      : '#7ea089';

  const spineColor = viewMode === 'skeletal' ? '#c7d2fe' : '#ffffff';

  // For early embryo (week 4 - 8)
  if (week <= 8) {
    return (
      <svg width="180" height="180" viewBox="0 0 200 200" className="drop-shadow-lg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Yolk Sac */}
        <circle cx="70" cy="115" r="24" fill={viewMode === 'ultrasound' ? '#444' : '#fed7aa'} opacity="0.6" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M 85 105 Q 95 100 105 100" stroke={cordColor} strokeWidth="2.5" fill="none" />
        {/* Embryonic C-shape curve */}
        <path
          d="M 130 75 C 150 85, 145 125, 120 135 C 100 145, 90 120, 105 105 C 115 95, 115 70, 130 75 Z"
          fill={skinFill}
          stroke={skinStroke}
          strokeWidth="3"
        />
        {/* Heart bulge with rhythmic beat animation */}
        <circle cx="118" cy="108" r="6" fill="#e11d48" className="animate-ping" style={{ animationDuration: '0.8s' }} />
        {/* Eye bud */}
        <circle cx="132" cy="85" r="3.5" fill={viewMode === 'ultrasound' ? '#fff' : '#1c1917'} />
      </svg>
    );
  }

  // Fetus (week 10 to 40)
  return (
    <svg width="220" height="220" viewBox="0 0 240 240" className="drop-shadow-xl">
      <defs>
        {/* Ultrasound texture */}
        <pattern id="ultrasoundNoise" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#e7e5e4" opacity="0.6" />
          <circle cx="5" cy="5" r="1" fill="#78716c" opacity="0.4" />
        </pattern>
        {/* Natural shading gradient */}
        <radialGradient id="babySkinGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffddd2" />
          <stop offset="60%" stopColor="#f4a261" />
          <stop offset="100%" stopColor="#e76f51" />
        </radialGradient>
      </defs>

      {/* Umbilical Cord */}
      <path
        d="M 120 135 C 100 160, 80 140, 60 170 C 45 190, 70 210, 85 200"
        fill="none"
        stroke={cordColor}
        strokeWidth="6"
        strokeLinecap="round"
        className="opacity-80"
      />

      {/* Baby Head */}
      <circle
        cx="145"
        cy="75"
        r={week >= 30 ? 38 : 34}
        fill={viewMode === 'natural' ? 'url(#babySkinGrad)' : skinFill}
        stroke={skinStroke}
        strokeWidth="2.5"
      />

      {/* Baby Face Profile: Closed Eyes, Nose button, delicate lips */}
      <path
        d="M 165 72 Q 170 75 167 78 Q 163 80 168 83 Q 164 86 161 88"
        fill="none"
        stroke={skinStroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Peaceful Closed Eyelid */}
      <path
        d="M 152 70 Q 157 73 162 70"
        fill="none"
        stroke={viewMode === 'ultrasound' ? '#fff' : '#7c2d12'}
        strokeWidth="2"
      />

      {/* Baby Body: Curled Fetal Spine & Torso */}
      <path
        d="M 130 98 C 105 110, 95 155, 125 175 C 145 190, 165 170, 155 145 C 148 128, 145 115, 130 98 Z"
        fill={viewMode === 'natural' ? 'url(#babySkinGrad)' : skinFill}
        stroke={skinStroke}
        strokeWidth="2.5"
      />

      {/* Skeletal Spine Ribs (visible in Skeletal & Ultrasound modes) */}
      {(viewMode === 'skeletal' || viewMode === 'ultrasound') && (
        <g stroke={spineColor} strokeWidth="1.5" opacity="0.85">
          {/* Vertebrae curve */}
          <path d="M 135 90 Q 105 125 125 165" fill="none" strokeWidth="2.5" />
          {/* Rib arches */}
          <line x1="118" y1="115" x2="135" y2="118" />
          <line x1="114" y1="125" x2="137" y2="128" />
          <line x1="113" y1="135" x2="138" y2="137" />
          <line x1="116" y1="145" x2="135" y2="147" />
        </g>
      )}

      {/* Baby Legs curled up towards chest */}
      <path
        d="M 135 175 C 160 185, 175 155, 160 140 C 150 130, 140 140, 135 150"
        fill={viewMode === 'natural' ? 'url(#babySkinGrad)' : skinFill}
        stroke={skinStroke}
        strokeWidth="2.5"
      />

      {/* Baby Arms curled near face / sucking thumb */}
      <path
        d="M 138 115 C 152 110, 165 95, 160 88 C 155 83, 145 95, 136 105"
        fill={viewMode === 'natural' ? 'url(#babySkinGrad)' : skinFill}
        stroke={skinStroke}
        strokeWidth="2.5"
      />

      {/* Pulsing Heart Center */}
      <circle
        cx="132"
        cy="125"
        r="4.5"
        fill="#e11d48"
        className="animate-ping"
        style={{ animationDuration: '0.85s' }}
      />
      <circle cx="132" cy="125" r="4" fill="#fb7185" />
    </svg>
  );
};
