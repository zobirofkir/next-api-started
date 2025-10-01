import SportController from "@/app/lib/controllers/SportController";
import { NextResponse } from "next/server";
import requireAuth from "@/app/lib/auth/requireAuth.js";

export const GET = async (request) => {
    return requireAuth(request, async () => {
        return NextResponse.json(await SportController.index());
    });
}

export const POST = async (request) => {
    return requireAuth(request, async () => {
        const sportData = await request.json();
        return NextResponse.json(await SportController.store(sportData));
    });
} 
