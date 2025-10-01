import { AuthController } from "@/app/lib/controllers/AuthController";
import { NextResponse } from "next/server";
import rateLimiter from "@/app/middleware/rateLimiter";

// Create a wrapper to handle the rate limiter with Next.js App Router
export const POST = async (request) => {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(/, /)[0] : '127.0.0.1';
    
    // Create a mock response object for the rate limiter
    const rateLimitRes = {
        setHeader: () => {},
        status: (code) => ({
            json: (data) => ({
                statusCode: code,
                data
            })
        })
    };

    // Create a wrapper function that will handle the rate limiter's next() call
    return new Promise((resolve) => {
        const next = async () => {
            try {
                const body = await request.json();
                const req = { body, ip };
                const res = {
                    status: (code) => ({
                        json: (data) => resolve(NextResponse.json(data, { status: code }))
                    }),
                    json: (data) => resolve(NextResponse.json(data))
                };
                
                return AuthController.register(req, res);
            } catch (error) {
                console.error('Error in register route:', error);
                resolve(NextResponse.json(
                    { success: false, error: 'Internal server error' },
                    { status: 500 }
                ));
            }
        };

        // Call the rate limiter middleware
        rateLimiter({ ...request, ip }, rateLimitRes, next);
    });
};