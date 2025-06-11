import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/conn/db';
import Owner from '@/models/Owner';

export async function DELETE(req) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { email } = body; // FIX: Match the frontend key

        const deleteResult = await Owner.deleteOne({ email });

        if (deleteResult.deletedCount === 0) {
            return NextResponse.json({ success: false, message: 'Owner not found' });
        }

        return NextResponse.json({ success: true, message: 'Owner deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
    }
}
