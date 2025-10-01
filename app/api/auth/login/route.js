import { AuthController } from "@/app/lib/controllers/AuthController";
import { NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const POST = async (request) => {
    const body = await request.json();
    const req = { body };
    const res = {
        status: (code) => ({
            json: (data) => NextResponse.json(data, { status: code, headers: corsHeaders })
        }),
        json: (data) => NextResponse.json(data, { headers: corsHeaders })
    };
    
    return AuthController.login(req, res);
}

export const OPTIONS = async () => {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}