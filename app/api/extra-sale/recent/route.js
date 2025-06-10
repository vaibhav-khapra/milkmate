import { NextResponse } from "next/server";
import Extra from "@/models/Extra";
import connectToDatabase from "@/app/conn/db";

export async function POST(req) {
    try {
        await connectToDatabase();

        const { ownerEmail, month } = await req.json();

        if (!ownerEmail) {
            return NextResponse.json(
                { success: false, message: "ownerEmail is required" },
                { status: 400 }
            );
        }

        // If month is provided, filter by month
        let query = { ownerEmail };

        if (typeof month !== 'undefined' && month !== null) {
            const currentYear = new Date().getFullYear();
            const startDate = new Date(currentYear, month, 1);
            const endDate = new Date(currentYear, month + 1, 0);

            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const extra = await Extra.find(query).sort({ date: -1 }); // Sort by date descending

        return NextResponse.json({ success: true, extra });
    } catch (error) {
        console.error("Error fetching extra sales:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}