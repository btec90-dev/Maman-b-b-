import React, { useState } from 'react';
import { RegistryItem } from '../types';
import { CheckSquare, Plus, Check, DollarSign, Filter, Sparkles, Tag, X } from 'lucide-react';

interface Props {
  items: RegistryItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: RegistryItem) => void;
}

const CATEGORIES = [
  'All',
  'Nursery',
  'Feeding',
  'Travel',
  'Clothing',
  'Diapering',
  'Health & Safety',
  'Mom Essentials',
] as const;

export const RegistryChecklist: React.FC<Props> = ({ items, onToggleItem, onAddItem }) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<RegistryItem['category']>('Nursery');
  const [newItemPriority, setNewItemPriority] = useState<RegistryItem['priority']>('must_have');
  const [newItemPrice, setNewItemPrice] = useState('');

  const filteredItems = items.filter(
    (item) => selectedCat === 'All' || item.category === selectedCat
  );

  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const progressPercent = Math.round((purchasedCount / items.length) * 100);

  const totalBudget = items.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
  const purchasedBudget = items
    .filter((i) => i.isPurchased)
    .reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: RegistryItem = {
      id: `reg-custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      priority: newItemPriority,
      quantity: 1,
      isPurchased: false,
      estimatedPrice: parseFloat(newItemPrice) || undefined,
    };

    onAddItem(item);
    setNewItemName('');
    setNewItemPrice('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Progress Card */}
      <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Baby Registry &amp; Essentials
            </h3>
            <p className="text-xs text-stone-500">Curated nursery, feeding, and travel gear</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-rose-500 to-sage-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Budget Metric Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <span className="text-stone-400 text-[11px] block">Items Checked</span>
            <span className="font-bold text-stone-800 dark:text-stone-200 font-mono tabular-nums">
              {purchasedCount} of {items.length} ({progressPercent}%)
            </span>
          </div>
          <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
            <span className="text-stone-400 text-[11px] block">Estimated Cost</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              ${purchasedBudget} / ${totalBudget}
            </span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`py-1 px-2.5 rounded-xl font-semibold cursor-pointer whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item Checklist Cards */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              item.isPurchased
                ? 'bg-sage-50/70 dark:bg-sage-950/20 border-sage-200 dark:border-sage-900/50'
                : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            {/* Checkbox */}
            <div
              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                item.isPurchased
                  ? 'bg-sage-600 text-white'
                  : 'border-2 border-stone-300 dark:border-stone-600'
              }`}
            >
              {item.isPurchased && <Check className="w-3.5 h-3.5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    item.isPurchased
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : 'text-stone-900 dark:text-stone-100'
                  }`}
                >
                  {item.name}
                </span>
                {item.estimatedPrice && (
                  <span className="font-mono text-xs font-semibold text-stone-500 shrink-0">
                    ${item.estimatedPrice}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-md">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    item.priority === 'must_have'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                      : item.priority === 'nice_to_have'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {item.priority === 'must_have' ? 'Must-Have' : item.priority === 'nice_to_have' ? 'Nice to Have' : 'Can Wait'}
                </span>
              </div>

              {item.notes && (
                <p className="text-[11px] text-stone-500 mt-1 italic">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Add Registry Item
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Cotton Sleep Sack"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as RegistryItem['category'])}
                    className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={newItemPriority}
                    onChange={(e) => setNewItemPriority(e.target.value as RegistryItem['priority'])}
                    className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
                  >
                    <option value="must_have">Must-Have</option>
                    <option value="nice_to_have">Nice-to-Have</option>
                    <option value="can_wait">Can Wait</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Estimated Price ($ USD)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 45"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
