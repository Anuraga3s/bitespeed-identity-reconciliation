import { Request, Response } from "express";
import { identifyContact } from "../services/identity.service";

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Email or phoneNumber required" });
    }

    const result = await identifyContact(email, phoneNumber);
    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};