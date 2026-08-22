'use client';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalPlannedExpense: number;
  showAllPlanned: boolean;
}

// Zoštíhlený spätný pohľad – čo sa reálne udialo (doplnok k hlavnému prehľadu).
export default function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  totalPlannedExpense,
  showAllPlanned,
}: SummaryCardsProps) {
  const items = [
    { label: 'Príjmy', value: `+${totalIncome.toFixed(2)} €`, color: 'var(--pos)', bg: 'var(--pos-soft)' },
    { label: 'Výdavky', value: `-${totalExpense.toFixed(2)} €`, color: 'var(--neg)', bg: 'var(--neg-soft)' },
    { label: 'Bilancia', value: `${balance.toFixed(2)} €`, color: 'var(--ink)', bg: '#f6f6f8' },
    {
      label: `Očakávané ${showAllPlanned ? '(celkovo)' : '(mesiac)'}`,
      value: `-${totalPlannedExpense.toFixed(2)} €`,
      color: 'var(--warn)',
      bg: 'var(--warn-soft)',
    },
  ];

  return (
    <section className="fin-card p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-2xl p-3" style={{ background: it.bg }}>
            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{it.label}</p>
            <p className="text-lg font-semibold mt-0.5" style={{ color: it.color }}>{it.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}