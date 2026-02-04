
export interface Activity {
  time: string;
  placeName: string;
  description: string;
  latitude?: number;
  longitude?: number;
  minCost?: number;
  maxCost?: number;
}

export interface DailyPlan {
  day: number;
  theme: string;
  activities: Activity[];
  narrativeSummary?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface BaseCost {
  category: 'flight' | 'accommodation' | 'transport' | 'other';
  item: string;
  provider?: string;
  estimatedPrice: number;
  link?: string;
}

export interface Itinerary {
  tripTitle: string;
  city: string;
  days: number;
  startDate?: string;
  dailyItinerary: DailyPlan[];
  estimatedTotalCost?: number;
  travelers?: number;
  sources?: GroundingSource[];
  baseCosts?: BaseCost[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface CityInput {
  city: string;
  departureCity?: string;
  days: number | string;
  travelers: number | string;
  startDate: string;
  budget?: number;
  style?: number; // 0: Relax, 100: Adventure
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
}

export interface Traveler {
  id: string;
  name: string;
  advance: number;
}

export type ReservationType = 'hotel' | 'activity' | 'food' | 'transport' | 'spa';

export interface Reservation {
  id: string;
  type: ReservationType;
  name: string;
  date: string;
  time?: string;
  notes?: string;
  cost?: number;
}

export type Language = 'en' | 'it';

export type View = 'search' | 'itinerary' | 'chat' | 'expenses' | 'reservations' | 'resources' | 'diary';
