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

  // Check if user is support or admin
  const canSeeTasks = currentUser?.role === "admin" || currentUser?.role === "supportagent";

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  async function loadTicketData() {
    try {
      setLoading(true);
      const promises: any[] = [
        api.getTicket(ticketId),
        api.getCommentsByTicket(ticketId),
      ];

      // Only load tasks if user can see them
      if (canSeeTasks) {
        promises.push(api.getTasksByTicket(ticketId));
      }

      const results = await Promise.all(promises);

      setTicket(results[0].data);
      setComments(results[1].data);
      
      if (canSeeTasks && results[2]) {
        setTasks(results[2].data);
      }
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

      {/* Only show TaskList for support agents and admins */}
      {canSeeTasks && (
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <TaskList ticketId={ticketId} tasks={tasks} onTasksChange={loadTicketData} />
        </div>
      )}
    </div>
  );
}
