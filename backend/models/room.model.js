// models/Room.js
import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        
    },
    type: { 
        type: String, 
        enum: ["Standard", "Deluxe", "Suite"], 
        required: true 
    },
   
    pricePerNight: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    offerPrice :{
        type: Number,
        default : null
    },
    capacity: { 
        type: Number, 
        required: true, 
        min: 1 
    }, // max guests per room
    beds: { 
        type: Number, 
        required: true, 
        min: 1 
    }, // number of beds
    bedType: { 
        type: String, 
        enum: ["Single", "Double", "Queen", "King"], 
        default: "Double" 
    },
    amenities: [{ type: String }], // e.g. ["WiFi", "AC", "TV", "Mini Bar"]
    description: { 
        type: String, 
        trim: true 
    },
    images: [
        {
            url: { type: String }, 
            public_id: { type: String }, // needed for deletion 
        }, 
    ],
    isAvailable: { 
        type: Boolean, 
        default: true 
    },
}, { timestamps: true });


RoomSchema.virtual("discountPercentage").get(function () {
    if (this.offerPrice && this.offerPrice < this.pricePerNight) {
        const discount = ((this.pricePerNight - this.offerPrice) / this.pricePerNight) * 100;
        return Math.round(discount); // e.g. 33%
    }
    return null;
});

const Room = mongoose.model("Room", RoomSchema);
export default Room;


