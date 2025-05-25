import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGODB_URI)
            .then((mongoose) => {
                return mongoose;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDatabase;