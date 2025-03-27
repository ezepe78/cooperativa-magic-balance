
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, TreasuryAccount } from '@/types/transactions';

// Ensure account values match database constraints
const formatAccountValue = (account: TreasuryAccount): string => {
  // The database constraint expects specific values, ensure they match
  switch (account) {
    case 'banco_provincia':
      return 'banco_provincia'; // Keep the same, but this is where we'd transform if needed
    case 'cash':
      return 'cash';
    default:
      return account;
  }
};

// Fetch all transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    return data.map(transaction => ({
      ...transaction,
      // Ensure proper typing
      type: transaction.type as TransactionType,
      account: transaction.account as TreasuryAccount
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Get a single transaction by ID
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      // Ensure proper typing
      type: data.type as TransactionType,
      account: data.account as TreasuryAccount
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
};

// Add a new transaction
export const addTransaction = async (
  transaction: Omit<Transaction, 'id'>
): Promise<Transaction> => {
  try {
    console.log('Adding transaction:', transaction); // Debug log
    
    // Format the account value to match database constraints
    const formattedTransaction = {
      ...transaction,
      account: formatAccountValue(transaction.account)
    };
    
    console.log('Formatted transaction:', formattedTransaction); // Debug log
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(formattedTransaction)
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return {
      ...data,
      type: data.type as TransactionType,
      account: data.account as TreasuryAccount
    };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// Update an existing transaction
export const updateTransaction = async (
  id: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<void> => {
  try {
    console.log('Updating transaction:', id, updates); // Debug log
    
    // Format the account value if it's being updated
    const formattedUpdates = {
      ...updates,
      account: updates.account ? formatAccountValue(updates.account) : undefined
    };
    
    console.log('Formatted updates:', formattedUpdates); // Debug log
    
    const { error } = await supabase
      .from('transactions')
      .update(formattedUpdates)
      .eq('id', id);
      
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
