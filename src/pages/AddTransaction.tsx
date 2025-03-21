
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionProvider, useTransactions, TransactionType, TreasuryAccount } from '@/context/TransactionContext';
import Navbar from '@/components/Navbar';
import { padCheckNumber } from '@/utils/formatters';
import { isValidCheckNumber, isValidVendorName, isValidAmount, isValidDate } from '@/utils/validators';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, HelpCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const accountOptions = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'banco_provincia', label: 'Banco Provincia' },
  { value: 'other', label: 'Otras Cuentas' },
];

const AddTransactionContent = () => {
  const navigate = useNavigate();
  const { addTransaction, categories } = useTransactions();
  
  // Form state
  const [type, setType] = useState<TransactionType>('income');
  const [account, setAccount] = useState<TreasuryAccount>('cash');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Filter categories based on transaction type
  const filteredCategories = categories.filter(c => c.type === type);
  
  // Set default category when filtered categories change
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some(c => c.id === category)) {
      setCategory(filteredCategories[0].id);
    }
  }, [filteredCategories, category]);
  
  // Determine if check number field should be visible
  const showCheckNumber = type === 'expense' && account === 'banco_provincia';
  
  // Determine if vendor field should be visible
  const showVendor = type === 'expense';
  
  // Handle check number blur to pad with zeros
  const handleCheckNumberBlur = () => {
    if (checkNumber) {
      setCheckNumber(padCheckNumber(checkNumber));
    }
  };

  // Count characters for vendor name
  const vendorCharCount = vendor.length;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form
    const validationErrors: Record<string, string> = {};
    
    if (!category) {
      validationErrors.category = 'Seleccione una categoría';
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      validationErrors.amount = 'Ingrese un monto válido';
    }
    
    if (!description) {
      validationErrors.description = 'Ingrese una descripción';
    }
    
    if (showVendor && !vendor) {
      validationErrors.vendor = 'Ingrese el nombre del proveedor';
    }
    
    if (showVendor && vendor && !isValidVendorName(vendor)) {
      validationErrors.vendor = 'Nombre de proveedor demasiado largo (máximo 100 caracteres)';
    }
    
    if (showCheckNumber && checkNumber && !isValidCheckNumber(checkNumber)) {
      validationErrors.checkNumber = 'Número de cheque inválido (debe tener 8 dígitos)';
    }
    
    if (!date || !isValidDate(date)) {
      validationErrors.date = 'Seleccione una fecha válida';
    }
    
    // If there are errors, display them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Create transaction object
    const transaction = {
      type,
      account,
      category,
      amount: Number(amount),
      date: date.toISOString(),
      description,
      vendor: showVendor ? vendor : undefined,
      checkNumber: showCheckNumber ? checkNumber : undefined,
    };
    
    // Add transaction and navigate back to dashboard
    addTransaction(transaction);
    navigate('/');
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white shadow-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl">Nueva Transacción</CardTitle>
          <CardDescription>
            Registre una nueva transacción financiera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs
              defaultValue="income"
              value={type}
              onValueChange={(value) => setType(value as TransactionType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="income" className="flex items-center">
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Ingreso
                </TabsTrigger>
                <TabsTrigger value="expense" className="flex items-center">
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  Gasto
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account">Cuenta de Tesorería</Label>
                <Select
                  value={account}
                  onValueChange={(value) => setAccount(value as TreasuryAccount)}
                >
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Seleccione una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-destructive text-xs mt-1">{errors.category}</p>
                )}
              </div>
            </div>
            
            {showVendor && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vendor">Nombre del Proveedor</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ejemplo: "Supermercado Los Pinos" o "Ferretería Roca & Hijos"</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <Input
                    id="vendor"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Ingrese el nombre del proveedor"
                    className={errors.vendor ? "border-destructive pr-20" : "pr-20"}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className={cn(
                      "text-xs",
                      vendorCharCount > 90 ? "text-amber-500" : "text-muted-foreground",
                      vendorCharCount > 100 ? "text-destructive" : ""
                    )}>
                      {vendorCharCount}/100
                    </span>
                  </div>
                </div>
                {errors.vendor && (
                  <p className="text-destructive text-xs mt-1">{errors.vendor}</p>
                )}
              </div>
            )}
            
            {showCheckNumber && (
              <div className="space-y-2">
                <Label htmlFor="checkNumber">Número de Cheque</Label>
                <Input
                  id="checkNumber"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value.replace(/\D/g, ''))}
                  onBlur={handleCheckNumberBlur}
                  placeholder="00000000"
                  className={cn(
                    "font-mono",
                    errors.checkNumber ? "border-destructive" : ""
                  )}
                  maxLength={8}
                />
                {errors.checkNumber && (
                  <p className="text-destructive text-xs mt-1">{errors.checkNumber}</p>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={cn(
                      "pl-8",
                      errors.amount ? "border-destructive" : ""
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="text-destructive text-xs mt-1">{errors.amount}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        errors.date ? "border-destructive" : ""
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "dd/MM/yyyy", { locale: es })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      locale={es}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-destructive text-xs mt-1">{errors.date}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingrese una descripción detallada"
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-destructive text-xs mt-1">{errors.description}</p>
              )}
            </div>
            
            <div className="pt-4 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => navigate('/')}>
                Cancelar
              </Button>
              <Button type="submit">
                {type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const AddTransaction = () => {
  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
          <AddTransactionContent />
        </main>
      </div>
    </TransactionProvider>
  );
};

export default AddTransaction;
