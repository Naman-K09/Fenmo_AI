import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { api } from './api';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from './components/ui/select';
export const App = ({ children }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    // Fetch categories for the filter
    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories'),
    });
    const categories = categoriesResponse?.data || [];
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 pb-12", children: [_jsx("header", { className: "bg-white shadow mb-8", children: _jsx("div", { className: "mx-auto max-w-4xl px-4 py-6 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/favicon.png", alt: "Expense Tracker Logo", className: "w-10 h-10 rounded shadow-sm" }), _jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Expense Tracker" })] }) }) }), _jsx("main", { className: "mx-auto max-w-4xl px-4", children: children || (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsx("div", { className: "lg:col-span-4", children: _jsx(ExpenseForm, {}) }), _jsxs("div", { className: "lg:col-span-8 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100", children: [_jsx("div", { className: "flex-1 max-w-[250px]", children: _jsxs(Select, { value: selectedCategory || "all", onValueChange: (val) => setSelectedCategory(val === "all" ? null : val), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Categories" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), categories.map(c => (_jsx(SelectItem, { value: c.id, children: c.name }, c.id)))] })] }) }), selectedCategory && (_jsx(Badge, { variant: "outline", className: "text-xs bg-slate-50", children: "Filtered" }))] }), _jsx(ExpenseList, { categoryId: selectedCategory })] })] })) })] }));
};
export default App;
//# sourceMappingURL=App.js.map