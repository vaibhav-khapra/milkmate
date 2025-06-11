// app/api/admin/login/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { email, password } = await request.json();

    const ADMIN_ID = process.env.ADMIN_ID;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    if (!ADMIN_ID || !ADMIN_PASS) {
        console.error("Admin credentials not set in environment variables.");
        return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    if (email === ADMIN_ID && password === ADMIN_PASS) {
        // In a real application, you'd generate a token (e.g., JWT) here
        // and send it back to the client. For this example, we'll just send a success.
        return NextResponse.json({ message: "Login successful!" }, { status: 200 });
    } else {
        return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }
}