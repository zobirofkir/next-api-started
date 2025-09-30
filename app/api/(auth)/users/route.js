import UserController from "@/app/lib/controllers/UserController";
import { NextResponse } from "next/server"

export const GET = async () => {
    return NextResponse.json(await UserController.index());
}

export const POST = async (request) => {
    const userData = await request.json();
    return NextResponse.json(await UserController.store(userData));
}