import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { api, ClientApiError } from '../api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from './ui/table';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(Number(amount));
};
export function ExpenseList({ categoryId }) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['expenses', categoryId],
        queryFn: () => {
            let url = '/expenses?sort=date_desc';
            if (categoryId) {
                url += `&categoryId=${encodeURIComponent(categoryId)}`;
            }
            return api.get(url);
        },
    });
    const expenses = data?.data || [];
    const total = data?.total || '0.00';
    if (error) {
        let errorMessage = 'Failed to load expenses.';
        if (error instanceof ClientApiError) {
            errorMessage = error.message;
        }
        else if (error instanceof Error) {
            errorMessage = error.message;
        }
        return (_jsxs("div", { className: "flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-red-50 border-red-100", children: [_jsx(AlertCircle, { className: "w-8 h-8 text-red-500 mb-3" }), _jsx("p", { className: "text-red-700 mb-4", children: errorMessage }), _jsxs(Button, { onClick: () => refetch(), variant: "outline", className: "bg-white", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "rounded-md border bg-white overflow-hidden shadow-sm", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "bg-slate-50/50", children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[120px]", children: "Date" }), _jsx(TableHead, { className: "w-[130px]", children: "Category" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { className: "text-right w-[150px]", children: "Amount" })] }) }), _jsx(TableBody, { children: isLoading ? (
                            // Loading State Skeletons
                            Array.from({ length: 5 }).map((_, i) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Skeleton, { className: "h-4 w-20" }) }), _jsx(TableCell, { children: _jsx(Skeleton, { className: "h-5 w-24 rounded-full" }) }), _jsx(TableCell, { children: _jsx(Skeleton, { className: "h-4 w-full max-w-[200px]" }) }), _jsx(TableCell, { className: "text-right", children: _jsx(Skeleton, { className: "h-4 w-20 ml-auto" }) })] }, i)))) : expenses.length === 0 ? (
                            // Empty State
                            _jsx(TableRow, { children: _jsx(TableCell, { colSpan: 4, className: "h-32 text-center text-slate-500", children: _jsxs("div", { className: "flex flex-col items-center justify-center space-y-1", children: [_jsx("p", { className: "text-base font-medium text-slate-700", children: "No expenses found" }), _jsx("p", { className: "text-sm", children: categoryId ? "Try a different category filter" : "Add your first expense above" })] }) }) })) : (
                            // Data Rows
                            expenses.map((expense) => (_jsxs(TableRow, { className: "h-[60px]", children: [_jsx(TableCell, { className: "whitespace-nowrap font-medium text-slate-600", children: expense.date }), _jsx(TableCell, { children: _jsx(Badge, { variant: "secondary", className: "font-normal bg-slate-100 text-slate-700 hover:bg-slate-200", children: expense.category.name }) }), _jsx(TableCell, { className: "max-w-[200px] truncate text-slate-600", title: expense.description, children: expense.description }), _jsx(TableCell, { className: "text-right font-medium text-slate-900 whitespace-nowrap", children: formatCurrency(expense.amount) })] }, expense.id)))) })] }) }), _jsx(Card, { className: "shadow-sm border-slate-200 bg-white", children: _jsxs(CardContent, { className: "p-4 flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-slate-500", children: categoryId ? 'Total (filtered):' : 'Total:' }), _jsx("span", { className: "text-xl font-bold text-slate-900", children: isLoading ? _jsx(Skeleton, { className: "h-7 w-32" }) : formatCurrency(total) })] }) })] }));
}
//# sourceMappingURL=ExpenseList.js.map