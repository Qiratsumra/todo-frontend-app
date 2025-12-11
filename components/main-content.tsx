"use client";
import React from "react";
import { Plus, ChevronDown, ListFilter, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskItem from "./Task-item";
import { Task } from "@/types";

interface MainContentProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onAddTask: () => void;
  onToggleComplete: (task: Task) => void;
}

const MainContent = ({ 
  tasks, 
  onTaskSelect, 
  onAddTask, 
  onToggleComplete 
}: MainContentProps) => {
  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Today</h1>
          <div className="bg-gray-200 px-3 py-1 rounded-full">
             <span className="text-xl md:text-2xl font-bold text-gray-600">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {/* Mobile: Full width, buttons split 50/50. Desktop: Auto width */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <ListFilter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={onAddTask} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 pb-20 md:pb-0">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onSelect={onTaskSelect}
              onToggleComplete={onToggleComplete}
            />
          ))
        ) : (
          /* Empty State for better UX */
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
            <LayoutList className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">Create a new task to get started</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;