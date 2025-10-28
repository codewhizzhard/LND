import express from "express";
import twilio from "twilio";
import { whatsappWebhook, verifyWhatsappToken, signup, login } from "./control.js";


const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

const authRouter = express.Router();

authRouter.post("/signup", signup);

// POST /auth/login
authRouter.post("/login", login);


// 👇 every route below now requires JWT auth


// Twilio webhook (incoming WhatsApp messages)
authRouter.post("/whatsapp/webhook", whatsappWebhook);

// Show onboarding page (user visits from WhatsApp link)
authRouter.get("/verify-whatsapp", verifyWhatsappToken);


export default authRouter;