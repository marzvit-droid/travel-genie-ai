
import React, { useState } from 'react';
import { Reservation, ReservationType, Language, Expense } from '../types';
import { Calendar as CalendarIcon, Hotel, Utensils, Ticket, Plus, Trash2, FileText, Bus, Sparkles, Clock } from 'lucide-react';

interface ReservationManagerProps {
  language: Language;
  reservations: Reservation[]; 
  onAddReservation: (res: Reservation) => void;
  onRemoveReservation: (id: string) => void;
  onAddExpense: (expense: Expense) => void;
}

export const ReservationManager: React.FC<ReservationManagerProps> = ({ 
  language, 
  reservations,
  onAddReservation,
  onRemoveReservation,
  onAddExpense 
}) => {
  const [type, setType] = useState<ReservationType>('hotel');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');

  const t = {
    en: {
      title: 'Booking Vault',
      add: 'Add to Vault',
      namePlaceholder: 'Entity Name (e.g. Emirates, Hilton)',
      datePlaceholder: 'Date',
      costPlaceholder: 'Price',
      empty: 'Vault is empty.',
      types: { hotel: 'Hotel', activity: 'Activity', food: 'Food', transport: 'Transport', spa: 'Spa' }
    },
    it: {
      title: 'Il Vault delle Prenotazioni',
      add: 'Aggiungi al Vault',
      namePlaceholder: 'Nome (es. Ryanair, Marriot)',
      datePlaceholder: 'Data',
      costPlaceholder: 'Costo',
      empty: 'Il Vault è vuoto.',
      types: { hotel: 'Hotel', activity: 'Attività', food: 'Cibo', transport: 'Trasporto', spa: 'Terme' }
    }
  };

  const text = t[language];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    const costNum = cost ? parseFloat(cost) : 0;
    const newRes: Reservation = { id: Date.now().toString(), type, name, date, time, notes, cost: costNum };
    onAddReservation(newRes);
    if (costNum > 0) {
      onAddExpense({ id: `res-${newRes.id}`, description: `${text.types[type]}: ${name}`, amount: costNum });
    }
    setName(''); setDate(''); setTime(''); setNotes(''); setCost('');
  };

  const getTypeIcon = (type: ReservationType) => {
    switch (type) {
      case 'hotel': return <Hotel size={20} className="text-blue-600" />;
      case 'food': return <Utensils size={20} className="text-orange-600" />;
      case 'transport': return <Bus size={20} className="text-emerald-600" />;
      case 'spa': return <Sparkles size={20} className="text-pink-600" />;
      default: return <Ticket size={20} className="text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-full overflow-hidden font-sans">
      <div className="p-5 bg-indigo-700 text-white border-b border-indigo-800 flex items-center gap-3 flex-none shadow-lg z-20">
        <FileText size={22} className="text-indigo-200" />
        <div>
          <h3 className="font-black text-base tracking-tight leading-none">{text.title}</h3>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Confirmed bookings sync</p>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200 bg-slate-50 flex-none z-10">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={type} onChange={e => setType(e.target.value as ReservationType)} className="px-3 py-2 text-xs border-2 border-slate-200 rounded-xl bg-white font-black outline-none transition-all">
              <option value="hotel">{text.types.hotel}</option>
              <option value="food">{text.types.food}</option>
              <option value="spa">{text.types.spa}</option>
              <option value="activity">{text.types.activity}</option>
              <option value="transport">{text.types.transport}</option>
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 text-xs border-2 border-slate-200 rounded-xl bg-white font-black outline-none" required />
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder={text.namePlaceholder} value={name} onChange={e => setName(e.target.value)} className="flex-1 px-3 py-2 text-xs border-2 border-slate-200 rounded-xl bg-white font-bold outline-none" required />
            <input type="number" step="0.01" placeholder={text.costPlaceholder} value={cost} onChange={e => setCost(e.target.value)} className="w-20 px-3 py-2 text-xs border-2 border-slate-200 rounded-xl bg-white font-black outline-none" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all">
            <Plus size={18} /> {text.add}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-white pb-20">
        {reservations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
            <Sparkles size={50} className="opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">{text.empty}</p>
          </div>
        ) : (
          reservations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(res => (
            <div key={res.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all flex justify-between items-center group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                  {getTypeIcon(res.type)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">{res.name}</h4>
                  <div className="flex items-center gap-3 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><CalendarIcon size={10} className="text-indigo-600" /> {res.date}</div>
                    {res.time && <div className="flex items-center gap-1"><Clock size={10} className="text-indigo-600" /> {res.time}</div>}
                  </div>
                  {res.cost !== undefined && res.cost > 0 && (
                     <div className="text-xs font-black text-emerald-700 mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 w-fit">
                       €{res.cost.toFixed(2)}
                     </div>
                  )}
                </div>
              </div>
              <button onClick={() => onRemoveReservation(res.id)} className="text-slate-300 hover:text-red-600 p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
