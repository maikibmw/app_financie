'use client';

import { useState } from 'react';
import { Category, TransactionType } from '@/types';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (newCat: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
];

export default function CategoryManager({
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({ name: name.trim(), type, color });
    setName('');
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div 
        className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Správa kategórií</h2>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
            {categories.length}
          </span>
        </div>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          {isOpen ? 'Skryť správu ▲' : 'Upraviť kategórie ▼'}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Formulár pre novú kategóriu */}
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Pridať novú kategóriu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Názov kategórie (napr. Škôlka, Koníčky)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm sm:col-span-2"
                required
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="EXPENSE">Výdavok</option>
                <option value="INCOME">Príjem</option>
              </select>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium p-2 rounded-md text-sm transition-colors"
              >
                + Pridať
              </button>
            </div>

            {/* Výber farby */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-500">Farba značky:</span>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* Zoznam existujúcich kategórií */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Existujúce kategórie</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center p-2.5 rounded-md border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: cat.color || '#6b7280' }}
                    />
                    <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      ({cat.type === 'INCOME' ? 'Príjem' : 'Výdavok'})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="text-gray-400 hover:text-red-600 text-xs px-1"
                    title="Vymazať kategóriu"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}