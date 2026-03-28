import { useNavigate, useLocation } from "react-router";
import { Camera, Map, Calendar, User } from "lucide-react";

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tabs = [
    { path: "/", icon: Camera, label: "Scan" },
    { path: "/map", icon: Map, label: "Map" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/profile", icon: User, label: "Profile" },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || 
            (tab.path === "/" && location.pathname.startsWith("/result"));
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-green-600" : "text-gray-400"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
