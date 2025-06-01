// /api/pauseDelivery (POST)
import connectToDatabase from "@/app/conn/db";
import PausedCustomer from "@/models/PausedCustomer";

export async function POST(req) {
    await connectToDatabase();
    const { name, ownerEmail } = await req.json();

    const alreadyPaused = await PausedCustomer.findOne({ name, ownerEmail });
    if (alreadyPaused) return NextResponse.json({ success: false, message: "Already paused" });

    await PausedCustomer.create({ name, ownerEmail, pausedFrom: new Date() });
    return NextResponse.json({ success: true });
}
