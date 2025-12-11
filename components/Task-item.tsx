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
        "group flex items-start justify-between p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]",
        { "bg-gray-50/80": task.completed }
      )}
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
        {/* Checkbox - Aligned to top to handle multi-line titles */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={task.completed}
            readOnly
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete && onToggleComplete(task);
            }}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <p
            className={clsx(
              "font-semibold text-gray-800 break-words text-sm md:text-base pr-2", 
              { "line-through text-gray-400": task.completed }
            )}
          >
            {task.title}
          </p>

          {/* Metadata Row - Wraps on mobile */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500 mt-2">
            
            {/* Due Date */}
            {task.dueDate && (
              <div className={clsx("flex items-center gap-1", {
                "text-red-500 font-medium": new Date(task.dueDate) < new Date() && !task.completed
              })}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>
                  {task.subtasks.filter((s) => s.completed).length}/
                  {task.subtasks.length}
                </span>
              </div>
            )}

            {/* Comments */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {/* Tags - Wraps independently if needed */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-[10px] md:text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-full whitespace-nowrap"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chevron - Always vertically centered relative to container height, or aligned top */}
      <ChevronRight className="w-5 h-5 text-gray-300 mt-1 flex-shrink-0 group-hover:text-gray-500 transition-colors" />
    </div>
  );
};

export default TaskItem;