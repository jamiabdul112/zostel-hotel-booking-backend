// controllers/roomController.js
import Room from "../models/room.model.js";   // make sure path matches your file
import { v2 as cloudinary } from "cloudinary";

// Admin: create room
export const createRoom = async (req, res) => {
    try {
        const { name, type, pricePerNight, offerPrice, capacity, beds, bedType, amenities, description, images } = req.body;

        let imageData = [];
        if (images) {
            const imgs = Array.isArray(images) ? images : [images];
            for (const img of imgs) {
                const uploadedResponse = await cloudinary.uploader.upload(img, { folder: "rooms" });
                imageData.push({ url: uploadedResponse.secure_url, public_id: uploadedResponse.public_id });
            }
        }

        const room = await Room.create({
            name,
            type,
            pricePerNight,
            offerPrice,
            capacity,
            beds,
            bedType,
            amenities,
            description,
            images: imageData,
        });

        res.status(201).json({
            message: "Room created successfully",
            room: {
                ...room.toObject(),
                discountPercentage: room.discountPercentage,
            },
        });
    } catch (error) {
        console.error("Create room error:", error);
        res.status(500).json({ error: "Failed to create room" });
    }
};

// Admin: update room
export const updateRoom = async (req, res) => {
    try {
        const { imagesToAdd, imagesToDelete, ...updateData } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: "Room not found" });

        // Delete selected images
        if (imagesToDelete && imagesToDelete.length > 0) {
            for (const img of imagesToDelete) {
                await cloudinary.uploader.destroy(img.public_id);
                room.images = room.images.filter((i) => i.public_id !== img.public_id);
            }
        }

        // Add new images
        if (imagesToAdd && imagesToAdd.length > 0) {
            for (const img of imagesToAdd) {
                const uploadedResponse = await cloudinary.uploader.upload(img, { folder: "rooms" });
                room.images.push({ url: uploadedResponse.secure_url, public_id: uploadedResponse.public_id });
            }
        }

        // Update other fields (including offerPrice)
        Object.assign(room, updateData);

        await room.save();
        res.json({
            message: "Room updated successfully",
            room: {
                ...room.toObject(),
                discountPercentage: room.discountPercentage,
            },
        });
    } catch (error) {
        console.error("Update room error:", error);
        res.status(500).json({ error: "Failed to update room" });
    }
};

// Admin: delete room
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: "Room not found" });

        // Clean up images in Cloudinary
        if (room.images && room.images.length > 0) {
            for (const img of room.images) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }

        await room.deleteOne();
        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({ error: "Failed to delete room" });
    }
};

// Public: get all rooms
export const getRooms = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = {};
        if (type) filter.type = type;

        const rooms = await Room.find(filter).sort({ createdAt: -1 });
        const formatted = rooms.map((room) => ({
            ...room.toObject(),
            discountPercentage: room.discountPercentage,
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Get rooms error:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
};

// Public: get room by ID
export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: "Room not found" });

        res.json({
            ...room.toObject(),
            discountPercentage: room.discountPercentage,
        });
    } catch (error) {
        console.error("Get room by ID error:", error);
        res.status(500).json({ error: "Failed to fetch room" });
    }
};

// Public: get rooms by type
export const getRoomsByType = async (req, res) => {
    try {
        const { type } = req.params;
        if (!type) return res.status(400).json({ error: "Room type is required" });

        const rooms = await Room.find({ type });
        if (rooms.length === 0) return res.status(404).json({ error: `No rooms found for type: ${type}` });

        const formatted = rooms.map((room) => ({
            ...room.toObject(),
            discountPercentage: room.discountPercentage,
        }));

        res.json({ count: formatted.length, rooms: formatted });
    } catch (error) {
        console.error("Get rooms by type error:", error);
        res.status(500).json({ error: "Failed to fetch rooms by type" });
    }
};





