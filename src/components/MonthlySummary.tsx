
import React, { useState } from 'react';
import { useTransactions } from '@/context/index';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MonthlySummary = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const { getMonthlySummary, isLoading } = useTransactions();
  
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Generate array of years (current year and 3 previous years)
  const years = Array.from({ length: 4 }, (_, i) => currentDate.getFullYear() - i);
  
  const summary = getMonthlySummary(selectedMonth, selectedYear);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Saldo Inicial</p>
              <p className="text-xl font-bold">{formatCurrency(summary.initialBalance)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ArrowUpIcon className="mr-1 h-4 w-4 text-success" /> 
                Ingresos
              </p>
              <p className="text-xl font-bold text-success">{formatCurrency(summary.totalIncome)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center">
                <ArrowDownIcon className="mr-1 h-4 w-4 text-destructive" /> 
                Gastos
              </p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(summary.totalExpense)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Saldo Final</p>
              <p className="text-xl font-bold">{formatCurrency(summary.finalBalance)}</p>
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
