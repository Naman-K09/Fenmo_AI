import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExpenseForm } from './components/ExpenseForm';
export const App = ({ children }) => {
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 pb-12", children: [_jsx("header", { className: "bg-white shadow mb-8", children: _jsxs("div", { className: "mx-auto max-w-4xl px-4 py-6 flex items-center gap-3", children: [_jsx("img", { src: "/favicon.png", alt: "Expense Tracker Logo", className: "w-10 h-10 rounded shadow-sm" }), _jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Expense Tracker" })] }) }), _jsx("main", { className: "mx-auto max-w-4xl px-4", children: children || (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsx("div", { children: _jsx(ExpenseForm, {}) }), _jsx("div", { children: _jsx("div", { className: "p-6 bg-white rounded-xl shadow-sm border border-slate-100 h-full min-h-[300px] flex items-center justify-center text-slate-400", children: "Expenses list will appear here..." }) })] })) })] }));
};
export default App;
//# sourceMappingURL=App.js.map