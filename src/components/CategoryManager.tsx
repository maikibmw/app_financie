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
  '#06b6d4', '#3b82f6', '#6366f1', '#7c5cfc', '#ec4899', '#64748b',
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
    <section className="fin-card overflow-hidden">
      <div
        className="px-6 py-4 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>Zoznam kategórií</span>
          <span className="fin-pill" style={{ background: 'var(--brand-soft)', color: 'var(--brand-dark)' }}>
            {categories.length}
          </span>
        </div>
        <button className="text-sm font-medium" style={{ color: 'var(--brand-dark)' }}>
          {isOpen ? 'Skryť ▲' : 'Upraviť ▼'}
        </button>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 space-y-6">
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl space-y-3" style={{ background: '#faf9fd', border: '1px solid var(--brand-border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Pridať novú kategóriu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input type="text" placeholder="Názov (napr. Škôlka, Koníčky)" value={name}
                onChange={(e) => setName(e.target.value)} className="fin-input sm:col-span-2" required />
              <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="fin-input">
                <option value="EXPENSE">Výdavok</option>
                <option value="INCOME">Príjem</option>
              </select>
              <button type="submit" className="fin-btn fin-btn-primary">+ Pridať</button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Farba značky:</span>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </form>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Existujúce kategórie</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-2.5 rounded-xl"
                  style={{ background: '#ffffff', border: '1px solid var(--brand-border)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color || '#6b7280' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{cat.name}</span>
                    <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--ink-faint)' }}>
                      ({cat.type === 'INCOME' ? 'Príjem' : 'Výdavok'})
                    </span>
                  </div>
                  <button type="button" onClick={() => onDeleteCategory(cat.id)}
                    className="text-xs px-1" style={{ color: 'var(--ink-faint)' }} title="Vymazať kategóriu">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}