
import { Transaction, Category, TreasuryAccount } from '@/types/transactions';

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
