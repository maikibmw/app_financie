'use client';

import { useState } from 'react';
import { Category, Transaction, TransactionStatus, RecurrenceInterval } from '@/types';

interface TransactionFormProps {
  categories: Category[];
  onAddTransaction: (tx: Transaction) => void;
}

export default function TransactionForm({ categories, onAddTransaction }: TransactionFormProps) {
  // Základné polia pre novú transakciu
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [status, setStatus] = useState<TransactionStatus>('COMPLETED');
  const [dueDate, setDueDate] = useState('');
  const [pickedCategoryId, setPickedCategoryId] = useState('');
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('NONE');

  // Polia pre Zmluvy / Paušály
  const [provider, setProvider] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [note, setNote] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Ak používateľ ešte nič nevybral (alebo vybraná kategória neexistuje),
  // použijeme prvú dostupnú. Odvodené bez useEffectu.
  const categoryId =
    categories.find((c) => c.id === pickedCategoryId)?.id ?? categories[0]?.id ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || parseFloat(amount) <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isRecurring = recurrenceInterval !== 'NONE';

    const newTransaction: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      description,
      amount: parseFloat(amount),
      type,
      categoryId,
      status,
      date: todayStr,
      dueDate: status === 'PLANNED' ? (dueDate || todayStr) : undefined,
      isRecurring,
      recurrenceInterval,
      seriesId: isRecurring ? `ser-${crypto.randomUUID()}` : undefined,
      seriesAmount: isRecurring ? parseFloat(amount) : undefined,
      provider: provider.trim() || undefined,
      contractNumber: contractNumber.trim() || undefined,
      contractEndDate: contractEndDate.trim() || undefined,
      note: note.trim() || undefined,
    };

    onAddTransaction(newTransaction);

    // Vyčistenie formulára
    setDescription('');
    setAmount('');
    setDueDate('');
    setRecurrenceInterval('NONE');
    setProvider('');
    setContractNumber('');
    setContractEndDate('');
    setNote('');
  };

  return (
    <section className="fin-card p-6 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Popis (napr. Paušál Mne)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="fin-input"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Suma v €"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="fin-input"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
            className="fin-input"
          >
            <option value="EXPENSE">Výdavok</option>
            <option value="INCOME">Príjem</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TransactionStatus)}
            className="fin-input"
          >
            <option value="COMPLETED">Uhradené</option>
            <option value="PLANNED">Očakávané</option>
          </select>

          {status === 'PLANNED' && (
            <div className="flex flex-col">
              <label className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Dátum splatnosti:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="fin-input"
                required
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Opakovanie platby:</label>
            <select
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
              className="fin-input"
            >
              <option value="NONE">Jednorazová platba</option>
              <option value="WEEKLY">Opakovať týždenne</option>
              <option value="MONTHLY">Opakovať mesačne</option>
              <option value="YEARLY">Opakovať ročne</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Kategória:</label>
            <select
              value={categoryId}
              onChange={(e) => setPickedCategoryId(e.target.value)}
              className="fin-input"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === 'INCOME' ? 'Príjem' : 'Výdavok'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prepínač pre pokročilé detaily zmluvy */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: 'var(--brand-dark)' }}
          >
            {showAdvanced ? '▲ Skryť detaily zmluvy a viazanosti' : '▼ Pridať detaily zmluvy / Poskytovateľa (voliteľné)'}
          </button>
        </div>

        {showAdvanced && (
          <div className="p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" style={{ background: '#faf9fd', border: '1px solid var(--brand-border)' }}>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>Poskytovateľ / Firma:</label>
              <input
                type="text"
                placeholder="napr. Orange, SPP, VÚB"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="fin-input"
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>Číslo zmluvy / VS:</label>
              <input
                type="text"
                placeholder="napr. 82391029"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="fin-input"
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>Koniec viazanosti / zmluvy:</label>
              <input
                type="date"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
                className="fin-input"
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>Poznámka / Podmienky:</label>
              <input
                type="text"
                placeholder="napr. zľava 10% pri predĺžení"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="fin-input"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="fin-btn fin-btn-primary"
          >
            Pridať transakciu
          </button>
        </div>
      </form>
    </section>
  );
}