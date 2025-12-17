import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import {
  Ticket as TicketIcon,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Loader,
} from "lucide-react";

interface TicketListProps {
  onSelectTicket: (ticketId: string) => void;
  onCreateTicket: () => void;
}

export default function TicketList({ onSelectTicket, onCreateTicket }: TicketListProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const isAdminOrSupport = user?.role === "admin" || user?.role === "supportagent";

  useEffect(() => {
    loadTickets();
    if (isAdminOrSupport) {
      loadCompanies();
    }
  }, []);

  async function loadTickets() {
    try {
      setLoading(true);
      const result = await api.getTickets();
      setTickets(result.data);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const result = await api.getCompanies();
      setCompanies(result.data);
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  }

  const uniqueDepartments = Array.from(new Set(tickets.map((t) => t.department).filter(Boolean)));

  const filteredTickets = tickets.filter((ticket) => {
    if (filter !== "all" && ticket.status.toLowerCase() !== filter.toLowerCase()) return false;
    if (companyFilter !== "all" && ticket.companyId?._id !== companyFilter) return false;
    if (departmentFilter !== "all" && ticket.department !== departmentFilter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "open":
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <TicketIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <button
            onClick={onCreateTicket}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            {["all", "new", "open", "in-progress", "resolved", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {isAdminOrSupport && (
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Companies</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => onSelectTicket(ticket._id)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>#{ticket._id.slice(-8)}</span>
                    {isAdminOrSupport && ticket.companyId && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {ticket.companyId.name}
                      </span>
                    )}
                    {ticket.department && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ticket.department}
                      </span>
                    )}
                    {ticket.module && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                        {ticket.module}
                      </span>
                    )}
                    {ticket.category && (
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded">
                        {ticket.category}
                      </span>
                    )}
                  </div>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>

                {ticket.aiSummary && (
                  <div className="mt-2 p-2 bg-purple-50 border border-purple-100 rounded text-xs text-purple-900">
                    <strong>AI:</strong> {ticket.aiSummary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
