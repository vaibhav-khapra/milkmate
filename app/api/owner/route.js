import { NextResponse } from "next/server";
import Owner from "@/models/Owner";
import connectToDatabase from "@/app/conn/db";



export async function GET(req) {

    try {
        await connectToDatabase();

       
        const owners = await Owner.find({});

        return NextResponse.json({ success: true, owners });
    } catch (error) {
        console.error("Error fetching owners:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
