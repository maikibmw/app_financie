'use client';

import { Category, Transaction } from '@/types';

interface PlannedTransactionsProps {
  visibleTransactions: Transaction[];
  categories: Category[];
  showAllPlanned: boolean;
  todayStr: string;
  onToggleShowAll: () => void;
  onMarkCompleted: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function PlannedTransactions({
  visibleTransactions,
  categories,
  showAllPlanned,
  todayStr,
  onToggleShowAll,
  onMarkCompleted,
  onEdit,
  onDelete,
}: PlannedTransactionsProps) {
  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <section className="fin-card overflow-hidden">
      <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full">
            {visibleTransactions.length} položiek
          </span>
        </div>

        <button
          onClick={onToggleShowAll}
          className="text-xs font-medium bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded border border-amber-300 transition-colors"
        >
          {showAllPlanned ? 'Zobraziť len tento mesiac' : 'Zobraziť všetky plány ➔'}
        </button>
      </div>

      {visibleTransactions.length === 0 ? (
        <div className="p-6 text-center text-amber-800/70 text-sm">
          Na tento mesiac nemáš žiadne plánované výdavky.{' '}
          <button
            onClick={onToggleShowAll}
            className="underline font-semibold hover:text-amber-900"
          >
            Pozrieť výdavky v ďalších mesiacoch
          </button>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-amber-800 text-xs uppercase font-medium border-b border-amber-200">
              <th className="px-6 py-3">Popis / Poskytovateľ</th>
              <th className="px-6 py-3">Kategória</th>
              <th className="px-6 py-3">Opakovanie</th>
              <th className="px-6 py-3">Splatnosť</th>
              <th className="px-6 py-3 text-right">Suma</th>
              <th className="px-6 py-3 text-center">Akcia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-200/60 text-sm">
            {visibleTransactions.map((tx) => {
              const category = getCategory(tx.categoryId);
              const isOverdue = tx.dueDate ? tx.dueDate < todayStr : false;

              return (
                <tr key={tx.id} className="hover:bg-amber-100/30">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{tx.description}</div>
                    {tx.provider && (
                      <div className="text-xs text-amber-900 font-semibold">🏢 {tx.provider}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-block px-2.5 py-0.5 text-xs rounded-full font-medium text-white"
                      style={{ backgroundColor: category?.color || '#6b7280' }}
                    >
                      {category?.name || 'Neznáma'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {tx.recurrenceInterval === 'WEEKLY' && '🔄 Týždenne'}
                    {tx.recurrenceInterval === 'MONTHLY' && '🔄 Mesačne'}
                    {tx.recurrenceInterval === 'YEARLY' && '🔄 Ročne'}
                    {(!tx.recurrenceInterval || tx.recurrenceInterval === 'NONE') && '— Jednorazová'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>{tx.dueDate || tx.date}</span>
                      {isOverdue && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">
                          Po splatnosti
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-amber-900">
                    -{tx.amount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => onMarkCompleted(tx)}
                        className="fin-btn fin-btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.72rem', background: 'var(--pos)' }}
                      >
                        DONE (Uhradené)
                      </button>
                      <button
                        onClick={() => onEdit(tx)}
                        className="text-gray-500 hover:text-blue-600 text-xs px-2 py-1"
                        title="Upraviť"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="text-gray-400 hover:text-red-600 text-xs px-2 py-1"
                        title="Vymazať"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}