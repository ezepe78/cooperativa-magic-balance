
import React, { useState } from 'react';
import { useTransactions } from '@/context/index';
import { Transaction, Category, TransactionType } from '@/types/transactions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownIcon, ArrowUpIcon, FilterIcon, MoreHorizontal, PencilIcon, SearchIcon, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TransactionsTable = () => {
  const { transactions, categories, deleteTransaction, isLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const navigate = useNavigate();
  
  // Function to get category name by id
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Desconocida';
  };
  
  // Navigate to edit transaction screen
  const handleEditTransaction = (transactionId: string) => {
    navigate(`/edit-transaction/${transactionId}`);
  };
  
  // Filter transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      // Apply type filter
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }
      
      // Apply search term filter
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(searchTermLower) ||
          getCategoryName(transaction.category_id).toLowerCase().includes(searchTermLower) ||
          (transaction.vendor && transaction.vendor.toLowerCase().includes(searchTermLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const accountLabels: Record<string, string> = {
    cash: 'Efectivo',
    banco_provincia: 'Banco Provincia'
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transacciones..."
              disabled
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Select disabled>
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <span>Filtrar por tipo</span>
                </div>
              </SelectTrigger>
            </Select>
          </div>
        </div>
        
        <div className="rounded-md border bg-white overflow-hidden animate-fade-in">
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as TransactionType | 'all')}
          >
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center">
                <FilterIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="income">Solo ingresos</SelectItem>
              <SelectItem value="expense">Solo gastos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border bg-white overflow-hidden animate-fade-in">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[110px]">Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="hidden md:table-cell">Proveedor</TableHead>
              <TableHead className="hidden md:table-cell">Cheque #</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                  No se encontraron transacciones
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{getCategoryName(transaction.category_id)}</TableCell>
                  <TableCell>{accountLabels[transaction.account]}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {transaction.vendor || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">
                    {transaction.check_number || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {transaction.type === 'income' ? (
                        <ArrowUpIcon className="mr-1 h-3 w-3 text-success" />
                      ) : (
                        <ArrowDownIcon className="mr-1 h-3 w-3 text-destructive" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          transaction.type === 'income' 
                            ? "text-success" 
                            : "text-destructive"
                        )}
                      >
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleEditTransaction(transaction.id)}
                          className="text-blue-600"
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Total: {filteredTransactions.length} transacciones
      </div>
    </div>
  );
};

export default TransactionsTable;
