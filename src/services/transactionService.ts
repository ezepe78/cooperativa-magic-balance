
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, TreasuryAccount } from '@/types/transactions';
import { v4 as uuidv4 } from 'uuid';

export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');

    if (error) throw error;

    // Convert the fetched data to the proper Transaction type
    return data.map((trans: any) => ({
      id: trans.id,
      type: trans.type as TransactionType,
      account: trans.account as TreasuryAccount,
      category_id: trans.category_id,
      amount: Number(trans.amount),
      date: trans.date,
      description: trans.description,
      vendor: trans.vendor,
      check_number: trans.check_number,
      receipt: trans.receipt,
      created_at: trans.created_at
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;

    // Convert the returned data to the proper Transaction type
    return {
      id: data.id,
      type: data.type as TransactionType,
      account: data.account as TreasuryAccount,
      category_id: data.category_id,
      amount: Number(data.amount),
      date: data.date,
      description: data.description,
      vendor: data.vendor,
      check_number: data.check_number,
      receipt: data.receipt,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id'>>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

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
