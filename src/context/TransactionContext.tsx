
import { createContext } from 'react';
import { Transaction, Category, TreasuryAccount, TransactionType } from '@/types/transactions';

// Define the context type
export interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  initialBalances: Record<TreasuryAccount, number>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  editTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getBalance: (account: TreasuryAccount) => number;
  getTotalBalance: () => number;
  getMonthlySummary: (month: number, year: number) => {
    initialBalance: number;
    totalIncome: number;
    totalExpense: number;
    finalBalance: number;
  };
  isLoading: boolean;
}

// Create the context with undefined as default value
export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);
