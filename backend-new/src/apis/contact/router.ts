import express from "express";
import { addContact, viewAllContacts } from "./controller.js";

const contactRouter = express.Router();

contactRouter.post("/add-contact", addContact);
contactRouter.get("/get-all-contacts", viewAllContacts);

export default contactRouter;