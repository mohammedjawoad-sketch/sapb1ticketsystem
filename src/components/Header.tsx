import { useAuth } from "../lib/auth-context";
import { LogOut, Ticket, Users } from "lucide-react";

interface HeaderProps {
  onNavigate: (view: "list" | "detail" | "new" | "users") => void;
  currentView: string;
  isAdmin: boolean;
}

export default function Header({ onNavigate, currentView, isAdmin }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SAP Business One Support System</h1>
            <p className="text-blue-100 text-sm">Ticket and Task Management</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === "list" || currentView === "detail" || currentView === "new"
                  ? "bg-blue-700"
                  : "hover:bg-blue-700"
              }`}
            >
              <Ticket className="w-4 h-4" />
              Tickets
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate("users")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === "users" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>
            )}

            <div className="border-l border-blue-400 pl-4 ml-2">
              <div className="text-sm">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-blue-200 text-xs">{user?.role}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
