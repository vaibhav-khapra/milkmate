// /api/resumeDelivery (POST)
import connectToDatabase from "@/app/conn/db";
import PausedCustomer from "@/models/PausedCustomer";

export async function POST(req) {
    await connectToDatabase();
    const { name, ownerEmail } = await req.json();

    await PausedCustomer.deleteOne({ name, ownerEmail });
    return NextResponse.json({ success: true });
}
