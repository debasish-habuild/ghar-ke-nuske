import { useAuth } from "./auth";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  const { isAuthed } = useAuth();
  return isAuthed ? <Dashboard /> : <LoginPage />;
}
