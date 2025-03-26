
import { supabase } from '@/integrations/supabase/client';
import { Category, TransactionType } from '@/types/transactions';

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data.map(category => ({
      ...category,
      type: category.type as TransactionType // Cast to our enum type
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Add new category
export const addCategory = async (
  category: Omit<Category, 'id'>
): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      type: data.type as TransactionType  // Cast to our enum type
    };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Update existing category
export const updateCategory = async (
  id: string,
  updates: Partial<Omit<Category, 'id'>>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
