import React from 'react';
import { RestaurantConfig } from '../../types/restaurant';
import { Clock, Phone, MapPin } from 'lucide-react';

export interface RestaurantHeaderProps {
  restaurant: RestaurantConfig;
}

export const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ restaurant }) => {
  return (
    <div className="relative bg-white border-b border-stone-200 overflow-hidden">
      <div className="h-32 w-full relative bg-stone-900">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-md mx-auto px-4 pb-4 -mt-8 relative z-10">
        <div className="flex items-end gap-3 mb-2">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="w-16 h-16 rounded-2xl border-4 border-white object-cover shadow-md bg-white flex-shrink-0"
          />
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 leading-tight">{restaurant.name}</h1>
            <span className="text-xs text-stone-500 font-medium block">{restaurant.tagline}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600 font-medium pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" /> {restaurant.address}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> {restaurant.openingHours.mondayToFriday}
          </span>
        </div>
      </div>
    </div>
  );
};
