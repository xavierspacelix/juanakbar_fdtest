import { Request, Response } from "express";
import { success, error } from "../utils/response";
import * as PasswordService from "../services/password.service";

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const result = await PasswordService.requestPasswordReset(email);
    return res.json(
      success("If the email is registered, a reset link has been sent.", result || null)
    );
  } catch (err: any) {
    return res.status(500).json(error("Failed to process request"));
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { id, token, password } = req.body;
    if (!id || !token || !password) return res.status(400).json(error("Missing parameters"));

    await PasswordService.resetPassword(Number(id), token, password);
    return res.json(success("Password reset successful"));
  } catch (err: any) {
    return res.status(400).json(error(err.message || "Reset failed"));
  }
}
