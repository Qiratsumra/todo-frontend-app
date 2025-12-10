
"use client";
import React from "react";
import { Plus, ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskItem from "./Task-item";
import { Task } from "@/types";

interface MainContentProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onAddTask: () => void;
  onToggleComplete: (task: Task) => void;
}

const MainContent = ({ tasks, onTaskSelect, onAddTask, onToggleComplete }: MainContentProps) => {
  return (
    <main className="flex-1 p-8 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">Today</h1>
          <span className="text-3xl font-bold text-gray-400">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <ListFilter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={onAddTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onSelect={onTaskSelect}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </main>
  );
};

export default MainContent;
