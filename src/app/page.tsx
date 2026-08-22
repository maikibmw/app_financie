'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, RecurrenceInterval, Category, Budget, Goal } from '@/types';
import { MOCK_TRANSACTIONS, INITIAL_CATEGORIES, SAMPLE_BENCHMARKS } from '@/data/mockData';
import CategoryManager from '@/components/CategoryManager';
import BudgetManager from '@/components/BudgetManager';
import ContractManager from '@/components/ContractManager';
import SummaryCards from '@/components/SummaryCards';
import MonthlyOverview from '@/components/MonthlyOverview';
import GoalManager, { GoalWithCalc } from '@/components/GoalManager';
import TransactionForm from '@/components/TransactionForm';
import PlannedTransactions from '@/components/PlannedTransactions';
import CompletedTransactions from '@/components/CompletedTransactions';
import EditTransactionModal from '@/components/EditTransactionModal';
import DataBackup from '@/components/DataBackup';

// Vektorové ikonky sekcií (bez externej knižnice). Farbu určuje rodič cez currentColor.
function SectionIcon({ name }: { name: string }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'calendar':
      return (<svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>);
    case 'target':
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>);
    case 'file':
      return (<svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>);
    case 'chart':
      return (<svg {...p}><path d="M3 21h18M7 21V11M12 21V6M17 21v-7" /></svg>);
    case 'plus':
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>);
    case 'clock':
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
    case 'check':
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>);
    case 'tag':
      return (<svg {...p}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><circle cx="7" cy="7" r="1.2" /></svg>);
    case 'wallet':
      return (<svg {...p}><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" /><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" /><path d="M21 12h-4a2 2 0 0 0 0 4h4z" /></svg>);
    case 'shield':
      return (<svg {...p}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>);
    default:
      return null;
  }
}

// Sekcia: farebná ikonka + ľudský názov + popisok (+ voliteľná nálepka), pod tým karta.
function Section({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <span style={{ color: iconColor, display: 'flex' }}>
            <SectionIcon name={icon} />
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {badge && <span className="fin-badge">{badge}</span>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Stav pre úpravu transakcie
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Prepínač pre zobrazenie všetkých plánovaných platieb
  const [showAllPlanned, setShowAllPlanned] = useState(false);

  // Aktívna záložka: prehlad | zaznamy | nastavenie
  const [activeTab, setActiveTab] = useState<'prehlad' | 'zaznamy' | 'nastavenie'>('prehlad');

  // Načítanie uložených dát z localStorage pri prvom otvorení appky.
  // Toto je legitímne "načítanie z externého úložiska", preto tu zámerne
  // vypíname pravidlo, ktoré inak varuje pred setState vo useEffect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedCategories = localStorage.getItem('app_categories');
    let currentCats = INITIAL_CATEGORIES;

    if (savedCategories) {
      try {
        currentCats = JSON.parse(savedCategories);
      } catch {
        currentCats = INITIAL_CATEGORIES;
      }
    }
    setCategories(currentCats);

    const savedBudgets = localStorage.getItem('app_budgets');
    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch {
        setBudgets([]);
      }
    }

    const savedGoals = localStorage.getItem('app_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch {
        setGoals([]);
      }
    }

    const savedTransactions = localStorage.getItem('app_transactions');
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch {
        setTransactions(MOCK_TRANSACTIONS);
      }
    } else {
      setTransactions(MOCK_TRANSACTIONS);
    }

    setIsLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Uloženia do localStorage
  useEffect(() => {
    if (isLoaded) localStorage.setItem('app_transactions', JSON.stringify(transactions));
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('app_categories', JSON.stringify(categories));
  }, [categories, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('app_budgets', JSON.stringify(budgets));
  }, [budgets, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('app_goals', JSON.stringify(goals));
  }, [goals, isLoaded]);

  const handleSaveBudget = (catId: string, limitAmount: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.categoryId === catId);
      if (existing) {
        return prev.map((b) => (b.categoryId === catId ? { ...b, limitAmount } : b));
      }
      return [...prev, { id: `b-${crypto.randomUUID()}`, categoryId: catId, limitAmount }];
    });
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  };

  const handleAddCategory = (newCatData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...newCatData,
      id: `cat-${crypto.randomUUID()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('Musí zostať aspoň jedna kategória.');
      return;
    }
    if (confirm('Naozaj chceš zmazať túto kategóriu? Transakcie v nej ostanú.')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
    }
  };

  const calculateNextDate = (dateString: string, interval: RecurrenceInterval): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (interval === 'WEEKLY') date.setDate(date.getDate() + 7);
    else if (interval === 'MONTHLY') date.setMonth(date.getMonth() + 1);
    else if (interval === 'YEARLY') date.setFullYear(date.getFullYear() + 1);

    return date.toISOString().split('T')[0];
  };

  const markAsCompleted = (tx: Transaction) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setTransactions((prev) => {
      const updatedList = prev.map((item) =>
        item.id === tx.id
          ? { ...item, status: 'COMPLETED' as TransactionStatus, date: todayStr }
          : item
      );

      if (tx.isRecurring && tx.recurrenceInterval && tx.recurrenceInterval !== 'NONE') {
        const baseDate = tx.dueDate || tx.date || todayStr;
        const nextDueDate = calculateNextDate(baseDate, tx.recurrenceInterval);

        const nextTransaction: Transaction = {
          ...tx,
          id: `tx-${crypto.randomUUID()}`,
          status: 'PLANNED',
          date: todayStr,
          dueDate: nextDueDate,
        };

        return [nextTransaction, ...updatedList];
      }

      return updatedList;
    });
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Naozaj chceš vymazať túto transakciu?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === editingTx.id ? editingTx : t))
    );
    setEditingTx(null);
  };

  const handleResetData = () => {
    if (confirm('Naozaj chceš obnoviť predvolené testovacie dáta, kategórie, rozpočty aj ciele?')) {
      setTransactions(MOCK_TRANSACTIONS);
      setCategories(INITIAL_CATEGORIES);
      setBudgets([]);
      setGoals([]);
      localStorage.setItem('app_transactions', JSON.stringify(MOCK_TRANSACTIONS));
      localStorage.setItem('app_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.removeItem('app_budgets');
      localStorage.removeItem('app_goals');
    }
  };

  const handleImportData = (data: {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
  }) => {
    setTransactions(data.transactions);
    setCategories(data.categories);
    setBudgets(data.budgets);
    // Uloženie do localStorage prebehne automaticky cez efekty vyššie.
  };

  const handleAddGoal = (data: { title: string; targetAmount: number; targetDate: string }) => {
    const newGoal: Goal = {
      id: `goal-${crypto.randomUUID()}`,
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      targetDate: data.targetDate,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Naozaj chceš zmazať tento cieľ?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleContributeGoal = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
  };

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const todayStr = new Date().toISOString().split('T')[0];

  const completedTransactions = transactions.filter((t) => t.status === 'COMPLETED');
  const allPlannedTransactions = transactions.filter((t) => t.status === 'PLANNED');

  const visiblePlannedTransactions = allPlannedTransactions.filter((t) => {
    if (showAllPlanned) return true;
    const itemMonth = t.dueDate ? t.dueDate.slice(0, 7) : t.date.slice(0, 7);
    const isOverdue = t.dueDate ? t.dueDate < todayStr : false;

    return itemMonth === currentMonthStr || isOverdue;
  });

  const totalIncome = completedTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = completedTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const totalPlannedExpense = visiblePlannedTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  // === Mesačný prehľad "Koľko mi ostáva" (Safe-to-Spend) ===
  // Berieme celý aktuálny mesiac ako plán dopredu.
  const monthOf = (t: Transaction) => (t.dueDate || t.date).slice(0, 7);
  const thisMonthTx = transactions.filter((t) => monthOf(t) === currentMonthStr);

  // Príjem za mesiac: uhradený aj očakávaný.
  const monthlyIncome = thisMonthTx
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  // Fixné záväzky = všetky výdavkové transakcie tohto mesiaca
  // (zapísané zmluvy: hypotéka, paušály, poistky – uhradené aj plánované).
  const monthlyFixed = thisMonthTx
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  // Obálky = paušálne rozpočty (budgety). Aby sme nezdvojovali sumy,
  // počítame len rozpočty pre kategórie, ktoré tento mesiac nemajú
  // vlastné zapísané výdavky.
  const categoriesWithExpensesThisMonth = new Set(
    thisMonthTx.filter((t) => t.type === 'EXPENSE').map((t) => t.categoryId)
  );
  const monthlyEnvelopes = budgets
    .filter((b) => !categoriesWithExpensesThisMonth.has(b.categoryId))
    .reduce((acc, b) => acc + b.limitAmount, 0);

  // === Ciele: dopočítame mesačnú sumu potrebnú na dosiahnutie ===
  const monthsBetween = (fromDate: Date, toDateStr: string): number => {
    const to = new Date(toDateStr);
    if (isNaN(to.getTime())) return 1;
    const months =
      (to.getFullYear() - fromDate.getFullYear()) * 12 +
      (to.getMonth() - fromDate.getMonth());
    return months;
  };

  const goalsWithCalc: GoalWithCalc[] = goals.map((goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const isReached = remaining <= 0;

    const monthsLeftRaw = monthsBetween(new Date(), goal.targetDate);
    const isOverdue = !isReached && monthsLeftRaw < 0;
    // Aspoň 1 mesiac, aby sme nedelili nulou ani zápornom.
    const monthsRemaining = Math.max(1, monthsLeftRaw);
    const monthlyRequired = isReached ? 0 : Math.max(0, remaining) / monthsRemaining;

    return { goal, monthlyRequired, monthsRemaining, isReached, isOverdue };
  });

  // Súčet mesačných odkladov na ciele -> riadok vo vodopáde.
  const monthlyGoals = goalsWithCalc.reduce((acc, g) => acc + g.monthlyRequired, 0);

  const freeToSpend = monthlyIncome - monthlyFixed - monthlyEnvelopes - monthlyGoals;

  // Koľko dní ostáva do konca mesiaca (vrátane dneška).
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - today.getDate() + 1);
  const perDay = freeToSpend > 0 ? freeToSpend / remainingDays : 0;

  const SK_MONTHS = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December',
  ];
  const monthLabel = `${SK_MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  if (!isLoaded) {
    return (
      <main className="max-w-4xl mx-auto p-8 text-center" style={{ color: 'var(--ink-faint)' }}>
        Načítavam dáta...
      </main>
    );
  }

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'prehlad', label: 'Prehľad' },
    { id: 'zaznamy', label: 'Záznamy' },
    { id: 'nastavenie', label: 'Nastavenie' },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Hlavička */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'var(--brand)' }}
          >
            👛
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
              Naše financie
            </h1>
            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
              {monthLabel}
            </p>
          </div>
        </div>
        <button
          onClick={handleResetData}
          className="text-xs hover:underline"
          style={{ color: 'var(--ink-faint)' }}
        >
          Obnoviť vzorové dáta
        </button>
      </header>

      {/* Záložky */}
      <nav className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors fin-tab"
              style={
                isActive
                  ? {
                      background: 'var(--brand)',
                      color: '#ffffff',
                      border: '1.5px solid transparent',
                      boxShadow: '0 4px 14px -4px rgba(124,92,252,0.5)',
                    }
                  : {
                      background: '#ffffff',
                      color: '#6b6480',
                      border: '1.5px solid #e2daf6',
                      boxShadow: '0 2px 8px -4px rgba(124,92,252,0.25)',
                    }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ====================== ZÓNA: PREHĽAD ====================== */}
      {activeTab === 'prehlad' && (
        <div className="space-y-6">
          <Section icon="calendar" iconColor="#7c5cfc" iconBg="#efeafc" title="Tento mesiac" subtitle="koľko ti reálne ostáva na míňanie">
            <MonthlyOverview
              monthLabel={monthLabel}
              income={monthlyIncome}
              fixedObligations={monthlyFixed}
              envelopes={monthlyEnvelopes}
              goals={monthlyGoals}
              free={freeToSpend}
              perDay={perDay}
              remainingDays={remainingDays}
              hasIncome={monthlyIncome > 0}
            />
          </Section>

          <Section icon="target" iconColor="#0f9d6e" iconBg="#eafaf1" title="Na čo si sporíš" subtitle="dovolenka, rezerva, väčšia kúpa">
            <GoalManager
              goals={goalsWithCalc}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
              onContribute={handleContributeGoal}
            />
          </Section>

          <Section icon="file" iconColor="#e0714f" iconBg="#fff2ec" title="Zmluvy a paušály" subtitle="strážime, kde sa dá ušetriť" badge="💡 Tipy na úspory">
            <ContractManager
              transactions={transactions}
              categories={categories}
              benchmarks={SAMPLE_BENCHMARKS}
            />
          </Section>
        </div>
      )}

      {/* ====================== ZÓNA: ZÁZNAMY ====================== */}
      {activeTab === 'zaznamy' && (
        <div className="space-y-6">
          <Section icon="chart" iconColor="#64748b" iconBg="#f1f2f6" title="Spätný pohľad" subtitle="čo sa reálne udialo tento mesiac">
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              totalPlannedExpense={totalPlannedExpense}
              showAllPlanned={showAllPlanned}
            />
          </Section>

          <Section icon="plus" iconColor="#7c5cfc" iconBg="#efeafc" title="Nová transakcia" subtitle="pridaj príjem, výdavok alebo záväzok">
            <TransactionForm categories={categories} onAddTransaction={handleAddTransaction} />
          </Section>

          {allPlannedTransactions.length > 0 && (
            <Section icon="clock" iconColor="#b4690e" iconBg="#fdf6ec" title="Očakávané výdavky" subtitle="platby, ktoré ťa ešte čakajú">
              <PlannedTransactions
                visibleTransactions={visiblePlannedTransactions}
                categories={categories}
                showAllPlanned={showAllPlanned}
                todayStr={todayStr}
                onToggleShowAll={() => setShowAllPlanned(!showAllPlanned)}
                onMarkCompleted={markAsCompleted}
                onEdit={setEditingTx}
                onDelete={handleDeleteTransaction}
              />
            </Section>
          )}

          <Section icon="check" iconColor="#0f9d6e" iconBg="#eafaf1" title="Uhradené transakcie" subtitle="všetko, čo je už zaplatené">
            <CompletedTransactions
              transactions={completedTransactions}
              categories={categories}
              onEdit={setEditingTx}
              onDelete={handleDeleteTransaction}
            />
          </Section>
        </div>
      )}

      {/* ==================== ZÓNA: NASTAVENIE ==================== */}
      {activeTab === 'nastavenie' && (
        <div className="space-y-6">
          <Section icon="tag" iconColor="#7c5cfc" iconBg="#efeafc" title="Kategórie" subtitle="ako si triediš príjmy a výdavky">
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </Section>

          <Section icon="wallet" iconColor="#0f9d6e" iconBg="#eafaf1" title="Rozpočty (obálky)" subtitle="mesačné limity na bežné míňanie">
            <BudgetManager
              categories={categories}
              transactions={transactions}
              budgets={budgets}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </Section>

          <Section icon="shield" iconColor="#64748b" iconBg="#f1f2f6" title="Záloha dát" subtitle="stiahni si dáta alebo obnov zo zálohy">
            <DataBackup
              transactions={transactions}
              categories={categories}
              budgets={budgets}
              onImport={handleImportData}
            />
          </Section>
        </div>
      )}

      {/* MODAL OKNO PRE ÚPRAVU TRANSAKCIE */}
      {editingTx && (
        <EditTransactionModal
          value={editingTx}
          categories={categories}
          onChange={setEditingTx}
          onSubmit={handleUpdateTransaction}
          onCancel={() => setEditingTx(null)}
        />
      )}
    </main>
  );
}