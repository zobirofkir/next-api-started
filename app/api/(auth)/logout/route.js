import { AuthController } from "@/app/lib/controllers/AuthController";
import { NextResponse } from "next/server";
import requireAuth from "@/app/lib/auth/requireAuth.js";

export const POST = async (request) => {
    return requireAuth(request, async (user, token, payload) => {
        const req = { user, token, payload };
        const res = {
            status: (code) => ({
                json: (data) => NextResponse.json(data, { status: code })
            }),
            json: (data) => NextResponse.json(data)
        };

        return AuthController.logout(req, res);
    });
}