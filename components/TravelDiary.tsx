
import React from 'react';
import { BookOpen, MapPin, Quote, PenTool, Feather } from 'lucide-react';
import { Itinerary, Language } from '../types';

interface TravelDiaryProps {
  itinerary: Itinerary;
  language: Language;
}

export const TravelDiary: React.FC<TravelDiaryProps> = ({ itinerary, language }) => {
  const t = {
    en: {
      title: 'Travel Diary',
      subtitle: 'The story of your journey',
      day: 'Day',
      empty: 'Start a trip to see your diary entries.',
      journalNote: 'Travel Journal'
    },
    it: {
      title: 'Diario di Viaggio',
      subtitle: 'Il racconto della tua avventura',
      day: 'Giorno',
      empty: 'Inizia un viaggio per vedere le pagine del tuo diario.',
      journalNote: 'Note di Viaggio'
    }
  };

  const text = t[language];

  const formatDateDisplay = (dateStr: string | undefined, dayOffset: number) => {
    if (!dateStr) return `${text.day} ${dayOffset + 1}`;
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="h-full bg-[#fdfcf0] rounded-3xl shadow-xl border border-amber-100 overflow-y-auto custom-scrollbar animate-fade-in font-serif">
      {/* Copertina del Diario - Ora è parte dello scorrimento */}
      <div className="p-10 bg-[#2d3436] text-white relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
          <BookOpen size={200} />
        </div>
        <div className="relative z-10 w-full max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/10 border border-amber-200/20 text-amber-200 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Feather size={12} /> {text.journalNote}
          </div>
          <h2 className="text-4xl font-black mb-3 text-amber-100 leading-tight tracking-tight">{itinerary.tripTitle}</h2>
          <div className="h-1 w-20 bg-amber-400 mx-auto mb-4 rounded-full"></div>
          <p className="text-slate-300 italic flex items-center justify-center gap-2 text-sm">
            <MapPin size={16} className="text-amber-400" /> {itinerary.city} &bull; {text.subtitle}
          </p>
        </div>
      </div>

      {/* Contenuto del Diario */}
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-16 pb-32">
        {itinerary.dailyItinerary.map((day, idx) => (
          <div key={day.day} className="relative group animate-slide-up">
            {/* Header del Giorno con linea temporale */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-none bg-amber-100 text-amber-900 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm border border-amber-200 rotate-2 group-hover:rotate-0 transition-transform">
                <span className="text-[10px] uppercase opacity-60 leading-none mb-1">{text.day}</span>
                <span className="text-xl leading-none">{day.day}</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
              <div className="flex-none text-[10px] uppercase tracking-[0.2em] text-amber-600 font-black">
                {formatDateDisplay(itinerary.startDate, idx)}
              </div>
            </div>

            {/* Racconto Narrativo */}
            <div className="border-l-4 border-amber-100/50 pl-8 space-y-6">
              <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                {day.theme}
                <PenTool size={20} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>

              <div className="relative bg-white/40 p-8 rounded-[2rem] border border-amber-50 shadow-inner group-hover:bg-white/60 transition-colors">
                <Quote className="absolute -top-4 -left-4 text-amber-200 h-10 w-10 opacity-50" />
                <p className="text-xl text-slate-700 leading-relaxed italic first-letter:text-5xl first-letter:font-black first-letter:text-amber-600 first-letter:mr-3 first-letter:float-left first-letter:mt-1">
                  {day.narrativeSummary || "Un nuovo capitolo sta per iniziare..."}
                </p>
              </div>

              {/* Elenco Attività in stile "Checklist Vintage" */}
              <div className="grid grid-cols-1 gap-4 mt-8 pt-4">
                {day.activities.map((act, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-amber-50/50 transition-colors border border-transparent hover:border-amber-100/50">
                    <div className="text-[11px] font-black text-amber-500 uppercase w-16 text-right font-mono flex-none">{act.time}</div>
                    <div className="w-2 h-2 rounded-full bg-amber-300 flex-none"></div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-base leading-none">{act.placeName}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
