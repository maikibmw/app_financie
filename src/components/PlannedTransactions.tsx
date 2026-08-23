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

const recLabel = (interval?: string) => {
  if (interval === 'WEEKLY') return '🔄 Týždenne';
  if (interval === 'MONTHLY') return '🔄 Mesačne';
  if (interval === 'YEARLY') return '🔄 Ročne';
  return null;
};

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
      {/* Horná lišta: počet + prepínač */}
      <div
        className="flex items-center justify-between gap-2 px-5 py-3"
        style={{ borderBottom: '1px solid #f2f0f7' }}
      >
        <span className="fin-pill" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>
          {visibleTransactions.length} položiek
        </span>
        <button
          onClick={onToggleShowAll}
          className="text-xs font-medium hover:underline"
          style={{ color: 'var(--brand-dark)' }}
        >
          {showAllPlanned ? 'Len tento mesiac' : 'Zobraziť všetky plány ➔'}
        </button>
      </div>

      {visibleTransactions.length === 0 ? (
        <div className="p-8 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
          Na tento mesiac nemáš žiadne plánované platby.{' '}
          <button
            onClick={onToggleShowAll}
            className="underline font-semibold"
            style={{ color: 'var(--brand-dark)' }}
          >
            Pozrieť ďalšie mesiace
          </button>
        </div>
      ) : (
        <div>
          {visibleTransactions.map((tx, i) => {
            const category = getCategory(tx.categoryId);
            const isOverdue = tx.dueDate ? tx.dueDate < todayStr : false;
            const isIncome = tx.type === 'INCOME';
            const rec = recLabel(tx.recurrenceInterval);

            const meta = [category?.name || 'Neznáma', `📅 ${tx.dueDate || tx.date}`, rec, tx.provider ? `🏢 ${tx.provider}` : null]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#faf9fd] transition-colors"
                style={{ borderTop: i === 0 ? 'none' : '1px solid #f2f0f7' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category?.color || '#9ca3af' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate" style={{ color: 'var(--ink)' }}>
                        {tx.description}
                      </p>
                      {isOverdue && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--neg-soft)', color: 'var(--neg)' }}
                        >
                          {isIncome ? 'Mešká' : 'Po splatnosti'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--ink-faint)' }}>
                      {meta}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="font-semibold text-sm whitespace-nowrap"
                    style={{ color: isIncome ? 'var(--pos)' : 'var(--warn)' }}
                  >
                    {isIncome ? '+' : '−'}{tx.amount.toFixed(2)} €
                  </span>
                  <button
                    onClick={() => onMarkCompleted(tx)}
                    className="fin-btn text-white"
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.72rem', background: 'var(--pos)' }}
                  >
                    {isIncome ? '✓ Prijaté' : '✓ Uhradiť'}
                  </button>
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