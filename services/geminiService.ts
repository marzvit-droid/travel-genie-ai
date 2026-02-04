
import { GoogleGenAI, Chat } from "@google/genai";
import { Itinerary, Language, Reservation, CityInput, GroundingSource, BaseCost } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateItinerary = async (input: CityInput, language: Language): Promise<Itinerary> => {
  const { city, departureCity, days, travelers, startDate, budget, style } = input;
  const langName = language === 'it' ? 'ITALIANO' : 'ENGLISH';
  
  const departureInfo = departureCity ? `partendo da ${departureCity}` : "scegliendo l'hub principale più vicino e conveniente";
  
  const styleDescription = style !== undefined ? 
    (style < 30 ? "MOLTO RILASSANTE (poche attività, tempi lunghi, comfort alto, SPA, musei calmi)" :
     style < 70 ? "EQUILIBRATO (mix di cultura, camminate e relax)" : 
     "AVVENTUROSO (molto movimento, trekking, attività all'aperto, ritmi serrati)") : "Equilibrato";

  const prompt = `
    AGISCI COME UN CONSULENTE DI VIAGGI DI LUSSO AI.
    Crea un piano di viaggio per ${days} giorni per ${travelers} persone a ${city}, inizio il ${startDate}, ${departureInfo}.
    
    PARAMETRI FONDAMENTALI:
    - BUDGET TOTALE MASSIMO: €${budget}.
    - STILE DI VIAGGIO: ${styleDescription}.
    
    REQUISITI DI LINGUA:
    - TUTTI i testi nel JSON devono essere in ${langName}.
    
    REQUISITI DI COORDINATE (FONDAMENTALE):
    - Per OGNI attività in "dailyItinerary", DEVI fornire "latitude" e "longitude" reali del luogo indicato.
    
    REQUISITI DI RICERCA LIVE E COSTI:
    1. Usa googleSearch per trovare prezzi REALI.
    2. Nel campo "baseCosts", includi Voli e Hotel con link reali.
    3. Per OGNI attività inserisci "minCost" e "maxCost". 
    4. "estimatedTotalCost" deve essere la somma di baseCosts + attività giornaliere.
    
    JSON STRUCTURE:
    {
      "tripTitle": "Titolo in ${langName}",
      "city": "${city}",
      "days": ${days},
      "estimatedTotalCost": ${budget},
      "baseCosts": [
        {
          "category": "flight",
          "item": "Volo reale trovato",
          "provider": "Nome Compagnia/Sito",
          "estimatedPrice": 0,
          "link": "URL REALE"
        }
      ],
      "dailyItinerary": [
        {
          "day": 1,
          "theme": "Tema",
          "activities": [
            {
              "time": "HH:MM",
              "placeName": "Luogo",
              "description": "Descrizione",
              "latitude": 0.0,
              "longitude": 0.0,
              "minCost": 10,
              "maxCost": 25
            }
          ],
          "narrativeSummary": "Riassunto"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }
    
    const result = JSON.parse(text) as Itinerary;
    result.travelers = Number(travelers);
    result.startDate = startDate;
    return result;
  } catch (error) {
    console.error("Errore generazione itinerario:", error);
    throw new Error("Impossibile generare l'itinerario. Riprova tra poco.");
  }
};

let chatSession: Chat | null = null;

export const initChat = (context: string, language: Language) => {
  const langName = language === 'it' ? 'ITALIANO' : 'ENGLISH';
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Sei un esperto assistente di viaggio. Contesto attuale del viaggio: ${context}.
      
      REGOLE IMPORTANTI:
      1. Se l'utente chiede di modificare la struttura del viaggio (es. aggiungere giorni, cambiare città, trasformare in tour multi-tappa), DEVI generare un NUOVO blocco JSON completo seguendo lo schema dell'itinerario originale.
      2. Includi il JSON nel tuo messaggio finale tra i tag \`\`\`json ... \`\`\`.
      3. Mantieni lo stile di viaggio e il budget precedentemente impostati a meno che l'utente non chieda di cambiarli.
      4. Rispondi sempre in ${langName}.
      5. Quando proponi un nuovo itinerario, spiega brevemente cosa hai cambiato prima di mostrare il JSON.`,
      tools: [{ googleSearch: {} }]
    }
  });
};

export const sendMessage = async (message: string): Promise<string> => {
  if (!chatSession) throw new Error("Chat non inizializzata");
  const response = await chatSession.sendMessage({ message });
  return response.text || "Errore.";
};
