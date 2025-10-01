import UserController from "@/app/lib/controllers/UserController";
import { NextResponse } from "next/server";
import requireAuth from "@/app/lib/auth/requireAuth.js";

export const GET = async (request, { params }) => {
    return requireAuth(request, async () => {
        return NextResponse.json(await UserController.show(params.id));
    });
}

export const PUT = async (request, { params }) => {
    return requireAuth(request, async () => {
        const userData = await request.json();
        return NextResponse.json(await UserController.update(params.id, userData));
    });
}

export const DELETE = async (request , {params}) => {
    return requireAuth(request, async () => {
        return NextResponse.json(await UserController.delete(params.id));
    });
}