import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MilestonePhoto } from '../types';
import {
  Camera,
  Image as ImageIcon,
  Sliders,
  Share2,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Crop,
  Type,
  Eye,
  EyeOff,
  Grid,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  Heart,
  Smile,
  X,
  Upload,
} from 'lucide-react';

interface Props {
  photos: MilestonePhoto[];
  onAddPhoto: (photo: MilestonePhoto) => void;
  onDeletePhoto: (id: string) => void;
  onUpdatePhoto: (photo: MilestonePhoto) => void;
  onSaveToJournal?: (photo: MilestonePhoto) => void;
  currentWeek: number;
  motherName?: string;
  babyName?: string;
}

type StudioView = 'gallery' | 'camera' | 'editor';
type AspectRatioPreset = '1:1' | '4:5' | '9:16';
type FilterType = 'none' | 'caramel' | 'rose' | 'vintage' | 'bw' | 'vivid';

const FILTER_PRESETS: Array<{ id: FilterType; label: string; previewClass: string }> = [
  { id: 'none', label: 'Natural', previewClass: 'filter-none' },
  { id: 'caramel', label: 'Caramel Warmth', previewClass: 'sepia-[0.25] contrast-[1.08] saturate-[1.15]' },
  { id: 'rose', label: 'Rosy Glow', previewClass: 'hue-rotate-[-10deg] saturate-[1.2] brightness-[1.05]' },
  { id: 'vintage', label: 'Vintage Matte', previewClass: 'sepia-[0.4] contrast-[0.95] brightness-[1.08]' },
  { id: 'bw', label: 'B&W Film', previewClass: 'grayscale contrast-[1.2]' },
  { id: 'vivid', label: 'Vivid Golden', previewClass: 'contrast-[1.15] saturate-[1.3] brightness-[1.04]' },
];

const STICKER_PRESETS = ['✨', '💕', '👶', '🍼', '👣', '🌸', '🧸', '🌈'];

