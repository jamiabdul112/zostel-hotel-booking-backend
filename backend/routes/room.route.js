// routes/roomRoutes.js
import express from "express";
import  protectRoute  from "../middleware/protectRoute.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
    createRoom,
    updateRoom,
    deleteRoom,
    getRooms,
    getRoomById,
    getRoomsByType
} from "../controllers/room.controllers.js";

const router = express.Router();

// Public routes
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.get("/type/:type", getRoomsByType);

// Admin-only routes
router.post("/", protectRoute, adminOnly, createRoom);
router.patch("/:id", protectRoute, adminOnly, updateRoom);
router.delete("/:id", protectRoute, adminOnly, deleteRoom);

export default router;
