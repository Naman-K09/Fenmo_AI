import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, ClientApiError } from '../api';
import { useIdempotentSubmit } from '../hooks/useIdempotentSubmit';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// Schema mimicking backend validation exactly
const expenseFormSchema = z.object({
    amount: z
        .string()
        .min(1, 'Amount is required')
        .regex(/^\d+(\.\d{1,2})?$/, 'Must be a positive number with at most 2 decimal places'),
    categoryId: z.string().uuid('Please select a valid category'),
    description: z
        .string()
        .min(1, 'Description is required')
        .max(500, 'Description must be 500 characters or less'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});
export function ExpenseForm() {
    const queryClient = useQueryClient();
    const { getKey, resetKey } = useIdempotentSubmit();
    const [submitError, setSubmitError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    // Fetch categories
    const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories'),
    });
    const categories = categoriesResponse?.data || [];
    // Default date to today in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const form = useForm({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            amount: '',
            categoryId: '',
            description: '',
            date: today,
        },
    });
    const mutation = useMutation({
        mutationFn: async (values) => {
            setSubmitError(null);
            // We pass the idempotency key to the API call
            return api.post('/expenses', values, { idempotencyKey: getKey() });
        },
        onSuccess: () => {
            resetKey(); // Important: Only reset after success!
            form.reset({ amount: '', categoryId: '', description: '', date: today });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            // Optimistic feedback: Invalidate to trigger background refetch
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
        onError: (error) => {
            if (error instanceof ClientApiError) {
                // Backend returned a non-2xx response with { error: string }
                setSubmitError(error.message);
            }
            else {
                // Network error / fetch exception
                setSubmitError("Couldn't connect — your expense may not have been saved. Please check your connection and try again.");
            }
        },
    });
    async function onSubmit(data) {
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
    return (_jsxs(Card, { className: "w-full max-w-md mx-auto shadow-md", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-xl font-bold text-slate-800", children: "Add New Expense" }) }), _jsx(CardContent, { children: _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "amount", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Amount" }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none select-none", children: "\u20B9" }), _jsx(Input, { placeholder: "0.00", className: "pl-8", ...field })] }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "categoryId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Category" }), _jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { disabled: isLoadingCategories, children: _jsx(SelectValue, { placeholder: isLoadingCategories ? "Loading..." : "Select a category" }) }) }), _jsx(SelectContent, { children: categories.map((category) => (_jsx(SelectItem, { value: category.id, children: category.name }, category.id))) })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Description" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "What did you spend on?", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "date", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", max: today, ...field }) }), _jsx(FormMessage, {})] })) }), submitError && (_jsxs("div", { className: "flex items-start gap-2 p-3 text-sm text-red-600 rounded-md bg-red-50 border border-red-100", children: [_jsx(AlertCircle, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("p", { children: submitError })] })), showSuccess && (_jsxs("div", { className: "flex items-center gap-2 p-3 text-sm text-green-700 rounded-md bg-green-50 border border-green-100", children: [_jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }), _jsx("p", { children: "Expense added successfully!" })] })), _jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Adding..."] })) : ('Add Expense') })] }) }) })] }));
}
//# sourceMappingURL=ExpenseForm.js.map