
import React from 'react';
import { TransactionProvider } from '@/providers/TransactionProvider';
import PageLayout from '@/components/layouts/PageLayout';
import TransactionForm from '@/components/transactions/TransactionForm';

// Create a content component to use the hooks inside the provider
const AddTransactionContent = () => {
  return (
    <PageLayout>
      <TransactionForm />
    </PageLayout>
  );
};

// Wrap the AddTransactionContent with the TransactionProvider
const AddTransaction = () => {
  return (
    <TransactionProvider>
      <AddTransactionContent />
    </TransactionProvider>
  );
};

export default AddTransaction;
