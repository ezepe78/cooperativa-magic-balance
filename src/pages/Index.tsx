
import React from 'react';
import { TransactionProvider } from '@/context/TransactionContext';
import Navbar from '@/components/Navbar';
import BalanceSummary from '@/components/BalanceSummary';
import MonthlySummary from '@/components/MonthlySummary';
import TransactionsTable from '@/components/TransactionsTable';

const Index = () => {
  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              Cooperadora escolar JI 902
            </h1>
            
            <BalanceSummary />
            
            <MonthlySummary />
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 animate-fade-in">
                Transacciones Recientes
              </h2>
              <TransactionsTable />
            </div>
          </div>
        </main>
      </div>
    </TransactionProvider>
  );
};

export default Index;
