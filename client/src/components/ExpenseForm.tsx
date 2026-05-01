import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

import { api, ClientApiError } from '../api';
import { useIdempotentSubmit } from '../hooks/useIdempotentSubmit';

import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Schema mimicking backend validation exactly
const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a positive number with at most 2 decimal places'),
  categoryName: z.string().min(1, 'Category is required').max(50, 'Category name is too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface Category {
  id: string;
  name: string;
}

export function ExpenseForm() {
  const queryClient = useQueryClient();
  const { getKey, resetKey } = useIdempotentSubmit();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch categories
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  });

  const categories = categoriesResponse?.data || [];

  // Default date to today in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: '',
      categoryName: '',
      description: '',
      date: today,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      setSubmitError(null);
      
      let finalCategoryId = '';
      const normalizedInput = values.categoryName.trim().toLowerCase();
      const existing = categories.find((c: Category) => c.name.toLowerCase() === normalizedInput);
      
      if (existing) {
        finalCategoryId = existing.id;
      } else {
        try {
          const createRes = await api.post<Category>('/categories', { name: values.categoryName });
          finalCategoryId = createRes.data.id;
        } catch (err) {
          if (err instanceof ClientApiError && err.status === 409) {
            // It was created just now by someone else, refetch to get the ID
            const freshCategories = await api.get<Category[]>('/categories');
            const found = freshCategories.data.find(c => c.name.toLowerCase() === normalizedInput);
            if (found) {
              finalCategoryId = found.id;
            } else {
              throw new Error("Failed to resolve category ID");
            }
          } else {
            throw err; // Re-throw if it's a different error
          }
        }
      }

      const expensePayload = {
        amount: values.amount,
        categoryId: finalCategoryId,
        description: values.description,
        date: values.date
      };

      // We pass the idempotency key to the API call
      return api.post('/expenses', expensePayload, { idempotencyKey: getKey() });
    },
    onSuccess: () => {
      resetKey(); // Important: Only reset after success!
      form.reset({ amount: '', categoryName: '', description: '', date: today });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Optimistic feedback: Invalidate to trigger background refetch
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      if (error instanceof ClientApiError) {
        // Backend returned a non-2xx response with { error: string }
        setSubmitError(error.message);
      } else {
        // Network error / fetch exception
        setSubmitError("Couldn't connect — your expense may not have been saved. Please check your connection and try again.");
      }
    },
  });

  async function onSubmit(data: ExpenseFormValues) {
    // Check if date is in the future
    const selectedDate = new Date(data.date);
    const now = new Date();
    // Reset time for today to midnight to compare just dates safely
    now.setHours(0, 0, 0, 0); 
    
    // Convert selectedDate to local time midnight comparison to be perfectly safe, 
    // but a simple string comparison actually works for YYYY-MM-DD.
    if (data.date > today) {
      form.setError('date', { message: 'Date cannot be in the future' });
      return;
    }

    mutation.mutate(data);
  }

  const isSubmitting = form.formState.isSubmitting || mutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none select-none">
                        ₹
                      </span>
                      <Input placeholder="0.00" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Food, Transport, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="What did you spend on?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" max={today} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Display */}
            {submitError && (
              <div className="flex items-start gap-2 p-3 text-sm text-red-600 rounded-md bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}

            {/* Success Display (Brief flash) */}
            {showSuccess && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-700 rounded-md bg-green-50 border border-green-100">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>Expense added successfully!</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Expense'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
