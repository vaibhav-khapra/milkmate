import { NextResponse } from "next/server";
import Owner from "@/models/Owner";
import connectToDatabase from "@/app/conn/db";

export async function GET(req) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const ownertofind = url.searchParams.get("owner");
     

        if (!ownertofind) {
            return NextResponse.json(
                { success: false, message: "Missing owner parameter" },
                { status: 400 }
            );
        }

        const owner = await Owner.findOne({ email: ownertofind });

        if (!owner) {
            return NextResponse.json(
                { success: false, message: "Owner not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, owners: owner });
    } catch (error) {
        console.error("Error fetching owners:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
