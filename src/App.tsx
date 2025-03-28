
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TransactionProvider } from "@/providers/TransactionProvider";
import Index from "./pages/Index";
import AddTransaction from "./pages/AddTransaction";
import EditTransaction from "./pages/EditTransaction";
import ManageCategories from "./pages/ManageCategories";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TransactionProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/edit-transaction/:id" element={<EditTransaction />} />
            <Route path="/manage-categories" element={<ManageCategories />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TransactionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
