'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAction } from "@/app/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpForm() {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const formData = new FormData(e.currentTarget);
            const result = await signUpAction(formData);
            
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                router.push("/todo");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during sign up");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-black">Sign Up</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
                <Input 
                    type="text" 
                    name="name" 
                    placeholder="Name" 
                    required 
                    autoComplete="name"
                />
                <Input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    required 
                    autoComplete="email"
                />
                <Input 
                    type="password" 
                    name="password" 
                    placeholder="Password (min 8 characters)" 
                    required
                    minLength={8}
                    autoComplete="new-password"
                />
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </Button>
            </form>
            <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-600 hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}