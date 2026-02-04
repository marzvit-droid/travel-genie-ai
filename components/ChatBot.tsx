
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Itinerary } from '../types';
import { sendMessage } from '../services/geminiService';
import { Send, MessageSquare, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ChatBotProps {
  onUpdateItinerary?: (newItinerary: Itinerary) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onUpdateItinerary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Ciao! Sono il tuo assistente di viaggio. Chiedimi pure qualsiasi cosa sul tuo itinerario, i trasporti o chiedimi di aggiungere nuove tappe al tuo tour!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractJson = (text: string): Itinerary | null => {
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]) as Itinerary;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await sendMessage(input);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    const itineraryProposal = extractJson(msg.text);
    const textWithoutJson = msg.text.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

    return (
      <div className="space-y-3">
        <div dangerouslySetInnerHTML={{ __html: textWithoutJson.replace(/\n/g, '<br/>') }} />
        {itineraryProposal && onUpdateItinerary && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-indigo-700 font-black text-[10px] uppercase tracking-wider">
              <RefreshCw size={14} className="animate-pulse" /> Proposta di Nuovo Itinerario
            </div>
            <p className="text-xs text-slate-600 font-medium">Ho rielaborato il tuo tour includendo le nuove tappe richieste.</p>
            <button 
              onClick={() => onUpdateItinerary(itineraryProposal)}
              className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all active:scale-95"
            >
              <CheckCircle2 size={16} /> Applica Nuovo Piano
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden font-sans">
      <div className="p-5 bg-indigo-600 text-white border-b border-indigo-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight leading-none uppercase">Architect AI</h3>
            <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">Expert Trip Designer</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-lg'
                  : 'bg-white border border-gray-100 text-slate-800 rounded-bl-none shadow-md'
              }`}
            >
              {renderMessageContent(msg)}
              <div className={`text-[8px] mt-2 font-black uppercase opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-md flex items-center gap-3 text-xs font-bold text-slate-500">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
              </div>
              Sto rielaborando il tuo tour...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Aggiungi tappe o chiedi consigli..."
            className="flex-1 px-4 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 text-sm bg-slate-50 text-slate-900 font-bold placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
