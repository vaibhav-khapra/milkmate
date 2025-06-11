import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

export default mongoose.models.owner || mongoose.model("owner", ownerSchema);
