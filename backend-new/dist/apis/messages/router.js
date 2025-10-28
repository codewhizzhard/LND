import express from "express";
import { getAllMessages } from "./controller.js";
const messageRouter = express.Router();
messageRouter.get("/get-all-messages", getAllMessages);
export default messageRouter;
//# sourceMappingURL=router.js.map