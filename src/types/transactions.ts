
// Define types for transactions module
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
  vendor?: string;
  check_number?: string;
  receipt?: string;
  created_at?: string;
}

export interface AccountBalance {
  id: string;
  account: TreasuryAccount;
  initial_balance: number;
  updated_at?: string;
}
