
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Define types
export type TransactionType = 'income' | 'expense';
export type TreasuryAccount = 'cash' | 'banco_provincia';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
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
}

interface AccountBalance {
  id: string;
  account: TreasuryAccount;
  initial_balance: number;
}

interface TransactionContextType {
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

// Create context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Provider component
export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialBalances, setInitialBalances] = useState<Record<TreasuryAccount, number>>({
    cash: 0,
    banco_provincia: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) {
          throw categoriesError;
        }

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*');

        if (transactionsError) {
          throw transactionsError;
        }

        // Fetch account balances
        const { data: balancesData, error: balancesError } = await supabase
          .from('account_balances')
          .select('*');

        if (balancesError) {
          throw balancesError;
        }

        // Set state with the fetched data
        setCategories(categoriesData);
        setTransactions(transactionsData);

        // Convert balances array to record object
        const balancesRecord: Record<TreasuryAccount, number> = {
          cash: 0,
          banco_provincia: 0
        };

        balancesData.forEach((balance: AccountBalance) => {
          if (balance.account in balancesRecord) {
            balancesRecord[balance.account as TreasuryAccount] = Number(balance.initial_balance);
          }
        });

        setInitialBalances(balancesRecord);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [...prev, data]);
      toast.success('Transacción agregada correctamente');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Error al agregar la transacción');
    }
  };

  const editTransaction = async (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? { ...transaction, ...data } : transaction
        )
      );
      toast.success('Transacción actualizada correctamente');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Error al actualizar la transacción');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transacción eliminada correctamente');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error al eliminar la transacción');
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast.success('Categoría agregada correctamente');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Error al agregar la categoría');
    }
  };

  const updateCategory = async (id: string, data: Partial<Omit<Category, 'id'>>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      setCategories(prev =>
        prev.map(category =>
          category.id === id ? { ...category, ...data } : category
        )
      );
      toast.success('Categoría actualizada correctamente');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar la categoría');
    }
  };

  const deleteCategory = async (id: string) => {
    // Check if category is used in any transaction
    const isUsed = transactions.some(transaction => transaction.category_id === id);
    if (isUsed) {
      toast.error('No se puede eliminar una categoría que está en uso');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== id));
      toast.success('Categoría eliminada correctamente');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const getBalance = (account: TreasuryAccount): number => {
    const accountTransactions = transactions.filter(t => t.account === account);
    
    return accountTransactions.reduce((balance, transaction) => {
      if (transaction.type === 'income') {
        return balance + Number(transaction.amount);
      } else {
        return balance - Number(transaction.amount);
      }
    }, initialBalances[account]);
  };

  const getTotalBalance = (): number => {
    return (
      getBalance('cash') + 
      getBalance('banco_provincia')
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
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
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
    isLoading
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
