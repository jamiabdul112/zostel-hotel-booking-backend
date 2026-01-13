// routes/orderRoutes.js
import express from "express";
import  protectRoute  from "../middleware/protectRoute.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    approveOrder,
    rejectOrder,
    payOrder,
} from "../controllers/order.controllers.js";

const router = express.Router();

// User routes
router.post("/", protectRoute, createOrder);
router.get("/my", protectRoute, getMyOrders);
router.get("/:id", protectRoute, getOrderById);
router.patch("/:id/pay", protectRoute, payOrder);

// Admin routes
router.get("/", protectRoute, adminOnly, getAllOrders);
router.patch("/:id/approve", protectRoute, adminOnly, approveOrder);
router.patch("/:id/reject", protectRoute, adminOnly, rejectOrder);

export default router;
