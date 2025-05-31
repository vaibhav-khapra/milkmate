import { NextResponse } from 'next/server'
import connectToDatabase from '@/app/conn/db'
import Customer from '@/models/Customer'

export async function PUT(req) {
    try {
        await connectToDatabase()
        const body = await req.json()

        const { _id, name, phoneno, quantity, price, isDelivered } = body

        const updated = await Customer.findByIdAndUpdate(
            _id,
            { name, phoneno, quantity, price, isDelivered },
            { new: true }
        )

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Customer not found' })
        }

        return NextResponse.json({ success: true, customer: updated })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 })
    }
}