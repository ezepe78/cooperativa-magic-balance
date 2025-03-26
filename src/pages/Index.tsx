
import React from 'react';
import Navbar from '@/components/Navbar';
import BalanceSummary from '@/components/BalanceSummary';
import MonthlySummary from '@/components/MonthlySummary';
import TransactionsTable from '@/components/TransactionsTable';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
        <div className="space-y-6">
          <MonthlySummary />
          
          <BalanceSummary />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 animate-fade-in">
              Transacciones Recientes
            </h2>
            
            <TransactionsTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
