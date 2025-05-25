import { NextResponse } from "next/server";
import Extra from "@/models/Extra";
import connectToDatabase from "@/app/conn/db";



export async function POST(req) {

    try {
        await connectToDatabase();

        const { ownerEmail } = await req.json()

        if (!ownerEmail) {
            return NextResponse.json(
                { success: false, message: "ownerEmail is required" },
                { status: 400 }
            );
        }

        const extra = await Extra.find({ ownerEmail });
        

        return NextResponse.json({ success: true, extra });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
