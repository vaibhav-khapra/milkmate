import mongoose from 'mongoose'

const BillSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    ownerEmail: {
        type: String,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 0,
        max: 11
    },
    year: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    paid: {
        type: Number,
        required: true,
        min: 0
    },
    remaining: {
        type: Number,
        required: true,
        min: 0
    },
    settledAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema)