
import { supabase } from '@/integrations/supabase/client';
import { TreasuryAccount } from '@/types/transactions';

// Fetch account balances from the database
export const fetchBalances = async (): Promise<Record<TreasuryAccount, number>> => {
  try {
    // Fetch all account balances from the database
    const { data, error } = await supabase
      .from('account_balances')
      .select('*');
      
    if (error) throw error;
    
    // Convert to Record<TreasuryAccount, number>
    const balances: Record<TreasuryAccount, number> = {
      cash: 0,
      banco_provincia: 0
    };
    
    if (data && data.length > 0) {
      data.forEach(item => {
        if (item.account === 'cash' || item.account === 'banco_provincia') {
          balances[item.account as TreasuryAccount] = Number(item.initial_balance);
        }
      });
    }
    
    return balances;
  } catch (error) {
    console.error('Error fetching balances:', error);
    // Return default balances if there's an error
    return {
      cash: 0,
      banco_provincia: 0
    };
  }
};

// Update account balance in the database
export const updateBalance = async (
  account: TreasuryAccount, 
  amount: number
): Promise<void> => {
  try {
    // Check if the balance exists
    const { data } = await supabase
      .from('account_balances')
      .select('*')
      .eq('account', account)
      .single();
      
    if (data) {
      // Update existing balance
      const { error } = await supabase
        .from('account_balances')
        .update({ initial_balance: amount })
        .eq('account', account);
        
      if (error) throw error;
    } else {
      // Insert new balance
      const { error } = await supabase
        .from('account_balances')
        .insert({ account, initial_balance: amount });
        
      if (error) throw error;
    }
  } catch (error) {
    console.error(`Error updating balance for ${account}:`, error);
    throw error;
  }
};
