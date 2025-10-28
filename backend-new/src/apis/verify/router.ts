import express from "express";
import { verifyEventsOnHedera, verifyFromDB } from "./controller.js";

const verifyRouter = express.Router();


verifyRouter.get("/db/:topicId", verifyFromDB)
verifyRouter.post("/hedera", verifyEventsOnHedera)

export default verifyRouter