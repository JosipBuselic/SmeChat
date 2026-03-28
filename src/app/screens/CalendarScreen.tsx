import { useState } from "react";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { motion } from "motion/react";
import { BottomNavigation } from "../components/BottomNavigation";
import { getCollectionSchedule, WASTE_CATEGORIES } from "../utils/wasteData";

export function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const schedule = getCollectionSchedule();
  
  const today = new Date();
  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Collection Schedule</h1>
          <p className="text-sm text-gray-600 mt-1">Zagreb waste collection calendar</p>
        </div>
      </div>
      
      {/* Calendar Header */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-bold text-lg text-gray-900">{monthName}</h2>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Schedule List */}
        <div className="space-y-3">
          {schedule.map((day, index) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
            const dayNumber = date.getDate();
            const monthShort = date.toLocaleDateString("en-US", { month: "short" });
            const isToday = date.toDateString() === today.toDateString();
            const isTomorrow = new Date(today.getTime() + 86400000).toDateString() === date.toDateString();
            
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-md p-4 ${
                  isToday ? "ring-2 ring-green-500" : ""
                }`}
              >
                <div className="flex gap-4">
                  {/* Date */}
                  <div className={`flex-shrink-0 w-16 text-center ${
                    isToday ? "bg-green-500 text-white" : "bg-gray-100 text-gray-900"
                  } rounded-xl p-2`}>
                    <div className="text-xs font-semibold">{monthShort}</div>
                    <div className="text-2xl font-bold">{dayNumber}</div>
                    <div className="text-xs">{dayName.slice(0, 3)}</div>
                  </div>
                  
                  {/* Collection info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {isToday ? "Today" : isTomorrow ? "Tomorrow" : dayName}
                      </h3>
                      {isToday && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                      {isTomorrow && (
                        <Bell className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    
                    {/* Waste categories for this day */}
                    <div className="flex flex-wrap gap-2">
                      {day.categories.map((categoryId) => {
                        const category = WASTE_CATEGORIES[categoryId];
                        return (
                          <div
                            key={categoryId}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                            style={{
                              backgroundColor: category.binColorHex + "20",
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.binColorHex }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {category.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-1">Get Reminders</h3>
              <p className="text-sm opacity-90 mb-3">
                Enable notifications to never miss collection day!
              </p>
              <button className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors">
                Enable Notifications
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Collection Types</h3>
          <div className="space-y-2">
            {Object.values(WASTE_CATEGORIES).map((category) => (
              <div key={category.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.binColorHex }}
                />
                <span className="text-sm text-gray-700">{category.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{category.binColor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
