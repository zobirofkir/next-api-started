import UserController from "@/app/lib/controllers/UserController";
import { NextResponse } from "next/server"
import requireAuth from "@/app/lib/auth/requireAuth.js";

export const GET = async (request) => {
    return requireAuth(request, async () => {
        return NextResponse.json(await UserController.index());
    });
}

export const POST = async (request) => {
    return requireAuth(request, async () => {
        const userData = await request.json();
        return NextResponse.json(await UserController.store(userData));
    });
}