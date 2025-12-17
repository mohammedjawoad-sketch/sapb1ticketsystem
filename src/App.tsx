import { useState } from "react";
import { useAuth } from "./lib/auth-context";
import Login from "./components/Login";
import Header from "./components/Header";
import TicketList from "./components/TicketList";
import TicketDetail from "./components/TicketDetail";
import NewTicketForm from "./components/NewTicketForm";
import UserManagement from "./components/UserManagement";
import { Loader } from "lucide-react";

function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<"list" | "detail" | "new" | "users">("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const currentUserId = user.id;

  function handleSelectTicket(ticketId: string) {
    setSelectedTicketId(ticketId);
    setView("detail");
  }

  function handleBackToList() {
    setSelectedTicketId(null);
    setView("list");
  }

  function handleCreateTicket() {
    setView("new");
  }

  function handleTicketCreated(ticketId: string) {
    setSelectedTicketId(ticketId);
    setView("detail");
  }

  function handleCloseNewTicket() {
    setView("list");
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onNavigate={setView} currentView={view} isAdmin={isAdmin} />

      <main className="flex-1 overflow-hidden">
        {view === "list" && (
          <TicketList
            onSelectTicket={handleSelectTicket}
            onCreateTicket={handleCreateTicket}
          />
        )}

        {view === "detail" && selectedTicketId && (
          <TicketDetail
            ticketId={selectedTicketId}
            onBack={handleBackToList}
            currentUser={user}
          />
        )}

        {view === "new" && (
          <NewTicketForm
            onClose={handleCloseNewTicket}
            onSuccess={handleTicketCreated}
            currentUserId={currentUserId}
          />
        )}

        {view === "users" && isAdmin && <UserManagement />}
      </main>
    </div>
  );
}

export default App;
