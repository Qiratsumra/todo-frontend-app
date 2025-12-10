"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Check,
  ChevronDown,
  Tag,
  Trash2,
  Users,
  Plus,
  Paperclip,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Task } from "@/types"; // Import Task

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
  onDelete: (taskId: string) => void;
}

const FormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  list: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  subtasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(),
});

const TaskDetail = ({ task, onClose, onTaskUpdated, onDelete }: TaskDetailProps) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const API_URL = "https://fullstack-todo-backend-1-p9wb.onrender.com/api";

  // Map numeric priority to string for form
  const getPriorityString = (priority: number | string | undefined) => {
    if (priority === undefined || priority === null) return "none";
    const priorityMap: { [key: number]: string } = {
      0: "none",
      1: "low",
      2: "medium",
      3: "high",
    };
    return typeof priority === 'number' ? priorityMap[priority] || "none" : priority;
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      list: task?.project || "",
      priority: getPriorityString(task?.priority),
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      tags: task?.tags || [],
      subtasks: task?.subtasks || [],
    },
  });

  useEffect(() => {
    form.reset({
      title: task?.title || "",
      description: task?.description || "",
      list: task?.project || "",
      priority: getPriorityString(task?.priority),
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      tags: task?.tags || [],
      subtasks: task?.subtasks || [],
    });
  }, [task]);

  if (!task) {
    return (
      <div className="w-96 border-l border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold">No Task Selected</h3>
        <p className="text-sm text-gray-500">
          Select a task to see its details here.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSaving(true);
    
    try {
      // Map priority string back to number for API
      const priorityMap: { [key: string]: number } = {
        'none': 0,
        'low': 1,
        'medium': 2,
        'high': 3,
      };

      const updateData = {
        title: data.title,
        description: data.description || "",
        priority: priorityMap[data.priority || 'none'],
        tags: data.tags && data.tags.length > 0 ? data.tags : [],
        dueDate: data.dueDate || null,
        subtasks: data.subtasks || [],
        completed: task.completed,
      };

      console.log("=== SAVING TASK ===");
      console.log("Task ID:", task.id);
      console.log("API URL:", `${API_URL}/tasks/${task.id}`);
      console.log("Update Data:", JSON.stringify(updateData, null, 2));

      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Failed to update task: ${response.status} - ${errorText}`);
      }
      
      const updated = await response.json();
      console.log("Task updated successfully:", updated);
      
      alert("Task saved successfully!");
      
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error("=== ERROR SAVING TASK ===");
      console.error(error);
      alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      onDelete && onDelete(task.id);
    }
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim() !== "") {
      const currentSubtasks = form.getValues("subtasks") || [];
      form.setValue("subtasks", [
        ...currentSubtasks,
        { id: crypto.randomUUID(), title: newSubtask, completed: false },
      ]);
      setNewSubtask("");
    }
  };

  return (
    <aside className="w-[380px] border-l border-gray-200 bg-white p-6 flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input {...field} className="text-2xl font-bold border-none focus-visible:ring-0 px-0" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-500">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add a description..." className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-500">Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-500">Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-500">Tags</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((tag, index) => (
                        <div key={index} className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-gray-500 hover:text-gray-800"
                            onClick={() => {
                              const newTags = [...field.value!];
                              newTags.splice(index, 1);
                              field.onChange(newTags);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <Input
                        placeholder="+ Add Tag"
                        className="border-none focus-visible:ring-0 h-auto p-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value) {
                            e.preventDefault();
                            field.onChange([...(field.value || []), e.currentTarget.value]);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Subtasks</h3>
              <div className="space-y-2">
                {form.watch("subtasks")?.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(e) => {
                        const newSubtasks = [...form.getValues("subtasks")!];
                        newSubtasks[index].completed = e.target.checked;
                        form.setValue("subtasks", newSubtasks);
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Input
                      defaultValue={subtask.title}
                      className="border-none focus-visible:ring-0 h-auto p-0"
                      onChange={(e) => {
                        const newSubtasks = [...form.getValues("subtasks")!];
                        newSubtasks[index].title = e.target.value;
                        form.setValue("subtasks", newSubtasks);
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Plus className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Add a subtask"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="border-none focus-visible:ring-0 h-auto p-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t flex items-center justify-between">
            <Button variant="outline" size="sm" type="button" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
            <Button size="sm" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </aside>
  );
};

export default TaskDetail;