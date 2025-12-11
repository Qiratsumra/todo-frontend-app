"use client";
import {
  Bell,
  Clock,
  Search,
  Settings,
  Tag,
  Home,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  LogOut,
  User,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task, FilterType } from "@/types";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onSearch?: (query: string) => void;
  tasks?: Task[];
  onFilterChange?: (filter: FilterType) => void;
  onTagFilter?: (tag: string) => void;
  activeFilter?: FilterType;
}

const Sidebar = ({
  onSearch,
  tasks = [],
  onFilterChange,
  onTagFilter,
  activeFilter = 'all'
}: SidebarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = authClient.useSession();
  const router = useRouter();

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Tasks due soon (within next 7 days)
  const dueSoonTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= sevenDaysFromNow && !task.completed;
  }).length;

  // High priority tasks
  const highPriorityTasks = tasks.filter(
    task => task.priority === "High" && !task.completed
  ).length;

  // Group tasks by tags
  const tagCounts: { [key: string]: number } = {};
  tasks.forEach(task => {
    if (task.tags && Array.isArray(task.tags)) {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch && onSearch(value);
  };

  const handleFilterClick = (filter: FilterType) => {
    onFilterChange && onFilterChange(filter);
  };

  const handleTagClick = (tag: string) => {
    onTagFilter && onTagFilter(tag);
  };

  return (
    // Changed: Uses h-full instead of h-screen to respect parent container
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">

      {/* Fixed Header Section */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Todo App</span>
          </div>
          <Button variant="ghost" size="icon" title="Notifications">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white"
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      {/* Changed: Added flex-1 and min-h-0 to allow proper scrolling within flex container */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 min-h-0 custom-scrollbar">

        {/* Main Nav */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">
            Tasks
          </h3>
          <button
            onClick={() => handleFilterClick('all')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'all'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <Home className="w-5 h-5" />
            <span>All Tasks</span>
            <span className={`ml-auto text-xs rounded-full px-2 py-0.5 ${activeFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
              }`}>
              {totalTasks}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('pending')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'pending'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <Circle className="w-5 h-5 text-gray-500" />
            <span>Pending</span>
            <span className="ml-auto text-xs bg-gray-200 rounded-full px-2 py-0.5">
              {pendingTasks}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('completed')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'completed'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Completed</span>
            <span className="ml-auto text-xs bg-gray-200 rounded-full px-2 py-0.5">
              {completedTasks}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('dueSoon')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'dueSoon'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <Clock className="w-5 h-5 text-orange-500" />
            <span>Due Soon</span>
            {dueSoonTasks > 0 && (
              <span className="ml-auto text-xs bg-orange-100 text-orange-600 rounded-full px-2 py-0.5">
                {dueSoonTasks}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterClick('highPriority')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'highPriority'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>High Priority</span>
            {highPriorityTasks > 0 && (
              <span className="ml-auto text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5">
                {highPriorityTasks}
              </span>
            )}
          </button>
        </div>

        {/* Priority Filters */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">
            Priority
          </h3>
          <button
            onClick={() => handleFilterClick('High')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'High'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>High</span>
            <span className="ml-auto text-xs text-gray-500">
              {tasks.filter(t => t.priority === "High" && !t.completed).length}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('Medium')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'Medium'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span>Medium</span>
            <span className="ml-auto text-xs text-gray-500">
              {tasks.filter(t => t.priority === "Medium" && !t.completed).length}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('Low')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFilter === 'Low'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100 text-gray-700'
              }`}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Low</span>
            <span className="ml-auto text-xs text-gray-500">
              {tasks.filter(t => t.priority === "Low" && !t.completed).length}
            </span>
          </button>
        </div>

        {/* Tags */}
        {topTags.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">
              Tags
            </h3>
            {topTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <Tag className="w-4 h-4 text-blue-500" />
                <span className="truncate">{tag}</span>
                <span className="ml-auto text-xs text-gray-500">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">
            Progress
          </h3>
          <div className="px-3 py-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Overall</span>
              <span className="font-semibold text-gray-900">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{completedTasks} completed</span>
              <span>{pendingTasks} pending</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Fixed Footer */}
      <div className="p-4 border-t space-y-1 bg-gray-50">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          onClick={() => alert('Settings clicked')}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <div className="relative">
          {session ? (
            <>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                id="user-menu-button"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-sm truncate">{session.user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user.email || 'user@example.com'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={async () => {
                      await authClient.signOut();
                      router.push("/signin");
                      setShowUserMenu(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <Button
              onClick={() => router.push("/signin")}
              className="w-full justify-start gap-3"
              variant="ghost"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;