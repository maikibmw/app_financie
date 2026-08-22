'use client';

import { Category, Transaction } from '@/types';

interface CompletedTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function CompletedTransactions({
  transactions,
  categories,
  onEdit,
  onDelete,
}: CompletedTransactionsProps) {
  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <section className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Uhradené transakcie</h2>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
            <th className="px-6 py-3">Popis / Poskytovateľ</th>
            <th className="px-6 py-3">Kategória</th>
            <th className="px-6 py-3">Typ platby</th>
            <th className="px-6 py-3">Dátum úhrady</th>
            <th className="px-6 py-3 text-right">Suma</th>
            <th className="px-6 py-3 text-center">Akcie</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {transactions.map((tx) => {
            const category = getCategory(tx.categoryId);
            const isIncome = tx.type === 'INCOME';

            return (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{tx.description}</div>
                  {tx.provider && (
                    <div className="text-xs text-gray-500">🏢 {tx.provider}</div>
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
                <td className="px-6 py-4 text-xs text-gray-500">
                  {tx.recurrenceInterval && tx.recurrenceInterval !== 'NONE' ? '🔄 Opakovaná' : 'Jednorazová'}
                </td>
                <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                <td
                  className={`px-6 py-4 text-right font-bold ${
                    isIncome ? 'text-emerald-600' : 'text-gray-900'
                  }`}
                >
                  {isIncome ? '+' : '-'}{tx.amount.toFixed(2)} €
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => onEdit(tx)}
                      className="text-gray-500 hover:text-blue-600 p-1 text-xs"
                      title="Upraviť transakciu"
                    >
                      ✏️ Upraviť
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="text-gray-400 hover:text-red-600 p-1 text-xs"
                      title="Vymazať transakciu"
                    >
                      🗑️ Zmazať
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}