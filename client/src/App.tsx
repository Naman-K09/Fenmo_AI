import React from 'react';
import { ExpenseForm } from './components/ExpenseForm';

interface AppProps {
  children?: React.ReactNode;
}

export const App: React.FC<AppProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white shadow mb-8">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-center gap-3">
          <img src="/favicon.png" alt="Expense Tracker Logo" className="w-10 h-10 rounded shadow-sm" />
          <h1 className="text-3xl font-bold text-slate-900">Expense Tracker</h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4">
        {children || (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ExpenseForm />
            </div>
            <div>
              {/* Future list component goes here */}
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 h-full min-h-[300px] flex items-center justify-center text-slate-400">
                Expenses list will appear here...
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
