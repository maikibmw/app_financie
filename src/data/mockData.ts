import { Category, Transaction, CategoryBenchmark } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Bývanie & Energie', type: 'EXPENSE', color: '#ef4444' },
  { id: 'cat-2', name: 'Potraviny & Domácnosť', type: 'EXPENSE', color: '#f97316' },
  { id: 'cat-3', name: 'Doprava & Auto', type: 'EXPENSE', color: '#eab308' },
  { id: 'cat-4', name: 'Služby & Paušály', type: 'EXPENSE', color: '#06b6d4' },
  { id: 'cat-5', name: 'Zábava & Voľný čas', type: 'EXPENSE', color: '#8b5cf6' },
  { id: 'cat-6', name: 'Výplata & Príjem', type: 'INCOME', color: '#10b981' },
];

export const MOCK_CATEGORIES = INITIAL_CATEGORIES;

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Výplata',
    amount: 2500,
    type: 'INCOME',
    categoryId: 'cat-6',
    status: 'COMPLETED',
    date: '2026-08-01',
    isRecurring: true,
    recurrenceInterval: 'MONTHLY',
  },
  {
    id: 'tx-2',
    description: 'Nákup potravín',
    amount: 85.5,
    type: 'EXPENSE',
    categoryId: 'cat-2',
    status: 'COMPLETED',
    date: '2026-08-15',
    isRecurring: false,
    recurrenceInterval: 'NONE',
  },
  {
    id: 'tx-3',
    description: 'Hypotéka',
    amount: 650,
    type: 'EXPENSE',
    categoryId: 'cat-1',
    status: 'PLANNED',
    date: '2026-08-20',
    dueDate: '2026-08-25',
    isRecurring: true,
    recurrenceInterval: 'MONTHLY',
  },
];

export const SAMPLE_BENCHMARKS: CategoryBenchmark[] = [
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