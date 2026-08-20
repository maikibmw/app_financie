export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'COMPLETED' | 'PLANNED';
export type RecurrenceInterval = 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: string;
  dueDate?: string;
  status: TransactionStatus;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;

  // KROK 2: Detailné parametre pre zmluvy/paušály
  provider?: string;          // Poskytovateľ (napr. Orange, SPP)
  contractNumber?: string;    // Číslo zmluvy / VS
  contractEndDate?: string;   // Dátum konca viazanosti / zmluvy
  note?: string;              // Poznámka
}

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
}

export interface CategoryBenchmark {
  categoryId: string;
  averagePrice: number; // Referenčná / priemerná cena na trhu
  recommendationNote?: string; // Voliteľný tip (napr. "Slovakia energy ponúka paušál za 20€")
  /** Ak je vyplnené, tip sa zobrazí len pri zmluve, ktorej názov/poskytovateľ obsahuje niektoré z týchto slov. */
  keywords?: string[];
}