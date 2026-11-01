import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { BookOpen, Search, Plus, Image as ImageIcon, Tag, Heart, Calendar, X } from 'lucide-react';

interface Props {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
}

export const MyJournal: React.FC<Props> = ({ entries, onAddEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);

  // New entry form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<JournalEntry['category']>('bump_photo');
  const [tagInput, setTagInput] = useState('Week 24, Memories');

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || e.category === selectedTag;
    return matchesSearch && matchesTag;
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

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              My Pregnancy &amp; Baby Journal
            </h3>
            <p className="text-xs text-stone-500">Memories, belly bump photos &amp; milestone reflections</p>
          </div>
          <button
            onClick={() => setShowNewEntryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Memory</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search journal reflections, notes & milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Entries' },
            { id: 'bump_photo', label: '📸 Bump Photos' },
            { id: 'ultrasound', label: '🩺 Ultrasound' },
            { id: 'doctor_visit', label: '📋 Doctor Notes' },
            { id: 'milestone', label: '✨ Milestones' },
            { id: 'thought', label: '💌 Thoughts' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedTag(cat.id)}
              className={`py-1 px-2.5 rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-all ${
                selectedTag === cat.id
                  ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Cards */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-xs text-stone-400">
            No memories matching your search. Add your first memory above!
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2 transition-colors"
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
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-stone-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Memory Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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
    </div>
  );
};
