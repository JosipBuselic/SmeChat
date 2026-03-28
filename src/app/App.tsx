import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { LocaleProvider } from "./context/LocaleContext";
import { router } from "./routes";
import { Toaster } from "./components/Toaster";

export default function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </LocaleProvider>
  );
}