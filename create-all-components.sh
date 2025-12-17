#!/bin/bash

echo "Creating all missing React components..."

# ============================================
# 1. Header Component
# ============================================
cat > src/components/Header.tsx << 'EOF'
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
EOF

# ============================================
# 2. TicketList Component
# ============================================
cat > src/components/TicketList.tsx << 'EOF'
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
EOF

# ============================================
# 3. Create remaining components (simplified versions)
# ============================================

# NewTicketForm
cat > src/components/NewTicketForm.tsx << 'EOF'
import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { analyzeTicket } from "../lib/ai-service";
import { X, Sparkles, Loader } from "lucide-react";

interface NewTicketFormProps {
  onClose: () => void;
  onSuccess: (ticketId: string) => void;
  currentUserId: string;
}

export default function NewTicketForm({ onClose, onSuccess }: NewTicketFormProps) {
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [module, setModule] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const modules = ["Sales", "Purchasing", "Inventory", "Finance", "Production", "General", "Other"];
  const priorities = ["Low", "Medium", "High", "Critical"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) return;

    if (!currentUser) {
      setError("User session expired. Please login again.");
      return;
    }

    try {
      setAnalyzing(true);

      const attachmentInfo = "No attachments";
      await analyzeTicket({ title, description, priority, module }, attachmentInfo);

      setAnalyzing(false);
      setSubmitting(true);

      const result = await api.createTicket({
        title,
        description,
        priority,
        module: module || undefined,
        attachmentInfo,
      });

      onSuccess(result.data._id);
    } catch (error: any) {
      console.error("Create ticket error:", error);
      setError(error.message || "Failed to create ticket");
    } finally {
      setAnalyzing(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the problem..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto-detect</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={analyzing || submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Analyzing with AI...
                </>
              ) : submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
EOF

# TicketDetail (Simplified)
cat > src/components/TicketDetail.tsx << 'EOF'
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { ArrowLeft, Send, Loader } from "lucide-react";
import TaskList from "./TaskList";

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
  currentUser: any;
}

export default function TicketDetail({ ticketId, onBack, currentUser }: TicketDetailProps) {
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  async function loadTicketData() {
    try {
      setLoading(true);
      const [ticketResult, commentsResult, tasksResult] = await Promise.all([
        api.getTicket(ticketId),
        api.getCommentsByTicket(ticketId),
        api.getTasksByTicket(ticketId),
      ]);

      setTicket(ticketResult.data);
      setComments(commentsResult.data);
      setTasks(tasksResult.data);
    } catch (error) {
      console.error("Error loading ticket:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || !ticket) return;

    try {
      await api.createComment({
        ticketId: ticket._id,
        content: newComment,
        isInternal: false,
      });

      setNewComment("");
      await loadTicketData();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
          <div className="flex gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {ticket.status}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
              {ticket.priority}
            </span>
            {ticket.module && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                {ticket.module}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{ticket.description}</p>
          </div>

          {ticket.aiSummary && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold mb-2 text-purple-900">AI Summary</h3>
              <p className="text-purple-800">{ticket.aiSummary}</p>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold mb-3">Comments ({comments.length})</h3>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="border-l-4 border-blue-400 pl-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{comment.userId?.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
        <TaskList ticketId={ticketId} tasks={tasks} onTasksChange={loadTicketData} />
      </div>
    </div>
  );
}
EOF

# TaskList
cat > src/components/TaskList.tsx << 'EOF'
import { useState } from "react";
import { api } from "../lib/api";
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, Trash2 } from "lucide-react";

interface TaskListProps {
  ticketId: string;
  tasks: any[];
  onTasksChange: () => void;
}

export default function TaskList({ ticketId, tasks, onTasksChange }: TaskListProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  async function handleAddTask() {
    if (!newTaskTitle.trim()) return;

    try {
      await api.createTask({
        ticketId,
        title: newTaskTitle,
        description: newTaskDescription,
        status: "To-Do",
        orderIndex: tasks.length,
      });

      setNewTaskTitle("");
      setNewTaskDescription("");
      setShowAddTask(false);
      onTasksChange();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  async function handleUpdateTaskStatus(taskId: string, newStatus: string) {
    try {
      await api.updateTask(taskId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      onTasksChange();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;

    try {
      await api.deleteTask(taskId);
      onTasksChange();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "In-Progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "Blocked":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const statusOptions = ["To-Do", "In-Progress", "Blocked", "Done"];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Tasks ({tasks.length})</h2>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAddTask && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setShowAddTask(false);
                setNewTaskTitle("");
                setNewTaskDescription("");
              }}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-2 mb-2">
                <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 mb-1">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                  )}
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>To-Do</span>
            <span className="font-medium">
              {tasks.filter((t) => t.status === "To-Do").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>In-Progress</span>
            <span className="font-medium">
              {tasks.filter((t) => t.status === "In-Progress").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Done</span>
            <span className="font-medium">
              {tasks.filter((t) => t.status === "Done").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# UserManagement (Simplified)
cat > src/components/UserManagement.tsx << 'EOF'
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Users, Plus, Trash2, Loader } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    companyId: "",
    department: "",
    phone: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [usersResult, companiesResult] = await Promise.all([
        api.getUsers(),
        api.getCompanies(),
      ]);
      setUsers(usersResult.data);
      setCompanies(companiesResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await api.createUser(formData);
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer",
        companyId: "",
        department: "",
        phone: "",
      });
      await loadData();
    } catch (error: any) {
      console.error("Error creating user:", error);
      alert(error.message || "Failed to create user");
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Delete user ${userName}?`)) return;

    try {
      await api.deleteUser(userId);
      await loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="customer">Customer</option>
                <option value="supportagent">Support Agent</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.companyId?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ All components created successfully!"
echo ""
echo "Components created:"
echo "  ✓ Header.tsx"
echo "  ✓ TicketList.tsx"
echo "  ✓ TicketDetail.tsx"
echo "  ✓ NewTicketForm.tsx"
echo "  ✓ TaskList.tsx"
echo "  ✓ UserManagement.tsx"
echo ""
echo "Your frontend will auto-reload with all components!"

