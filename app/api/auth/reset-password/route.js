import { NextResponse } from 'next/server';
import ResetPasswordController from '@/app/lib/controllers/ResetPasswordController';

export async function POST(request) {
    try {
        const reqData = await request.json();
        const result = await ResetPasswordController.sendResetLink({
            body: reqData
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in send reset link:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const reqData = await request.json();
        const result = await ResetPasswordController.resetPassword({
            body: reqData
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in reset password:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
