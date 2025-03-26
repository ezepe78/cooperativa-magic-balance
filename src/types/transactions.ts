
export type TransactionType = 'income' | 'expense';
export type TreasuryAccount = 'cash' | 'banco_provincia';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  created_at?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  account: TreasuryAccount;
  category_id: string;
  amount: number;
  date: string;
  description: string;
  supplier?: string;
  check_number?: string;
  receipt?: string;
  person_name?: string;
  created_at?: string;
}

export interface AccountBalance {
  id: string;
  account: TreasuryAccount;
  initial_balance: number;
  updated_at?: string;
}

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
