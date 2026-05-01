import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { api } from './api';
import { Badge } from './components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

interface AppProps {
  children?: React.ReactNode;
}

interface Category {
  id: string;
  name: string;
}

export const App: React.FC<AppProps> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories for the filter
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  });

  const categories = categoriesResponse?.data || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white shadow mb-8">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Expense Tracker Logo" className="w-10 h-10 rounded shadow-sm" />
            <h1 className="text-3xl font-bold text-slate-900">Expense Tracker</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4">
        {children || (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <ExpenseForm />
            </div>
            <div className="lg:col-span-8 space-y-4">
              {/* Filter Controls */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex-1 max-w-[250px]">
                  <Select 
                    value={selectedCategory || "all"} 
                    onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategory && (
                  <Badge variant="outline" className="text-xs bg-slate-50">
                    Filtered
                  </Badge>
                )}
              </div>

              {/* Expense List */}
              <ExpenseList categoryId={selectedCategory} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
