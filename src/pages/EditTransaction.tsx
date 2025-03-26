import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactions, TransactionType, TreasuryAccount } from '@/context/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, ChevronLeftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidCheckNumber, isValidVendorName, isValidAmount, isValidDate } from '@/utils/validators';
import Navbar from '@/components/Navbar';

const EditTransactionContent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { transactions, categories, editTransaction } = useTransactions();
  
  const [type, setType] = useState<TransactionType>('income');
  const [account, setAccount] = useState<TreasuryAccount>('cash');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [receipt, setReceipt] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && transactions.length > 0) {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setType(transaction.type);
        setAccount(transaction.account);
        setCategory(transaction.category_id);
        setAmount(transaction.amount);
        setDate(transaction.date);
        setDescription(transaction.description);
        setVendor(transaction.vendor || '');
        setCheckNumber(transaction.check_number || '');
        setReceipt(transaction.receipt || '');
        setIsLoading(false);
      }
    }
  }, [id, transactions]);

  const filteredCategories = categories.filter(c => c.type === type);

  const formatCheckNumber = (value: string) => {
    if (!value) return '';
    const numberOnly = value.replace(/\D/g, '');
    return numberOnly.padStart(8, '0');
  };

  const handleCheckNumberBlur = () => {
    if (checkNumber) {
      setCheckNumber(formatCheckNumber(checkNumber));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!category) errors.category = 'Seleccione una categoría';
    
    const amountValue = parseFloat(amount);
    if (!isValidAmount(amountValue)) {
      errors.amount = 'Ingrese un monto válido mayor a 0';
    }
    
    if (!description.trim()) errors.description = 'Ingrese una descripción';
    
    if (type === 'expense') {
      if (!vendor.trim()) {
        errors.vendor = 'Ingrese un proveedor';
      } else if (!isValidVendorName(vendor)) {
        errors.vendor = 'El nombre del proveedor debe tener máximo 100 caracteres';
      }
    }
    
    if (type === 'expense' && account === 'banco_provincia') {
      if (!checkNumber) {
        errors.checkNumber = 'Ingrese un número de cheque';
      } else if (!isValidCheckNumber(checkNumber)) {
        errors.checkNumber = 'El número de cheque debe tener exactamente 8 dígitos';
      }
    }
    
    if (!isValidDate(date)) {
      errors.date = 'La fecha no puede ser futura';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (id) {
        await editTransaction(id, {
          type,
          account,
          category_id: category,
          amount,
          date,
          description,
          vendor: vendor || undefined,
          check_number: checkNumber || undefined,
          receipt: receipt || undefined,
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="p-0 h-8 w-8"
              onClick={() => navigate('/')}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Transacción
            </h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la transacción</CardTitle>
              <CardDescription>
                Modifique los datos de la transacción
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de transacción</Label>
                    <RadioGroup
                      value={type}
                      onValueChange={(value) => {
                        setType(value as TransactionType);
                        setCategory('');
                      }}
                      className="flex space-x-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="income" id="income" />
                        <Label htmlFor="income" className="text-green-600 font-medium">Ingreso</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="expense" />
                        <Label htmlFor="expense" className="text-red-600 font-medium">Gasto</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="account">Cuenta</Label>
                      <Select
                        value={account}
                        onValueChange={(value) => setAccount(value as TreasuryAccount)}
                      >
                        <SelectTrigger id="account">
                          <SelectValue placeholder="Seleccionar cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Efectivo</SelectItem>
                          <SelectItem value="banco_provincia">Banco Provincia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={category}
                        onValueChange={setCategory}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.category && (
                        <p className="text-sm text-destructive">{validationErrors.category}</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      {validationErrors.amount && (
                        <p className="text-sm text-destructive">{validationErrors.amount}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => newDate && setDate(newDate)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {validationErrors.date && (
                        <p className="text-sm text-destructive">{validationErrors.date}</p>
                      )}
                    </div>
                  </div>
                  
                  {type === 'expense' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="vendor">
                          Proveedor
                        </Label>
                        <Input
                          id="vendor"
                          value={vendor}
                          onChange={(e) => setVendor(e.target.value)}
                          placeholder="Nombre del proveedor"
                          maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                          {vendor.length}/100 caracteres
                        </p>
                        {validationErrors.vendor && (
                          <p className="text-sm text-destructive">{validationErrors.vendor}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {type === 'expense' && account === 'banco_provincia' && (
                    <div className="space-y-2">
                      <Label htmlFor="checkNumber">
                        Número de Cheque
                      </Label>
                      <Input
                        id="checkNumber"
                        value={checkNumber}
                        onChange={(e) => setCheckNumber(e.target.value.replace(/\D/g, ''))}
                        onBlur={handleCheckNumberBlur}
                        placeholder="00000000"
                        maxLength={8}
                      />
                      {validationErrors.checkNumber && (
                        <p className="text-sm text-destructive">{validationErrors.checkNumber}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describa el propósito de esta transacción"
                      rows={3}
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-destructive">{validationErrors.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

const EditTransaction = () => {
  return (
    <TransactionProvider>
      <EditTransactionContent />
    </TransactionProvider>
  );
};

export default EditTransaction;
