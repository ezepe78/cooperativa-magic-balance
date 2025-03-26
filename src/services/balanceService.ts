
import { supabase } from '@/integrations/supabase/client';
import { TreasuryAccount } from '@/types/transactions';

// Fetch initial balances for accounts
export const fetchBalances = async (): Promise<Record<TreasuryAccount, number>> => {
  try {
    const { data, error } = await supabase
      .from('account_balances')
      .select('*');
      
    if (error) throw error;
    
    // Convert array to record object with account as key
    const balances: Record<TreasuryAccount, number> = {
      cash: 0,
      banco_provincia: 0
    };
    
    data.forEach(item => {
      if (item.account === 'cash' || item.account === 'banco_provincia') {
        balances[item.account as TreasuryAccount] = Number(item.initial_balance);
      }
    });
    
    return balances;
  } catch (error) {
    console.error('Error fetching balances:', error);
    return {
      cash: 0,
      banco_provincia: 0
    };
  }
};

// Update initial balance for an account
export const updateBalance = async (
  account: TreasuryAccount, 
  balance: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('account_balances')
      .update({ initial_balance: balance, updated_at: new Date().toISOString() })
      .eq('account', account);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error;
  }
};
