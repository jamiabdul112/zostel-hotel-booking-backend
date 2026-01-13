// controllers/orderController.js

import Order from "../models/order.model.js";
import Room from "../models/room.model.js";
import { generateAndUploadReceipt } from "../utils/generateReceipt.js";

// Helper: calculate nights between two dates
const nightsBetween = (checkInDate, checkOutDate) => {
    const ms = new Date(checkOutDate) - new Date(checkInDate);
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// User: create order
export const createOrder = async (req, res) => {
    try {
        const { roomId, adults, kids, checkInDate, checkOutDate } = req.body;

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ error: "Room not found" });

        // Validate capacity (single room only)
        const totalGuests = adults + (kids || 0);
        if (totalGuests > room.capacity) {
            return res.status(400).json({ error: "Guest count exceeds room capacity" });
        }

        // Calculate nights
        const nights = nightsBetween(checkInDate, checkOutDate);

        // Use offerPrice if available, else pricePerNight
        const pricePerNight = room.offerPrice && room.offerPrice < room.pricePerNight
            ? room.offerPrice
            : room.pricePerNight;

        const totalPrice = pricePerNight * nights;

        const order = await Order.create({
            userId: req.user._id,
            roomId,
            adults,
            kids,
            checkInDate,
            checkOutDate,
            totalPrice,
            status: "Pending",
        });

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ error: "Failed to place order" });
    }
};

// User: get own orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate("roomId", "name type pricePerNight offerPrice");
        res.json(orders);
    } catch (error) {
        console.error("Get my orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// User/Admin: get order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("roomId", "name type pricePerNight offerPrice images")
            .populate("userId", "name email role");

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only owner or admin can view
        if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        res.json(order);
    } catch (error) {
        console.error("Get order by ID error:", error);
        res.status(500).json({ error: "Failed to fetch order" });
    }
};

// Admin: get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("roomId", "name type pricePerNight offerPrice")
            .populate("userId", "name email role");
        res.json(orders);
    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// Admin: approve order → generate UPI link
export const approveOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("roomId");
        if (!order) return res.status(404).json({ error: "Order not found" });

        order.status = "Approved";
        order.paymentLink = `upi://pay?pa=hotel@upi&am=${order.totalPrice}&tn=RoomBooking`;

        await order.save();

        res.json({ message: "Order approved, payment link generated", order });
    } catch (error) {
        console.error("Approve order error:", error);
        res.status(500).json({ error: "Failed to approve order" });
    }
};

// Admin: reject order
export const rejectOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: "Rejected" }, { new: true });
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json({ message: "Order rejected", order });
    } catch (error) {
        console.error("Reject order error:", error);
        res.status(500).json({ error: "Failed to reject order" });
    }
};

// User: pay order → mark as Paid + generate receipt
export const payOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("roomId userId");
        if (!order) return res.status(404).json({ error: "Order not found" });

        if (order.status === "Paid") {
            return res.status(200).json({ message: "Already paid", order });
        }

        if (order.status !== "Approved") {
            return res.status(400).json({ error: "Order not approved" });
        }

        // 1. Update Status
        order.status = "Paid";

        // 2. Generate and Upload actual PDF to Cloudinary
        const cloudinaryUrl = await generateAndUploadReceipt(order);
        order.receiptUrl = cloudinaryUrl;

        await order.save();

        res.json({ message: "Payment successful, receipt uploaded", order });
    } catch (error) {
        console.error("Payment error:", error);
        res.status(500).json({ error: "Failed to process payment/receipt" });
    }
};