export const MilestonePhotoStudio: React.FC<Props> = ({
  photos,
  onAddPhoto,
  onDeletePhoto,
  onUpdatePhoto,
  onSaveToJournal,
  currentWeek,
  motherName = 'Mama',
  babyName = 'Baby',
}) => {
  const [activeView, setActiveView] = useState<StudioView>('gallery');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'all'>('all');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showBumpGuide, setShowBumpGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [guideOpacity, setGuideOpacity] = useState(0.65);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Editor State
  const [editingPhoto, setEditingPhoto] = useState<MilestonePhoto | null>(null);
  const [editorSourceImage, setEditorSourceImage] = useState<string>('');
  const [targetWeek, setTargetWeek] = useState<number>(currentWeek || 24);
  const [photoType, setPhotoType] = useState<MilestonePhoto['type']>('bump');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('caramel');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('4:5');
  const [textOverlay, setTextOverlay] = useState<string>(`Week ${currentWeek || 24} ✨ Baby Bump`);
  const [showTextBadge, setShowTextBadge] = useState(true);
  const [selectedSticker, setSelectedSticker] = useState<string>('✨');
  const [editorNotes, setEditorNotes] = useState('');
  const [exportingCanvas, setExportingCanvas] = useState(false);

  // Detail Modal State
  const [viewingPhoto, setViewingPhoto] = useState<MilestonePhoto | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Initialize or Stop Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      console.warn('Camera access unavailable or declined:', err);
      setCameraError('Camera access unavailable or blocked. You can upload an image or select a sample photo.');
      setIsCameraActive(false);
    }
  }, [facingMode, cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  useEffect(() => {
    if (activeView === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeView, startCamera, stopCamera]);

  // Capture Photo from Live Stream
  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if user facing camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    openEditorWithImage(dataUrl, currentWeek, 'bump');
  };

  // Upload Photo File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        stopCamera();
        openEditorWithImage(dataUrl, currentWeek, 'bump');
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Photo Editor
  const openEditorWithImage = (
    imageSrc: string,
    week: number = currentWeek,
    type: MilestonePhoto['type'] = 'bump',
    existing?: MilestonePhoto
  ) => {
    setEditorSourceImage(imageSrc);
    setTargetWeek(week || 24);
    setPhotoType(type);
    setSelectedFilter(existing?.filterApplied || 'caramel');
    setAspectRatio(existing?.aspectRatio || '4:5');
    setTextOverlay(existing?.textOverlay || `Week ${week || 24} ✨ Baby Bump`);
    setShowTextBadge(true);
    setEditorNotes(existing?.notes || '');
    setEditingPhoto(existing || null);
    setActiveView('editor');
  };

  // Render Flattened Edited Image with Filters & Badges onto Canvas
  const handleSaveEditedPhoto = async () => {
    setExportingCanvas(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = editorSourceImage;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const targetWidth = 1200;
      let targetHeight = 1200;
      if (aspectRatio === '4:5') targetHeight = 1500;
      if (aspectRatio === '9:16') targetHeight = 2133;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Image with Aspect Crop (Cover)
      const srcRatio = img.width / img.height;
      const dstRatio = targetWidth / targetHeight;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (srcRatio > dstRatio) {
        sw = img.height * dstRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / dstRatio;
        sy = (img.height - sh) / 2;
      }

      // Draw base photo
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

      // Apply Color Filter overlay via composite
      if (selectedFilter === 'caramel') {
        ctx.fillStyle = 'rgba(191, 128, 66, 0.15)'; // Caramel tone
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.globalCompositeOperation = 'source-over';
      } else if (selectedFilter === 'rose') {
        ctx.fillStyle = 'rgba(235, 120, 140, 0.12)';
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.globalCompositeOperation = 'source-over';
      } else if (selectedFilter === 'vintage') {
        ctx.fillStyle = 'rgba(120, 90, 60, 0.22)';
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.fillStyle = 'rgba(255, 245, 230, 0.08)';
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.globalCompositeOperation = 'source-over';
      } else if (selectedFilter === 'bw') {
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (selectedFilter === 'vivid') {
        ctx.fillStyle = 'rgba(255, 200, 50, 0.08)';
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw Text Badge Overlay if enabled
      if (showTextBadge && textOverlay.trim()) {
        const badgePaddingX = 36;
        const badgePaddingY = 18;
        const fontSize = 42;
        ctx.font = `bold ${fontSize}px sans-serif`;

        const textMetrics = ctx.measureText(textOverlay);
        const badgeWidth = textMetrics.width + badgePaddingX * 2 + 50;
        const badgeHeight = fontSize + badgePaddingY * 2;
        const badgeX = (targetWidth - badgeWidth) / 2;
        const badgeY = targetHeight - badgeHeight - 60;

        // Rounded badge background (Caramel Rose)
        ctx.save();
        ctx.fillStyle = 'rgba(28, 25, 23, 0.85)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 6;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 30);
        ctx.fill();
        ctx.restore();

        // Sticker / Icon
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillText(selectedSticker, badgeX + badgePaddingX, badgeY + badgeHeight - badgePaddingY - 4);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(textOverlay, badgeX + badgePaddingX + 50, badgeY + badgeHeight - badgePaddingY - 4);
      }

      // Watermark / Brand stamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '22px sans-serif';
      ctx.fillText(`Maman & bébé · ${new Date().toLocaleDateString()}`, 40, targetHeight - 30);

      const exportedUrl = canvas.toDataURL('image/jpeg', 0.94);

      if (editingPhoto) {
        onUpdatePhoto({
          ...editingPhoto,
          weekNumber: targetWeek,
          type: photoType,
          photoUrl: exportedUrl,
          notes: editorNotes,
          filterApplied: selectedFilter,
          textOverlay: showTextBadge ? textOverlay : undefined,
          aspectRatio,
        });
      } else {
        const newPhoto: MilestonePhoto = {
          id: `photo-${Date.now()}`,
          weekNumber: targetWeek,
          date: new Date().toISOString().split('T')[0],
          type: photoType,
          photoUrl: exportedUrl,
          notes: editorNotes,
          filterApplied: selectedFilter,
          textOverlay: showTextBadge ? textOverlay : undefined,
          aspectRatio,
          tags: [`Week ${targetWeek}`, photoType, babyName],
        };
        onAddPhoto(newPhoto);
      }

      setActiveView('gallery');
    } catch (err) {
      console.error('Failed to export edited photo:', err);
    } finally {
      setExportingCanvas(false);
    }
  };

  // Native Device Sharing
  const handleSharePhoto = async (photo: MilestonePhoto) => {
    setShareSuccess(false);
    const title = `Week ${photo.weekNumber} Milestone Photo · Maman & bébé`;
    const shareText = `Cherishing Week ${photo.weekNumber} of pregnancy with ${babyName}! 💕 ${photo.notes || ''} #MamanBebe`;

    if (navigator.share) {
      try {
        // Attempt to convert base64 dataUrl into real File for sharing
        const res = await fetch(photo.photoUrl);
        const blob = await res.blob();
        const file = new File([blob], `Week_${photo.weekNumber}_Bump.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            text: shareText,
            files: [file],
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2500);
          return;
        } else {
          await navigator.share({
            title,
            text: shareText,
            url: window.location.href,
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2500);
          return;
        }
      } catch (e: unknown) {
        if ((e as Error).name !== 'AbortError') {
          console.warn('Native share failed, using download fallback', e);
        }
      }
    }

    // Fallback: Download file
    handleDownloadPhoto(photo);
  };

  const handleDownloadPhoto = (photo: MilestonePhoto) => {
    const link = document.createElement('a');
    link.href = photo.photoUrl;
    link.download = `Maman_Bebe_Week_${photo.weekNumber}_${photo.date}.jpg`;
    link.click();
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  // Group Photos by Gestational Weeks
  const sortedPhotos = [...photos].sort((a, b) => b.weekNumber - a.weekNumber);
  const filteredPhotos =
    selectedWeekFilter === 'all'
      ? sortedPhotos
      : sortedPhotos.filter((p) => p.weekNumber === selectedWeekFilter);

  // Available unique weeks with photos
  const availableWeeks = Array.from(new Set(photos.map((p) => p.weekNumber))).sort((a, b) => a - b);

  return (
    <div className="w-full space-y-4">
      {/* Top Header Card */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4 no-print">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Milestone Photo &amp; Bump Studio
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900">
                  Week {currentWeek}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Weekly belly bump guide, ultrasound memories, photo filters &amp; native sharing
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeView === 'gallery'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Gallery ({photos.length})</span>
            </button>

            <button
              onClick={() => setActiveView('camera')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
                activeView === 'camera'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Bump Camera</span>
            </button>
          </div>
        </div>

        {/* Quick Week Filter Carousel in Gallery View */}
        {activeView === 'gallery' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedWeekFilter('all')}
              className={`px-3 py-1 rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-all ${
                selectedWeekFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              All Weeks ({photos.length})
            </button>
            {availableWeeks.map((wk) => (
              <button
                key={wk}
                onClick={() => setSelectedWeekFilter(wk)}
                className={`px-3 py-1 rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  selectedWeekFilter === wk
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                Week {wk} ({photos.filter((p) => p.weekNumber === wk).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. CAMERA INTEGRATION WITH BUMP GUIDE & GRID OVERLAY      */}
      {/* ========================================================= */}
      {activeView === 'camera' && (
        <div className="w-full bg-stone-950 text-white rounded-3xl overflow-hidden shadow-xl border border-stone-800 relative">
          {/* Camera Top Controls */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-20 relative">
            <button
              onClick={() => setActiveView('gallery')}
              className="flex items-center gap-1 text-xs text-stone-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Gallery</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  showGrid ? 'bg-rose-600 text-white' : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
                title="Toggle Rule-of-Thirds Alignment Grid"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowBumpGuide(!showBumpGuide)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  showBumpGuide ? 'bg-rose-600 text-white' : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
                title="Toggle Belly Bump Contour Silhouette"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bump Guide</span>
              </button>

              <button
                onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-stone-300 hover:text-white cursor-pointer"
                title="Flip Front / Rear Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewport Viewfinder */}
          <div className="relative aspect-[3/4] sm:aspect-[4/5] max-h-[580px] w-full bg-black flex items-center justify-center overflow-hidden">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <Camera className="w-12 h-12 text-stone-600 mx-auto" />
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  {cameraError || 'Initializing Camera access for weekly bump milestone tracking...'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <label className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Bump Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY: Rule-of-Thirds Grid */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div></div>
              </div>
            )}

            {/* OVERLAY: Bump Silhouette Guide (SVG Vector Alignment Arc) */}
            {showBumpGuide && (
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity"
                style={{ opacity: guideOpacity }}
              >
                <svg
                  viewBox="0 0 400 500"
                  className="w-full h-full max-w-md max-h-md text-rose-400/80 stroke-current"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Subtle Human Silhouette & Profile Bump Guide */}
                  {/* Head outline guide */}
                  <circle cx="200" cy="80" r="40" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                  {/* Torso & Bump Silhouette Arc */}
                  <path
                    d="M 175 125 C 160 160, 150 200, 150 250 C 150 310, 170 360, 185 400"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  {/* The Bump Outward Curve (Center-Right Profile Guide) */}
                  <path
                    d="M 215 135 C 240 180, 290 220, 290 280 C 290 340, 240 375, 215 400"
                    strokeWidth="3.5"
                    stroke="#BF8042"
                  />
                  {/* Belly Height Level Indicator Line */}
                  <line x1="140" y1="280" x2="300" y2="280" strokeWidth="1.5" stroke="#ffffff" strokeDasharray="3 3" opacity="0.8" />
                  {/* Belly Apex Focal Point */}
                  <circle cx="290" cy="280" r="6" fill="#BF8042" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x="295"
                    y="275"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Bump Apex
                  </text>
                </svg>
              </div>
            )}

            {/* Guide Opacity Slider Control */}
            {showBumpGuide && (
              <div className="absolute top-16 left-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 z-20 text-xs">
                <span className="text-[11px] text-stone-300 whitespace-nowrap">Guide Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={guideOpacity}
                  onChange={(e) => setGuideOpacity(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[11px] text-stone-300 font-mono">
                  {Math.round(guideOpacity * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Camera Bottom Shutter Bar */}
          <div className="p-5 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between gap-4">
            <label className="flex flex-col items-center gap-1 text-[11px] text-stone-400 hover:text-white cursor-pointer">
              <div className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <span>Upload</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Big Shutter Button */}
            <button
              onClick={handleCaptureFromCamera}
              disabled={!isCameraActive}
              className={`w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1.5 transition-transform active:scale-90 ${
                isCameraActive ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="w-full h-full bg-rose-500 hover:bg-rose-400 rounded-full transition-colors flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>

            <button
              onClick={() => {
                // Quick sample bump photo for desktop preview
                openEditorWithImage(
                  'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1000&q=80',
                  currentWeek,
                  'bump'
                );
              }}
              className="flex flex-col items-center gap-1 text-[11px] text-stone-400 hover:text-white cursor-pointer"
            >
              <div className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <span>Sample</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PHOTO EDITOR & TEXT OVERLAY COMPONENT                  */}
      {/* ========================================================= */}
      {activeView === 'editor' && (
        <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-5 no-print">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('gallery')}
                className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-xl cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Milestone Photo Editor
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('gallery')}
                className="px-3 py-1.5 text-stone-500 hover:text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedPhoto}
                disabled={exportingCanvas}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
              >
                {exportingCanvas ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save to Gallery</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Visual Canvas View */}
            <div className="md:col-span-7 flex flex-col items-center justify-center bg-stone-950 p-4 rounded-2xl relative overflow-hidden">
              <div
                className={`relative overflow-hidden rounded-xl shadow-2xl transition-all max-h-[460px] ${
                  aspectRatio === '1:1'
                    ? 'aspect-square w-full max-w-[380px]'
                    : aspectRatio === '4:5'
                    ? 'aspect-[4/5] w-full max-w-[340px]'
                    : 'aspect-[9/16] w-full max-w-[260px]'
                }`}
              >
                <img
                  src={editorSourceImage}
                  alt="Milestone Preview"
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    FILTER_PRESETS.find((f) => f.id === selectedFilter)?.previewClass || ''
                  }`}
                />

                {/* Live Text Overlay Badge */}
                {showTextBadge && textOverlay && (
                  <div className="absolute bottom-5 inset-x-3 flex justify-center pointer-events-none">
                    <div className="bg-stone-900/85 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 max-w-[90%]">
                      <span className="text-base shrink-0">{selectedSticker}</span>
                      <span className="text-xs font-bold truncate tracking-tight">
                        {textOverlay}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editing Controls Sidebar */}
            <div className="md:col-span-5 space-y-4 text-xs">
              {/* Aspect Ratio Preset */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Crop className="w-3.5 h-3.5 text-rose-500" />
                  <span>Crop &amp; Aspect Ratio</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1:1', label: '1:1 Square' },
                    { id: '4:5', label: '4:5 Portrait' },
                    { id: '9:16', label: '9:16 Story' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setAspectRatio(r.id as AspectRatioPreset)}
                      className={`py-2 px-2.5 rounded-xl text-center font-semibold cursor-pointer border transition-all ${
                        aspectRatio === r.id
                          ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter Presets */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-rose-500" />
                  <span>Color Filters</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FILTER_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFilter(f.id)}
                      className={`py-2 px-2 rounded-xl text-center font-semibold cursor-pointer border transition-all truncate ${
                        selectedFilter === f.id
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Badge Overlay Controls */}
              <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-rose-500" />
                    <span>Milestone Text Badge</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTextBadge(!showTextBadge)}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    {showTextBadge ? 'Hide Badge' : 'Show Badge'}
                  </button>
                </div>

                {showTextBadge && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      placeholder="e.g. Week 24 ✨ Belly Bump"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                    />

                    {/* Quick Badge Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        `Week ${targetWeek} Bump`,
                        'First Kicks 💕',
                        'Anatomy Scan 🩺',
                        'Halfway There! ✨',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTextOverlay(preset)}
                          className="text-[10px] px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 rounded-lg cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {/* Stickers */}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-[11px] text-stone-400">Icon:</span>
                      {STICKER_PRESETS.map((stk) => (
                        <button
                          key={stk}
                          type="button"
                          onClick={() => setSelectedSticker(stk)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center cursor-pointer transition-transform ${
                            selectedSticker === stk ? 'bg-rose-500 text-white scale-110 shadow-xs' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          {stk}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata: Week Number & Type */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Week of Pregnancy
                  </label>
                  <select
                    value={targetWeek}
                    onChange={(e) => setTargetWeek(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                  >
                    {Array.from({ length: 37 }, (_, i) => i + 4).map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Photo Type
                  </label>
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value as MilestonePhoto['type'])}
                    className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                  >
                    <option value="bump">📸 Belly Bump</option>
                    <option value="ultrasound">🩺 Ultrasound Scan</option>
                    <option value="nursery">🧸 Nursery Prep</option>
                    <option value="celebration">✨ Celebration</option>
                  </select>
                </div>
              </div>

              {/* Memory Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  Memory Notes / Reflection
                </label>
                <textarea
                  rows={2}
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  placeholder="What was baby feeling like? How was mama feeling today?..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LOCAL GALLERY STORAGE VIEW (Organized by Weeks)        */}
      {/* ========================================================= */}
      {activeView === 'gallery' && (
        <div className="space-y-4">
          {filteredPhotos.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-stone-400 space-y-3">
              <Camera className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
              <div>
                <p className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                  {selectedWeekFilter === 'all'
                    ? 'No milestone photos recorded yet'
                    : `No photos recorded for Week ${selectedWeekFilter}`}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Capture your weekly bump with our alignment guide or upload an ultrasound scan!
                </p>
              </div>
              <button
                onClick={() => setActiveView('camera')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Bump Camera</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setViewingPhoto(photo)}
                  className="group relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  {/* Photo Thumbnail */}
                  <div className="aspect-[4/5] w-full bg-stone-100 dark:bg-stone-800 relative overflow-hidden">
                    <img
                      src={photo.photoUrl}
                      alt={`Week ${photo.weekNumber}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Week Tag Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                      Week {photo.weekNumber}
                    </div>

                    {/* Type Tag */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-rose-500/90 text-white text-[9px] font-semibold uppercase tracking-wider">
                      {photo.type}
                    </div>

                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSharePhoto(photo);
                        }}
                        className="p-2 bg-white/90 text-stone-900 rounded-xl hover:bg-white transition-colors"
                        title="Share Photo"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditorWithImage(photo.photoUrl, photo.weekNumber, photo.type, photo);
                        }}
                        className="p-2 bg-white/90 text-stone-900 rounded-xl hover:bg-white transition-colors"
                        title="Edit Photo"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content Info */}
                  <div className="p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {photo.textOverlay || `Week ${photo.weekNumber}`}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {photo.date}
                      </span>
                    </div>
                    {photo.notes && (
                      <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                        "{photo.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DETAIL & NATIVE SHARING MODAL                          */}
      {/* ========================================================= */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold">
                  Week {viewingPhoto.weekNumber}
                </span>
                <span className="text-xs text-stone-500">
                  {viewingPhoto.date} · {viewingPhoto.type.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setViewingPhoto(null)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo View */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
              <div className="max-h-[440px] w-full rounded-2xl overflow-hidden shadow-lg border border-stone-100 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 flex items-center justify-center">
                <img
                  src={viewingPhoto.photoUrl}
                  alt={`Week ${viewingPhoto.weekNumber}`}
                  className="max-h-[440px] w-auto object-contain"
                />
              </div>

              {viewingPhoto.notes && (
                <div className="w-full mt-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-xs text-stone-600 dark:text-stone-300">
                  <p className="font-semibold text-stone-800 dark:text-stone-200 mb-0.5">Note:</p>
                  <p className="italic">"{viewingPhoto.notes}"</p>
                </div>
              )}

              {shareSuccess && (
                <div className="w-full mt-2 p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Ready to share or downloaded successfully!</span>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions (Share, Edit, Save to Journal, Delete) */}
            <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this milestone photo?')) {
                    onDeletePhoto(viewingPhoto.id);
                    setViewingPhoto(null);
                  }
                }}
                className="p-2 text-stone-400 hover:text-red-500 rounded-xl transition-colors"
                title="Delete photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPhoto(viewingPhoto)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
                  title="Download photo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p = viewingPhoto;
                    setViewingPhoto(null);
                    openEditorWithImage(p.photoUrl, p.weekNumber, p.type, p);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSharePhoto(viewingPhoto)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Native</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
