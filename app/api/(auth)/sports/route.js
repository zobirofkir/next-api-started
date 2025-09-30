import SportController from "@/app/lib/controllers/SportController";
import { NextResponse } from "next/server";

export const GET = async () => {
    return NextResponse.json(await SportController.index());
}
