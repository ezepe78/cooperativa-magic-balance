
import React from 'react';
import { useTransactions, TreasuryAccount } from '@/context/TransactionContext';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BalanceSummary = () => {
  const { getBalance, getTotalBalance } = useTransactions();

  const accounts = [
    { 
      id: 'cash' as TreasuryAccount, 
      name: 'Efectivo', 
      icon: Banknote,
      iconColor: 'text-green-500' 
    },
    { 
      id: 'banco_provincia' as TreasuryAccount, 
      name: 'Banco Provincia', 
      icon: Building2,
      iconColor: 'text-blue-500'
    }
  ];

  const totalBalance = getTotalBalance();
  const isNegative = totalBalance < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      {accounts.map((account) => {
        const balance = getBalance(account.id);
        const Icon = account.icon;
        return (
          <Card key={account.id} className="overflow-hidden card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
              <Icon className={`h-5 w-5 ${account.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Saldo actual
              </p>
            </CardContent>
          </Card>
        );
      })}
      
      <div className="md:col-span-2">
        <Card className={cn(
          "overflow-hidden border-t-4 card-hover",
          isNegative ? "border-destructive" : "border-success"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              isNegative ? "text-destructive" : "text-success"
            )}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suma de todas las cuentas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSummary;
