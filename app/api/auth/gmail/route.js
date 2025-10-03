import AuthGmailController from '@/app/lib/controllers/AuthGmailController';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { idToken } = await request.json();
        
        if (!idToken) {
            return NextResponse.json(
                { success: false, message: 'ID token is required' },
                { status: 400 }
            );
        }

        // Create a mock request object that matches what the controller expects
        const req = {
            body: { idToken }
        };

        // Create a mock response object
        let responseData = {};
        let statusCode = 200;

        const res = {
            status: (code) => {
                statusCode = code;
                return res;
            },
            json: (data) => {
                responseData = data;
                return data;
            }
        };

        // Call the controller's login method
        await AuthGmailController.login(req, res);

        // Return the response from the controller
        return NextResponse.json(responseData, { status: statusCode });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Internal server error',
                error: error.message 
            },
            { status: 500 }
        );
    }
}

// Handle unsupported methods
export function GET() {
    return NextResponse.json(
        { 
            success: false, 
            message: 'Method not allowed' 
        },
        { status: 405 }
    );
}

// Create a generic method not allowed handler
const METHOD_NOT_ALLOWED = () => {
    return NextResponse.json(
        { 
            success: false, 
            message: 'Method not allowed' 
        },
        { status: 405 }
    );
};

// Export other HTTP methods as not allowed
export { 
    METHOD_NOT_ALLOWED as PUT, 
    METHOD_NOT_ALLOWED as DELETE, 
    METHOD_NOT_ALLOWED as PATCH,
    METHOD_NOT_ALLOWED as HEAD,
    METHOD_NOT_ALLOWED as OPTIONS
};