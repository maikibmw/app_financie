'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, RecurrenceInterval, Category, Budget, CategoryBenchmark } from '@/types';
import { MOCK_TRANSACTIONS, INITIAL_CATEGORIES } from '@/data/mockData';
import CategoryManager from '@/components/CategoryManager';
import BudgetManager from '@/components/BudgetManager';
import ContractManager from '@/components/ContractManager';
// Ukážkové dáta pre porovnanie cien, ktoré neskôr budú chodiť z Admin rozhrania
const SAMPLE_BENCHMARKS: CategoryBenchmark[] = [
  {
    categoryId: 'cat-4',
    averagePrice: 20.00,
    recommendationNote: 'Na trhu sú dostupné balíky s optikou od 19,90 € / mesiac.',
    keywords: ['internet', 'optika', 'wifi', 'tv', 'televízia', 'televizia', 'orange', 'telekom', 'o2', 'swan'],
  },
  {
    categoryId: 'cat-1',
    averagePrice: 110.00,
    recommendationNote: 'Priemerná záloha v SR je 110 €. Skontrolujte si ročné zúčtovanie.',
    keywords: ['energia', 'elektrina', 'plyn', 'spp', 'záloha', 'zaloha', 'kúrenie', 'kurenie', 'voda', 'zse', 'sse'],
  },
];
export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Základné polia pre novú transakciu
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [status, setStatus] = useState<TransactionStatus>('COMPLETED');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('NONE');

  // KROK 2: Nové polia pre Zmluvy / Paušály
  const [provider, setProvider] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [note, setNote] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Stav pre úpravu transakcie
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Prepínač pre zobrazenie všetkých plánovaných platieb
  const [showAllPlanned, setShowAllPlanned] = useState(false);

  // Načítanie z localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('app_categories');
    let currentCats = INITIAL_CATEGORIES;

    if (savedCategories) {
      try {
        currentCats = JSON.parse(savedCategories);
      } catch (e) {
        currentCats = INITIAL_CATEGORIES;
      }
    }
    setCategories(currentCats);

    if (currentCats.length > 0) {
      setCategoryId(currentCats[0].id);
    }

    const savedBudgets = localStorage.getItem('app_budgets');
    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch (e) {
        setBudgets([]);
      }
    }

    const savedTransactions = localStorage.getItem('app_transactions');
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        setTransactions(MOCK_TRANSACTIONS);
      }
    } else {
      setTransactions(MOCK_TRANSACTIONS);
    }

    setIsLoaded(true);
  }, []);

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

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const handleSaveBudget = (catId: string, limitAmount: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.categoryId === catId);
      if (existing) {
        return prev.map((b) => (b.categoryId === catId ? { ...b, limitAmount } : b));
      }
      return [...prev, { id: `b-${Date.now()}`, categoryId: catId, limitAmount }];
    });
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  };

  const handleAddCategory = (newCatData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...newCatData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
    if (!categoryId) setCategoryId(newCategory.id);
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('Musí zostať aspoň jedna kategória.');
      return;
    }
    if (confirm('Naozaj chceš zmazať túto kategóriu? Transakcie v nej ostanú.')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
      if (categoryId === id) {
        const remaining = categories.filter((c) => c.id !== id);
        if (remaining.length > 0) setCategoryId(remaining[0].id);
      }
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
          id: `tx-${Date.now()}`,
          status: 'PLANNED',
          date: todayStr,
          dueDate: nextDueDate,
        };

        return [nextTransaction, ...updatedList];
      }

      return updatedList;
    });
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
    if (confirm('Naozaj chceš obnoviť predvolené testovacie dáta, kategórie aj rozpočty?')) {
      setTransactions(MOCK_TRANSACTIONS);
      setCategories(INITIAL_CATEGORIES);
      setBudgets([]);
      localStorage.setItem('app_transactions', JSON.stringify(MOCK_TRANSACTIONS));
      localStorage.setItem('app_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.removeItem('app_budgets');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || parseFloat(amount) <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isRecurring = recurrenceInterval !== 'NONE';

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      description,
      amount: parseFloat(amount),
      type,
      categoryId: categoryId || (categories[0]?.id ?? ''),
      status,
      date: todayStr,
      dueDate: status === 'PLANNED' ? (dueDate || todayStr) : undefined,
      isRecurring,
      recurrenceInterval,
      provider: provider.trim() || undefined,
      contractNumber: contractNumber.trim() || undefined,
      contractEndDate: contractEndDate.trim() || undefined,
      note: note.trim() || undefined,
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    setDueDate('');
    setRecurrenceInterval('NONE');
    setProvider('');
    setContractNumber('');
    setContractEndDate('');
    setNote('');
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

  if (!isLoaded) {
    return <main className="max-w-4xl mx-auto p-8 text-center text-gray-500">Načítavam dáta...</main>;
  }

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aplikácia Financie</h1>
          <p className="text-gray-500">Prehľad príjmov a výdavkov</p>
        </div>
        <button
          onClick={handleResetData}
          className="text-xs text-gray-500 hover:text-red-600 underline"
        >
          Obnoviť vzorové dáta
        </button>
      </header>

      {/* Sumárne karty */}
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

      {/* MODUL: Mesačné rozpočty */}
      <BudgetManager
        categories={categories}
        transactions={transactions}
        budgets={budgets}
        onSaveBudget={handleSaveBudget}
        onDeleteBudget={handleDeleteBudget}
      />

      {/* MODUL: Správa zmlúv & viazaností */}
      <ContractManager
        transactions={transactions}
        categories={categories}
        benchmarks={SAMPLE_BENCHMARKS}
      />

      {/* MODUL: Správa kategórií */}
      <CategoryManager
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Formulár na pridanie transakcie */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Pridať novú transakciu / Záväzok</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Popis (napr. Paušál Mne)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Suma v €"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXPENSE">Výdavok</option>
              <option value="INCOME">Príjem</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TransactionStatus)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="COMPLETED">Uhradené</option>
              <option value="PLANNED">Očakávané</option>
            </select>

            {status === 'PLANNED' && (
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Dátum splatnosti:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Opakovanie platby:</label>
              <select
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
                className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NONE">Jednorazová platba</option>
                <option value="WEEKLY">Opakovať týždenne</option>
                <option value="MONTHLY">Opakovať mesačne</option>
                <option value="YEARLY">Opakovať ročne</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Kategória:</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type === 'INCOME' ? 'Príjem' : 'Výdavok'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prepínač pre pokročilé detaily zmluvy */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              {showAdvanced ? '▲ Skryť detaily zmluvy a viazanosti' : '▼ Pridať detaily zmluvy / Poskytovateľa (voliteľné)'}
            </button>
          </div>

          {showAdvanced && (
            <div className="p-4 bg-slate-50 rounded-md border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Poskytovateľ / Firma:</label>
                <input
                  type="text"
                  placeholder="napr. Orange, SPP, VÚB"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Číslo zmluvy / VS:</label>
                <input
                  type="text"
                  placeholder="napr. 82391029"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Koniec viazanosti / zmluvy:</label>
                <input
                  type="date"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Poznámka / Podmienky:</label>
                <input
                  type="text"
                  placeholder="napr. zľava 10% pri predĺžení"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md text-sm transition-colors"
            >
              Pridať transakciu
            </button>
          </div>
        </form>
      </section>

      {/* SEKCE 1: Očakávané výdavky */}
      {allPlannedTransactions.length > 0 && (
        <section className="bg-amber-50/50 rounded-lg border border-amber-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-amber-200 bg-amber-100/50 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-amber-900">
                Očakávané výdavky
              </h2>
              <span className="text-xs font-medium bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full">
                {visiblePlannedTransactions.length} položiek
              </span>
            </div>

            <button
              onClick={() => setShowAllPlanned(!showAllPlanned)}
              className="text-xs font-medium bg-amber-200/80 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded border border-amber-300 transition-colors"
            >
              {showAllPlanned ? 'Zobraziť len tento mesiac' : 'Zobraziť všetky plány ➔'}
            </button>
          </div>

          {visiblePlannedTransactions.length === 0 ? (
            <div className="p-6 text-center text-amber-800/70 text-sm">
              Na tento mesiac nemáš žiadne plánované výdavky.{' '}
              <button
                onClick={() => setShowAllPlanned(true)}
                className="underline font-semibold hover:text-amber-900"
              >
                Pozrieť výdavky v ďalších mesiacoch
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-amber-800 text-xs uppercase font-medium border-b border-amber-200">
                  <th className="px-6 py-3">Popis / Poskytovateľ</th>
                  <th className="px-6 py-3">Kategória</th>
                  <th className="px-6 py-3">Opakovanie</th>
                  <th className="px-6 py-3">Splatnosť</th>
                  <th className="px-6 py-3 text-right">Suma</th>
                  <th className="px-6 py-3 text-center">Akcia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/60 text-sm">
                {visiblePlannedTransactions.map((tx) => {
                  const category = getCategory(tx.categoryId);
                  const isOverdue = tx.dueDate ? tx.dueDate < todayStr : false;

                  return (
                    <tr key={tx.id} className="hover:bg-amber-100/30">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tx.description}</div>
                        {tx.provider && (
                          <div className="text-xs text-amber-900 font-semibold">🏢 {tx.provider}</div>
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
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {tx.recurrenceInterval === 'WEEKLY' && '🔄 Týždenne'}
                        {tx.recurrenceInterval === 'MONTHLY' && '🔄 Mesačne'}
                        {tx.recurrenceInterval === 'YEARLY' && '🔄 Ročne'}
                        {(!tx.recurrenceInterval || tx.recurrenceInterval === 'NONE') && '— Jednorazová'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>{tx.dueDate || tx.date}</span>
                          {isOverdue && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">
                              Po splatnosti
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-amber-900">
                        -{tx.amount.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => markAsCompleted(tx)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors"
                          >
                            DONE (Uhradené)
                          </button>
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="text-gray-500 hover:text-blue-600 text-xs px-2 py-1"
                            title="Upraviť"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="text-gray-400 hover:text-red-600 text-xs px-2 py-1"
                            title="Vymazať"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* SEKCE 2: Realizované transakcie */}
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
            {completedTransactions.map((tx) => {
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
                        onClick={() => setEditingTx(tx)}
                        className="text-gray-500 hover:text-blue-600 p-1 text-xs"
                        title="Upraviť transakciu"
                      >
                        ✏️ Upraviť
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
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

      {/* MODAL OKNO PRE ÚPRAVU TRANSAKCIE */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">Upraviť transakciu / Zmluvu</h3>
            <form onSubmit={handleUpdateTransaction} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Popis:</label>
                <input
                  type="text"
                  value={editingTx.description}
                  onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full p-2 border rounded-md text-sm mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Suma (€):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTx.amount}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 border rounded-md text-sm mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Dátum:</label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Typ:</label>
                  <select
                    value={editingTx.type}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, type: e.target.value as 'INCOME' | 'EXPENSE' })
                    }
                    className="w-full p-2 border rounded-md text-sm mt-1"
                  >
                    <option value="EXPENSE">Výdavok</option>
                    <option value="INCOME">Príjem</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Kategória:</label>
                  <select
                    value={editingTx.categoryId}
                    onChange={(e) => setEditingTx({ ...editingTx, categoryId: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm mt-1"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="my-2 border-gray-200" />
              <p className="text-xs font-bold text-gray-700">Parametre zmluvy / Poskytovateľa</p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Poskytovateľ:</label>
                  <input
                    type="text"
                    value={editingTx.provider || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, provider: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Číslo zmluvy / VS:</label>
                  <input
                    type="text"
                    value={editingTx.contractNumber || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, contractNumber: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Koniec viazanosti:</label>
                  <input
                    type="date"
                    value={editingTx.contractEndDate || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, contractEndDate: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Poznámka:</label>
                  <input
                    type="text"
                    value={editingTx.note || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, note: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Uložiť zmeny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}