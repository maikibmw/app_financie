'use client';

import { Category, Transaction, TransactionStatus, RecurrenceInterval } from '@/types';

interface EditTransactionModalProps {
  value: Transaction;
  categories: Category[];
  onChange: (tx: Transaction) => void;
  onSave: (scope: 'one' | 'future') => void;
  onCancel: () => void;
}

export default function EditTransactionModal({
  value,
  categories,
  onChange,
  onSave,
  onCancel,
}: EditTransactionModalProps) {
  const isRecurring = !!value.recurrenceInterval && value.recurrenceInterval !== 'NONE';
  const canSave = !!value.description && value.amount > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">Upraviť transakciu / Zmluvu</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Popis:</label>
            <input
              type="text"
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              className="fin-input mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600">Suma (€):</label>
              <input
                type="number"
                step="0.01"
                value={value.amount}
                onChange={(e) =>
                  onChange({ ...value, amount: parseFloat(e.target.value) || 0 })
                }
                className="fin-input mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Dátum:</label>
              <input
                type="date"
                value={value.date}
                onChange={(e) => onChange({ ...value, date: e.target.value })}
                className="fin-input mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600">Typ:</label>
              <select
                value={value.type}
                onChange={(e) =>
                  onChange({ ...value, type: e.target.value as 'INCOME' | 'EXPENSE' })
                }
                className="fin-input mt-1"
              >
                <option value="EXPENSE">Výdavok</option>
                <option value="INCOME">Príjem</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Kategória:</label>
              <select
                value={value.categoryId}
                onChange={(e) => onChange({ ...value, categoryId: e.target.value })}
                className="fin-input mt-1"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600">Stav:</label>
              <select
                value={value.status}
                onChange={(e) => {
                  const status = e.target.value as TransactionStatus;
                  onChange({
                    ...value,
                    status,
                    // Pri prepnutí na Očakávané doplníme dátum splatnosti, ak chýba.
                    dueDate: status === 'PLANNED' ? value.dueDate || value.date : value.dueDate,
                  });
                }}
                className="fin-input mt-1"
              >
                <option value="COMPLETED">Uhradené</option>
                <option value="PLANNED">Očakávané</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Opakovanie:</label>
              <select
                value={value.recurrenceInterval || 'NONE'}
                onChange={(e) => {
                  const recurrenceInterval = e.target.value as RecurrenceInterval;
                  onChange({
                    ...value,
                    recurrenceInterval,
                    isRecurring: recurrenceInterval !== 'NONE',
                  });
                }}
                className="fin-input mt-1"
              >
                <option value="NONE">Jednorazová</option>
                <option value="WEEKLY">Týždenne</option>
                <option value="MONTHLY">Mesačne</option>
                <option value="YEARLY">Ročne</option>
              </select>
            </div>
          </div>

          {value.status === 'PLANNED' && (
            <div>
              <label className="text-xs font-semibold text-gray-600">Dátum splatnosti:</label>
              <input
                type="date"
                value={value.dueDate || ''}
                onChange={(e) => onChange({ ...value, dueDate: e.target.value })}
                className="fin-input mt-1"
                required
              />
            </div>
          )}

          <hr className="my-2 border-gray-200" />
          <p className="text-xs font-bold text-gray-700">Parametre zmluvy / Poskytovateľa</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">Poskytovateľ:</label>
              <input
                type="text"
                value={value.provider || ''}
                onChange={(e) => onChange({ ...value, provider: e.target.value })}
                className="fin-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Číslo zmluvy / VS:</label>
              <input
                type="text"
                value={value.contractNumber || ''}
                onChange={(e) => onChange({ ...value, contractNumber: e.target.value })}
                className="fin-input mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">Koniec viazanosti:</label>
              <input
                type="date"
                value={value.contractEndDate || ''}
                onChange={(e) => onChange({ ...value, contractEndDate: e.target.value })}
                className="fin-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Poznámka:</label>
              <input
                type="text"
                value={value.note || ''}
                onChange={(e) => onChange({ ...value, note: e.target.value })}
                className="fin-input mt-1"
              />
            </div>
          </div>

          {isRecurring && (
            <p className="text-xs rounded-xl px-3 py-2" style={{ background: 'var(--brand-soft)', color: 'var(--brand-dark)' }}>
              Toto je opakovaná platba. Vyber, či sa zmena týka len tohto mesiaca, alebo aj všetkých ďalších.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button type="button" onClick={onCancel} className="fin-btn fin-btn-ghost">
              Zrušiť
            </button>

            {isRecurring ? (
              <>
                <button
                  type="button"
                  disabled={!canSave}
                  onClick={() => onSave('one')}
                  className="fin-btn fin-btn-soft"
                >
                  Uložiť len túto
                </button>
                <button
                  type="button"
                  disabled={!canSave}
                  onClick={() => onSave('future')}
                  className="fin-btn fin-btn-primary"
                >
                  Uložiť aj všetky budúce
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={!canSave}
                onClick={() => onSave('one')}
                className="fin-btn fin-btn-primary"
              >
                Uložiť zmeny
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}