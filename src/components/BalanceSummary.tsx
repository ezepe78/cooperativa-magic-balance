
import React from 'react';
import { useTransactions } from '@/context/index';
import { TreasuryAccount } from '@/types/transactions';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BalanceSummary = () => {
  const { getBalance, getTotalBalance, isLoading } = useTransactions();

  const accounts = [
    { 
      id: 'cash' as TreasuryAccount, 
      name: 'Caja chica', 
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
  
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Card className="overflow-hidden border-t-4 border-muted mb-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                <account.icon className={`h-5 w-5 ${account.iconColor}`} />
              </CardHeader>
              <CardContent className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalBalance = getTotalBalance();
  const isNegative = totalBalance < 0;

  return (
    <div className="animate-fade-in">
      <Card className={cn(
        "overflow-hidden border-t-4 card-hover mb-4",
        isNegative ? "border-destructive" : "border-success"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};

export default BalanceSummary;
