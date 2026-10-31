import { asyncHandler } from "../utils/asyncHandler.js";
import Address from "../models/address.model.js";

// Add new delivery address : POST /api/address/add
export const addAddress = asyncHandler(async (req, res) => {
    const userId = req.userId || req.body.userId;
    const { firstName, lastName, email, street, city, state, zipCode, country, phone, isDefault } = req.body;

    if (!firstName || !lastName || !street || !city || !state || !zipCode || !phone) {
        return res.status(400).json({
            success: false,
            message: "All required address fields must be provided",
        });
    }

    if (isDefault && userId) {
        await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({
        userId,
        firstName,
        lastName,
        email: email || '',
        street,
        city,
        state,
        zipCode,
        country: country || 'India',
        phone,
        isDefault: Boolean(isDefault),
    });

    return res.status(201).json({
        success: true,
        message: "Address saved successfully",
        address,
    });
});

// Get user addresses : GET /api/address/list
export const getUserAddresses = asyncHandler(async (req, res) => {
    const userId = req.userId || req.body.userId;

    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    return res.json({
        success: true,
        addresses,
    });
});

// Delete address : DELETE /api/address/:id
export const deleteAddress = asyncHandler(async (req, res) => {
    const userId = req.userId || req.body.userId;
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, userId });

    if (!address) {
        return res.status(404).json({
            success: false,
            message: "Address not found or unauthorized to delete",
        });
    }

    return res.json({
        success: true,
        message: "Address removed successfully",
    });
});
