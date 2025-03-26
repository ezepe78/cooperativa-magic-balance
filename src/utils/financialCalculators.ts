
import { Transaction, TreasuryAccount } from '@/types/transactions';

// Calculate current balance for an account
export const calculateBalance = (
  transactions: Transaction[],
  account: TreasuryAccount,
  initialBalance: number
): number => {
  const accountTransactions = transactions.filter(t => t.account === account);
  
  const balance = accountTransactions.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      return acc + Number(transaction.amount);
    } else {
      return acc - Number(transaction.amount);
    }
  }, initialBalance);
  
  return balance;
};

// Calculate total balance across all accounts
export const calculateTotalBalance = (
  transactions: Transaction[],
  initialBalances: Record<TreasuryAccount, number>
): number => {
  return Object.keys(initialBalances).reduce((total, account) => {
    const accountBalance = calculateBalance(
      transactions, 
      account as TreasuryAccount,
      initialBalances[account as TreasuryAccount]
    );
    return total + accountBalance;
  }, 0);
};

// Calculate account-specific balances
export const calculateAccountBalances = (
  transactions: Transaction[],
  initialBalances: Record<TreasuryAccount, number>
): Record<TreasuryAccount, number> => {
  const result: Record<TreasuryAccount, number> = {} as Record<TreasuryAccount, number>;
  
  Object.keys(initialBalances).forEach(account => {
    const accountKey = account as TreasuryAccount;
    result[accountKey] = calculateBalance(
      transactions,
      accountKey,
      initialBalances[accountKey]
    );
  });
  
  return result;
};

// Get summary for a specific month
export const getMonthlySummary = (
  transactions: Transaction[],
  initialBalances: Record<TreasuryAccount, number>,
  month: number, // 0-indexed (0 = January)
  year: number
) => {
  // Filter transactions for the given month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  
  const monthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });
  
  // Calculate income and expense totals
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Calculate initial balance at the start of the month
  const previousTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate < monthStart;
  });
  
  const initialBalance = calculateTotalBalance(previousTransactions, initialBalances);
  
  // Calculate account-specific initial balances
  const accountInitialBalances = calculateAccountBalances(previousTransactions, initialBalances);
  
  // Calculate account-specific final balances (all transactions up to the end of the month)
  const upToEndOfMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate <= monthEnd;
  });
  
  const accountFinalBalances = calculateAccountBalances(upToEndOfMonthTransactions, initialBalances);
  
  // Calculate final balance
  const finalBalance = initialBalance + totalIncome - totalExpense;
  
  return {
    initialBalance,
    totalIncome,
    totalExpense,
    finalBalance,
    accountInitialBalances,
    accountFinalBalances
  };
};
