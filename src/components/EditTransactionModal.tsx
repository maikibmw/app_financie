'use client';

import { Category, Transaction } from '@/types';

interface EditTransactionModalProps {
  value: Transaction;
  categories: Category[];
  onChange: (tx: Transaction) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditTransactionModal({
  value,
  categories,
  onChange,
  onSubmit,
  onCancel,
}: EditTransactionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">Upraviť transakciu / Zmluvu</h3>
        <form onSubmit={onSubmit} className="space-y-3">
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

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="fin-btn fin-btn-ghost"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="fin-btn fin-btn-primary"
            >
              Uložiť zmeny
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}