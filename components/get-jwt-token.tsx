"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GetJWTToken() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const fetchToken = async () => {
        setLoading(true);
        try {
            const { data, error } = await authClient.token();
            
            if (error) {
                console.error("Token fetch error:", error);
                alert("Failed to get token");
                return;
            }
            
            if (data) {
                setToken(data.token);
                console.log("JWT Token:", data.token);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Get JWT Token</h3>
            <Button onClick={fetchToken} disabled={loading}>
                {loading ? "Loading..." : "Get Token"}
            </Button>
            
            {token && (
                <div className="mt-4 bg-gray-50 p-3 rounded">
                    <p className="text-xs font-semibold mb-1">Your JWT Token:</p>
                    <code className="text-xs break-all block bg-white p-2 rounded border">
                        {token}
                    </code>
                    <Button 
                        onClick={() => navigator.clipboard.writeText(token)}
                        className="mt-2"
                        size="sm"
                    >
                        Copy Token
                    </Button>
                </div>
            )}
        </div>
    );
}