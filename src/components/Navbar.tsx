
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PlusCircle, PieChart, Home, Tag } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/add-transaction', label: 'Nueva Transacción', icon: PlusCircle },
    { to: '/manage-categories', label: 'Categorías', icon: Tag },
  ];

  return (
    <header className="w-full backdrop-blur-md bg-white/80 border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <PieChart className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">Cooperativa Escolar</h1>
        </div>
        
        <nav className="flex items-center space-x-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-secondary",
                  isActive 
                    ? "bg-secondary text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
