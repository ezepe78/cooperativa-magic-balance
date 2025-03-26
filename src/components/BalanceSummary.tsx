
import React, { useState } from 'react';
import { useTransactions } from '@/context/index';
import { TreasuryAccount } from '@/types/transactions';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Building2, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const BalanceSummary = () => {
  const { getBalance, getTotalBalance, isLoading } = useTransactions();
  const [isOpen, setIsOpen] = useState(false);

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
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={cn(
                  "text-3xl font-bold",
                  isNegative ? "text-destructive" : "text-success"
                )}>
                  {formatCurrency(totalBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Suma de todas las cuentas
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <button className="rounded-full hover:bg-muted p-1" aria-label="Toggle account details">
                  {isOpen ? 
                    <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  }
                </button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="animated-collapsible">
              {/* Desglose de cuentas dentro de la sección de saldo final */}
              <div className="grid grid-cols-1 gap-2 pl-1 border-l-2 border-muted mt-4">
                {accounts.map((account) => {
                  const balance = getBalance(account.id);
                  const accountIsNegative = balance < 0;
                  return (
                    <div key={account.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <account.icon className={`h-4 w-4 mr-2 ${account.iconColor}`} />
                        <span className="text-sm">{account.name}</span>
                      </div>
                      <div className={cn(
                        "font-medium",
                        accountIsNegative ? "text-destructive" : "text-success"
                      )}>
                        {formatCurrency(balance)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSummary;
