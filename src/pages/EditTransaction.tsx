
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactions } from '@/context/useTransactions';
import { TransactionType, TreasuryAccount } from '@/types/transactions';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CheckCheck, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';

const EditTransaction = () => {
  const { id } = useParams<{ id: string }>();
  const { editTransaction, transactions, categories } = useTransactions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [type, setType] = useState<TransactionType>('expense');
  const [account, setAccount] = useState<TreasuryAccount>('cash');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [checkNumber, setCheckNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (id) {
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
      }
    }
  }, [id, transactions]);

  const filteredCategories = categories.filter(cat => cat.type === type);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (id) {
        await editTransaction(id, {
          type: type,
          account: account,
          category_id: category,
          amount: amount,
          date: date,
          description: description,
          vendor: vendor,
          check_number: checkNumber
        });

        navigate('/');
      } else {
        toast({
          title: "Error!",
          description: "No se encontró el ID de la transacción.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error!",
        description: "Hubo un error al actualizar la transacción.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
        <Card className="bg-white shadow-sm max-w-2xl mx-auto animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Editar Transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fecha - Primer campo */}
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? formatDate(new Date(date)) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date ? new Date(date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setDate(date.toISOString().split('T')[0]);
                        }
                        setOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tipo - Segundo campo */}
              <div>
                <Label htmlFor="type">Tipo de Transacción</Label>
                <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cuenta - Tercer campo */}
              <div>
                <Label htmlFor="account">Cuenta</Label>
                <Select value={account} onValueChange={(value) => setAccount(value as TreasuryAccount)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Caja chica</SelectItem>
                    <SelectItem value="banco_provincia">Banco Provincia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoría - Cuarto campo */}
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campos específicos para Egreso */}
              {type === 'expense' && (
                <>
                  {/* Proveedor - Quinto campo (condicional) */}
                  <div>
                    <Label htmlFor="vendor">Proveedor (Opcional)</Label>
                    <Input
                      type="text"
                      id="vendor"
                      placeholder="Nombre del proveedor"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                    />
                  </div>
                  
                  {/* Número de Cheque - Sexto campo (condicional) */}
                  <div>
                    <Label htmlFor="checkNumber">Número de Cheque (Opcional)</Label>
                    <Input
                      type="text"
                      id="checkNumber"
                      placeholder="Número de cheque"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Monto - Séptimo campo */}
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input
                  type="number"
                  id="amount"
                  placeholder="0.00"
                  value={amount === 0 ? '' : amount.toString()}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              {/* Descripción - Octavo campo */}
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  type="text"
                  id="description"
                  placeholder="Descripción de la transacción"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    Actualizar Transacción
                    <CheckCheck className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditTransaction;
