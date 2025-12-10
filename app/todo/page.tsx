"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/main-content";
import TaskDetail from "@/components/Task-detail";
import { Task, ApiTask, FilterType } from "@/types";
import { TaskForm } from "@/components/task-form";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const TodoPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      const mappedTasks = data.map(mapApiTaskToTask);
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter logic based on search, priority/status filter, and tag
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
          // task.dueDate is ALREADY a Date object from mapApiTaskToTask mapping?
          // Line 23: dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
          // So yes, it is a Date.
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate >= today && taskDate <= sevenDaysFromNow && !task.completed;
        });
      } else if (activeFilter === "highPriority") {
        updatedTasks = updatedTasks.filter(
          (task) => task.priority === "High" && !task.completed
        );
      } else {
        // Filter by priority (High/Medium/Low)
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
  };

  const handleTagFilter = (tag: string) => {
    setActiveTag(tag);
  };

  const handleTaskAdded = async () => {
    await fetchTasks();
    setIsAddModalOpen(false);
  };

  const handleTaskUpdated = async () => {
    await fetchTasks();
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      await fetchTasks();
      if (selectedTask?.id === taskId) setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleComplete = async (startedTask: Task) => {
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
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        onSearch={handleSearch}
        tasks={tasks}
        onFilterChange={handleFilterChange}
        onTagFilter={handleTagFilter}
        activeFilter={activeFilter}
      />
      <MainContent
        tasks={filteredTasks}
        onTaskSelect={handleSelectTask}
        onAddTask={() => setIsAddModalOpen(true)}
        onToggleComplete={handleToggleComplete}
      />
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={handleCloseDetail}
          onTaskUpdated={handleTaskUpdated}
          onDelete={() => handleTaskDelete(selectedTask.id)}
        />
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
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

export default TodoPage;
