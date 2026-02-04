
import React, { useState, useRef } from 'react';
import { Expense, Language, Traveler } from '../types';
import { Plus, Trash2, Wallet, Users, Calculator, CreditCard, UserPlus, Coins, Printer } from 'lucide-react';

interface ExpenseTrackerProps {
  language: Language;
  expenses: Expense[];
  travelers: Traveler[];
  onAdd: (expense: Expense) => void;
  onRemove: (id: string) => void;
  onAddTraveler: (traveler: Traveler) => void;
  onRemoveTraveler: (id: string) => void;
  onUpdateTraveler: (id: string, advance: number) => void;
  onUpdateTravelerName: (id: string, name: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ 
  language,
  expenses,
  travelers,
  onAdd,
  onRemove,
  onAddTraveler,
  onRemoveTraveler,
  onUpdateTraveler,
  onUpdateTravelerName
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'travelers'>('expenses');
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const listEndRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      title: 'Finance Report',
      tabs: { expenses: 'Expenses', travelers: 'Settlement' },
      add: 'Add',
      descPlaceholder: 'Item (e.g., Hotel)',
      namePlaceholder: 'Name',
      advPlaceholder: 'Paid',
      total: 'Total',
      totalAdv: 'Paid',
      balance: 'Balance',
      emptyExp: 'No expenses.',
      emptyTrav: 'No travelers.',
      currency: '€',
      costPerPerson: 'Cost per Person',
      settlement: 'Settlement Division',
      toPay: 'Owes',
      toReceive: 'Receives',
      settled: 'Settled',
      addTraveler: 'Add Traveler',
      printReport: 'Print Report'
    },
    it: {
      title: 'Consuntivo Spese',
      tabs: { expenses: 'Spese', travelers: 'Divisione' },
      add: 'Aggiungi',
      descPlaceholder: 'Voce (es. Hotel)',
      namePlaceholder: 'Nome',
      advPlaceholder: 'Pagato',
      total: 'Totale Spese',
      totalAdv: 'Totale Pagato',
      balance: 'In sospeso',
      emptyExp: 'Nessuna spesa.',
      emptyTrav: 'Nessun partecipante.',
      currency: '€',
      costPerPerson: 'Costo a Persona',
      settlement: 'Divisione Spese',
      toPay: 'Deve Dare',
      toReceive: 'Deve Avere',
      settled: 'In Pari',
      addTraveler: 'Aggiungi Viaggiatore',
      printReport: 'Stampa Consuntivo'
    }
  };

  const text = t[language];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onAdd({
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount)
    });
    setDescription('');
    setAmount('');
  };

  const handleAddTravelerClick = () => {
    const nextNum = travelers.length + 1;
    const autoName = language === 'it' ? `Viaggiatore ${nextNum}` : `Traveler ${nextNum}`;
    onAddTraveler({ id: Date.now().toString(), name: autoName, advance: 0 });
    setTimeout(() => { listEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  };

  const handleAdvanceChange = (id: string, val: string) => {
    const numVal = val === '' ? 0 : parseFloat(val);
    onUpdateTraveler(id, isNaN(numVal) ? 0 : numVal);
  };

  const totalCost = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalAdvances = travelers.reduce((sum, t) => sum + t.advance, 0);
  const balance = totalCost - totalAdvances;
  const travelerCount = travelers.length || 1;
  const costPerPerson = totalCost / travelerCount;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col h-full overflow-hidden font-sans">
      <div className="flex border-b border-slate-200 bg-slate-50 flex-none z-10 no-print">
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'expenses' ? 'bg-white text-indigo-700 border-b-2 border-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>
          <Wallet size={16} /> {text.tabs.expenses}
        </button>
        <button onClick={() => setActiveTab('travelers')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'travelers' ? 'bg-white text-indigo-700 border-b-2 border-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>
          <Users size={16} /> {text.tabs.travelers}
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative bg-white">
        {activeTab === 'expenses' && (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex-none no-print">
              <form onSubmit={handleAddSubmit} className="flex gap-2">
                <input type="text" placeholder={text.descPlaceholder} value={description} onChange={e => setDescription(e.target.value)} className="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:border-indigo-500 outline-none font-bold" />
                <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-24 px-3 py-2 text-sm border-2 border-slate-200 rounded-xl bg-white focus:border-indigo-500 outline-none font-black" />
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl shadow-md hover:bg-indigo-700 transition-all">
                  <Plus size={20} />
                </button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-32">
              <h2 className="hidden print:block text-2xl font-black mb-6 text-indigo-900 uppercase tracking-tighter">{text.title}</h2>
              {expenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Wallet size={40} className="opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{text.emptyExp}</p>
                </div>
              ) : (
                expenses.map(exp => (
                  <div key={exp.id} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-sm font-bold text-slate-800 truncate pr-4">{exp.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-slate-950">{text.currency}{exp.amount.toFixed(2)}</span>
                      <button onClick={() => onRemove(exp.id)} className="text-slate-300 hover:text-red-600 p-1.5 bg-slate-50 rounded-lg no-print">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'travelers' && (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex-none no-print flex gap-2">
               <button onClick={handleAddTravelerClick} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all">
                  <UserPlus size={16} /> {text.addTraveler}
                </button>
                <button onClick={() => window.print()} className="px-4 bg-slate-800 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                   <Printer size={16} /> {text.printReport}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white pb-40">
              <h2 className="hidden print:block text-2xl font-black mb-6 text-indigo-900 uppercase tracking-tighter">{text.settlement}</h2>
              {travelers.length > 0 && totalCost > 0 && (
                 <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Calculator size={14}/> {text.settlement}
                    </h3>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-indigo-200">
                       <span className="text-[9px] text-indigo-700 uppercase font-black tracking-widest">{text.costPerPerson}</span>
                       <span className="text-2xl font-black text-indigo-950">{text.currency}{costPerPerson.toFixed(2)}</span>
                    </div>
                    <div className="space-y-3">
                       {travelers.map(t => {
                          const debt = costPerPerson - t.advance;
                          return (
                            <div key={t.id} className="flex items-center justify-between text-xs">
                               <span className="font-bold text-slate-800 truncate max-w-[150px]">{t.name}</span>
                               <div className="flex items-center gap-2">
                                  {debt > 0.01 ? (
                                    <span className="font-black text-red-700 bg-red-100 px-2 py-1 rounded-lg border border-red-200 min-w-[70px] text-right">
                                      {text.currency}{Math.abs(debt).toFixed(2)}
                                    </span>
                                  ) : debt < -0.01 ? (
                                    <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 min-w-[70px] text-right">
                                      {text.currency}{Math.abs(debt).toFixed(2)}
                                    </span>
                                  ) : <span className="text-indigo-400 font-black text-[9px] uppercase">{text.settled}</span>}
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
              )}
              <div className="space-y-2">
                {travelers.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-300 gap-2 no-print">
                    <Users size={40} className="opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{text.emptyTrav}</p>
                  </div>
                ) : (
                  travelers.map(t => (
                    <div key={t.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                         <span className="hidden print:inline font-bold text-sm mr-4">{t.name}: Pagato {text.currency}{t.advance.toFixed(2)}</span>
                         <input type="text" value={t.name} onChange={e => onUpdateTravelerName(t.id, e.target.value)} className="no-print text-sm font-bold text-slate-900 w-full bg-slate-50 border-none focus:ring-1 focus:ring-indigo-300 rounded-lg px-2 py-1 transition-all" />
                      </div>
                      <div className="flex items-center gap-2 flex-none no-print">
                         <div className="relative">
                           <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black">€</span>
                           <input type="number" step="0.01" value={t.advance === 0 ? '' : t.advance} onChange={e => handleAdvanceChange(t.id, e.target.value)} placeholder="0" className="w-20 pl-5 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none text-right font-black text-slate-950" />
                         </div>
                         <button onClick={() => onRemoveTraveler(t.id)} className="text-slate-300 hover:text-red-600 p-1.5 bg-slate-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <div ref={listEndRef} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-slate-900 text-white border-t border-white/10 flex-none space-y-2 shadow-2xl no-print">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-1"><Wallet size={12}/> {text.total}: {text.currency}{totalCost.toFixed(2)}</span>
          <span className="text-emerald-400">{text.totalAdv}: {text.currency}{totalAdvances.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
           <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/50">{text.balance}</span>
            <span className={`text-2xl font-black tracking-tighter ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {text.currency}{Math.abs(balance).toFixed(2)}
            </span>
           </div>
           <div className="bg-white/10 p-2 rounded-xl">
             <CreditCard size={20} className="text-white/40" />
           </div>
        </div>
      </div>
    </div>
  );
};
