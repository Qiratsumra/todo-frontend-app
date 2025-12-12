import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";  // ADD THIS
import { Pool } from "pg";

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL
    }),
    emailAndPassword: { 
        enabled: true, 
    },
    
    secret: process.env.BETTER_AUTH_SECRET!,
    
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    
    plugins: [
        nextCookies(),
        jwt({  // ADD JWT PLUGIN
            jwt: {
                expirationTime: "7d", // Token ki expiry
            }
        })
    ] 
})