import { NextResponse } from 'next/server';
import ResetPasswordController from '@/app/lib/controllers/ResetPasswordController';
import connectDB from '@/app/lib/connection/db';

/**
 * Handles GET requests to verify a reset token
 * @param {Request} request - The incoming HTTP request
 * @param {Object} params - Route parameters
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 */
export const GET = async (request, { params }) => {
    try {
        const req = { params };
        let responseSent = false;
        let responseData = {};
        let statusCode = 200;

        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => {
                        responseData = data;
                        responseSent = true;
                    }
                };
            },
            json: (data) => {
                responseData = data;
                responseSent = true;
            }
        };

        // Establish database connection first
        await connectDB();
        await ResetPasswordController.verifyResetToken(req, res);
        
        if (responseSent) {
            return NextResponse.json(responseData, { status: statusCode });
        }

        return NextResponse.json(
            { success: false, message: 'No response from server' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Error in verify reset token route:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
};

// Export other HTTP methods as not allowed
export const POST = () => 
    NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );

export const PUT = () => 
    NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );

export const PATCH = () => 
    NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );

export const DELETE = () => 
    NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );

export const OPTIONS = () => 
    NextResponse.json(
        { success: true },
        { 
            status: 200,
            headers: {
                'Allow': 'GET, OPTIONS',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        }
    );
