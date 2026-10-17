import { AdminView } from "./views/AdminView";
import { PublicView } from "./views/PublicView";

export default function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? <AdminView /> : <PublicView />;
}
