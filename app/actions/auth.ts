"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name
            },
            headers: await headers() // ADD THIS!
        });
        return { success: true };
    } catch (e: any) {
        console.error("Sign up error:", e);
        return { error: e.message || "Failed to create account" };
    }
}

export async function signInAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password
            },
            headers: await headers() // Make sure this is here too
        });
        return { success: true };
    } catch (e: any) {
        console.error("Sign in error:", e);
        return { error: "Invalid email or password" };
    }
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers()
    });
    redirect("/");
}