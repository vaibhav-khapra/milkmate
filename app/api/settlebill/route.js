import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/conn/db';
import Bill from '@/models/Bill';

export async function POST(req) {
    await connectToDatabase(); // Ensure DB connection inside the function

    try {
        const body = await req.json();
        const { customerName, ownerEmail, month, year, total, paid, remaining } = body;

        const existingBill = await Bill.findOne({ customerName, ownerEmail, month, year });

        if (existingBill) {
            existingBill.total = total
            existingBill.paid = paid;
            existingBill.remaining = existingBill.total - existingBill.paid ;
            await existingBill.save();

            return NextResponse.json({
                success: true,
                message: 'Payment updated successfully',
                data: existingBill
            }, { status: 200 });
        } else {
            const newBill = new Bill({
                customerName,
                ownerEmail,
                month,
                year,
                total,
                paid,
                remaining,
                settledAt: new Date()
            });

            await newBill.save();

            return NextResponse.json({
                success: true,
                message: 'Bill settled successfully',
                data: newBill
            }, { status: 200 });
        }
    } catch (error) {
        console.error('Error settling bill:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}
