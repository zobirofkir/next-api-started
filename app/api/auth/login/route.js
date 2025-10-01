import { AuthController } from "@/app/lib/controllers/AuthController";
import { NextResponse } from "next/server";

export const POST = async (request) => {
    const body = await request.json();
    const req = { body };
    const res = {
        status: (code) => ({
            json: (data) => NextResponse.json(data, { status: code })
        }),
        json: (data) => NextResponse.json(data)
    };
    
    return AuthController.login(req, res);
}