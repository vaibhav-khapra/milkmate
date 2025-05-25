import { NextResponse } from 'next/server'
import connectToDatabase from '@/app/conn/db'
import Bill from '@/models/Bill'



export async function POST(req) {
    await connectToDatabase()
    try {
        const { ownerEmail, month, year } = await req.json()

        const bills = await Bill.find({
            ownerEmail,
            month,
            year,
        })

        return NextResponse.json({
            success: true,
            bills,
        })
    } catch (error) {
        console.error('Error fetching settled bills:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        )
    }
}
