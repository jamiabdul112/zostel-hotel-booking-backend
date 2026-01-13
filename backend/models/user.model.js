// models/User.js
import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
       
        minlength: 2 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 
    },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' 
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema)
export default User
