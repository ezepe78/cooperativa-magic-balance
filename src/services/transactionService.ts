
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, TreasuryAccount } from '@/types/transactions';
import { v4 as uuidv4 } from 'uuid';

// Fetch all transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    // Map DB fields to our Transaction type
    return (data || []).map(item => ({
      id: item.id,
      type: item.type as TransactionType,
      account: item.account as TreasuryAccount,
      category_id: item.category_id,
      amount: Number(item.amount),
      date: item.date,
      description: item.description,
      vendor: item.supplier, // Map supplier to vendor
      check_number: item.check_number || '',
      receipt: item.receipt || '',
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  try {
    const id = uuidv4();
    const newTransaction = {
      id,
      type: transaction.type as string,
      account: transaction.account as string,
      category_id: transaction.category_id,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
      supplier: transaction.vendor, // Map vendor to supplier for DB
      check_number: transaction.check_number || null,
      receipt: transaction.receipt || null,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('transactions')
      .insert(newTransaction);
      
    if (error) throw error;
    
    // Return the newly created transaction with proper type mapping
    return {
      ...transaction,
      id,
      created_at: newTransaction.created_at
    };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// Update existing transaction
export const updateTransaction = async (
  id: string, 
  data: Partial<Omit<Transaction, 'id'>>
): Promise<void> => {
  try {
    // Map vendor to supplier for the database
    const dbData: any = { ...data };
    if (data.vendor !== undefined) {
      dbData.supplier = data.vendor;
      delete dbData.vendor;
    }
    
    const { error } = await supabase
      .from('transactions')
      .update(dbData)
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
