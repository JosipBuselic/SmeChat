import { useState } from "react";
import { MapPin, Navigation, Trash2, Recycle } from "lucide-react";
import { motion } from "motion/react";
import { BottomNavigation } from "../components/BottomNavigation";
import { RECYCLING_LOCATIONS, WASTE_CATEGORIES } from "../utils/wasteData";

export function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState(RECYCLING_LOCATIONS[0]);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Nearby Locations</h1>
          <p className="text-sm text-gray-600 mt-1">Find recycling bins & centers</p>
        </div>
      </div>
      
      {/* Map Placeholder */}
      <div className="max-w-md mx-auto">
        <div className="relative bg-gradient-to-br from-green-100 to-blue-100 h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Zagreb, Croatia</p>
            <p className="text-xs text-gray-500 mt-1">Interactive map view</p>
          </div>
          
          {/* Map markers simulation */}
          {RECYCLING_LOCATIONS.slice(0, 3).map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute"
              style={{
                top: `${30 + index * 20}%`,
                left: `${40 + index * 10}%`,
              }}
            >
              <button
                onClick={() => setSelectedLocation(location)}
                className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
                  selectedLocation.id === location.id
                    ? "bg-green-500 ring-4 ring-green-200"
                    : "bg-white"
                }`}
              >
                {location.type === "center" ? (
                  <Recycle className={`w-4 h-4 ${selectedLocation.id === location.id ? "text-white" : "text-green-600"}`} />
                ) : (
                  <Trash2 className={`w-4 h-4 ${selectedLocation.id === location.id ? "text-white" : "text-blue-600"}`} />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Locations List */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">All Locations</h2>
          <button className="flex items-center gap-1 text-sm text-green-600 font-semibold">
            <Navigation className="w-4 h-4" />
            Near Me
          </button>
        </div>
        
        <div className="space-y-3">
          {RECYCLING_LOCATIONS.map((location) => (
            <motion.button
              key={location.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLocation(location)}
              className={`w-full text-left bg-white rounded-2xl shadow-md p-4 transition-all ${
                selectedLocation.id === location.id
                  ? "ring-2 ring-green-500 shadow-lg"
                  : "hover:shadow-lg"
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  location.type === "center" ? "bg-green-100" : "bg-blue-100"
                }`}>
                  {location.type === "center" ? (
                    <Recycle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Trash2 className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                  
                  {/* Accepted waste types */}
                  <div className="flex flex-wrap gap-1">
                    {location.accepts.map((categoryId) => {
                      const category = WASTE_CATEGORIES[categoryId];
                      return (
                        <span
                          key={categoryId}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: category.binColorHex + "40",
                            color: category.binColorHex,
                          }}
                        >
                          {category.icon}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-900">
                    {(Math.random() * 2 + 0.5).toFixed(1)} km
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Legend</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                <Recycle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Recycling Center</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">Bin Station</span>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
