import mongoose from "mongoose";

const undeliveredSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    dateNotDelivered: { type: Date, required: true },
   
   });

export default mongoose.models.undelivered || mongoose.model("undelivered", undeliveredSchema);