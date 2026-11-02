import React, { useState } from 'react';
import { ANDROID_CODE_FILES, AndroidFile } from '../data/androidCodeData';
import {
  Code2,
  Copy,
  Check,
  Download,
  Languages,
  Smartphone,
  Layers,
  Database,
  FileCode,
  FileText,
} from 'lucide-react';

type FileCategoryFilter = 'all' | 'camera_photos' | 'localization' | 'ai_assistant' | 'compose_ui' | 'room' | 'viewmodel' | 'manifest';

export const AndroidCodeStudio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<FileCategoryFilter>('all');
  const [selectedFilename, setSelectedFilename] = useState<string>('BumpGuideCameraScreen.kt');
  const [copied, setCopied] = useState(false);

  const filteredFiles = ANDROID_CODE_FILES.filter((f) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'camera_photos') return f.category === 'camera_photos' || f.filename.includes('Photo') || f.filename.includes('Camera') || f.filename.includes('Share');
    if (selectedCategory === 'localization') return f.category === 'localization';
    if (selectedCategory === 'ai_assistant') return f.category === 'ai_assistant';
    if (selectedCategory === 'compose_ui') return f.category === 'compose_ui';
    if (selectedCategory === 'room') return f.category === 'room' || f.category === 'repository';
    if (selectedCategory === 'viewmodel') return f.category === 'viewmodel';
    if (selectedCategory === 'manifest') return f.category === 'manifest' || f.category === 'gradle' || f.category === 'theme';
    return true;
  });

  const activeFile =
    ANDROID_CODE_FILES.find((f) => f.filename === selectedFilename) ||
    filteredFiles[0] ||
    ANDROID_CODE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      {/* Architecture Overview Banner */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Android Clean Architecture &amp; Jetpack Compose Studio
              </h3>
              <p className="text-xs text-stone-500">
                Production-ready Kotlin &amp; XML codebase for Google Play Store with dynamic multi-language i18n
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200/60 dark:border-emerald-900/60">
            <Languages className="w-3.5 h-3.5" />
            <span>8 Locales · RTL Support</span>
          </div>
        </div>

        {/* Clean Architecture Diagram Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">UI &amp; i18n Layer</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block mt-0.5">
              Compose &amp; stringResource()
            </span>
            <span className="text-[10px] text-stone-400">RTL Mirroring, M3 Tokens</span>
          </div>
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">Presentation</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block mt-0.5">
              MVVM &amp; StateFlow
            </span>
            <span className="text-[10px] text-stone-400">Hilt ViewModel, LocaleHelper</span>
          </div>
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Domain Layer</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block mt-0.5">
              Repository Pattern
            </span>
            <span className="text-[10px] text-stone-400">Reactive Kotlin Flows</span>
          </div>
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Data / Local</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block mt-0.5">
              Room Database KSP
            </span>
            <span className="text-[10px] text-stone-400">SQLite Offline-First</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all' as const, label: `All Files (${ANDROID_CODE_FILES.length})` },
            { id: 'camera_photos' as const, label: 'Camera & Milestone Photos (4)' },
            { id: 'ai_assistant' as const, label: 'Gemini Assistant AI (2)' },
            { id: 'localization' as const, label: 'Localization & i18n (5)' },
            { id: 'compose_ui' as const, label: 'Jetpack Compose UI (2)' },
            { id: 'room' as const, label: 'Room Database & Repos (3)' },
            { id: 'viewmodel' as const, label: 'MVVM ViewModels (1)' },
            { id: 'manifest' as const, label: 'Manifest & Build (3)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                const firstInCat = ANDROID_CODE_FILES.find((f) => {
                  if (cat.id === 'all') return true;
                  if (cat.id === 'camera_photos') return f.category === 'camera_photos' || f.filename.includes('Photo') || f.filename.includes('Camera') || f.filename.includes('Share');
                  if (cat.id === 'ai_assistant') return f.category === 'ai_assistant';
                  if (cat.id === 'localization') return f.category === 'localization';
                  if (cat.id === 'compose_ui') return f.category === 'compose_ui';
                  if (cat.id === 'room') return f.category === 'room' || f.category === 'repository';
                  if (cat.id === 'viewmodel') return f.category === 'viewmodel';
                  if (cat.id === 'manifest') return f.category === 'manifest' || f.category === 'gradle' || f.category === 'theme';
                  return true;
                });
                if (firstInCat) setSelectedFilename(firstInCat.filename);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Inspector: File Tabs + Code Display */}
      <div className="w-full bg-stone-900 text-stone-100 rounded-3xl overflow-hidden border border-stone-800 shadow-xl">
        {/* Top File Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-950/80 border-b border-stone-800 flex-wrap gap-2">
          {/* File Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full sm:max-w-[calc(100%-190px)]">
            {filteredFiles.map((f) => {
              const isSelected = f.filename === selectedFilename;
              return (
                <button
                  key={f.filename}
                  onClick={() => setSelectedFilename(f.filename)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{f.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* File Description Header */}
        <div className="px-5 py-2.5 bg-stone-900/60 border-b border-stone-800/80 text-xs text-stone-400 flex items-center justify-between flex-wrap gap-2">
          <span className="font-mono text-stone-300 font-semibold">{activeFile.filename}</span>
          <span className="text-stone-400 italic text-[11px]">{activeFile.description}</span>
        </div>

        {/* Code Content Area with Line Numbers */}
        <div className="p-4 max-h-[520px] overflow-auto font-mono text-[11px] leading-relaxed select-text bg-[#0e0e11]">
          <pre className="text-stone-300 whitespace-pre font-mono">
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
