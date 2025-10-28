import express from "express";
import { getUserAssets, getUserEvents, handleCreateAsset, handleNonScheduleTransaction, prepareNonScheduleTopicTransaction } from "./contoller.js";

const eventRouter = express.Router();

eventRouter.post("/prepare", prepareNonScheduleTopicTransaction);

// POST /auth/login
eventRouter.post("/handle", handleNonScheduleTransaction);
eventRouter.post("/create-asset", handleCreateAsset)
eventRouter.get("/events", getUserEvents)
eventRouter.get("/assets", getUserAssets)




export default eventRouter;