'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, RecurrenceInterval, Category, Budget } from '@/types';
import { MOCK_TRANSACTIONS, INITIAL_CATEGORIES, SAMPLE_BENCHMARKS } from '@/data/mockData';
import CategoryManager from '@/components/CategoryManager';
import BudgetManager from '@/components/BudgetManager';
import ContractManager from '@/components/ContractManager';
import SummaryCards from '@/components/SummaryCards';
import TransactionForm from '@/components/TransactionForm';
import PlannedTransactions from '@/components/PlannedTransactions';
import CompletedTransactions from '@/components/CompletedTransactions';
import EditTransactionModal from '@/components/EditTransactionModal';
import DataBackup from '@/components/DataBackup';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Stav pre úpravu transakcie
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Prepínač pre zobrazenie všetkých plánovaných platieb
  const [showAllPlanned, setShowAllPlanned] = useState(false);

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
    if (confirm('Naozaj chceš obnoviť predvolené testovacie dáta, kategórie aj rozpočty?')) {
      setTransactions(MOCK_TRANSACTIONS);
      setCategories(INITIAL_CATEGORIES);
      setBudgets([]);
      localStorage.setItem('app_transactions', JSON.stringify(MOCK_TRANSACTIONS));
      localStorage.setItem('app_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.removeItem('app_budgets');
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
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        totalPlannedExpense={totalPlannedExpense}
        showAllPlanned={showAllPlanned}
      />

      {/* MODUL: Záloha dát (export / import) */}
      <DataBackup
        transactions={transactions}
        categories={categories}
        budgets={budgets}
        onImport={handleImportData}
      />

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
      <TransactionForm categories={categories} onAddTransaction={handleAddTransaction} />

      {/* SEKCIA 1: Očakávané výdavky */}
      {allPlannedTransactions.length > 0 && (
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
      )}

      {/* SEKCIA 2: Realizované transakcie */}
      <CompletedTransactions
        transactions={completedTransactions}
        categories={categories}
        onEdit={setEditingTx}
        onDelete={handleDeleteTransaction}
      />

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