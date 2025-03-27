
import React, { useState, useEffect } from 'react';
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
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  FilterIcon, 
  MoreHorizontal, 
  PencilIcon, 
  SearchIcon, 
  Trash2, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Number of transactions per page
const ITEMS_PER_PAGE = 10;

const TransactionsPeriodTable = () => {
  const { transactions, categories, deleteTransaction, isLoading } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get the currently selected month and year from MonthlySummary
  const monthSelectElement = document.querySelector('select[name="month"]');
  const yearSelectElement = document.querySelector('select[name="year"]');
  
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  const navigate = useNavigate();
  
  // Update selected month and year when changed in MonthlySummary
  useEffect(() => {
    // Get the currently selected month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    setSelectedMonth(selectedMonth !== null ? selectedMonth : currentMonth);
    setSelectedYear(selectedYear !== null ? selectedYear : currentYear);
    
    // Listen for changes in MonthlySummary select elements
    const monthSelectObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const select = mutation.target as HTMLSelectElement;
          if (select && select.value) {
            setSelectedMonth(parseInt(select.value));
            setCurrentPage(1); // Reset to first page when month changes
          }
        }
      }
    });
    
    const yearSelectObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const select = mutation.target as HTMLSelectElement;
          if (select && select.value) {
            setSelectedYear(parseInt(select.value));
            setCurrentPage(1); // Reset to first page when year changes
          }
        }
      }
    });
    
    // Start observing the select elements
    if (monthSelectElement) {
      monthSelectObserver.observe(monthSelectElement, { attributes: true });
    }
    
    if (yearSelectElement) {
      yearSelectObserver.observe(yearSelectElement, { attributes: true });
    }
    
    // Cleanup
    return () => {
      monthSelectObserver.disconnect();
      yearSelectObserver.disconnect();
    };
  }, []);
  
  // Function to get category name by id
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Desconocida';
  };
  
  // Navigate to edit transaction screen
  const handleEditTransaction = (transactionId: string) => {
    navigate(`/edit-transaction/${transactionId}`);
  };
  
  // Filter transactions for the selected month and year
  const getFilteredTransactions = () => {
    if (selectedMonth === null || selectedYear === null) {
      return [];
    }
    
    // Filter by month and year
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const isInPeriod = transactionDate >= startDate && transactionDate <= endDate;
        
        // Apply type filter
        if (filterType !== 'all' && transaction.type !== filterType) {
          return false;
        }
        
        // Apply search term filter
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          return (
            isInPeriod &&
            (transaction.description.toLowerCase().includes(searchTermLower) ||
            getCategoryName(transaction.category_id).toLowerCase().includes(searchTermLower) ||
            (transaction.vendor && transaction.vendor.toLowerCase().includes(searchTermLower)) ||
            (transaction.voucher_number && transaction.voucher_number.toLowerCase().includes(searchTermLower)))
          );
        }
        
        return isInPeriod;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const accountLabels: Record<string, string> = {
    cash: 'Caja Chica',
    banco_provincia: 'Banco Provincia'
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PaginationItem key={page}>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
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
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                  No se encontraron transacciones para este período
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 'income' ? (
                      <span className="flex items-center text-success">
                        <ArrowUpIcon className="mr-1 h-3 w-3" />
                        Ingreso
                      </span>
                    ) : (
                      <span className="flex items-center text-destructive">
                        <ArrowDownIcon className="mr-1 h-3 w-3" />
                        Egreso
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getCategoryName(transaction.category_id)}</TableCell>
                  <TableCell>{accountLabels[transaction.account]}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{transaction.vendor || '-'}</span>
                      {transaction.voucher_number && (
                        <span className="text-xs text-muted-foreground flex items-center mt-1">
                          <Receipt className="h-3 w-3 mr-1" />
                          {transaction.voucher_number}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">
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
      
      {renderPagination()}
      
      <div className="text-xs text-muted-foreground text-center">
        Total: {filteredTransactions.length} transacciones
        {totalPages > 1 && ` (Mostrando ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de ${filteredTransactions.length})`}
      </div>
    </div>
  );
};

export default TransactionsPeriodTable;
