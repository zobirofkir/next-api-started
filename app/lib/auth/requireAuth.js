import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/app/lib/models/User.js';
import connect from '@/app/lib/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function requireAuth(request, handler) {
    try {
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!JWT_SECRET) {
            return NextResponse.json({ error: 'Server misconfiguration: missing JWT_SECRET' }, { status: 500 });
        }

        const token = authHeader.substring('Bearer '.length).trim();
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        await connect();
        const user = await User.findById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        return await handler(user);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


