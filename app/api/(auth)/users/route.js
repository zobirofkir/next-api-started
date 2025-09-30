import connect from "@/app/lib/db"
import User from "@/app/lib/models/User";
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        await connect();
        const users = await User.find();
        return NextResponse.json(users);
    } catch (error) {
        return new NextResponse('Error fetching users', { status: 500 });
    }
}