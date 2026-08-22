'use client';

import { useState } from 'react';
import { Goal } from '@/types';

// Cieľ obohatený o dopočítané hodnoty (počíta ich page.tsx).
export interface GoalWithCalc {
  goal: Goal;
  monthlyRequired: number;   // koľko treba odkladať mesačne
  monthsRemaining: number;   // koľko mesiacov ostáva
  isReached: boolean;        // už nasporené?
  isOverdue: boolean;        // termín už prešiel a nie je nasporené?
}

interface GoalManagerProps {
  goals: GoalWithCalc[];
  onAddGoal: (data: { title: string; targetAmount: number; targetDate: string }) => void;
  onDeleteGoal: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
}

export default function GoalManager({
  goals,
  onAddGoal,
  onDeleteGoal,
  onContribute,
}: GoalManagerProps) {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [contribInputs, setContribInputs] = useState<Record<string, string>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !targetDate) return;
    if (parseFloat(targetAmount) <= 0) return;

    onAddGoal({
      title: title.trim(),
      targetAmount: parseFloat(targetAmount),
      targetDate,
    });

    setTitle('');
    setTargetAmount('');
    setTargetDate('');
  };

  const handleContribute = (id: string) => {
    const raw = contribInputs[id];
    const value = parseFloat(raw);
    if (!value || value <= 0) return;
    onContribute(id, value);
    setContribInputs((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">🎯 Sporiace ciele</h2>
        <p className="text-sm text-gray-500">
          Zadaj cieľ a dokedy ho chceš dosiahnuť. Appka dopočíta, koľko si treba
          mesačne odkladať, a odráta to z voľných peňazí.
        </p>
      </div>

      {/* Formulár na pridanie cieľa */}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        <div className="md:col-span-2">
          <label className="text-xs text-gray-600 block mb-1">Názov cieľa:</label>
          <input
            type="text"
            placeholder="napr. Dovolenka, Vianočné darčeky"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Cieľová suma (€):</label>
          <input
            type="number"
            step="0.01"
            placeholder="5000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Dokedy:</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            required
          />
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors"
          >
            Pridať cieľ
          </button>
        </div>
      </form>

      {/* Zoznam cieľov */}
      {goals.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Zatiaľ nemáš žiadny cieľ. Skús pridať napríklad dovolenku alebo núdzový fond.
        </p>
      ) : (
        <div className="space-y-3">
          {goals.map(({ goal, monthlyRequired, monthsRemaining, isReached, isOverdue }) => {
            const percent = Math.min(
              100,
              goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
            );

            return (
              <div key={goal.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{goal.title}</p>
                    <p className="text-xs text-gray-500">
                      {goal.currentAmount.toFixed(2)} € z {goal.targetAmount.toFixed(2)} €
                      {' · '}termín {goal.targetDate}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                    title="Zmazať cieľ"
                  >
                    🗑️
                  </button>
                </div>

                {/* Ukazovateľ postupu */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${isReached ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Stav / mesačná suma */}
                  <div className="text-sm">
                    {isReached ? (
                      <span className="text-emerald-700 font-medium">✅ Cieľ dosiahnutý!</span>
                    ) : isOverdue ? (
                      <span className="text-rose-600 font-medium">
                        ⚠️ Termín prešiel · chýba {(goal.targetAmount - goal.currentAmount).toFixed(2)} €
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        Odkladaj{' '}
                        <span className="font-semibold text-blue-700">
                          {monthlyRequired.toFixed(2)} € / mesiac
                        </span>{' '}
                        <span className="text-gray-400">
                          (ostáva {monthsRemaining} {monthsRemaining === 1 ? 'mesiac' : 'mes.'})
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Pridať odloženú sumu */}
                  {!isReached && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="+ suma"
                        value={contribInputs[goal.id] || ''}
                        onChange={(e) =>
                          setContribInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))
                        }
                        className="w-24 p-1.5 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={() => handleContribute(goal.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                      >
                        Odložiť
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}