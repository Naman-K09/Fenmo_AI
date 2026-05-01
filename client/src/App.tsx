import React from 'react';

interface AppProps {
  children?: React.ReactNode;
}

export const App: React.FC<AppProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Expense Tracker</h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        {children || <p className="text-slate-600">Welcome to Expense Tracker</p>}
      </main>
    </div>
  );
};

export default App;
