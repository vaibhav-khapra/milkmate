import { NextResponse } from "next/server";
import Extra from "@/models/Extra";
import connectToDatabase from "@/app/conn/db";

export async function POST(req) {
    try {
        await connectToDatabase();

        const { name, quantity, date, ownerEmail } = await req.json();

       



       
          
        const newExtra = new Extra({ name, quantity, date, ownerEmail });
                    await newExtra.save();
             

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating undelivered:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
