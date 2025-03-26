
import React, { useState } from 'react';
import { useTransactions } from '@/context/index';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  CalendarIcon, 
  Loader2, 
  Banknote, 
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreasuryAccount } from '@/types/transactions';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const MonthlySummary = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [initialBalanceOpen, setInitialBalanceOpen] = useState(false);
  const [finalBalanceOpen, setFinalBalanceOpen] = useState(false);
  
  const { getMonthlySummary, getBalance, isLoading } = useTransactions();
  
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Generate array of years (current year and 3 previous years)
  const years = Array.from({ length: 4 }, (_, i) => currentDate.getFullYear() - i);
  
  const summary = getMonthlySummary(selectedMonth, selectedYear);

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

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Resumen Mensual</CardTitle>
        <div className="flex space-x-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Initial Balance Section - Now Collapsible */}
            <div className="space-y-3">
              <Collapsible
                open={initialBalanceOpen}
                onOpenChange={setInitialBalanceOpen}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Saldo Inicial</p>
                    <p className="text-xl font-bold">{formatCurrency(summary.initialBalance)}</p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <button className="rounded-full hover:bg-muted p-1" aria-label="Toggle initial balance details">
                      {initialBalanceOpen ? 
                        <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      }
                    </button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-1 animated-collapsible">
                  <div className="grid grid-cols-1 gap-2 pl-1 border-l-2 border-muted mt-2">
                    {accounts.map((account) => {
                      const accountInitialBalance = summary.accountInitialBalances?.[account.id] || 0;
                      return (
                        <div key={`initial-${account.id}`} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <account.icon className={`h-4 w-4 mr-2 ${account.iconColor}`} />
                            <span className="text-sm">{account.name}</span>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(accountInitialBalance)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            {/* Final Balance Section - Now Collapsible */}
            <div className="space-y-3">
              <Collapsible
                open={finalBalanceOpen}
                onOpenChange={setFinalBalanceOpen}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Saldo Final</p>
                    <p className={cn(
                      "text-xl font-bold",
                      summary.finalBalance < 0 ? "text-destructive" : ""
                    )}>
                      {formatCurrency(summary.finalBalance)}
                    </p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <button className="rounded-full hover:bg-muted p-1" aria-label="Toggle final balance details">
                      {finalBalanceOpen ? 
                        <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      }
                    </button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-1 animated-collapsible">
                  <div className="grid grid-cols-1 gap-2 pl-1 border-l-2 border-muted mt-2">
                    {accounts.map((account) => {
                      const accountFinalBalance = summary.accountFinalBalances?.[account.id] || 0;
                      const isNegative = accountFinalBalance < 0;
                      return (
                        <div key={`final-${account.id}`} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <account.icon className={`h-4 w-4 mr-2 ${account.iconColor}`} />
                            <span className="text-sm">{account.name}</span>
                          </div>
                          <div className={cn(
                            "font-medium",
                            isNegative ? "text-destructive" : "text-success"
                          )}>
                            {formatCurrency(accountFinalBalance)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            {/* Income Section */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4 text-success" /> 
                Ingresos
              </p>
              <p className="text-xl font-bold text-success">{formatCurrency(summary.totalIncome)}</p>
            </div>
            
            {/* Expense Section */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4 text-destructive" /> 
                Egresos
              </p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(summary.totalExpense)}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 py-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="mr-1 h-3 w-3" />
          <span>Período: {months[selectedMonth]} {selectedYear}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MonthlySummary;
