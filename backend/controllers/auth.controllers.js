import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js"
import User from "../models/user.model.js"


export const signup = async (req, res) => {
    try {
        console.log("Signup body:", req.body); // Debug

        const { name, email, password } = req.body;

        // ✅ Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ✅ Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // ✅ Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "user", // default user
        });

        await newUser.save(); // save first

        // ✅ Generate token
        const token = generateToken(newUser._id, res);

        // ✅ Response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }
            
        });
    } catch (error) {
        console.error("Signup controller error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" });
        }

        // ✅ Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // ✅ Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // ✅ Generate JWT token
        const token = generateToken(user._id, res);

        // ✅ Response
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error("Login controller error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const logout = async (req, res) => {
  try {
    // Match the same settings used when creating the cookie
    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true 
    });
    res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    console.error(`Logout controller error, ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
}



export const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).select("-password")
        res.status(200).json(user)
    } catch (error) {
        console.error(`getMe controler error, ${error}`)
        res.status(500).json({ message: "Internal server" })
    }
}
