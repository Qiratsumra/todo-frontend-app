"use client";

import { useState } from "react";
import { Task, Subtask } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Check,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  CheckCircle,
  Circle,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  ListTodo,
  Layers,
  Target
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onCompleteAll?: () => void;
  onClearCompleted?: () => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string, completed: boolean) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onEditSubtask?: (taskId: string, subtaskId: string, title: string) => void;
}

interface ExtendedTask extends Task {
  // Priority is now inherited from Task as number
  // priority?: 'high' | 'medium' | 'low' | 'none' | number; 

  dueDate?: Date;

  category?: string;

  tags?: string[];

  subtasks?: Subtask[];

}



export function TaskList({

  tasks,

  loading,

  error,

  onToggleComplete,

  onDeleteTask,

  onEditTask,

  onCompleteAll,

  onClearCompleted,

  onAddSubtask,

  onToggleSubtask,

  onDeleteSubtask,

  onEditSubtask

}: TaskListProps) {

  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const [deletedTasks, setDeletedTasks] = useState<string[]>([]);

  // Removed: const [sortedTasks, setSortedTasks] = useState<Task[]>(tasks);

  const [sortBy, setSortBy] = useState<'date' | 'title' | 'priority' | 'completed'>('date');

  const [showCompleted, setShowCompleted] = useState(true);

  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const [filterPriority, setFilterPriority] = useState<string>('all');



  const [newSubtaskText, setNewSubtaskText] = useState<{ [key: string]: string }>({});

  const [expandedSubtasks, setExpandedSubtasks] = useState<string[]>([]);

  const [editingSubtask, setEditingSubtask] = useState<{ taskId: string, subtaskId: string } | null>(null);

  const [editSubtaskText, setEditSubtaskText] = useState<string>('');

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);



  // Get task completion statistics

  const completedCount = tasks.filter(t => t.completed).length;

  const pendingCount = tasks.filter(t => !t.completed).length;

  const today = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter(task => {

    const extendedTask = task as ExtendedTask;

    return extendedTask.dueDate?.toISOString().split('T')[0] === today && !task.completed;

  }).length;



  // Calculate subtask statistics

  const getSubtaskStats = (subtasks?: Subtask[]) => {

    if (!subtasks || subtasks.length === 0) return { total: 0, completed: 0, percentage: 0 };

    const completed = subtasks.filter(st => st.completed).length;

    const percentage = Math.round((completed / subtasks.length) * 100);

    return { total: subtasks.length, completed, percentage };

  };



  const getPriorityColor = (priority?: "High" | "Medium" | "Low") => { 

    if (priority === undefined || priority === null) return 'border-l-4 border-l-gray-200';

    switch (priority) {

      case 'High': return 'border-l-4 border-l-red-500'; // High

      case 'Medium': return 'border-l-4 border-l-yellow-500'; // Medium

      case 'Low': return 'border-l-4 border-l-green-500'; // Low

      default: return 'border-l-4 border-l-gray-200'; // None or unknown

    }

  };



  // Removed useEffect for sortedTasks. Calculating directly.

  let currentFilteredTasks = tasks.filter(task => !deletedTasks.includes(task.id));



  if (!showCompleted) {

    currentFilteredTasks = currentFilteredTasks.filter(task => !task.completed);

  }



  if (filterPriority && filterPriority !== 'all') {

    currentFilteredTasks = currentFilteredTasks.filter(task => {

      const extendedTask = task as ExtendedTask;

      return extendedTask.priority === filterPriority;
    });

  }



  const sortedTasks = [...currentFilteredTasks].sort((a, b) => {

    const aExtended = a as ExtendedTask;

    const bExtended = b as ExtendedTask;



    if (sortBy === 'title') {

      return a.title.localeCompare(b.title);

    }
    if (sortBy === 'priority') {

      // Mapping for priority levels (numeric values as expected by backend)

      const priorityOrder: { [key: string]: number } = {

        'High': 3,

        'Medium': 2,

        'Low': 1,
      };

      const aPriorityValue = priorityOrder[aExtended.priority!] ?? 0;

      const bPriorityValue = priorityOrder[bExtended.priority!] ?? 0;

      return bPriorityValue - aPriorityValue; // Sort from high (3) to low (0)

    }

    if (sortBy === 'completed') {

      if (a.completed === b.completed) return 0;

      return a.completed ? 1 : -1;

    }

    // Default sort by date (newest first)
    if (a.dueDate && b.dueDate) {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;


  });

  // Handle task completion with animation
  const handleToggleComplete = (id: string, completed: boolean) => {
    if (completed) {
      setCompletedTasks(prev => [...prev, id]);
    }
    onToggleComplete(id, completed);

    // Remove from selected tasks if selecting
    if (isSelectMode && selectedTasks.includes(id)) {
      setSelectedTasks(prev => prev.filter(taskId => taskId !== id));
    }
  };

  // Handle subtask completion
  const handleToggleSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    if (onToggleSubtask) {
      onToggleSubtask(taskId, subtaskId, completed);
    }
  };

  // Complete all subtasks for a task
  const handleCompleteAllSubtasks = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId) as ExtendedTask;
    if (task?.subtasks) {
      task.subtasks.forEach(subtask => {
        if (!subtask.completed && onToggleSubtask) {
          onToggleSubtask(taskId, subtask.id, true);
        }
      });
    }
  };

  // Add new subtask
  const handleAddSubtask = (taskId: string) => {
    const text = newSubtaskText[taskId]?.trim();
    if (text && onAddSubtask) {
      onAddSubtask(taskId, text);
      setNewSubtaskText(prev => ({ ...prev, [taskId]: '' }));
    }
  };

  // Delete subtask
  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    if (onDeleteSubtask) {
      onDeleteSubtask(taskId, subtaskId);
    }
  };

  // Start editing subtask
  const handleStartEditSubtask = (taskId: string, subtaskId: string, title: string) => {
    setEditingSubtask({ taskId, subtaskId });
    setEditSubtaskText(title);
  };

  // Save subtask edit
  const handleSaveEditSubtask = () => {
    if (editingSubtask && editSubtaskText.trim() && onEditSubtask) {
      onEditSubtask(editingSubtask.taskId, editingSubtask.subtaskId, editSubtaskText.trim());
      setEditingSubtask(null);
      setEditSubtaskText('');
    }
  };

  // Toggle subtask expansion
  // Toggle subtask expansion
  const toggleSubtasks = (taskId: string) => {
    setExpandedSubtasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };



  const handleDelete = async (id: string) => {
    setDeletedTasks(prev => [...prev, id]);
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    onDeleteTask(id);
  };

  // Complete all tasks
  const handleCompleteAll = () => {
    if (onCompleteAll) {
      onCompleteAll();
    } else {
      tasks.forEach(task => {
        if (!task.completed) {
          handleToggleComplete(task.id, true);
        }
      });
    }
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    if (onClearCompleted) {
      onClearCompleted();
    } else {
      tasks.forEach(task => {
        if (task.completed) {
          handleDelete(task.id);
        }
      });
    }
  };

  const handleBulkComplete = () => {
    selectedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        handleToggleComplete(taskId, true);
      }
    });
    setSelectedTasks([]);
    setIsSelectMode(false);
  };

  const handleBulkDelete = async () => {
    // Process deletes sequentially to avoid potential race conditions with state updates
    for (const taskId of selectedTasks) {
      await handleDelete(taskId);
    }
    setSelectedTasks([]);
    setIsSelectMode(false);
  };

  // Calculate completion percentage
  const completionPercentage = tasks.length > 0
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-gray-600 animate-pulse">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 rounded-lg bg-red-50 border border-red-200 animate-shake">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 mb-4">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-500 mb-4">Create your first task to get started!</p>
        <div className="animate-bounce mt-8">
          <ChevronDown className="w-6 h-6 text-gray-400 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Stats - Updated to match the image */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-lg">Task Progress</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{completedCount} of {tasks.length} tasks completed</span>
              <span>{pendingCount} remaining</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Task Summary - from the image */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                <span className="text-gray-400 mx-2">-</span>
                <span>{completedCount} completed</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isSelectMode ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    if (isSelectMode) setSelectedTasks([]); // Clear selection when exiting mode
                  }}
                  className={`text-sm border-gray-300 hover:bg-gray-50 px-4 py-2 ${isSelectMode ? 'bg-blue-100 border-blue-200' : ''}`}
                >
                  {isSelectMode ? 'Cancel Selection' : 'Select Tasks'}
                </Button>

                {isSelectMode && selectedTasks.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkComplete}
                      className="text-sm border-green-200 text-green-700 hover:bg-green-50 px-4 py-2"
                    >
                      Complete ({selectedTasks.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-sm border-red-200 text-red-700 hover:bg-red-50 px-4 py-2"
                    >
                      Delete ({selectedTasks.length})
                    </Button>
                  </>
                )}

                {!isSelectMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCompleteAll}
                      disabled={pendingCount === 0}
                      className="text-sm border-gray-300 hover:bg-gray-50 px-4 py-2"
                    >
                      Complete All
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCompleted}
                      disabled={completedCount === 0}
                      className="text-sm border-gray-300 hover:bg-gray-50 px-4 py-2"
                    >
                      Clear Completed
                    </Button>
                  </>
                )}




                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCompleted}
                  disabled={completedCount === 0}
                  className="text-sm border-gray-300 hover:bg-gray-50 px-4 py-2"
                >
                  Clear Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section - Updated to match the image exactly */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Priority Filters as buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filterPriority === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPriority('all')}
            className={`text-sm ${filterPriority === 'all' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            All Priorities
          </Button>

          <Button
            variant={filterPriority === 'high' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPriority('high')}
            className={`text-sm ${filterPriority === 'high' ? 'bg-red-500 text-white hover:bg-red-600' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            High Priority
          </Button>

          <Button
            variant={filterPriority === 'medium' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPriority('medium')}
            className={`text-sm ${filterPriority === 'medium' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            Medium Priority
          </Button>

          <Button
            variant={filterPriority === 'low' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPriority('low')}
            className={`text-sm ${filterPriority === 'low' ? 'bg-green-500 text-white hover:bg-green-600' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            Low Priority
          </Button>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={sortBy}
            onValueChange={(value: "date" | "title" | "priority" | "completed") => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px] text-sm border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="title">Sort by Title</SelectItem>
                                <SelectItem value="priority">Sort by Priority</SelectItem>
                                <SelectItem value="completed">Sort by Status</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
              
                          {/* Hide Completed Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="text-sm text-gray-700 font-medium hover:bg-gray-50"
                          >
                            {showCompleted ? 'Hide Completed' : 'Show Completed'}
                          </Button>
                        </div>
              
                        {/* Task List */}
                        <div className="space-y-3">
                          {sortedTasks.map((task, index) => {
                            const extendedTask = task as ExtendedTask;
                            const priority = extendedTask.priority;
                            const dueDate = extendedTask.dueDate;
                            const subtasks = extendedTask.subtasks || [];
                            const isDueToday = dueDate?.toISOString().split('T')[0] === today;
                            const isOverdue = dueDate && new Date(dueDate) < new Date() && !task.completed;
                            const subtaskStats = getSubtaskStats(subtasks);
                            const showSubtasks = expandedSubtasks.includes(task.id) && subtasks.length > 0;
                            const allSubtasksCompleted = subtaskStats.total > 0 && subtaskStats.completed === subtaskStats.total;
              
                            return (
                              <div
                                key={task.id}
                                className={`
                                  relative overflow-hidden
                                  transform transition-all duration-300 ease-out
                                  ${deletedTasks.includes(task.id) ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100'}
                                  hover:scale-[1.002] hover:shadow-md
                                  ${getPriorityColor(priority)}
                                  ${task.completed
                                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-green-500'
                                    : 'bg-white'
                                  }
                                  ${isSelectMode && selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                  border border-gray-200 rounded-xl shadow-sm
                                  group
                                `}
                                style={{
                                  animationDelay: `${index * 50}ms`
                                }}
                                onClick={() => isSelectMode && !task.completed && handleTaskSelect(task.id)}
                              >
                                <div className="p-4">
                                  <div className="flex items-start gap-3">
                                    {/* Selection Checkbox */}
                                    {isSelectMode && !task.completed && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTaskSelect(task.id);
                                        }}
                                        className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedTasks.includes(task.id)
                                          ? 'bg-blue-500 border-blue-500'
                                          : 'border-gray-300 hover:border-blue-400'
                                          }`}
                                      >
                                        {selectedTasks.includes(task.id) && (
                                          <Check className="w-3 h-3 text-white" />
                                        )}
                                      </button>
                                    )}
              
                                    {/* Animated Checkbox */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleComplete(task.id, !task.completed);
                                      }}
                                      className={`
                                        relative flex-shrink-0
                                        w-6 h-6 rounded-lg border-2 flex items-center justify-center
                                        transition-all duration-300 ease-out
                                        cursor-pointer transform ${!isSelectMode && 'group-hover:scale-110'}
                                        ${task.completed
                                          ? 'bg-gradient-to-br from-green-400 to-blue-500 border-transparent shadow-lg shadow-blue-200'
                                          : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow'
                                        }
                                        ${completedTasks.includes(task.id) ? 'animate-pulse-ring' : ''}
                                      `}
                                    >
                                      {task.completed ? (
                                        <Check
                                          className="w-4 h-4 text-white stroke-[3] animate-scale-in"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                                      )}
                                    </button>
              
                                    {/* Task Content */}
                                    <div
                                      className="flex-1 min-w-0 cursor-pointer"
                                      onClick={(e) => {
                                        if (!isSelectMode) {
                                          setExpandedTask(expandedTask === task.id ? null : task.id);
                                        }
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <h3 className={`
                                              font-medium transition-colors duration-200
                                              ${task.completed
                                                ? 'text-gray-500 line-through decoration-2'
                                                : 'text-gray-900 group-hover:text-gray-700'
                                              }
                                            `}>
                                              {task.title}
                                            </h3>
                                            {task.completed && (
                                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Done
                                              </span>
                                            )}
                                          </div>
              
                                          {task.description && (
                                            <p className={`
                                              mt-1 text-sm transition-all duration-300 overflow-hidden
                                              ${expandedTask === task.id
                                                ? 'text-gray-600 max-h-96 opacity-100'
                                                : 'text-gray-500 max-h-20 opacity-90'
                                              }
                                            `}>
                                              {task.description}
                                            </p>
                                          )}
              
                                          {/* Subtask Progress */}
                                          {subtasks.length > 0 && (
                                            <div className="mt-2">
                                              <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                  <ListTodo className="w-3 h-3 text-gray-400" />
                                                  <span className="text-xs text-gray-500">
                                                    Subtasks: {getSubtaskStats(subtasks).completed}/{getSubtaskStats(subtasks).total}
                                                  </span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-700">
                                                  {getSubtaskStats(subtasks).percentage}%
                                                </span>
                                              </div>
                                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                                                  style={{ width: `${getSubtaskStats(subtasks).percentage}%` }}
                                                />
                                              </div>
                                            </div>
                                          )}
              
                                          {/* Task Metadata */}
                                          <div className="flex flex-wrap gap-2 mt-2">
                                            {dueDate && (
                                              <span className={`
                                                inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
                                                ${isOverdue
                                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                                  : isDueToday && !task.completed
                                                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                }
                                              `}>
                                                <Calendar className="w-3 h-3" />
                                                {dueDate.toISOString().split('T')[0]}
                                                {isOverdue && ' (Overdue)'}
                                                {isDueToday && !task.completed && ' (Today)'}
                                              </span>
                                            )}
              
                                            {/* Priority Badge - Updated to match image */}
                                            {priority !== undefined && priority !== null && (
                                              <span className={`
                                                inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full
                                                ${priority === 'High'
                                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                                  : priority === 'Medium'
                                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                    : 'bg-green-50 text-green-700 border border-green-200'
                                                }
                                              `}>
                                                {priority === 'High' && <AlertCircle className="w-3 h-3" />}
                                                {priority === 'Medium' && <Clock className="w-3 h-3" />}
                                                {priority === 'Low' && <Circle className="w-3 h-3" />}
                                                {priority} Priority
                                              </span>
                                            )}
              
                                            {extendedTask.category && (
                                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                                {extendedTask.category}
                                              </span>
                                            )}
              
                                            {subtasks.length > 0 && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleSubtasks(task.id);
                                                }}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
                                              >
                                                {showSubtasks ? (
                                                  <>
                                                    <Minus className="w-3 h-3" />
                                                    Hide Subtasks
                                                  </>
                                                ) : (
                                                  <>
                                                    <Layers className="w-3 h-3" />
                                                    {subtasks.length} Subtasks
                                                  </>
                                                )}
                                              </button>
                                            )}
                                          </div>
                                        </div>
              
                                        {task.description && task.description.length > 100 && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedTask(expandedTask === task.id ? null : task.id);
                                            }}
                                            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                                          >
                                            {expandedTask === task.id ? (
                                              <ChevronUp className="w-4 h-4" />
                                            ) : (
                                              <ChevronDown className="w-4 h-4" />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
              
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEditTask(task)}
                                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(task.id)}
                                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
              
                                  {/* Subtasks Section */}
                                  {showSubtasks && (
                                    <div className="mt-4 pl-9 border-t border-gray-100 pt-4 animate-slide-down">
                                      <div className="space-y-2">
                                        {/* Complete All Subtasks Button */}
                                        {getSubtaskStats(subtasks).total > 0 && getSubtaskStats(subtasks).completed < getSubtaskStats(subtasks).total && (
                                          <div className="flex items-center justify-between mb-2">
                                            <button
                                              onClick={() => handleCompleteAllSubtasks(task.id)}
                                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                            >
                                              <Target className="w-3 h-3" />
                                              Complete All Subtasks
                                            </button>
                                            {allSubtasksCompleted && (
                                              <span className="text-xs font-medium text-green-600">
                                                All subtasks completed!
                                              </span>
                                            )}
                                          </div>
                                        )}
              
                                        {/* Subtasks List */}
                                        {subtasks.map((subtask) => (
                                          <div
                                            key={subtask.id}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group/subtask"
                                          >
                                            <div className="flex items-center gap-2 flex-1">
                                              <button
                                                type="button"
                                                onClick={() => handleToggleSubtask(task.id, subtask.id, !subtask.completed)}
                                                className={`
                                                  w-4 h-4 rounded border flex items-center justify-center transition-all
                                                  ${subtask.completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 hover:border-green-400'
                                                  }
                                                `}
                                              >
                                                {subtask.completed && (
                                                  <Check className="w-3 h-3 text-white" />
                                                )}
                                              </button>
              
                                              {editingSubtask?.taskId === task.id && editingSubtask?.subtaskId === subtask.id ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                  <input
                                                    type="text"
                                                    value={editSubtaskText}
                                                    onChange={(e) => setEditSubtaskText(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEditSubtask()}
                                                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    autoFocus
                                                  />
                                                  <button
                                                    onClick={handleSaveEditSubtask}
                                                    className="text-green-600 hover:text-green-800"
                                                  >
                                                    <Check className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => setEditingSubtask(null)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                  >
                                                    <Minus className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <>
                                                  <span className={`
                                                    text-sm flex-1
                                                    ${subtask.completed
                                                      ? 'text-gray-500 line-through'
                                                      : 'text-gray-700'
                                                    }
                                                  `}>
                                                    {subtask.title}
                                                  </span>
                                                  <div className="flex items-center gap-1 opacity-0 group-hover/subtask:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => handleStartEditSubtask(task.id, subtask.id, subtask.title)}
                                                      className="p-1 text-gray-500 hover:text-blue-600"
                                                    >
                                                      <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                                                      className="p-1 text-gray-500 hover:text-red-600"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                </>
                                              )}
                                            </div>
              
                                            {/* Subtask Completion Animation */}
                                            {subtask.completed && (
                                              <div className="ml-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                              </div>
                                            )}
                                          </div>
                                        ))}
              
                                        {/* Add New Subtask */}
                                        <div className="flex items-center gap-2 mt-3">
                                          <input
                                            type="text"
                                            value={newSubtaskText[task.id] || ''}
                                            onChange={(e) => setNewSubtaskText(prev => ({
                                              ...prev,
                                              [task.id]: e.target.value
                                            }))}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSubtask(task.id);
                                              }
                                            }}
                                            placeholder="Add a new subtask..."
                                            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                          <button
                                            onClick={() => handleAddSubtask(task.id)}
                                            disabled={!newSubtaskText[task.id]?.trim()}
                                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
              
                                {/* Completion Animation */}
                                {task.completed && (
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-500 animate-progress" />
                                )}
                              </div>
                            );
                          })}
                        </div>
              
                        {/* Completion Stats */}
                        <div className="text-center pt-4 border-t border-gray-100">
                          <div className="inline-flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                              Active: {pendingCount}
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              Completed: {completedCount}
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              Today: {todayTasks}
                            </span>
                          </div>
                        </div>
              
                        {/* Add custom styles for animations */}
                        <style jsx>{`
                          @keyframes scaleIn {
                            from { transform: scale(0); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                          }
                          
                          @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                          }
                          
                          @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                            20%, 40%, 60%, 80% { transform: translateX(2px); }
                          }
                          
                          @keyframes progress {
                            from { width: 0%; }
                            to { width: 100%; }
                          }
                          
                          @keyframes pulseRing {
                            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
                            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                          }
                          
                          @keyframes slideDown {
                            from { 
                              opacity: 0;
                              transform: translateY(-10px);
                              max-height: 0;
                            }
                            to { 
                              opacity: 1;
                              transform: translateY(0);
                              max-height: 500px;
                            }
                          }
                          
                          .animate-scale-in {
                            animation: scaleIn 0.2s ease-out;
                          }
                          
                          .animate-fade-in {
                            animation: fadeIn 0.5s ease-out;
                          }
                          
                          .animate-shake {
                            animation: shake 0.5s ease-in-out;
                          }
                          
                          .animate-progress {
                            animation: progress 0.5s ease-out;
                          }
                          
                          .animate-pulse-ring {
                            animation: pulseRing 1.5s ease-in-out;
                          }
                          
                          .animate-slide-down {
                            animation: slideDown 0.3s ease-out;
                          }
                          
                          @media (max-width: 640px) {
                            .group-hover\\:scale-110 {
                              transform: scale(1.05);
                            }
                          }
                        `}</style>
                      </div>
                    );
                  }
                  