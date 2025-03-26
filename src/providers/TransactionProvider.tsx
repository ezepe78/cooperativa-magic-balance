
import React, { useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { TransactionContext } from '@/context/transaction/TransactionContext';
import { 
  Transaction, 
  Category, 
  TreasuryAccount,
  TransactionContextType
} from '@/types/transactions';
import {
  fetchTransactions,
  addTransaction as apiAddTransaction,
  updateTransaction,
  deleteTransaction as apiDeleteTransaction
} from '@/services/transactionService';
import {
  fetchCategories,
  addCategory as apiAddCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory
} from '@/services/categoryService';
import { fetchBalances } from '@/services/balanceService';
import {
  calculateBalance,
  calculateTotalBalance,
  getMonthlySummary as calculateMonthlySummary
} from '@/utils/financialCalculators';

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
        // Fetch data in parallel for better performance
        const [categoriesData, transactionsData, balancesData] = await Promise.all([
          fetchCategories(),
          fetchTransactions(),
          fetchBalances()
        ]);

        // Set state with the fetched data
        setCategories(categoriesData);
        setTransactions(transactionsData);
        setInitialBalances(balancesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addTransactionHandler = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await apiAddTransaction(transaction);
      setTransactions(prev => [...prev, newTransaction]);
      toast.success('Transacción agregada correctamente');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Error al agregar la transacción');
      throw error; // Re-throw to allow handling in components
    }
  };

  const editTransactionHandler = async (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    try {
      await updateTransaction(id, data);
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? { ...transaction, ...data } : transaction
        )
      );
      toast.success('Transacción actualizada correctamente');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Error al actualizar la transacción');
      throw error;
    }
  };

  const deleteTransactionHandler = async (id: string) => {
    try {
      await apiDeleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transacción eliminada correctamente');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error al eliminar la transacción');
      throw error;
    }
  };

  const addCategoryHandler = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await apiAddCategory(category);
      setCategories(prev => [...prev, newCategory]);
      toast.success('Categoría agregada correctamente');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Error al agregar la categoría');
      throw error;
    }
  };

  const updateCategoryHandler = async (id: string, data: Partial<Omit<Category, 'id'>>) => {
    try {
      await apiUpdateCategory(id, data);
      setCategories(prev =>
        prev.map(category =>
          category.id === id ? { ...category, ...data } : category
        )
      );
      toast.success('Categoría actualizada correctamente');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar la categoría');
      throw error;
    }
  };

  const deleteCategoryHandler = async (id: string) => {
    // Check if category is used in any transaction
    const isUsed = transactions.some(transaction => transaction.category_id === id);
    if (isUsed) {
      toast.error('No se puede eliminar una categoría que está en uso');
      return;
    }
    
    try {
      await apiDeleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
      toast.success('Categoría eliminada correctamente');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
      throw error;
    }
  };

  const getBalanceHandler = (account: TreasuryAccount): number => {
    return calculateBalance(transactions, account, initialBalances[account]);
  };

  const getTotalBalanceHandler = (): number => {
    return calculateTotalBalance(transactions, initialBalances);
  };

  const getMonthlySummaryHandler = (month: number, year: number) => {
    return calculateMonthlySummary(transactions, initialBalances, month, year);
  };

  const value: TransactionContextType = {
    transactions,
    categories,
    initialBalances,
    addTransaction: addTransactionHandler,
    editTransaction: editTransactionHandler,
    addCategory: addCategoryHandler,
    updateCategory: updateCategoryHandler,
    deleteCategory: deleteCategoryHandler,
    deleteTransaction: deleteTransactionHandler,
    getBalance: getBalanceHandler,
    getTotalBalance: getTotalBalanceHandler,
    getMonthlySummary: getMonthlySummaryHandler,
    isLoading
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
