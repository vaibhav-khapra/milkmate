import { NextResponse } from "next/server";
import Undelivered from "@/models/Undelivered";
import connectToDatabase from "@/app/conn/db";

export async function POST(req) {
    try {
        await connectToDatabase();

        const { customersToSave } = await req.json();

        if (!Array.isArray(customersToSave)) {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        let savedCount = 0;
        let removedCount = 0;

        for (const customer of customersToSave) {
            const { name, ownerEmail, dateNotDelivered, isDelivered } = customer;

            const exists = await Undelivered.findOne({ name, ownerEmail, dateNotDelivered });

            if (!isDelivered) {
                if (!exists) {
                    const newUndelivered = new Undelivered({ name, ownerEmail, dateNotDelivered });
                    await newUndelivered.save();
                    savedCount++;
                }
            } else {
                if (exists) {
                    await Undelivered.deleteOne({ _id: exists._id });
                    removedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, savedCount, removedCount });
    } catch (error) {
        console.error("Error updating undelivered:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
