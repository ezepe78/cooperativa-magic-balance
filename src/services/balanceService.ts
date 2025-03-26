
import { supabase } from '@/integrations/supabase/client';
import { TreasuryAccount } from '@/types/transactions';

export const fetchBalances = async (): Promise<Record<TreasuryAccount, number>> => {
  const { data, error } = await supabase
    .from('account_balances')
    .select('*');

  if (error) throw error;

  const balancesRecord: Record<TreasuryAccount, number> = {
    cash: 0,
    banco_provincia: 0
  };

  data.forEach((balance: any) => {
    const accountKey = balance.account as TreasuryAccount;
    if (accountKey in balancesRecord) {
      balancesRecord[accountKey] = Number(balance.initial_balance);
    }
  });

  return balancesRecord;
};
