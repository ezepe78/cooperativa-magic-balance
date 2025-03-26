
import { supabase } from '@/integrations/supabase/client';
import { Category, TransactionType } from '@/types/transactions';

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) throw error;

  // Convert the fetched data to the proper types
  return data.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type as TransactionType,
    created_at: cat.created_at
  }));
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;

  // Convert the returned data to the proper Category type
  return {
    id: data.id,
    name: data.name,
    type: data.type as TransactionType,
    created_at: data.created_at
  };
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id);

  if (error) throw error;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
