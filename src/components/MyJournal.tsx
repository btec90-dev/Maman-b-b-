import React, { useState } from 'react';
import { JournalEntry } from '../types';
import {
  BookOpen,
  Search,
  Plus,
  Tag,
  Calendar,
  X,
  Printer,
  FileDown,
  Sparkles,
  ArrowUpDown,
  Check,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';

interface Props {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  motherName?: string;
  babyName?: string;
  dueDate?: string;
}

export const MyJournal: React.FC<Props> = ({
  entries,
  onAddEntry,
  motherName = 'Mama',
  babyName = 'Baby',
  dueDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomTag, setSelectedCustomTag] = useState<string | null>(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Print/Export customization state
  const [printScope, setPrintScope] = useState<'all' | 'filtered'>('all');
  const [sortOrder, setSortOrder] = useState<'chronological' | 'reverse'>('chronological');
  const [includeTags, setIncludeTags] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);

  // New entry form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<JournalEntry['category']>('bump_photo');
  const [tagInput, setTagInput] = useState('Week 24, Memories');

  // Extract all unique tags with count
  const tagCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    entry.tags.forEach((tag) => {
      const cleaned = tag.trim();
      if (cleaned) {
        acc[cleaned] = (acc[cleaned] || 0) + 1;
      }
    });
    return acc;
  }, {});

  const availableTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  // Filter entries based on search query (title, content, tags), category, and custom tag
  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      entry.tags.some((t) => t.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'all' || entry.category === selectedCategory;

    const matchesCustomTag =
      !selectedCustomTag || entry.tags.some((t) => t.toLowerCase() === selectedCustomTag.toLowerCase());

    return matchesSearch && matchesCategory && matchesCustomTag;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedCustomTag !== null;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCustomTag(null);
  };

  // Prepare entries for export based on user selection
  const exportSource = printScope === 'all' ? entries : filteredEntries;
  const sortedExportEntries = [...exportSource].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'chronological' ? dateA - dateB : dateB - dateA;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    onAddEntry(newEntry);
    setTitle('');
    setContent('');
    setShowNewEntryModal(false);
  };

  const handlePrintAllEntries = () => {
    // Select all entries for print export
    setPrintScope('all');
    // Allow state cycle to resolve before calling browser native print dialog
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleTriggerPrint = () => {
    // Invoke browser native print dialog which can "Save as PDF"
    window.print();
  };

  const handleDownloadMarkdown = () => {
    let md = `# Maman & bébé — Keepsake Journal\n`;
    md += `**Family:** ${motherName} & ${babyName}\n`;
    if (dueDate) md += `**Due Date:** ${dueDate}\n`;
    md += `**Export Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Total Entries:** ${sortedExportEntries.length}\n\n`;
    md += `---\n\n`;

    sortedExportEntries.forEach((e, idx) => {
      md += `### ${idx + 1}. ${e.title}\n`;
      md += `*Date: ${e.date}* | *Category: ${e.category.replace('_', ' ')}*\n\n`;
      md += `${e.content}\n\n`;
      if (e.tags.length > 0) {
        md += `*Tags:* ${e.tags.map((t) => `#${t}`).join(' ')}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Maman_Bebe_Journal_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3.5 no-print">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              My Pregnancy &amp; Baby Journal
            </h3>
            <p className="text-xs text-stone-500">
              Memories, belly bump photos &amp; milestone reflections
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrintAllEntries}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95"
              title="Generate a printable PDF of all journal entries"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print All (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              title="Customize Print & PDF Export options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <span>Print Options</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewEntryModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Memory</span>
            </button>
          </div>
        </div>

        {/* Enhanced Search Input with Quick Clear and Counter */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, note, or tag (e.g. Ultrasound, Margot, Week 24)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Interactive Tag Filter Cloud */}
        {availableTags.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-rose-500" />
                <span>Filter by Tag:</span>
              </span>
              {selectedCustomTag && (
                <button
                  onClick={() => setSelectedCustomTag(null)}
                  className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Clear tag filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedCustomTag(null)}
                className={`py-1 px-2.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${
                  selectedCustomTag === null
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                All Tags
              </button>
              {availableTags.map((tag) => {
                const isSelected = selectedCustomTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedCustomTag(isSelected ? null : tag)}
                    className={`py-1 px-2.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs font-semibold'
                        : 'bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {tagCounts[tag]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Pills & Active Filter Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'bump_photo', label: '📸 Bump Photos' },
              { id: 'ultrasound', label: '🩺 Ultrasound' },
              { id: 'doctor_visit', label: '📋 Doctor Notes' },
              { id: 'milestone', label: '✨ Milestones' },
              { id: 'thought', label: '💌 Thoughts' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1 px-2.5 rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active Filter Counter / Reset */}
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <span className="font-mono tabular-nums">
              Showing {filteredEntries.length} of {entries.length}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick 1-Click Printable PDF Keepsake Action Banner */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200/70 dark:border-rose-900/40 rounded-2xl no-print gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Printable Keepsake PDF Book
              </p>
              <p className="text-[11px] text-stone-500">
                Generate a clean, print-ready document containing all {entries.length} recorded memories &amp; dates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrintAllEntries}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate PDF</span>
          </button>
        </div>
      )}

      {/* Journal Cards (Screen view) */}
      <div className="space-y-3 no-print">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-xs text-stone-400 space-y-3">
            <BookOpen className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
            <div>
              <p className="font-semibold text-stone-700 dark:text-stone-300 text-sm">
                No memories match your search
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {searchQuery && `Keyword: "${searchQuery}"`}
                {selectedCustomTag && ` · Tag: #${selectedCustomTag}`}
                {selectedCategory !== 'all' && ` · Category: ${selectedCategory.replace('_', ' ')}`}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear Search &amp; Tag Filters
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{entry.date}</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md">
                  {entry.category.replace('_', ' ')}
                </span>
              </div>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {entry.title}
              </h4>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {entry.content}
              </p>

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-stone-100 dark:border-stone-800">
                  {entry.tags.map((tag) => {
                    const isSelected = selectedCustomTag?.toLowerCase() === tag.toLowerCase();
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedCustomTag(isSelected ? null : tag)}
                        className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white font-semibold shadow-xs'
                            : 'text-stone-500 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
                        }`}
                        title={`Filter by #${tag}`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>#{tag}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* NEW MEMORY MODAL */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Record New Memory
              </h4>
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. First Flutter Kicks in the Morning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as JournalEntry['category'])}
                  className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                >
                  <option value="bump_photo">📸 Belly Bump Photo Reflection</option>
                  <option value="ultrasound">🩺 Ultrasound Scan Milestone</option>
                  <option value="doctor_visit">📋 Doctor Appointment Summary</option>
                  <option value="milestone">✨ Key Baby Milestone</option>
                  <option value="thought">💌 Personal Note &amp; Feelings</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Journal Reflection
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your thoughts, emotions, what baby reacted to today..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Week 20, Ultrasound, Excited"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="px-3 py-2 text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT / PDF PREVIEW & EXPORT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Print / PDF Keepsake Book
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Preview and generate a clean, styled PDF keepsake of your memories
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Configuration Controls */}
            <div className="px-5 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              {/* Scope */}
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-medium">Include:</span>
                <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => setPrintScope('all')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      printScope === 'all'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    All ({entries.length})
                  </button>
                  <button
                    onClick={() => setPrintScope('filtered')}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      printScope === 'filtered'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Filtered ({filteredEntries.length})
                  </button>
                </div>
              </div>

              {/* Chronological order */}
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-medium">Order:</span>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === 'chronological' ? 'reverse' : 'chronological')
                  }
                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg font-medium text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  <ArrowUpDown className="w-3 h-3 text-rose-500" />
                  <span>{sortOrder === 'chronological' ? 'Oldest to Newest (Book)' : 'Newest First'}</span>
                </button>
              </div>

              {/* Tags checkbox */}
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={includeTags}
                  onChange={(e) => setIncludeTags(e.target.checked)}
                  className="rounded text-rose-600 accent-rose-600 cursor-pointer"
                />
                <span>Include Tags</span>
              </label>
            </div>

            {/* Scrollable Document Preview Canvas (Styled like a printed keepsake memory book) */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-100 dark:bg-stone-950">
              <div className="max-w-xl mx-auto bg-white text-stone-900 p-8 sm:p-10 rounded-2xl shadow-md border border-stone-200 font-serif space-y-6">
                {/* Keepsake Cover / Book Header */}
                <div className="text-center pb-6 border-b-2 border-stone-800 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-rose-600 mb-1">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-sans text-[11px] font-bold tracking-widest uppercase">
                      Maman &amp; bébé
                    </span>
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
                    Pregnancy &amp; Baby Keepsake Journal
                  </h1>
                  <p className="font-sans text-xs text-stone-500 mt-1">
                    The Journey of {motherName} &amp; {babyName}
                  </p>
                  {dueDate && (
                    <p className="font-sans text-[11px] text-stone-400">
                      Estimated Due Date: {dueDate} · Exported on {new Date().toLocaleDateString()}
                    </p>
                  )}
                  <div className="font-sans text-[10px] text-stone-400 tracking-wider uppercase pt-2">
                    {sortedExportEntries.length} Cherished Memories Recorded
                  </div>
                </div>

                {/* Printable Entries List */}
                <div className="space-y-6">
                  {sortedExportEntries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5 print-entry-card"
                    >
                      <div className="flex items-center justify-between text-xs font-sans text-stone-500">
                        <span className="font-mono font-medium">
                          {idx + 1}. {entry.date}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                          {entry.category.replace('_', ' ')}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-stone-900 font-serif">
                        {entry.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans whitespace-pre-line">
                        {entry.content}
                      </p>

                      {includeTags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-200 text-stone-500 font-sans text-[10px]">
                          {entry.tags.map((tag) => (
                            <span key={tag} className="bg-stone-200 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Keepsake Footer */}
                <div className="text-center pt-6 border-t border-stone-200 text-stone-400 font-sans text-[11px]">
                  <p>Maman &amp; bébé — Supportive Maternity &amp; Baby Journal Keepsake</p>
                  <p className="text-[10px] mt-0.5">Created with love for {babyName}</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Controls */}
            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 bg-white dark:bg-stone-900 shrink-0">
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                title="Download as markdown / text file"
              >
                <FileDown className="w-4 h-4 text-stone-400" />
                <span>Save Markdown (.md)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED PRINT DOM SECTION (Visible only during @media print) */}
      <div id="journal-print-section" className="hidden print:block">
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'serif' }}>
          {/* Print Header */}
          <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: '2px solid #1c1917', marginBottom: '24px' }}>
            <p style={{ fontFamily: 'sans-serif', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#bf8042', fontWeight: 'bold' }}>
              Maman &amp; bébé · Keepsake Journal
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', color: '#1c1917' }}>
              Pregnancy &amp; Baby Journal
            </h1>
            <p style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#44403c' }}>
              The Cherished Memories of {motherName} &amp; {babyName}
            </p>
            {dueDate && (
              <p style={{ fontFamily: 'sans-serif', fontSize: '11px', color: '#78716c', marginTop: '4px' }}>
                Estimated Due Date: {dueDate} · Generated: {new Date().toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Printable entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedExportEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className="print-entry-card"
                style={{
                  border: '1px solid #e7e5e4',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  pageBreakInside: 'avoid',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'sans-serif', fontSize: '11px', color: '#78716c', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{idx + 1}. {entry.date}</span>
                  <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#bf8042' }}>
                    {entry.category.replace('_', ' ')}
                  </span>
                </div>

                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1c1917', margin: '4px 0 8px 0' }}>
                  {entry.title}
                </h2>

                <p style={{ fontFamily: 'sans-serif', fontSize: '13px', lineHeight: '1.6', color: '#292524', whiteSpace: 'pre-line' }}>
                  {entry.content}
                </p>

                {includeTags && entry.tags.length > 0 && (
                  <div style={{ fontFamily: 'sans-serif', fontSize: '10px', color: '#78716c', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f5f5f4' }}>
                    Tags: {entry.tags.map((t) => `#${t}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Print Footer */}
          <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e7e5e4', fontFamily: 'sans-serif', fontSize: '11px', color: '#a8a29e' }}>
            Recorded with Maman &amp; bébé — Supportive Pregnancy &amp; Baby Tracker
          </div>
        </div>
      </div>
    </div>
  );
};
