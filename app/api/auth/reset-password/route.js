import { NextResponse } from 'next/server';
import ResetPasswordController from '@/app/lib/controllers/ResetPasswordController';
import rateLimiter from '@/app/middleware/rateLimiter';
import connectDB from '@/app/lib/connection/db';

/**
 * Handles POST requests to the reset password endpoint
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
                // Establish database connection first
                await connectDB();
                
                const body = await request.json();
                const req = { body, ip };
                const res = {
                    status: (code) => ({
                        json: (data) => resolve(NextResponse.json(data, { status: code }))
                    }),
                    json: (data) => resolve(NextResponse.json(data))
                };
                
                // Handle different reset password actions based on the request
                if (body.action === 'request') {
                    return await ResetPasswordController.forgotPassword(req, res);
                } else if (body.action === 'reset') {
                    return await ResetPasswordController.resetPassword(req, res);
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid action. Please specify either "request" or "reset" action.'
                    });
                }
            } catch (error) {
                console.error('Error in reset password route:', error);
                resolve(NextResponse.json(
                    { success: false, error: 'Internal server error' },
                    { status: 500 }
                ));
            }
        };

        rateLimiter({ ...request, ip }, rateLimitRes, next);
    });
};

/**
 * Handles unsupported HTTP methods
 * @param {Request} request - The incoming HTTP request
 * @returns {NextResponse} A 405 Method Not Allowed response
 */
export function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Allow': 'POST, OPTIONS',
        },
    });
}

// Export other HTTP methods as not allowed
export function GET() { return methodNotAllowed(); }
export function PUT() { return methodNotAllowed(); }
export function PATCH() { return methodNotAllowed(); }
export function DELETE() { return methodNotAllowed(); }

function methodNotAllowed() {
    return new NextResponse(
        JSON.stringify({ 
            success: false, 
            message: 'Method not allowed' 
        }), 
        { 
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}