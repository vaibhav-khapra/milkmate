import { NextResponse } from "next/server";
import customer from "@/models/Customer";
import connectToDatabase from "@/app/conn/db";

export async function POST(req) {
    try {
        await connectToDatabase();

        const { name, phone, quantity, pricePerLitre,startDate, ownerEmail } = await req.json();

        // Check for existing customer with the same name and ownerEmail
        const existingCustomer = await customer.findOne({ name, ownerEmail });
        if (existingCustomer) {
            return NextResponse.json(
                { success: false, message: "Customer with this name already exists for your account." },
                { status: 400 }
            );
        }

        const newCustomer = new customer({
            name,
            phoneno: phone,
            quantity,
            price: pricePerLitre,
            startDate,
            ownerEmail,
        });

        await newCustomer.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
