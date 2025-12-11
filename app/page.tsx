import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth"
import Link from "next/link";
import { headers } from "next/headers"
import { CheckCircle2, Sparkles, Zap, ListTodo } from "lucide-react";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session){
    return(
      <div className="relative min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite]"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite_2s]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite_4s]"></div>
        </div>

        {/* Main content */}
        <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
          {/* Logo/Icon with animation */}
          <div className="mb-8 transform hover:scale-110 transition-transform duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 p-4 rounded-2xl shadow-xl">
                <ListTodo className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title with gradient */}
          <h1 className="text-6xl md:text-7xl font-bold text-center mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-[fadeIn_0.8s_ease-out]">
            Todo App
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 text-center mb-12 max-w-2xl animate-[fadeIn_0.8s_ease-out_0.2s_both]">
            Welcome to the best todo app in the world!
            <span className="block text-base mt-2 text-gray-500">Organize your life with style and simplicity</span>
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full px-4">
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-violet-100">
              <div className="bg-gradient-to-br from-violet-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Beautiful Design</h3>
              <p className="text-sm text-gray-600">Elegant interface that makes task management a joy</p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-violet-100">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Quick and responsive with seamless interactions</p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-violet-100">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Things Done</h3>
              <p className="text-sm text-gray-600">Stay productive and accomplish your goals</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-[fadeIn_0.8s_ease-out_0.4s_both]">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-6 text-lg"
            >
              <Link href="/signup">
                Sign Up
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="border-2 border-violet-600 text-violet-600 hover:bg-violet-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-6 text-lg"
            >
              <Link href="/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return(
    <div className="relative min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite]"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-[blob_7s_infinite_2s]"></div>
      </div>

      {/* Welcome back content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-violet-100 transform hover:scale-105 transition-all duration-300 max-w-2xl w-full animate-[fadeIn_0.8s_ease-out]">
          {/* Welcome icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 p-4 rounded-full shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Welcome message */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back, {session.user.name}!
          </h1>
          
          <p className="text-center text-gray-600 mb-8 text-lg">
            Ready to tackle your tasks and make today productive?
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-6 text-lg"
            >
              <Link href="/todo">
                Go to Todo List →
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}