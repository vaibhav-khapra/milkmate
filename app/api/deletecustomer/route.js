import { NextResponse } from 'next/server'
import connectToDatabase from '@/app/conn/db'
import Customer from '@/models/Customer'
import Bill from '@/models/Bill'
import Extra from '@/models/Extra'
import Undelivered from '@/models/Undelivered'

export async function DELETE(req) {
    try {
        await connectToDatabase()
        const body = await req.json()
        const { id } = body
        const customer = await Customer.findById(id);
        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
          }
        const customerName = customer.name;

        const deletedbill = await Bill.deleteMany({ customerName });
        const deletedextra = await Extra.deleteMany({ name: customer.name });
        const deletedundel = await Undelivered.deleteMany({ name: customer.name });

       
       
        const deleted = await Customer.findByIdAndDelete(id)

        if (!deleted && !deletedbill && !deletedextra && !deletedundel) {
            return NextResponse.json({ success: false, message: 'Customer not found' })
        }

        return NextResponse.json({ success: true, message: 'Customer deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 })
    }
}
