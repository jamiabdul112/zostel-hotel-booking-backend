// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    roomId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Room", 
        required: true 
    },
    
    adults: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    kids: { 
        type: Number, 
        default: 0, 
        min: 0 
    },
    checkInDate: { 
        type: Date, 
        required: true 
    },
    checkOutDate: { 
        type: Date, 
        required: true 
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Paid"],
        default: "Pending"
    },
    totalPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    receiptUrl: { 
        type: String 
    }, // optional PDF/HTML receipt
    paymentLink: { 
        type: String 
    }, // UPI link generated after approval
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);
export default Order;
