import { GmailAuthController } from "@/app/lib/controllers/GmailAuthController";
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
    
    return GmailAuthController.registerWithGmail(req, res);
}
