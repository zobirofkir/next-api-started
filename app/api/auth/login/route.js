import { AuthController } from "@/app/lib/controllers/AuthController";
import { NextResponse } from "next/server";
import rateLimiter from "@/app/middleware/rateLimiter";

/**
 * Handles POST requests to the login endpoint
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 */
export const POST = async (request) => {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(/, /)[0] : '127.0.0.1';
    
    const rateLimitRes = {
        setHeader: () => {},
        status: (code) => ({
            json: (data) => ({
                statusCode: code,
                data
            })
        })
    };

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
                
                return AuthController.login(req, res);
            } catch (error) {
                console.error('Error in login route:', error);
                resolve(NextResponse.json(
                    { success: false, error: 'Internal server error' },
                    { status: 500 }
                ));
            }
        };

        rateLimiter({ ...request, ip }, rateLimitRes, next);
    });
};