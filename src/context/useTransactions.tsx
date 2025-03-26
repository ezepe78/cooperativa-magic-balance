
import { useContext } from 'react';
import { TransactionContext, TransactionContextType } from './TransactionContext';

// Custom hook to use the context
export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
