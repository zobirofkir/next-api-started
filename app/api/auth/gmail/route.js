import { NextResponse } from 'next/server';
import AuthGmailRequest from '@/lib/requests/AuthGmailRequest';
import AuthGmailController from '@/lib/controllers/AuthGmailController';

/**
 * @module routes/auth/gmail
 * @description Google OAuth authentication endpoints
 */

/**
 * @async
 * @function POST
 * @description Handles Google OAuth authentication request
 * @param {Object} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with authentication result
 * 
 * @example
 * // Request
 * POST /api/auth/gmail
 * {
 *   "idToken": "google_id_token_here",
 *   "accessToken": "google_access_token_here"
 * }
 * 
 * // Success Response
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "user": {
 *       "id": "user_id_here",
 *       "name": "User Name",
 *       "email": "user@example.com",
 *       "photoURL": "https://...",
 *       "provider": "google",
 *       "createdAt": "2025-10-03T20:00:00.000Z",
 *       "updatedAt": "2025-10-03T20:00:00.000Z"
 *     },
 *     "token": "jwt_token_here"
 *   }
 * }
 */
export async function POST(request) {
    try {
        const requestData = await request.json();
        const validation = new AuthGmailRequest();
        
        const { isValid, errors } = await validation.validate(requestData);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors },
                { status: 400 }
            );
        }

        const sanitizedData = validation.sanitize(requestData);
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

        const result = await AuthGmailController.login(req, res);
        
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
 * @function GET
 * @description Handles unsupported GET requests to the Google auth endpoint
 * @returns {NextResponse} 405 Method Not Allowed response
 */
export function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405, headers: { 'Allow': 'POST' } }
    );
}

/**
 * @private
 * @function METHOD_NOT_ALLOWED
 * @description Handles unsupported HTTP methods
 * @returns {NextResponse} 405 Method Not Allowed response
 */
const METHOD_NOT_ALLOWED = async () => {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405, headers: { 'Allow': 'POST' } }
    );
};

export { 
    METHOD_NOT_ALLOWED as PUT, 
    METHOD_NOT_ALLOWED as DELETE, 
    METHOD_NOT_ALLOWED as PATCH, 
    METHOD_NOT_ALLOWED as HEAD, 
    METHOD_NOT_ALLOWED as OPTIONS 
};