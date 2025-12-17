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
