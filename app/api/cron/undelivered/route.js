import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/conn/db';
import Customer from '@/models/Customer';
import Undelivered from '@/models/Undelivered';

export async function GET() {
    try {
        await connectToDatabase();

        const customers = await Customer.find({});
        const today = new Date().toISOString().split('T')[0];

        let savedCount = 0;

        for (const customer of customers) {
            if (!customer.isDelivered) {
                const exists = await Undelivered.findOne({
                    name: customer.name,
                    ownerEmail: customer.ownerEmail,
                    dateNotDelivered: today,
                });

                if (!exists) {
                    const newUndelivered = new Undelivered({
                        name: customer.name,
                        ownerEmail: customer.ownerEmail,
                        dateNotDelivered: today,
                    });
                    await newUndelivered.save();
                    savedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, savedCount });
    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ success: false, message: 'Cron job failed' }, { status: 500 });
    }
}
