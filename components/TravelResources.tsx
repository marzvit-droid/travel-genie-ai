
import React from 'react';
import { ExternalLink, Plane, Hotel, TrainFront, Compass, Info, ArrowRight, AlertTriangle } from 'lucide-react';
import { Language } from '../types';

interface TravelResourcesProps {
  language: Language;
  onNavigateToReservations: () => void;
  city: string;
  startDate?: string;
  days: number;
  travelers: number;
}

export const TravelResources: React.FC<TravelResourcesProps> = ({ 
  language, 
  onNavigateToReservations, 
  city, 
  startDate, 
  days,
  travelers 
}) => {
  const t = {
    en: {
      title: 'Booking Hub',
      subtitle: 'Find real-time deals for your dates',
      guide: 'Booked something? Go to "Vault" to add it. This syncs your plan and budget instantly.',
      dateWarning: 'Note: Flights usually cannot be booked more than 330 days in advance.',
      importBtn: 'Add to Vault',
      searchBtn: 'Search Live',
      categories: {
        flights: 'Flights & Airfare',
        hotels: 'Hotels & Lodging',
        transport: 'Trains & Buses',
        activities: 'Tours & Experiences'
      }
    },
    it: {
      title: 'Hub Prenotazioni',
      subtitle: 'Offerte in tempo reale per le tue date',
      guide: 'Hai prenotato? Vai nella sezione "Vault" per aggiungerlo. Questo aggiornerà istantaneamente itinerario e budget.',
      dateWarning: 'Nota: I voli di solito non sono prenotabili oltre i 330 giorni di anticipo.',
      importBtn: 'Aggiungi al Vault',
      searchBtn: 'Ricerca Live',
      categories: {
        flights: 'Voli e Aerei',
        hotels: 'Hotel e Alloggi',
        transport: 'Treni e Trasporti',
        activities: 'Tour ed Esperienze'
      }
    }
  };

  const text = t[language];

  const getDates = () => {
    if (!startDate) return { in: '', out: '' };
    const parts = startDate.split('-');
    const inDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const outDate = new Date(inDate);
    outDate.setDate(inDate.getDate() + Number(days));
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    return { in: formatDate(inDate), out: formatDate(outDate) };
  };

  const d = getDates();
  const encodedCity = encodeURIComponent(city);

  // Verifichiamo se la data è troppo lontana (oltre 330 giorni)
  const isDateTooFar = startDate ? (new Date(startDate).getTime() - new Date().getTime()) > (330 * 24 * 60 * 60 * 1000) : false;

  const platforms = [
    {
      name: 'Google Flights',
      category: text.categories.flights,
      icon: <Plane className="text-blue-500" />,
      // Google Flights è molto più robusto di Skyscanner per i deep link con nomi città
      url: `https://www.google.com/travel/flights?q=Voli per ${encodedCity} dal ${d.in} al ${d.out} per ${travelers} persone`,
      color: 'border-blue-200 bg-blue-50'
    },
    {
      name: 'Booking.com',
      category: text.categories.hotels,
      icon: <Hotel className="text-blue-600" />,
      url: startDate
        ? `https://www.booking.com/searchresults.html?ss=${encodedCity}&checkin=${d.in}&checkout=${d.out}&group_adults=${travelers}`
        : `https://www.booking.com/searchresults.html?ss=${encodedCity}`,
      color: 'border-blue-100 bg-blue-50/50'
    },
    {
      name: 'Airbnb',
      category: text.categories.hotels,
      icon: <Compass className="text-rose-500" />,
      url: startDate
        ? `https://www.airbnb.it/s/${encodedCity}/homes?checkin=${d.in}&checkout=${d.out}&adults=${travelers}`
        : `https://www.airbnb.it/s/${encodedCity}/homes`,
      color: 'border-rose-200 bg-rose-50'
    },
    {
      name: 'Trainline',
      category: text.categories.transport,
      icon: <TrainFront className="text-emerald-600" />,
      url: `https://www.thetrainline.com/it/search-results?to=${encodedCity}`,
      color: 'border-emerald-200 bg-emerald-50'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-8 bg-indigo-600 text-white flex-none">
        <h2 className="text-2xl font-black mb-1">{text.title}</h2>
        <p className="text-indigo-100 text-sm font-medium">{text.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        {isDateTooFar && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-center shadow-sm">
            <AlertTriangle size={20} className="text-amber-600 flex-none" />
            <p className="text-[11px] text-amber-800 font-bold leading-tight">
              {text.dateWarning}
            </p>
          </div>
        )}

        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-4 items-start shadow-sm">
          <div className="bg-white p-2.5 rounded-xl shadow-sm flex-none">
            <Info size={20} className="text-indigo-600" />
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed font-bold">
            {text.guide}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {platforms.map((p, idx) => (
            <div key={idx} className={`p-5 rounded-3xl border-2 ${p.color} transition-all hover:scale-[1.02] hover:shadow-lg`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm flex-none">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{p.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mt-1">{p.category}</p>
                  </div>
                </div>
                <a 
                  href={p.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-gray-700 p-2.5 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              <div className="flex gap-3">
                <a 
                  href={p.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-700 flex items-center justify-center gap-2 hover:border-indigo-300 transition-all shadow-sm"
                >
                  {text.searchBtn}
                </a>
                <button 
                  onClick={onNavigateToReservations}
                  className="flex-1 py-3 px-4 bg-indigo-600 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  {text.importBtn}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
