
import { Transaction, TreasuryAccount } from '@/types/transactions';

export const calculateBalance = (
  transactions: Transaction[], 
  account: TreasuryAccount, 
  initialBalance: number
): number => {
  const accountTransactions = transactions.filter(t => t.account === account);
  
  return accountTransactions.reduce((balance, transaction) => {
    if (transaction.type === 'income') {
      return balance + Number(transaction.amount);
    } else {
      return balance - Number(transaction.amount);
    }
  }, initialBalance);
};

export const calculateTotalBalance = (
  transactions: Transaction[], 
  initialBalances: Record<TreasuryAccount, number>
): number => {
  return (
    calculateBalance(transactions, 'cash', initialBalances.cash) + 
    calculateBalance(transactions, 'banco_provincia', initialBalances.banco_provincia)
  );
};

export const getMonthlySummary = (
  transactions: Transaction[], 
  initialBalances: Record<TreasuryAccount, number>,
  month: number, 
  year: number
) => {
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
