import Extra from '@/models/Extra'
import connectToDatabase from '@/app/conn/db'

export async function POST(req) {
    await connectToDatabase()

    try {
        const { ownerEmail, month, year } = await req.json()

        if (!ownerEmail) {
            return new Response(
                JSON.stringify({ success: false, message: 'Owner email is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const filter = { ownerEmail }

        if (month !== undefined && year !== undefined) {
            const start = new Date(year, month, 1)
            const end = new Date(year, month + 1, 1)
            filter.date = { $gte: start, $lt: end }
        }

        const extras = await Extra.find(filter).sort({ date: -1 })

        return new Response(
            JSON.stringify({ success: true, extras }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ success: false, message: 'Server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
