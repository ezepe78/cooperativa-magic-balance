
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, TreasuryAccount } from '@/types/transactions';

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
      // Map supplier to vendor for UI consistency
      vendor: transaction.supplier,
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
      // Map supplier to vendor for UI consistency
      vendor: data.supplier,
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
  // Format data for insertion - Key fix: map vendor to supplier field
  const dataToInsert = {
    ...transaction,
    // Map vendor to supplier for database storage
    supplier: transaction.vendor,
    // Remove vendor from the insert since it's not in the database schema
    vendor: undefined
  };
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(dataToInsert)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      vendor: data.supplier,
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
  // Format data for update - Key fix: map vendor to supplier field
  const dataToUpdate = {
    ...updates,
    // Map vendor to supplier for database storage
    ...(updates.vendor && { supplier: updates.vendor }),
    // Remove vendor from the update since it's not in the database schema
    vendor: undefined
  };
  
  try {
    const { error } = await supabase
      .from('transactions')
      .update(dataToUpdate)
      .eq('id', id);
      
    if (error) throw error;
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
