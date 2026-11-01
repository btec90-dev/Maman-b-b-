import React, { useState } from 'react';
import { ANDROID_CODE_FILES, AndroidFile } from '../data/androidCodeData';
import { Code2, Copy, Check, Download, Layers, ShieldCheck, Database, Smartphone, FileCode } from 'lucide-react';

export const AndroidCodeStudio: React.FC = () => {
  const [selectedFilename, setSelectedFilename] = useState<string>('PregnancyHomeScreen.kt');
  const [copied, setCopied] = useState(false);

  const activeFile = ANDROID_CODE_FILES.find((f) => f.filename === selectedFilename) || ANDROID_CODE_FILES[0];

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
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Android Clean Architecture &amp; Jetpack Compose Studio
              </h3>
              <p className="text-xs text-stone-500">
                Production-ready Kotlin codebase for Google Play Store deployment
              </p>
            </div>
          </div>
        </div>

        {/* Clean Architecture Diagram Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">UI Layer</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block mt-0.5">
              Jetpack Compose M3
            </span>
            <span className="text-[10px] text-stone-400">Canvas 3D, M3 Theme</span>
          </div>
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">Presentation</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 block mt-0.5">
              MVVM &amp; StateFlow
            </span>
            <span className="text-[10px] text-stone-400">Hilt ViewModel</span>
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
      </div>

      {/* Code Inspector: File Tabs + Code Display */}
      <div className="w-full bg-stone-900 text-stone-100 rounded-3xl overflow-hidden border border-stone-800 shadow-xl">
        {/* Top File Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-950/80 border-b border-stone-800 flex-wrap gap-2">
          {/* File Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[calc(100%-180px)]">
            {ANDROID_CODE_FILES.map((f) => {
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
        <div className="px-5 py-2.5 bg-stone-900/60 border-b border-stone-800/80 text-xs text-stone-400 flex items-center justify-between">
          <span className="font-mono text-stone-300">{activeFile.filename}</span>
          <span className="text-stone-500 italic">{activeFile.description}</span>
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
