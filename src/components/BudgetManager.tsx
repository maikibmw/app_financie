'use client';

import { useMemo, useState } from 'react';
import { Category, Transaction, Budget } from '@/types';

interface BudgetManagerProps {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  onSaveBudget: (categoryId: string, limitAmount: number) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export default function BudgetManager({
  categories,
  transactions,
  budgets,
  onSaveBudget,
  onDeleteBudget,
}: BudgetManagerProps) {
  const expenseCategories = useMemo(
    () => categories.filter((cat) => cat.type === 'EXPENSE'),
    [categories]
  );

  // Používateľom vybraná kategória (jeho "surová" voľba).
  const [pickedCatId, setPickedCatId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Skutočne platná kategória: ak vybraná neexistuje (napr. bola zmazaná),
  // automaticky spadneme na prvú dostupnú. Odvodené bez useEffectu.
  const selectedCatId = useMemo(() => {
    if (expenseCategories.some((cat) => cat.id === pickedCatId)) {
      return pickedCatId;
    }
    return expenseCategories[0]?.id ?? '';
  }, [expenseCategories, pickedCatId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !limitAmount) return;
    onSaveBudget(selectedCatId, Number(limitAmount));
    setLimitAmount('');
  };

  const handleEdit = (budget: Budget) => {
    setPickedCatId(budget.categoryId);
    setLimitAmount(String(budget.limitAmount));
    setIsOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Mesačné rozpočty</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {isOpen ? 'Skryť' : 'Zobraziť'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          <form onSubmit={handleSave} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategória
              </label>
              <select
                value={selectedCatId}
                onChange={(e) => setPickedCatId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={expenseCategories.length === 0}
              >
                {expenseCategories.length === 0 && (
                  <option value="">Najprv pridajte výdavkovú kategóriu</option>
                )}
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesačný limit (€)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="napr. 200"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
              disabled={!selectedCatId}
            >
              Uložiť rozpočet
            </button>
          </form>

          {budgets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Zatiaľ nemáte žiadny vlastný rozpočet. Vyberte kategóriu, zadajte limit a uložte.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {budgets.map((budget) => {
                const cat = categories.find((c) => c.id === budget.categoryId);

                const spent = transactions
                  .filter((t) => t.categoryId === budget.categoryId && t.type === 'EXPENSE')
                  .reduce((sum, t) => sum + t.amount, 0);

                const limit = budget.limitAmount;
                const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

                return (
                  <div
                    key={budget.id}
                    className="p-4 border border-gray-200 rounded-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {cat?.name ?? 'Neznáma kategória'}
                        </h3>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(budget)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Upraviť
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteBudget(budget.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Zmazať
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Minuté: {spent.toFixed(2)} €</span>
                        <span>Limit: {limit.toFixed(2)} €</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            spent > limit ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
