
import { Transaction, TreasuryAccount } from '@/types/transactions';

// Calculate balance for a specific account
export const calculateBalance = (
  transactions: Transaction[], 
  account: TreasuryAccount, 
  initialBalance: number
): number => {
  const accountTransactions = transactions.filter(t => t.account === account);
  
  const totalIncome = accountTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpense = accountTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  return initialBalance + totalIncome - totalExpense;
};

// Calculate total balance across all accounts
export const calculateTotalBalance = (
  transactions: Transaction[], 
  initialBalances: Record<TreasuryAccount, number>
): number => {
  let total = 0;
  
  // Add up initial balances for all accounts
  for (const account in initialBalances) {
    if (Object.prototype.hasOwnProperty.call(initialBalances, account)) {
      const accountBalance = calculateBalance(
        transactions, 
        account as TreasuryAccount, 
        initialBalances[account as TreasuryAccount]
      );
      total += accountBalance;
    }
  }
  
  return total;
};

// Filter transactions for a specific month and year
const filterTransactionsByMonth = (
  transactions: Transaction[], 
  month: number, 
  year: number
): Transaction[] => {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

// Calculate monthly summary
export const getMonthlySummary = (
  transactions: Transaction[], 
  initialBalances: Record<TreasuryAccount, number>, 
  month: number,
  year: number
) => {
  // Filter transactions for the month
  const monthTransactions = filterTransactionsByMonth(transactions, month, year);
  
  // Calculate totals
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Calculate initial balance (total balance at the start of the month)
  const prevMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    const transactionYear = date.getFullYear();
    const transactionMonth = date.getMonth();
    
    // Include all transactions before the current month
    return (
      (transactionYear < year) || 
      (transactionYear === year && transactionMonth < month)
    );
  });
  
  // Calculate initial balance based on initial system balance plus all previous transactions
  let initialBalance = 0;
  for (const account in initialBalances) {
    if (Object.prototype.hasOwnProperty.call(initialBalances, account)) {
      initialBalance += initialBalances[account as TreasuryAccount];
    }
  }
  
  // Add all income and subtract all expenses from prevMonthTransactions
  const prevIncome = prevMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const prevExpense = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  initialBalance = initialBalance + prevIncome - prevExpense;
  
  // Calculate final balance
  const finalBalance = initialBalance + totalIncome - totalExpense;
  
  return {
    initialBalance,
    totalIncome,
    totalExpense,
    finalBalance
  };
};
