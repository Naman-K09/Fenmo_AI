import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const App = ({ children }) => {
    return (_jsxs("div", { className: "min-h-screen bg-slate-50", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "mx-auto max-w-4xl px-4 py-6 flex items-center gap-3", children: [_jsx("img", { src: "/favicon.png", alt: "Expense Tracker Logo", className: "w-10 h-10 rounded shadow-sm" }), _jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Expense Tracker" })] }) }), _jsx("main", { className: "mx-auto max-w-4xl px-4 py-8", children: children || _jsx("p", { className: "text-slate-600", children: "Welcome to Expense Tracker" }) })] }));
};
export default App;
//# sourceMappingURL=App.js.map