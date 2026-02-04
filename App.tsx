
import React, { useState, useEffect } from 'react';
import { generateItinerary, initChat } from './services/geminiService';
import { Itinerary, CityInput, Language, View, Expense, Reservation, Traveler, Activity } from './types';
import { ChatBot } from './components/ChatBot';
import { ExpenseTracker } from './components/ExpenseTracker';
import { ReservationManager } from './components/ReservationManager';
import { TravelResources } from './components/TravelResources';
import { TravelDiary } from './components/TravelDiary';
import { 
  MapPin, 
  Calendar, 
  Plane, 
  Loader2, 
  Users, 
  MessageSquare,
  Wallet,
  FileText,
  RefreshCw,
  X,
  Globe,
  Smartphone,
  BookOpen,
  Coins,
  Zap,
  Coffee,
  Sparkles,
  ExternalLink,
  Building2,
  ChevronDown,
  Download,
  Copy,
  Check,
  Apple,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Tag,
  CreditCard,
  Utensils,
  Navigation,
  Printer
} from 'lucide-react';

const App: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [formState, setFormState] = useState<CityInput>({ 
    city: '', 
    departureCity: '',
    days: 1, 
    travelers: 2, 
    startDate: today,
    budget: 1500,
    style: 50
  });
  
  const [budgetText, setBudgetText] = useState('1500');
  const [language, setLanguage] = useState<Language>('it');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<View>('search');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowShareModal(true);
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [travelersList, setTravelersList] = useState<Traveler[]>([]);

  const t = {
    en: {
      title: 'TravelGenie AI',
      subtitle: 'Smart Travel Planner',
      departurePlaceholder: 'Departure City',
      wherePlaceholder: 'Where to?',
      daysPlaceholder: 'Days',
      travelersPlaceholder: 'Travelers',
      datePlaceholder: 'Start Date',
      budgetLabel: 'Your Total Budget (€)',
      styleLabel: 'Travel Vibe',
      relax: 'Relax & SPA',
      adventure: 'Adventure & Sport',
      btnGenerate: 'Plan My Journey',
      btnGenerating: 'AI is Crafting...',
      errorMsg: 'Generation failed. Check your connection.',
      day: 'Day',
      install: 'Get the App',
      installDesc: 'Add to home screen for the best experience',
      installIosDesc: 'Tap Share and then "Add to Home Screen"',
      reset: 'New Search',
      estBudget: 'Estimated Budget Breakdown',
      bookNow: 'Book Now',
      free: 'Free',
      activityCosts: 'Activities & Meals',
      openMaps: 'Open in Google Maps',
      dayRoute: 'Daily Route',
      print: 'Print',
      tabs: {
        search: 'Search',
        itinerary: 'Plan',
        chat: 'Expert',
        expenses: 'Budget',
        reservations: 'Vault',
        resources: 'Deals',
        diary: 'Diary'
      }
    },
    it: {
      title: 'TravelGenie AI',
      subtitle: 'Il tuo Planner Intelligente',
      departurePlaceholder: 'Città di Partenza',
      wherePlaceholder: 'Dove vuoi andare?',
      daysPlaceholder: 'Giorni',
      travelersPlaceholder: 'Persone',
      datePlaceholder: 'Data Partenza',
      budgetLabel: 'Il tuo Budget Totale (€)',
      styleLabel: 'Stile di Viaggio',
      relax: 'Relax e SPA',
      adventure: 'Avventura e Sport',
      btnGenerate: 'Crea Viaggio Su Misura',
      btnGenerating: 'L\'AI sta pianificando...',
      errorMsg: 'Impossibile generare. Riprova tra poco.',
      day: 'Giorno',
      install: 'Installa l\'App',
      installDesc: 'Aggiungi alla home per usarla come una vera app',
      installIosDesc: 'Premi Condividi e poi "Aggiungi alla schermata Home"',
      reset: 'Nuova Ricerca',
      estBudget: 'Dettaglio Costi Stimati',
      bookNow: 'Prenota Ora',
      free: 'Gratis',
      activityCosts: 'Attività e Pasti',
      openMaps: 'Apri su Google Maps',
      dayRoute: 'Percorso del Giorno',
      print: 'Stampa',
      tabs: {
        search: 'Cerca',
        itinerary: 'Piano',
        chat: 'Esperto',
        expenses: 'Budget',
        reservations: 'Vault',
        resources: 'Offerte',
        diary: 'Diario'
      }
    }
  };

  const text = t[language];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.city) return;
    setLoading(true);
    setError('');
    
    try {
      const data = await generateItinerary(formState, language);
      setItinerary({ ...data, startDate: formState.startDate });
      initChat(JSON.stringify(data), language);
      setActiveView('itinerary'); 
    } catch (err) {
      setError(text.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFromAI = (newItinerary: Itinerary) => {
    const updated = {
      ...newItinerary,
      startDate: itinerary?.startDate || formState.startDate,
      travelers: itinerary?.travelers || Number(formState.travelers)
    };
    setItinerary(updated);
    initChat(JSON.stringify(updated), language);
    setActiveView('itinerary');
  };

  const openGoogleMapsRoute = (activities: Activity[]) => {
    const validPoints = activities.filter(a => a.latitude && a.longitude);
    if (validPoints.length === 0) return;
    
    const origin = `${validPoints[0].latitude},${validPoints[0].longitude}`;
    const destination = `${validPoints[validPoints.length - 1].latitude},${validPoints[validPoints.length - 1].longitude}`;
    const waypoints = validPoints.slice(1, -1).map(p => `${p.latitude},${p.longitude}`).join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const navItems = [
    { id: 'itinerary', label: text.tabs.itinerary, icon: MapPin },
    { id: 'diary', label: text.tabs.diary, icon: BookOpen },
    { id: 'chat', label: text.tabs.chat, icon: MessageSquare },
    { id: 'expenses', label: text.tabs.expenses, icon: Wallet },
    { id: 'reservations', label: text.tabs.reservations, icon: FileText },
    { id: 'resources', label: text.tabs.resources, icon: Globe },
  ];

  const totalActivitiesCost = itinerary?.dailyItinerary.reduce((sum, day) => 
    sum + day.activities.reduce((dSum, act) => dSum + (act.maxCost || 0), 0), 0
  ) || 0;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="bg-white border-b border-gray-200 z-50 flex-none h-16 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => itinerary && setActiveView('itinerary')}>
            <div className="bg-indigo-600 p-2 rounded-lg"><Plane className="text-white h-5 w-5" /></div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{text.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase text-white hover:bg-indigo-700 shadow-md transition-all"
            >
              <Download size={14} /> {text.install}
            </button>
            <button 
              onClick={() => setLanguage(l => l === 'it' ? 'en' : 'it')}
              className="px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-700 border border-slate-200"
            >
              {language === 'it' ? 'IT' : 'EN'}
            </button>
            {itinerary && (
              <button onClick={() => { setItinerary(null); setActiveView('search'); }} className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 border border-red-100">
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto">
          {(activeView === 'search' || !itinerary) && (
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-10 bg-gradient-to-b from-indigo-50/50 to-white">
              <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 animate-fade-in">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-wider mb-4 border border-indigo-100 shadow-sm">
                    <Sparkles size={14} /> Generazione con Ricerca Live
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{text.subtitle}</h2>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-2 animate-pulse">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="relative group">
                      <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder={text.departurePlaceholder} 
                        value={formState.departureCity} 
                        onChange={e => setFormState(p => ({...p, departureCity: e.target.value}))} 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-lg transition-all" 
                      />
                    </div>

                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder={text.wherePlaceholder} 
                        value={formState.city} 
                        onChange={e => setFormState(p => ({...p, city: e.target.value}))} 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none font-black text-lg transition-all" 
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="number" min="1" max="30" placeholder={text.daysPlaceholder} 
                          value={formState.days} 
                          onChange={e => setFormState(p => ({...p, days: e.target.value}))} 
                          className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" 
                        />
                      </div>
                      <div className="relative group">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="number" min="1" max="20" placeholder={text.travelersPlaceholder} 
                          value={formState.travelers} 
                          onChange={e => setFormState(p => ({...p, travelers: e.target.value}))} 
                          className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" 
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="date" value={formState.startDate} 
                        onChange={e => setFormState(p => ({...p, startDate: e.target.value}))} 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-6 rounded-[2rem] border-2 border-indigo-100 space-y-6 shadow-inner">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest px-1 flex justify-between">
                         {text.budgetLabel}
                       </label>
                       <div className="relative group">
                         <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 h-5 w-5" />
                         <input 
                          type="number" step="100" 
                          value={budgetText} 
                          onChange={e => {
                            setBudgetText(e.target.value);
                            if (e.target.value) setFormState(p => ({...p, budget: Number(e.target.value)}));
                          }} 
                          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 text-xl font-black text-slate-950 shadow-sm transition-all" 
                         />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end text-[10px] font-black text-indigo-900 uppercase tracking-widest px-1">
                         <span className="flex flex-col items-center gap-1"><Coffee size={16} className="text-amber-600"/> {text.relax}</span>
                         <span className="flex flex-col items-center gap-1">{text.adventure} <Zap size={16} className="text-indigo-600"/></span>
                       </div>
                       <div className="px-1 py-2">
                        <input 
                          type="range" min="0" max="100" 
                          value={formState.style} 
                          onChange={e => setFormState(p => ({...p, style: Number(e.target.value)}))} 
                          className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                       </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 text-xl uppercase tracking-tight relative overflow-hidden">
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} 
                    {loading ? text.btnGenerating : text.btnGenerate}
                  </button>
                </form>
              </div>
            </div>
          )}

          {itinerary && activeView === 'itinerary' && (
            <div className="max-w-3xl mx-auto p-4 pb-32 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 overflow-hidden relative group transition-all">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter">{itinerary.city}</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-tighter">AI Curated</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-black rounded-full uppercase shadow-sm hover:bg-slate-200 transition-all no-print"
                      >
                        <Printer size={14} /> {text.print}
                      </button>
                      <button 
                        onClick={() => openGoogleMapsRoute(itinerary.dailyItinerary.flatMap(d => d.activities))}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase shadow-md hover:bg-indigo-700 transition-all no-print"
                      >
                        <Navigation size={14} /> {text.openMaps}
                      </button>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-950 leading-tight mb-3">{itinerary.tripTitle}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-bold">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"><Calendar size={16} className="text-indigo-600"/> {itinerary.days} {text.day}s</div>
                    {itinerary.estimatedTotalCost && (
                      <div onClick={() => setShowBudgetModal(true)} className="flex items-center gap-1.5 text-emerald-700 font-black bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm cursor-pointer hover:bg-emerald-100">
                        <Coins size={18}/> €{itinerary.estimatedTotalCost} 
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {itinerary.dailyItinerary.map((day) => (
                  <div key={day.day} className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="bg-indigo-50 px-8 py-6 border-b border-indigo-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-indigo-950 text-2xl leading-none">{text.day} {day.day}</span>
                        <span className="text-xs font-black bg-white text-indigo-700 px-5 py-2 rounded-full border border-indigo-200 shadow-sm uppercase tracking-tighter">{day.theme}</span>
                      </div>
                      <button 
                        onClick={() => openGoogleMapsRoute(day.activities)}
                        className="p-2.5 bg-white text-indigo-600 rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2 text-[10px] font-black uppercase no-print"
                      >
                        <Navigation size={16} /> {text.dayRoute}
                      </button>
                    </div>
                    <div className="p-8 space-y-10">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-6 group">
                           <div className="flex-none w-16 pt-1 text-[11px] font-black text-slate-500 text-right uppercase tracking-tighter font-mono">{activity.time}</div>
                           <div className="flex-1 pb-8 border-l-2 border-slate-100 pl-8 last:pb-0 relative">
                              <div className="absolute -left-[6px] top-2 w-2.5 h-2.5 rounded-full bg-indigo-200 group-hover:bg-indigo-600 transition-colors border-2 border-white shadow-sm"></div>
                              <h4 className="font-black text-slate-900 text-xl group-hover:text-indigo-700 transition-colors leading-tight mb-2">{activity.placeName}</h4>
                              <p className="text-base text-slate-700 mt-1 leading-relaxed font-medium">{activity.description}</p>
                              
                              {(activity.minCost !== undefined || activity.maxCost !== undefined) && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-lg border border-slate-100 shadow-sm">
                                  <Tag size={12} className="text-indigo-500" />
                                  {activity.minCost === 0 && activity.maxCost === 0 ? (
                                    <span className="text-emerald-600 uppercase tracking-widest">{text.free}</span>
                                  ) : (
                                    <span>€{activity.minCost} - €{activity.maxCost}</span>
                                  )}
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itinerary && activeView === 'diary' && <div className="h-full p-4"><TravelDiary itinerary={itinerary} language={language} /></div>}
          {itinerary && activeView === 'chat' && <div className="h-full p-4"><ChatBot onUpdateItinerary={handleUpdateFromAI} /></div>}
          {itinerary && activeView === 'expenses' && <div className="h-full p-4"><ExpenseTracker language={language} expenses={expenses} travelers={travelersList} onAdd={e => setExpenses(p => [...p, e])} onRemove={id => setExpenses(p => p.filter(x => x.id !== id))} onAddTraveler={t => setTravelersList(p => [...p, t])} onRemoveTraveler={id => setTravelersList(p => p.filter(x => x.id !== id))} onUpdateTraveler={(id, adv) => setTravelersList(p => p.map(x => x.id === id ? {...x, advance: adv} : x))} onUpdateTravelerName={(id, name) => setTravelersList(p => p.map(x => x.id === id ? {...x, name} : x))} /></div>}
          {itinerary && activeView === 'reservations' && <div className="h-full p-4"><ReservationManager language={language} reservations={reservations} onAddReservation={r => setReservations(p => [...p, r])} onRemoveReservation={id => setReservations(p => p.filter(x => x.id !== id))} onAddExpense={e => setExpenses(p => [...p, e])} /></div>}
          {itinerary && activeView === 'resources' && <div className="h-full p-4"><TravelResources language={language} city={itinerary.city} startDate={itinerary.startDate} days={itinerary.days} travelers={itinerary.travelers || 1} onNavigateToReservations={() => setActiveView('reservations')} /></div>}
        </div>
      </main>

      {itinerary && (
        <nav className="bg-white border-t border-gray-200 pb-safe z-50 no-print">
          <div className="flex justify-around items-center h-20 max-w-md mx-auto">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id as View)} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${activeView === item.id ? 'text-indigo-700' : 'text-slate-400'}`}>
                <item.icon size={22} className={activeView === item.id ? 'stroke-[2.5px]' : ''} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {showBudgetModal && itinerary && (
        <div className="fixed inset-0 bg-slate-900/80 z-[400] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in no-print-bg">
           <div className="bg-white rounded-[2.5rem] max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
              <div className="p-8 bg-indigo-600 text-white flex-none relative">
                 <div className="absolute right-4 top-4 flex items-center gap-2 no-print">
                   <button 
                     onClick={handlePrint}
                     className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors flex items-center gap-2 text-[10px] font-black uppercase"
                   >
                     <Printer size={16} /> {text.print}
                   </button>
                   <button className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors" onClick={() => setShowBudgetModal(false)}>
                     <X size={20} />
                   </button>
                 </div>
                 <TrendingUp className="mb-4 opacity-50" size={32} />
                 <h3 className="text-2xl font-black leading-tight">{text.estBudget}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                 {itinerary.baseCosts?.map((cost, i) => (
                   <div key={i} className="flex flex-col gap-3 p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <div className="bg-white p-2.5 rounded-xl shadow-sm">
                               {cost.category === 'flight' ? <Plane className="text-blue-500" size={18} /> : 
                                cost.category === 'accommodation' ? <Building2 className="text-indigo-500" size={18} /> : 
                                <Tag className="text-slate-500" size={18} />}
                            </div>
                            <div>
                               <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">{cost.category}</p>
                               <h4 className="font-bold text-slate-800 leading-tight">{cost.item}</h4>
                            </div>
                         </div>
                         <span className="font-black text-indigo-700 text-lg">€{cost.estimatedPrice}</span>
                      </div>
                      {cost.link && (
                        <a href={cost.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm no-print">
                           {text.bookNow} <ExternalLink size={14} />
                        </a>
                      )}
                   </div>
                 ))}
                 <div className="flex flex-col gap-3 p-5 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className="bg-white p-2.5 rounded-xl shadow-sm"><Utensils className="text-amber-500" size={18} /></div>
                          <div>
                             <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-0.5">Daily Expenses</p>
                             <h4 className="font-bold text-indigo-950 leading-tight">{text.activityCosts}</h4>
                          </div>
                       </div>
                       <span className="font-black text-indigo-800 text-lg">€{totalActivitiesCost}</span>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Totale Stimato Viaggio</span>
                       <span className="text-3xl font-black text-slate-900 tracking-tighter">€{itinerary.estimatedTotalCost}</span>
                    </div>
                    <CreditCard size={32} className="text-slate-200" />
                 </div>
              </div>
           </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in no-print">
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-8 relative shadow-2xl border border-slate-100 flex flex-col items-center">
            <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-950 transition-colors" onClick={() => setShowShareModal(false)}>
              <X size={24}/>
            </button>
            <div className="bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-100"><Smartphone className="text-white" size={28} /></div>
            <h3 className="text-2xl font-black mb-2 text-slate-900">{text.install}</h3>
            <div className="w-full space-y-6">
              <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl space-y-4">
                <p className="text-[11px] text-slate-700 font-bold leading-tight italic">{isIos ? text.installIosDesc : text.installDesc}</p>
                <div className="bg-white p-4 rounded-xl shadow-inner flex flex-col items-center gap-2">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`} className="w-32 h-32 opacity-80" alt="QR" />
                </div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                {copySuccess ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />} {copySuccess ? 'Link Copiato!' : 'Copia Link App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
