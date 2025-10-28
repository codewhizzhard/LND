import express from "express";
import { verifyEventsOnHedera, verifyFromDB } from "./controller.js";
import { optionalAuthMiddleware } from "./optionalAuth.js";
const verifyRouter = express.Router();
verifyRouter.get("/db/:topicId", optionalAuthMiddleware, verifyFromDB);
verifyRouter.post("/hedera", verifyEventsOnHedera);
export default verifyRouter;
//# sourceMappingURL=router.js.map