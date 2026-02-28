"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identify = void 0;
const identity_service_1 = require("../services/identity.service");
const identify = async (req, res) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res.status(400).json({
            error: "email or phoneNumber required",
        });
    }
    try {
        const result = await (0, identity_service_1.identifyService)(email, phoneNumber);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "internal server error" });
    }
};
exports.identify = identify;
