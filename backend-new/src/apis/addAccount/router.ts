import express from "express";
import { addExistingCreator, addNewAccountToCreator } from "./controller.js";

const accountRouter = express.Router();

accountRouter.post("/add-account", addNewAccountToCreator)
accountRouter.post("/add-existing-account", addExistingCreator)

export default accountRouter;