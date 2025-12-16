"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditTaskModalProps {
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
}

const FormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
});

export function EditTaskModal({ task, onClose, onTaskUpdated }: EditTaskModalProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority,
    },
  });

  // Fixed URL Logic: Base URL shouldn't include trailing slash if you add it later
  const baseUrl = "https://todo-phase-3-backend.onrender.com/api";

  // Reset the form when the task prop changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority,
      });
    }
  }, [task, form]);

  if (!task) {
    return null;
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!task) return;

    try {
      const updateData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
      };

      // Corrected API endpoint construction
      const response = await fetch(`${baseUrl}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Task updated:", await response.json());
      onTaskUpdated();
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  }

  return (
    // 1. Z-Index and Fixed Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* 2. Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* 3. Modal Container with Responsive Padding */}
      <div className="relative z-50 w-full p-4 md:p-0 flex items-center justify-center pointer-events-none">
        
        {/* 4. The Card itself */}
        <div className="
          bg-white p-6 rounded-lg shadow-xl 
          w-full max-w-md 
          pointer-events-auto
          max-h-[90vh] overflow-y-auto  /* Ensures modal scrolls if screen is too short */
        ">
          <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10">
            <h2 className="text-xl md:text-2xl font-bold">Edit Task</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              ✕
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 pb-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} className="text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Task description (optional)" {...field} className="text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low Priority</SelectItem>
                        <SelectItem value="Medium">Medium Priority</SelectItem>
                        <SelectItem value="High">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose task priority level</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Footer Buttons */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end sm:space-x-2 gap-2 sm:gap-0 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}