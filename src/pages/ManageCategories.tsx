import React, { useState } from 'react';
import { useTransactions } from '@/context/useTransactions';
import { TransactionType } from '@/types/transactions';
import Navbar from '@/components/Navbar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2, Loader2 } from 'lucide-react';

import { TransactionProvider } from '@/providers/TransactionProvider';

const ManageCategoriesContent = () => {
  const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useTransactions();
  
  const [activeTab, setActiveTab] = useState<TransactionType>('income');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  const [formError, setFormError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const filteredCategories = categories.filter(category => category.type === activeTab);
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setFormError('Ingrese un nombre de categoría válido');
      return;
    }
    
    const exists = categories.some(
      category => category.name.toLowerCase() === newCategoryName.trim().toLowerCase() && category.type === activeTab
    );
    
    if (exists) {
      setFormError('Ya existe una categoría con este nombre');
      return;
    }
    
    setIsAdding(true);
    await addCategory({
      name: newCategoryName.trim(),
      type: activeTab,
    });
    
    setNewCategoryName('');
    setFormError('');
    setIsAdding(false);
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      return;
    }
    
    const exists = categories.some(
      category => 
        category.id !== editingCategory.id && 
        category.name.toLowerCase() === editingCategory.name.trim().toLowerCase() && 
        category.type === activeTab
    );
    
    if (exists) {
      setFormError('Ya existe una categoría con este nombre');
      return;
    }
    
    setIsUpdating(true);
    await updateCategory(editingCategory.id, {
      name: editingCategory.name.trim(),
    });
    
    setEditingCategory(null);
    setFormError('');
    setIsUpdating(false);
  };

  const handleDeleteCategory = async (id: string) => {
    setIsDeleting(id);
    await deleteCategory(id);
    setIsDeleting(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white shadow-sm animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl">Administrar Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="income"
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as TransactionType);
              setNewCategoryName('');
              setFormError('');
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="income" className="flex items-center">
                <ArrowUpIcon className="mr-2 h-4 w-4" />
                Categorías de Ingresos
              </TabsTrigger>
              <TabsTrigger value="expense" className="flex items-center">
                <ArrowDownIcon className="mr-2 h-4 w-4" />
                Categorías de Gastos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="income" className="animate-fade-in">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Nueva categoría de ingresos"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className={formError ? "border-destructive" : ""}
                    />
                    {formError && (
                      <p className="text-destructive text-xs mt-1">{formError}</p>
                    )}
                  </div>
                  <Button onClick={handleAddCategory} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <PlusIcon className="h-4 w-4 mr-2" />
                    )}
                    Agregar
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-[100px] text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                            No hay categorías de ingresos
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              {editingCategory?.id === category.id ? (
                                <Input
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                  className={formError ? "border-destructive" : ""}
                                  autoFocus
                                />
                              ) : (
                                category.name
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingCategory?.id === category.id ? (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={handleUpdateCategory}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : null}
                                    Guardar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                      setEditingCategory(null);
                                      setFormError('');
                                    }}
                                    disabled={isUpdating}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCategory({
                                        id: category.id,
                                        name: category.name,
                                      });
                                      setFormError('');
                                    }}
                                  >
                                    Editar
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Eliminar Categoría</DialogTitle>
                                        <DialogDescription>
                                          ¿Estás seguro de que deseas eliminar la categoría "{category.name}"?
                                          <br />
                                          Esta acción no se puede deshacer.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button
                                          variant="ghost"
                                          onClick={() => {}}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button 
                                          variant="destructive"
                                          onClick={() => handleDeleteCategory(category.id)}
                                          disabled={isDeleting === category.id}
                                        >
                                          {isDeleting === category.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          ) : null}
                                          Eliminar
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="expense" className="animate-fade-in">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Nueva categoría de gastos"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className={formError ? "border-destructive" : ""}
                    />
                    {formError && (
                      <p className="text-destructive text-xs mt-1">{formError}</p>
                    )}
                  </div>
                  <Button onClick={handleAddCategory} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <PlusIcon className="h-4 w-4 mr-2" />
                    )}
                    Agregar
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-[100px] text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                            No hay categorías de gastos
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              {editingCategory?.id === category.id ? (
                                <Input
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                  className={formError ? "border-destructive" : ""}
                                  autoFocus
                                />
                              ) : (
                                category.name
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingCategory?.id === category.id ? (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={handleUpdateCategory}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : null}
                                    Guardar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                      setEditingCategory(null);
                                      setFormError('');
                                    }}
                                    disabled={isUpdating}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCategory({
                                        id: category.id,
                                        name: category.name,
                                      });
                                      setFormError('');
                                    }}
                                  >
                                    Editar
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Eliminar Categoría</DialogTitle>
                                        <DialogDescription>
                                          ¿Estás seguro de que deseas eliminar la categoría "{category.name}"?
                                          <br />
                                          Esta acción no se puede deshacer.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button
                                          variant="ghost"
                                          onClick={() => {}}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button 
                                          variant="destructive"
                                          onClick={() => handleDeleteCategory(category.id)}
                                          disabled={isDeleting === category.id}
                                        >
                                          {isDeleting === category.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          ) : null}
                                          Eliminar
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const ManageCategories = () => {
  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
          <ManageCategoriesContent />
        </main>
      </div>
    </TransactionProvider>
  );
};

export default ManageCategories;
