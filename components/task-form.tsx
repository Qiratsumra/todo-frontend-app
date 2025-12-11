"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low', 'none']),
  tags: z.string().optional(),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  onTaskAdded: () => void;
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "none" as const,
      tags: "",
      dueDate: "",
    },
  });

  const getApiUrl = () => {
    return "https://fullstack-todo-backend-1-p9wb.onrender.com/api";
  };

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const priorityMap: { [key: string]: number } = {
        'none': 0,
        'low': 1,
        'medium': 2,
        'high': 3,
      };

      const taskData = {
        title: data.title,
        description: data.description || null,
        priority: priorityMap[data.priority],
        tags: data.tags ? [data.tags] : null,
        dueDate: data.dueDate || null,
        completed: false,
      };

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
      }

      form.reset();
      onTaskAdded();
    } catch (err: unknown) {
      console.error("Error creating task:", err);
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          setError(`Cannot connect to server. Check your internet connection.`);
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            <div className="font-medium">Error</div>
            {error}
          </div>
        )}

        {/* Title - Full Width */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                {/* text-base prevents iOS zoom */}
                <Input 
                  placeholder="Enter task title" 
                  {...field} 
                  disabled={isSubmitting} 
                  className="text-base md:text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description - Full Width */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description (optional)"
                  className="min-h-[80px] md:min-h-[100px] text-base md:text-sm resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid for Priority and Date - Stacks on Mobile, Side-by-Side on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="text-base md:text-sm">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      type="date"
                      className="pl-10 text-base md:text-sm block w-full"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags - Full Width */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Work, Personal"
                  {...field}
                  disabled={isSubmitting}
                  className="text-base md:text-sm"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Comma separated tags
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-11 md:h-10 text-base md:text-sm font-medium"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}