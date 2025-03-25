
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
