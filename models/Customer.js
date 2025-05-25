import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneno: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    ownerEmail: { type: String, required: true },
    isDelivered: { type: Boolean, default: true } 
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);