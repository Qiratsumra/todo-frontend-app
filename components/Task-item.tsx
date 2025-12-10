
"use client";
import React from "react";
import { Calendar, ChevronRight, Tag, Check, MessageSquare, Paperclip } from "lucide-react";
import { clsx } from "clsx";
import { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onSelect: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

const TaskItem = ({ task, onSelect, onToggleComplete }: TaskItemProps) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer",
        { "bg-gray-50": task.completed }
      )}
      onClick={() => onSelect(task)}
    >
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          readOnly
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening detail view
            onToggleComplete && onToggleComplete(task);
          }}
          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <p
            className={clsx("font-semibold text-gray-800", {
              "line-through text-gray-500": task.completed,
            })}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>
                  {task.subtasks.filter((s) => s.completed).length}/
                  {task.subtasks.length}
                </span>
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-4 h-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChevronRight className="w-6 h-6 text-gray-400" />
    </div>
  );
};

export default TaskItem;
