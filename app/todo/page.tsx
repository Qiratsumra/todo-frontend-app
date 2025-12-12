import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TodoPageClient from "@/components/todo-page-client";

export default async function TodoPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect("/signin");
  }
  
  return <TodoPageClient user={session.user} />;
}