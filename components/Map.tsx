import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Itinerary, Reservation, Language } from '../types';
import { Navigation, Star, Layers, Check, EyeOff, Eye } from 'lucide-react';

interface MapProps {
  itinerary: Itinerary;
  reservations?: Reservation[];
  language: Language;
}

// Custom Marker Generator with distinct colors
const createCustomIcon = (color: string) => {
    // Create an SVG pin with the specific color
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" fill="white" />
    </svg>`;
    
    return L.divIcon({
        className: 'custom-pin',
        html: svg,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -44]
    });
};

// Vibrant colors for different days
const DAY_COLORS = [
    '#ef4444', // Red (Day 1)
    '#3b82f6', // Blue (Day 2)
    '#10b981', // Emerald (Day 3)
    '#f59e0b', // Amber (Day 4)
    '#8b5cf6', // Violet (Day 5)
    '#ec4899', // Pink (Day 6)
    '#06b6d4', // Cyan (Day 7)
    '#6366f1', // Indigo (Day 8)
    '#84cc16', // Lime (Day 9)
    '#14b8a6', // Teal (Day 10)
    '#f97316', // Orange (Day 11)
    '#d946ef', // Fuchsia (Day 12)
];

// Component to update map center based on points
const MapUpdater: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
};

export const MapView: React.FC<MapProps> = ({ itinerary, reservations = [], language }) => {
  const [activeDay, setActiveDay] = useState<number | 'all'>('all');
  const [showReservations, setShowReservations] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  const t = {
      en: {
          legendTitle: 'Itinerary Filter',
          day: 'Day',
          all: 'Show All',
          reservations: 'My Bookings',
          openMaps: 'Open Route'
      },
      it: {
          legendTitle: 'Filtra Itinerario',
          day: 'Giorno',
          all: 'Tutti',
          reservations: 'Prenotazioni',
          openMaps: 'Apri in Maps'
      }
  };
  const text = t[language];

  // Process activities and assign them colors/IDs
  const allActivities = itinerary.dailyItinerary.flatMap(day => {
    const dateOffset = day.day - 1;
    let activityDateStr = '';
    
    if (itinerary.startDate) {
        const parts = itinerary.startDate.split('-');
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        dateObj.setDate(dateObj.getDate() + dateOffset);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        activityDateStr = `${y}-${m}-${dd}`;
    }

    return day.activities.map(act => {
        const linkedReservation = reservations.find(res => {
            if (res.date !== activityDateStr) return false;
            const resName = res.name.toLowerCase();
            const actName = act.placeName.toLowerCase();
            const actDesc = act.description.toLowerCase();
            return actName.includes(resName) || actDesc.includes(resName) || resName.includes(actName);
        });

        return {
            ...act,
            day: day.day,
            color: DAY_COLORS[(day.day - 1) % DAY_COLORS.length],
            linkedReservation
        };
    });
  });
  
  // FILTERING LOGIC
  const filteredActivities = allActivities.filter(a => {
      // 1. Filter by Day
      if (activeDay !== 'all' && a.day !== activeDay) return false;
      
      // 2. Filter Reservations if toggle is off
      if (!showReservations && a.linkedReservation) return false;

      return true;
  });

  // Extract valid coordinates for filtered set
  const points: [number, number][] = filteredActivities
    .filter(a => a.latitude && a.longitude)
    .map(a => [a.latitude!, a.longitude!]);

  // Center logic: if empty filtered, default to city center or first activity of whole trip
  const defaultCenter: [number, number] = points.length > 0 
    ? points[0] 
    : (allActivities[0]?.latitude && allActivities[0]?.longitude ? [allActivities[0].latitude!, allActivities[0].longitude!] : [41.9028, 12.4964]);

  const handleOpenGoogleMaps = () => {
    if (points.length < 2) return;
    
    const origin = `${points[0][0]},${points[0][1]}`;
    const destination = `${points[points.length - 1][0]},${points[points.length - 1][1]}`;
    
    // Limit waypoints to ~9 to prevent URL overflow
    const maxWaypoints = 9;
    let intermediates = points.slice(1, points.length - 1);
    
    if (intermediates.length > maxWaypoints) {
        // basic downsampling if too many points
        const step = Math.ceil(intermediates.length / maxWaypoints);
        intermediates = intermediates.filter((_, i) => i % step === 0);
    }
    
    const waypoints = intermediates
      .map(p => `${p[0]},${p[1]}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 z-0 relative group">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw Line connecting points to visualize route order */}
        {points.length > 1 && (
            <Polyline 
                positions={points} 
                pathOptions={{ 
                    color: activeDay === 'all' ? '#6366f1' : DAY_COLORS[((activeDay as number) - 1) % DAY_COLORS.length], 
                    weight: 5, 
                    dashArray: '10, 10', 
                    opacity: 0.8 
                }} 
            />
        )}

        {filteredActivities.map((activity, idx) => (
          (activity.latitude && activity.longitude) && (
            <Marker 
                key={`${activity.day}-${idx}`} 
                position={[activity.latitude, activity.longitude]}
                icon={createCustomIcon(activity.color)}
            >
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{backgroundColor: activity.color}}>
                         {text.day} {activity.day}
                     </span>
                     {activity.linkedReservation && (
                         <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                             <Star size={8} fill="currentColor" />
                             <span className="text-[10px] font-bold uppercase tracking-wide">Booking</span>
                         </div>
                     )}
                  </div>
                  
                  <strong className="block text-sm text-gray-900 leading-tight">
                    {activity.linkedReservation ? activity.linkedReservation.name : activity.placeName}
                  </strong>
                  
                  <span className="text-xs text-gray-500 font-semibold">{activity.time}</span>
                  <p className="text-xs mt-1 text-gray-600 leading-snug">
                     {activity.description}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        <MapUpdater coords={points} />
      </MapContainer>

      {/* FILTER LEGEND OVERLAY */}
      <div className={`absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-xl border border-gray-100 transition-all overflow-hidden flex flex-col max-h-[70%] ${isLegendOpen ? 'w-48' : 'w-12 h-12'}`}>
         <button 
           onClick={() => setIsLegendOpen(!isLegendOpen)}
           className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 w-full"
           title={text.legendTitle}
         >
             {isLegendOpen ? (
                 <span className="text-xs font-bold text-gray-700">{text.legendTitle}</span>
             ) : (
                 <Layers size={20} className="text-indigo-600" />
             )}
         </button>

         {isLegendOpen && (
             <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {/* Show All Toggle */}
                 <button 
                   onClick={() => setActiveDay('all')}
                   className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${activeDay === 'all' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}
                 >
                     <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
                     {text.all}
                     {activeDay === 'all' && <Check size={12} className="ml-auto"/>}
                 </button>
                 
                 <div className="h-px bg-gray-100 my-1"></div>

                 {/* Individual Days */}
                 {Array.from({length: itinerary.days}).map((_, i) => {
                     const dayNum = i + 1;
                     const color = DAY_COLORS[i % DAY_COLORS.length];
                     const isActive = activeDay === dayNum;
                     
                     return (
                        <button 
                            key={dayNum}
                            onClick={() => setActiveDay(dayNum)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: color}}></div>
                            {text.day} {dayNum}
                            {isActive && <Check size={12} className="ml-auto"/>}
                        </button>
                     );
                 })}
                 
                 <div className="h-px bg-gray-100 my-1"></div>

                 {/* Reservations Toggle */}
                 {reservations.length > 0 && (
                     <button 
                        onClick={() => setShowReservations(!showReservations)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-gray-50 text-gray-600"
                    >
                        {showReservations ? <Eye size={14} /> : <EyeOff size={14} />}
                        {text.reservations}
                    </button>
                 )}
             </div>
         )}
      </div>

      {/* Floating Action Button for Navigation (Contextual to Filter) */}
      {points.length > 1 && (
        <button
            onClick={handleOpenGoogleMaps}
            className="absolute bottom-6 right-6 z-[1000] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full shadow-xl flex items-center gap-2 transition-transform active:scale-95"
            title="Open Route in Google Maps"
        >
            <Navigation size={20} />
            <span className="text-sm">{text.openMaps}</span>
        </button>
      )}
    </div>
  );
};