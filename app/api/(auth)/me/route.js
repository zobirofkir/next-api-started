import { AuthController } from "@/app/lib/controllers/AuthController";
import { NextResponse } from "next/server";
import requireAuth from "@/app/lib/auth/requireAuth.js";

export const GET = async (request) => {
    return requireAuth(request, async (user) => {
        const req = { user };
        const res = {
            status: (code) => ({
                json: (data) => NextResponse.json(data, { status: code })
            }),
            json: (data) => NextResponse.json(data)
        };

        return AuthController.me(req, res);
    });
}

export const PUT = async (request) => {
    return requireAuth(request, async (user) => {
        const body = await request.json();
        const req = { user, body };
        const res = {
            status: (code) => ({
                json: (data) => NextResponse.json(data, { status: code })
            }),
            json: (data) => NextResponse.json(data)
        };

        return AuthController.updateMe(req, res);
    });
}


