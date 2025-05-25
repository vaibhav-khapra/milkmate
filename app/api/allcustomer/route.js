import { NextResponse } from "next/server";
import customer from "@/models/Customer";
import connectToDatabase from "@/app/conn/db";
import Undelivered from "@/models/Undelivered";


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

        const customers = await customer.find({ ownerEmail });
        const undelivered = await Undelivered.find({ ownerEmail });

        return NextResponse.json({ success: true, customers , undelivered });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
