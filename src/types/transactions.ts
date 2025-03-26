
export type TransactionType = 'income' | 'expense';
export type TreasuryAccount = 'cash' | 'banco_provincia';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  description?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category_id: string;
  account: TreasuryAccount;
  type: TransactionType;
  vendor?: string;
  check_number?: string;
  receipt?: string;
}
