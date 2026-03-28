import { createBrowserRouter } from "react-router";
import { ScanScreen } from "./screens/ScanScreen";
import { MapScreen } from "./screens/MapScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ResultScreen } from "./screens/ResultScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ScanScreen,
  },
  {
    path: "/map",
    Component: MapScreen,
  },
  {
    path: "/calendar",
    Component: CalendarScreen,
  },
  {
    path: "/profile",
    Component: ProfileScreen,
  },
  {
    path: "/result/:category",
    Component: ResultScreen,
  },
]);
