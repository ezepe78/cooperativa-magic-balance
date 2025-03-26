
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, TreasuryAccount } from '@/types/transactions';

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');

  if (error) throw error;

  // Convert the fetched data to the proper types
  return data.map((trans: any) => ({
    id: trans.id,
    type: trans.type as TransactionType,
    account: trans.account as TreasuryAccount,
    category_id: trans.category_id,
    amount: Number(trans.amount),
    date: trans.date,
    description: trans.description,
    supplier: trans.supplier,
    check_number: trans.check_number,
    receipt: trans.receipt,
    person_name: trans.person_name,
    created_at: trans.created_at
  }));
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const { supplier, ...rest } = transaction as any;
  
  const transactionData = {
    ...rest,
    supplier: supplier || null
  };
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
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
    supplier: data.supplier,
    check_number: data.check_number,
    receipt: data.receipt,
    person_name: data.person_name,
    created_at: data.created_at
  };
};

export const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id'>>): Promise<void> => {
  // Handle vendor to supplier mapping if present
  const { vendor, ...restData } = data as any;
  
  const updateData = {
    ...restData,
    ...(vendor !== undefined ? { supplier: vendor } : {})
  };
  
  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
