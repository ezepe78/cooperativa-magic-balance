
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types
export type TransactionType = 'income' | 'expense';
export type TreasuryAccount = 'cash' | 'banco_provincia' | 'other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  account: TreasuryAccount;
  category: string;
  amount: number;
  date: string;
  description: string;
  vendor?: string;
  checkNumber?: string;
  receipt?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  initialBalances: Record<TreasuryAccount, number>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  deleteTransaction: (id: string) => void;
  getBalance: (account: TreasuryAccount) => number;
  getTotalBalance: () => number;
  getMonthlySummary: (month: number, year: number) => {
    initialBalance: number;
    totalIncome: number;
    totalExpense: number;
    finalBalance: number;
  };
}

// Create context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Sample data
const defaultCategories: Category[] = [
  { id: '1', name: 'Cuotas', type: 'income' },
  { id: '2', name: 'Donaciones', type: 'income' },
  { id: '3', name: 'Eventos', type: 'income' },
  { id: '4', name: 'Materiales', type: 'expense' },
  { id: '5', name: 'Servicios', type: 'expense' },
  { id: '6', name: 'Salarios', type: 'expense' },
];

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    account: 'cash',
    category: '1',
    amount: 15000,
    date: '2023-10-15',
    description: 'Cuotas de octubre',
  },
  {
    id: '2',
    type: 'expense',
    account: 'banco_provincia',
    category: '6',
    amount: 50000,
    date: '2023-10-16',
    description: 'Pago salarios',
    vendor: 'Personal docente',
    checkNumber: '00012345',
  },
  {
    id: '3',
    type: 'income',
    account: 'banco_provincia',
    category: '3',
    amount: 75000,
    date: '2023-10-20',
    description: 'Evento de recaudación',
  },
  {
    id: '4',
    type: 'expense',
    account: 'cash',
    category: '4',
    amount: 8500,
    date: '2023-10-25',
    description: 'Compra de útiles',
    vendor: 'Librería El Ateneo',
  },
];

// Provider component
export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [initialBalances, setInitialBalances] = useState({
    cash: 50000,
    banco_provincia: 100000,
    other: 0,
  });

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('initialBalances', JSON.stringify(initialBalances));
  }, [transactions, categories, initialBalances]);

  // Load from local storage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedCategories = localStorage.getItem('categories');
    const savedBalances = localStorage.getItem('initialBalances');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedBalances) setInitialBalances(JSON.parse(savedBalances));
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([...transactions, newTransaction]);
    toast.success('Transacción agregada correctamente');
  };

  const editTransaction = (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(
      transactions.map(transaction =>
        transaction.id === id ? { ...transaction, ...data } : transaction
      )
    );
    toast.success('Transacción actualizada correctamente');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success('Transacción eliminada correctamente');
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories([...categories, newCategory]);
    toast.success('Categoría agregada correctamente');
  };

  const updateCategory = (id: string, data: Partial<Omit<Category, 'id'>>) => {
    setCategories(
      categories.map(category =>
        category.id === id ? { ...category, ...data } : category
      )
    );
    toast.success('Categoría actualizada correctamente');
  };

  const deleteCategory = (id: string) => {
    // Check if category is used in any transaction
    const isUsed = transactions.some(transaction => transaction.category === id);
    if (isUsed) {
      toast.error('No se puede eliminar una categoría que está en uso');
      return;
    }
    
    setCategories(categories.filter(category => category.id !== id));
    toast.success('Categoría eliminada correctamente');
  };

  const getBalance = (account: TreasuryAccount): number => {
    const accountTransactions = transactions.filter(t => t.account === account);
    
    return accountTransactions.reduce((balance, transaction) => {
      if (transaction.type === 'income') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, initialBalances[account]);
  };

  const getTotalBalance = (): number => {
    return (
      getBalance('cash') + 
      getBalance('banco_provincia') + 
      getBalance('other')
    );
  };

  const getMonthlySummary = (month: number, year: number) => {
    // Filter transactions for the specified month
    const monthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    // Calculate monthly totals
    const initialBalance = Object.values(initialBalances).reduce((sum, balance) => sum + balance, 0);
    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const finalBalance = initialBalance + totalIncome - totalExpense;

    return {
      initialBalance,
      totalIncome,
      totalExpense,
      finalBalance,
    };
  };

  const value = {
    transactions,
    categories,
    initialBalances,
    addTransaction,
    editTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteTransaction,
    getBalance,
    getTotalBalance,
    getMonthlySummary,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use the context
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
