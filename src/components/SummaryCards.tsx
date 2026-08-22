'use client';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalPlannedExpense: number;
  showAllPlanned: boolean;
}

export default function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  totalPlannedExpense,
  showAllPlanned,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-sm font-medium text-emerald-600">Príjmy</p>
        <p className="text-2xl font-bold text-emerald-700">+{totalIncome.toFixed(2)} €</p>
      </div>
      <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
        <p className="text-sm font-medium text-rose-600">Výdavky</p>
        <p className="text-2xl font-bold text-rose-700">-{totalExpense.toFixed(2)} €</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-sm font-medium text-slate-600">Bilancia</p>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
          {balance.toFixed(2)} €
        </p>
      </div>
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm font-medium text-amber-600">
          Očakávané {showAllPlanned ? '(celkovo)' : '(tento mesiac)'}
        </p>
        <p className="text-2xl font-bold text-amber-700">-{totalPlannedExpense.toFixed(2)} €</p>
      </div>
    </div>
  );
}