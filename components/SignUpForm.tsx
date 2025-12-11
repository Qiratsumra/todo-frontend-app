'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAction } from "@/app/actions/auth";
import { useState } from "react";

export default function SignUpForm() {
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError("");
        setLoading(true);
        
        try {
            const result = await signUpAction(formData) as unknown as { error?: string };
            
            if (result?.error) {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during sign up");
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-black">Sign Up</h1>
            <form action={handleSubmit} className="flex flex-col gap-3 w-64">
                <Input type="text" name="name" placeholder="Name" required/>
                <Input type="email" name="email" placeholder="Email" required/>
                <Input 
                    type="password" 
                    name="password" 
                    placeholder="Password (min 8 characters)" 
                    required
                    minLength={8}
                />
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </Button>
            </form>
        </div>
    )
}