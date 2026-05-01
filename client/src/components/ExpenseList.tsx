import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { api, ClientApiError } from '../api';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface ExpenseListProps {
  categoryId: string | null;
}

interface Expense {
  id: string;
  amount: string;
  category: {
    id: string;
    name: string;
  };
  description: string;
  date: string;
  createdAt: string;
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(amount));
};

export function ExpenseList({ categoryId }: ExpenseListProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', categoryId],
    queryFn: () => {
      let url = '/expenses?sort=date_desc';
      if (categoryId) {
        url += `&categoryId=${encodeURIComponent(categoryId)}`;
      }
      return api.get<Expense[]>(url);
    },
  });

  const expenses = data?.data || [];
  const total = data?.total || '0.00';

  if (error) {
    let errorMessage = 'Failed to load expenses.';
    if (error instanceof ClientApiError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-red-50 border-red-100">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-red-700 mb-4">{errorMessage}</p>
        <Button onClick={() => refetch()} variant="outline" className="bg-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[130px]">Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right w-[150px]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading State Skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : expenses.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-base font-medium text-slate-700">No expenses found</p>
                    <p className="text-sm">
                      {categoryId ? "Try a different category filter" : "Add your first expense above"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              expenses.map((expense) => (
                <TableRow key={expense.id} className="h-[60px]">
                  <TableCell className="whitespace-nowrap font-medium text-slate-600">
                    {expense.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-700 hover:bg-slate-200">
                      {expense.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-slate-600" title={expense.description}>
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-900 whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">
            {categoryId ? 'Total (filtered):' : 'Total:'}
          </span>
          <span className="text-xl font-bold text-slate-900">
            {isLoading ? <Skeleton className="h-7 w-32" /> : formatCurrency(total)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
