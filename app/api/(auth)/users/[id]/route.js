import UserController from "@/app/lib/controllers/UserController";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
    return NextResponse.json(await UserController.show(params.id));
}