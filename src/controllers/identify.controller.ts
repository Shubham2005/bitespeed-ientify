import { Request, Response } from "express";
import { identifyService } from "../services/identity.service";

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: "email or phoneNumber required",
    });
  }

  try {
    const result = await identifyService(email, phoneNumber);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};