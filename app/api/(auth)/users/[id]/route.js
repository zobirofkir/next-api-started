import UserController from "@/app/lib/controllers/UserController";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
    return NextResponse.json(await UserController.show(params.id));
}

export const PUT = async (request, { params }) => {
    const userData = await request.json();
    return NextResponse.json(await UserController.update(params.id, userData));
}