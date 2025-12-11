"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "../app/actions/auth";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError("");
        setLoading(true);

        try {
            const result = await signInAction(formData);

            // Check if there's an error in the result
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                router.push("/todo");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during sign in");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-black">Sign In</h1>
            <form action={handleSubmit} className="flex flex-col gap-3 w-64">
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
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                />
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </Button>
            </form>
            <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    )
}