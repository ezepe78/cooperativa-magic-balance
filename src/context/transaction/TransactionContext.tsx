
import React, { createContext, useContext } from 'react';
import { TransactionContextType } from './types';

// Create context with a default undefined value
export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Custom hook to use the transaction context
export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
