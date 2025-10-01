import { AuthController } from "@/app/lib/controllers/AuthController";
import { NextResponse } from "next/server";

export const POST = async (request) => {
    const req = {};
    const res = {
        json: (data) => NextResponse.json(data)
    };
    
    return AuthController.logout(req, res);
}