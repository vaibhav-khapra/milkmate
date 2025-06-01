// /app/api/cron/undelivered/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/app/conn/db";
import PausedCustomer from "@/models/PausedCustomer";
import Undelivered from "@/models/Undelivered";

export async function GET() {
    await connectToDatabase();

    const today = new Date();
    const dateOnly = new Date(today.toISOString().split("T")[0]);
    const paused = await PausedCustomer.find();

    for (const c of paused) {
        const exists = await Undelivered.findOne({
            name: c.name,
            ownerEmail: c.ownerEmail,
            dateNotDelivered: dateOnly,
        });

        if (!exists) {
            await Undelivered.create({
                name: c.name,
                ownerEmail: c.ownerEmail,
                dateNotDelivered: dateOnly,
            });
        }
    }

    return NextResponse.json({ success: true });
}
