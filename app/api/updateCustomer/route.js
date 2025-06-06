import { NextResponse } from 'next/server'
import connectToDatabase from '@/app/conn/db'
import Customer from '@/models/Customer'

export async function PUT(req) {
    try {
        await connectToDatabase()
        const body = await req.json()

        const { _id, name, phoneno, quantity, price, isDelivered } = body
        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (phoneno !== undefined) updateData.phoneno = phoneno
        if (quantity !== undefined) updateData.quantity = quantity
        if (price !== undefined) updateData.price = price
        if (isDelivered !== undefined) updateData.isDelivered = isDelivered

        const updated = await Customer.findByIdAndUpdate(
            _id,
            updateData,
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