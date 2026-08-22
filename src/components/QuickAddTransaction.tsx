'use client';

import { useState } from 'react';
import { Category, Transaction, TransactionStatus } from '@/types';

interface QuickAddTransactionProps {
  categories: Category[];
  onAdd: (tx: Transaction) => void;
  onClose: () => void;
  onGoToRecords: () => void;
}

export default function QuickAddTransaction({ categories, onAdd, onClose, onGoToRecords }: QuickAddTransactionProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pickedCategoryId, setPickedCategoryId] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('COMPLETED');
  const [dueDate, setDueDate] = useState('');

  // Ak používateľ nič nevybral, použijeme prvú kategóriu.
  const categoryId =
    categories.find((c) => c.id === pickedCategoryId)?.id ?? categories[0]?.id ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || parseFloat(amount) <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Rovnaký tvar transakcie ako v plnom formulári – aby sa započítala všade.
    const newTransaction: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      description,
      amount: parseFloat(amount),
      type,
      categoryId,
      status,
      date: todayStr,
      dueDate: status === 'PLANNED' ? dueDate || todayStr : undefined,
      isRecurring: false,
      recurrenceInterval: 'NONE',
    };

    onAdd(newTransaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>Rýchle pridanie</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--ink-faint)' }}
            title="Zavrieť"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Prepínač typu */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f4f2f9' }}>
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={
                type === 'EXPENSE'
                  ? { background: '#fff', color: 'var(--neg)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: 'var(--ink-faint)' }
              }
            >
              Výdavok
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={
                type === 'INCOME'
                  ? { background: '#fff', color: 'var(--pos)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: 'var(--ink-faint)' }
              }
            >
              Príjem
            </button>
          </div>

          {/* Suma */}
          <div className="flex items-center gap-2 border rounded-xl px-4 py-3" style={{ borderColor: '#e5e3ec' }}>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-2xl font-semibold outline-none bg-transparent"
              style={{ color: 'var(--ink)' }}
              autoFocus
              required
            />
            <span className="text-xl" style={{ color: 'var(--ink-faint)' }}>€</span>
          </div>

          {/* Popis */}
          <input
            type="text"
            placeholder="Popis (napr. Nákup potravín)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="fin-input"
            required
          />

          {/* Kategória + stav */}
          <div className="flex gap-2">
            <select
              value={categoryId}
              onChange={(e) => setPickedCategoryId(e.target.value)}
              className="fin-input flex-1"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TransactionStatus)}
              className="fin-input flex-1"
            >
              <option value="COMPLETED">Uhradené</option>
              <option value="PLANNED">Očakávané</option>
            </select>
          </div>

          {/* Dátum splatnosti len pri očakávanej platbe */}
          {status === 'PLANNED' && (
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>
                Dátum splatnosti:
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="fin-input"
                required
              />
            </div>
          )}

          {/* Tlačidlá */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="fin-btn fin-btn-ghost">
              Zrušiť
            </button>
            <button type="submit" className="fin-btn fin-btn-primary flex-1">
              Pridať transakciu
            </button>
          </div>

          <p className="text-center text-xs" style={{ color: 'var(--ink-faint)' }}>
            Zmluvu s detailmi a opakované platby pridáš v{' '}
            <button
              type="button"
              onClick={onGoToRecords}
              className="font-semibold hover:underline"
              style={{ color: 'var(--brand-dark)' }}
            >
              Záznamoch →
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}