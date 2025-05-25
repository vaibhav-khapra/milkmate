import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/conn/db';
import Extra from '@/models/Extra';

export async function DELETE(request, { params }) {
    const { id } =await params;

    try {
        await connectToDatabase();
        await Extra.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Sale deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
    }
}
export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        await connectToDatabase();
        const data = await request.json();

        const updatedSale = await Extra.findByIdAndUpdate(id, data, { new: true });

        if (!updatedSale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedSale }, { status: 200 });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
    }
}