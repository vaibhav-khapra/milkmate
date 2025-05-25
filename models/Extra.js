import mongoose from "mongoose";

const extraSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, required: true }, 
});
  

export default mongoose.models.extra || mongoose.model("extra", extraSchema);