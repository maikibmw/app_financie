'use client';

import { useState } from 'react';
import { Goal } from '@/types';

export interface GoalWithCalc {
  goal: Goal;
  monthlyRequired: number;
  monthsRemaining: number;
  isReached: boolean;
  isOverdue: boolean;
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
    onAddGoal({ title: title.trim(), targetAmount: parseFloat(targetAmount), targetDate });
    setTitle('');
    setTargetAmount('');
    setTargetDate('');
  };

  const handleContribute = (id: string) => {
    const value = parseFloat(contribInputs[id]);
    if (!value || value <= 0) return;
    onContribute(id, value);
    setContribInputs((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <section className="fin-card p-6 space-y-4">
      <div>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>
          Zadaj cieľ a dokedy ho chceš dosiahnuť. Appka dopočíta mesačný odklad a odráta ho z voľných peňazí.
        </p>
      </div>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>Názov cieľa:</label>
          <input type="text" placeholder="napr. Dovolenka, Vianočné darčeky" value={title}
            onChange={(e) => setTitle(e.target.value)} className="fin-input" required />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>Cieľová suma (€):</label>
          <input type="number" step="0.01" placeholder="5000" value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)} className="fin-input" required />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--ink-soft)' }}>Dokedy:</label>
          <input type="date" value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)} className="fin-input" required />
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button type="submit" className="fin-btn fin-btn-primary">Pridať cieľ</button>
        </div>
      </form>

      {goals.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--ink-faint)' }}>
          Zatiaľ nemáš žiadny cieľ. Skús pridať napríklad dovolenku alebo núdzový fond.
        </p>
      ) : (
        <div className="space-y-3">
          {goals.map(({ goal, monthlyRequired, monthsRemaining, isReached, isOverdue }) => {
            const percent = Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
            return (
              <div key={goal.id} className="p-4 rounded-2xl" style={{ background: '#faf9fd', border: '1px solid var(--brand-border)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--ink)' }}>{goal.title}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                      {goal.currentAmount.toFixed(2)} € z {goal.targetAmount.toFixed(2)} € · termín {goal.targetDate}
                    </p>
                  </div>
                  <button onClick={() => onDeleteGoal(goal.id)} className="text-sm"
                    style={{ color: 'var(--ink-faint)' }} title="Zmazať cieľ">🗑️</button>
                </div>

                <div className="w-full rounded-full h-2.5 mb-2 overflow-hidden" style={{ background: 'var(--brand-soft)' }}>
                  <div className="h-2.5 rounded-full"
                    style={{ width: `${percent}%`, background: isReached ? 'var(--pos)' : 'var(--brand)' }} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    {isReached ? (
                      <span className="font-medium" style={{ color: 'var(--pos)' }}>✅ Cieľ dosiahnutý!</span>
                    ) : isOverdue ? (
                      <span className="font-medium" style={{ color: 'var(--neg)' }}>
                        ⚠️ Termín prešiel · chýba {(goal.targetAmount - goal.currentAmount).toFixed(2)} €
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ink-soft)' }}>
                        Odkladaj{' '}
                        <span className="font-semibold" style={{ color: 'var(--brand-dark)' }}>
                          {monthlyRequired.toFixed(2)} € / mesiac
                        </span>{' '}
                        <span style={{ color: 'var(--ink-faint)' }}>
                          (ostáva {monthsRemaining} {monthsRemaining === 1 ? 'mesiac' : 'mes.'})
                        </span>
                      </span>
                    )}
                  </div>

                  {!isReached && (
                    <div className="flex items-center gap-1">
                      <input type="number" step="0.01" placeholder="+ suma"
                        value={contribInputs[goal.id] || ''}
                        onChange={(e) => setContribInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                        className="fin-input" style={{ width: '6rem' }} />
                      <button onClick={() => handleContribute(goal.id)} className="fin-btn fin-btn-primary" style={{ padding: '0.4rem 0.9rem' }}>
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