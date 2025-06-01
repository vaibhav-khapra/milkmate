// models/PausedCustomer.js
import mongoose from "mongoose";

const pausedCustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    pausedFrom: { type: Date, required: true },
});

export default mongoose.models.PausedCustomer || mongoose.model("PausedCustomer", pausedCustomerSchema);
