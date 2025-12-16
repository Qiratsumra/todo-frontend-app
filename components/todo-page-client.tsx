"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/main-content";
import TaskDetail from "@/components/Task-detail";
import { Task, ApiTask, FilterType } from "@/types";
import { TaskForm } from "@/components/task-form";

interface TodoPageClientProps {
  user: {
    name: string;
    email: string;
  };
}

const mapApiTaskToTask = (apiTask: ApiTask): Task => {
  const priorityMap: { [key: number]: "High" | "Medium" | "Low" | undefined } = {
    0: undefined,
    1: "Low",
    2: "Medium",
    3: "High",
  };

  return {
    ...apiTask,
    id: apiTask.id.toString(),
    priority: priorityMap[apiTask.priority],
    dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
  };
};

const TodoPageClient = ({ user }: TodoPageClientProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get API URL - move inside component to ensure it's available
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchTasks = async () => {
    if (!API_URL) {
      setError("API URL is not configured. Please check your environment variables.");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      console.log("Fetching from:", `${API_URL}/tasks`);
      const response = await fetch(`${API_URL}/tasks`);
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (Status: ${response.status})`);
      }
      const data = await response.json();
      console.log("Fetched tasks:", data);
      const mappedTasks = data.map(mapApiTaskToTask);
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError(`Cannot connect to API at ${API_URL}. Make sure your backend is running.`);
      } else {
        setError(error instanceof Error ? error.message : "Failed to fetch tasks");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let updatedTasks = [...tasks];

    // Apply search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      updatedTasks = updatedTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerQuery) ||
          task.description?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply priority or completion filter
    if (activeFilter !== "all") {
      if (activeFilter === "completed") {
        updatedTasks = updatedTasks.filter((task) => task.completed);
      } else if (activeFilter === "pending") {
        updatedTasks = updatedTasks.filter((task) => !task.completed);
      } else if (activeFilter === "dueSoon") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        updatedTasks = updatedTasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate >= today && taskDate <= sevenDaysFromNow && !task.completed;
        });
      } else if (activeFilter === "highPriority") {
        updatedTasks = updatedTasks.filter(
          (task) => task.priority === "High" && !task.completed
        );
      } else {
        updatedTasks = updatedTasks.filter((task) => task.priority === activeFilter);
      }
    }

    // Apply tag filter
    if (activeTag) {
      updatedTasks = updatedTasks.filter((task) => task.tags?.includes(activeTag));
    }

    setFilteredTasks(updatedTasks);
  }, [tasks, searchQuery, activeFilter, activeTag]);

  const handleSelectTask = (task: Task) => setSelectedTask(task);
  const handleCloseDetail = () => setSelectedTask(null);
  const handleSearch = (query: string) => setSearchQuery(query);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setIsMobileMenuOpen(false);
  };

  const handleTagFilter = (tag: string) => {
    setActiveTag(tag);
    setIsMobileMenuOpen(false);
  };

  const handleTaskAdded = async () => {
    await fetchTasks();
    setIsAddModalOpen(false);
  };

  const handleTaskUpdated = async () => {
    await fetchTasks();
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!API_URL) return;
    
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      await fetchTasks();
      if (selectedTask?.id === taskId) setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task");
    }
  };

  const handleToggleComplete = async (startedTask: Task) => {
    if (!API_URL) return;
    
    const updatedTask = { ...startedTask, completed: !startedTask.completed };
    setTasks(tasks.map((t) => (t.id === startedTask.id ? updatedTask : t)));

    try {
      const response = await fetch(`${API_URL}/tasks/${startedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updatedTask.completed }),
      });
      if (!response.ok) await fetchTasks();
    } catch (error) {
      console.error("Error updating task completion:", error);
      await fetchTasks(); // Revert on error
    }
  };

  // Error state UI
  if (error && !API_URL) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure NEXT_PUBLIC_API_URL is set in your .env.local file or Vercel environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden relative">
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:shadow-none
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          onSearch={handleSearch}
          tasks={tasks}
          onFilterChange={handleFilterChange}
          onTagFilter={handleTagFilter}
          activeFilter={activeFilter}
        />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Hamburger Menu */}
        <div className="md:hidden bg-white p-4 border-b flex items-center justify-between">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg">My Tasks</span>
          <div className="w-6" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading tasks...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-800 mb-2">Error: {error}</p>
                <button 
                  onClick={fetchTasks}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <MainContent
              tasks={filteredTasks}
              onTaskSelect={handleSelectTask}
              onAddTask={() => setIsAddModalOpen(true)}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </div>
      </div>

      {/* Responsive Task Detail Panel */}
      {selectedTask && (
        <div className="fixed inset-0 z-40 md:static md:inset-auto md:z-0 md:w-96 md:border-l bg-white shadow-2xl md:shadow-none overflow-y-auto">
           {/* Mobile Back Button */}
           <div className="md:hidden p-4 border-b flex items-center">
              <button 
                onClick={handleCloseDetail}
                className="text-gray-600 flex items-center gap-2"
              >
                ← Back to List
              </button>
           </div>
           
           <TaskDetail
            task={selectedTask}
            onClose={handleCloseDetail}
            onTaskUpdated={handleTaskUpdated}
            onDelete={() => handleTaskDelete(selectedTask.id)}
          />
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
            <TaskForm onTaskAdded={handleTaskAdded} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoPageClient;