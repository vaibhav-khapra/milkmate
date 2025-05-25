import { NextResponse } from 'next/server'
import connectToDatabase from '@/app/conn/db'
import Customer from '@/models/Customer'

export async function DELETE(req) {
    try {
        await connectToDatabase()
        const body = await req.json()
        const { id } = body

        const deleted = await Customer.findByIdAndDelete(id)

        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Customer not found' })
        }

        return NextResponse.json({ success: true, message: 'Customer deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 })
    }
}
