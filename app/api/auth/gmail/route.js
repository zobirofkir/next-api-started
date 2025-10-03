import { NextResponse } from 'next/server';
import AuthGmailRequest from '@/lib/requests/AuthGmailRequest';
import AuthGmailController from '@/lib/controllers/AuthGmailController';

/**
 * @route POST /api/auth/gmail
 * @description Handle Google OAuth authentication
 * @access Public
 */
export async function POST(request) {
    try {
        const requestData = await request.json();
        const validation = new AuthGmailRequest();
        
        // Validate request data
        const { isValid, errors } = await validation.validate(requestData);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors },
                { status: 400 }
            );
        }

        // Sanitize and process the request
        const sanitizedData = validation.sanitize(requestData);
        
        // Create a mock request/response object for the controller
        const req = { body: sanitizedData };
        const res = {
            status: (code) => ({
                json: (data) => ({
                    success: data.success,
                    message: data.message,
                    data: data.data,
                    status: code
                })
            })
        };

        // Call the controller
        const result = await AuthGmailController.login(req, res);
        
        // Return the response
        return NextResponse.json({
            success: result.success,
            message: result.message,
            data: result.data
        }, { status: result.status || 200 });

    } catch (error) {
        console.error('Error in Google auth route:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

/**
 * @route GET /api/auth/gmail
 * @description Returns method not allowed response
 * @access Public
 */
export function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405, headers: { 'Allow': 'POST' } }
    );
}

// Export other HTTP methods as not allowed
const METHOD_NOT_ALLOWED = async () => {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405, headers: { 'Allow': 'POST' } }
    );
};

export { METHOD_NOT_ALLOWED as PUT, METHOD_NOT_ALLOWED as DELETE, METHOD_NOT_ALLOWED as PATCH, METHOD_NOT_ALLOWED as HEAD, METHOD_NOT_ALLOWED as OPTIONS };