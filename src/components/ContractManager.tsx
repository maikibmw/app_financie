'use client';

import { useState } from 'react';
import { Category, Transaction, CategoryBenchmark, RecurrenceInterval } from '@/types';

function toMonthlyAmount(amount: number, interval?: RecurrenceInterval): number {
  switch (interval) {
    case 'WEEKLY':
      return (amount * 52) / 12;
    case 'MONTHLY':
      return amount;
    case 'YEARLY':
      return amount / 12;
    default:
      return amount;
  }
}

function recurrenceLabel(interval?: RecurrenceInterval): string {
  switch (interval) {
    case 'WEEKLY':
      return 'Týždenne';
    case 'MONTHLY':
      return 'Mesačne';
    case 'YEARLY':
      return 'Ročne';
    default:
      return 'Jednorazovo';
  }
}

function isCommitment(tx: Transaction): boolean {
  if (tx.type !== 'EXPENSE') return false;
  return Boolean(tx.provider || tx.contractNumber || tx.contractEndDate);
}

function contractSeriesKey(tx: Transaction): string {
  return [
    tx.description.trim().toLowerCase(),
    tx.provider ?? '',
    tx.contractNumber ?? '',
    tx.recurrenceInterval ?? 'NONE',
  ].join('|');
}

function latestCommitments(transactions: Transaction[]): Transaction[] {
  const latestBySeries = new Map<string, Transaction>();

  for (const tx of transactions) {
    if (!isCommitment(tx)) continue;

    const key = contractSeriesKey(tx);
    const existing = latestBySeries.get(key);
    const txTime = tx.dueDate || tx.date;
    if (!existing || (existing.dueDate || existing.date) < txTime) {
      latestBySeries.set(key, tx);
    }
  }

  return [...latestBySeries.values()].sort((a, b) =>
    a.description.localeCompare(b.description, 'sk')
  );
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchesBenchmark(tx: Transaction, benchmark: CategoryBenchmark): boolean {
  if (benchmark.categoryId !== tx.categoryId) return false;

  const keywords = benchmark.keywords?.filter(Boolean) ?? [];
  if (keywords.length === 0) return false;

  const haystack = normalizeText(
    [tx.description, tx.provider, tx.note].filter(Boolean).join(' ')
  );

  return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('sk-SK');
}

interface ContractManagerProps {
  categories: Category[];
  transactions: Transaction[];
  benchmarks?: CategoryBenchmark[];
}

export default function ContractManager({
  categories = [],
  transactions = [],
  benchmarks = [],
}: ContractManagerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const contracts = latestCommitments(transactions);

  return (
    <div className="fin-card p-6 space-y-4">
      <div className="flex justify-between items-center ">
        <div>
          <p className="text-xs text-gray-500">
            Každá služba zvlášť, s tipom len ak sa odporúčanie týka práve jej
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {isOpen ? 'Skryť' : 'Zobraziť'}
        </button>
      </div>

      {isOpen && (
        <div className="grid gap-4 md:grid-cols-2">
          {contracts.map((tx) => {
            const category = categories.find((cat) => cat.id === tx.categoryId);
            const monthly = toMonthlyAmount(tx.amount, tx.recurrenceInterval);
            const isRecurring =
              Boolean(tx.isRecurring) && tx.recurrenceInterval && tx.recurrenceInterval !== 'NONE';
            const benchmark = benchmarks.find((b) => matchesBenchmark(tx, b));
            const savings =
              benchmark && isRecurring && monthly > benchmark.averagePrice
                ? monthly - benchmark.averagePrice
                : 0;

            return (
              <div
                key={tx.id}
                className="p-4 border border-blue-100 bg-blue-50/40 rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{tx.description}</h3>
                    {tx.provider && (
                      <p className="text-xs text-gray-600 mt-0.5">🏢 {tx.provider}</p>
                    )}
                  </div>
                  {category && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded shrink-0">
                      {category.name}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    Platba:{' '}
                    <strong className="text-gray-900">
                      {tx.amount.toFixed(2)} € · {recurrenceLabel(tx.recurrenceInterval)}
                    </strong>
                  </p>
                  {isRecurring && (
                    <p>
                      Mesačný prepočet:{' '}
                      <strong className="text-gray-900">{monthly.toFixed(2)} € / mes.</strong>
                    </p>
                  )}
                  {tx.contractNumber && <p>Číslo zmluvy / VS: {tx.contractNumber}</p>}
                  {tx.contractEndDate && (
                    <p>Koniec viazanosti: {formatDate(tx.contractEndDate)}</p>
                  )}
                  {tx.note && <p className="italic text-gray-500">{tx.note}</p>}
                </div>

                {benchmark ? (
                  <div className="mt-2 pt-2 border-t border-blue-100 text-xs space-y-1">
                    <div className="font-bold text-blue-900">
                      💡 Odporúčanie pre túto službu
                    </div>
                    <p className="text-blue-800 leading-snug">{benchmark.recommendationNote}</p>
                    <div className="text-[11px] text-blue-700 font-medium pt-1">
                      Trhová cena pre túto službu: {benchmark.averagePrice.toFixed(2)} € / mes.
                    </div>
                    {savings > 0 && (
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Voči trhu platíte o {savings.toFixed(2)} € / mes. viac.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 pt-1">
                    Pre túto konkrétnu službu zatiaľ nemáme trhové porovnanie.
                  </p>
                )}
              </div>
            );
          })}

          {contracts.length === 0 && (
            <div className="col-span-2 text-center text-xs text-gray-500 py-4">
              Zatiaľ nemáte pridanú žiadnu zmluvu ani viazanosť. Pri výdavku otvorte
              „detaily zmluvy“ a vyplňte poskytovateľa, číslo zmluvy alebo dátum konca viazanosti.
            </div>
          )}
        </div>
      )}
    </div>
  );
}