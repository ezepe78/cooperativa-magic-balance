
import React from 'react';
import Navbar from '@/components/Navbar';
import MonthlySummary from '@/components/MonthlySummary';
import TransactionsPeriodTable from '@/components/TransactionsPeriodTable';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
        <div className="space-y-6">
          <MonthlySummary />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 animate-fade-in">
              Transacciones del Período
            </h2>
            
            <TransactionsPeriodTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
