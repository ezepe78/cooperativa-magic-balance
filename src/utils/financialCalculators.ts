
import { Transaction, TreasuryAccount } from '@/types/transactions';

// Calculate balance for a specific account
export const calculateBalance = (
  transactions: Transaction[],
  account: TreasuryAccount,
  initialBalance: number
): number => {
  const balance = transactions.reduce((acc, transaction) => {
    if (transaction.account !== account) {
      return acc;
    }
    
    return transaction.type === 'income' 
      ? acc + Number(transaction.amount) 
      : acc - Number(transaction.amount);
  }, 0);
  
  return initialBalance + balance;
};

// Calculate total balance for all accounts
export const calculateTotalBalance = (
  transactions: Transaction[],
  initialBalances: Record<TreasuryAccount, number>
): number => {
  // Get all unique accounts from initial balances
  const accounts = Object.keys(initialBalances) as TreasuryAccount[];
  
  return accounts.reduce((total, account) => {
    const accountBalance = calculateBalance(
      transactions,
      account,
      initialBalances[account]
    );
    return total + accountBalance;
  }, 0);
};

// Calculate monthly summary (incomes, expenses, balance)
export const getMonthlySummary = (
  transactions: Transaction[],
  initialBalances: Record<TreasuryAccount, number>,
  month: number,
  year: number
) => {
  // Filter transactions by month and year
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  // Calculate initial balance (sum of all account balances at the beginning of the month)
  const totalInitialBalance = calculateTotalBalance(
    transactions.filter(t => new Date(t.date) < startDate),
    initialBalances
  );
  
  // Filter transactions for the current month
  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate >= startDate &&
      transactionDate <= endDate
    );
  });
  
  // Calculate income and expense totals
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  // Calculate final balance
  const finalBalance = totalInitialBalance + totalIncome - totalExpense;
  
  return {
    initialBalance: totalInitialBalance,
    totalIncome,
    totalExpense,
    finalBalance
  };
};
