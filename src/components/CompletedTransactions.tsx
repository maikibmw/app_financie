'use client';

import { Category, Transaction } from '@/types';

interface CompletedTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const recLabel = (interval?: string) => {
  if (interval === 'WEEKLY') return '🔄 Týždenne';
  if (interval === 'MONTHLY') return '🔄 Mesačne';
  if (interval === 'YEARLY') return '🔄 Ročne';
  return null;
};

export default function CompletedTransactions({
  transactions,
  categories,
  onEdit,
  onDelete,
}: CompletedTransactionsProps) {
  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <section className="fin-card overflow-hidden">
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
          Zatiaľ žiadne uhradené transakcie.
        </div>
      ) : (
        <div>
          {transactions.map((tx, i) => {
            const category = getCategory(tx.categoryId);
            const isIncome = tx.type === 'INCOME';
            const rec = recLabel(tx.recurrenceInterval);

            const meta = [category?.name || 'Neznáma', tx.date, rec, tx.provider ? `🏢 ${tx.provider}` : null]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#faf9fd] transition-colors"
                style={{ borderTop: i === 0 ? 'none' : '1px solid #f2f0f7' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category?.color || '#9ca3af' }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--ink)' }}>
                      {tx.description}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--ink-faint)' }}>
                      {meta}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="font-semibold text-sm whitespace-nowrap"
                    style={{ color: isIncome ? 'var(--pos)' : 'var(--ink)' }}
                  >
                    {isIncome ? '+' : '−'}{tx.amount.toFixed(2)} €
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#efeafc] transition-colors text-sm"
                      title="Upraviť"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#fdecec] transition-colors text-sm"
                      title="Vymazať"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}