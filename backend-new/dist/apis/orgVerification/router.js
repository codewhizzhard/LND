import express from "express";
import { addWorker, getWorkers, removeWorker, registerIssuerEcdsaAccount, retrieveIssuerEcdsaAccount, getBusinessesByIssuer, getBusiness, getIssuer, saveTransactionId, addCreatorType, getBusinessRumors, getIssuers, requestIssuerTrust, accessIssuerTrust, } from "./controller.js";
const verificationRouter = express.Router();
// ----- add organization -----
verificationRouter.post("/add-creator-type", addCreatorType);
// ----- Issuer Routes -----
verificationRouter.get("/issuer", getIssuer);
// ----- Issuer ECDSA Account -----
verificationRouter.post("/issuer/register-edsca", registerIssuerEcdsaAccount);
verificationRouter.get("/issuer/retrieve-edsca", retrieveIssuerEcdsaAccount);
verificationRouter.get("/issuer/transaction/save", saveTransactionId);
verificationRouter.get("/issuers", getIssuers);
verificationRouter.post("/issuer/access-trust", accessIssuerTrust);
// ----- Business Routes -----
verificationRouter.get("/business", getBusiness); // role query param: worker or business
verificationRouter.get("/issuer/businesses", getBusinessesByIssuer); // get all businesses for an issuer
verificationRouter.post("/rumor/business", getBusinessRumors); // get business rumors
verificationRouter.post("/request-issuer-trust", requestIssuerTrust);
// ----- Worker/Admin Routes -----
verificationRouter.post("/worker/add", addWorker);
verificationRouter.get("/worker/:orgDID", getWorkers); // fetch workers by orgDID
verificationRouter.delete("/worker", removeWorker);
export default verificationRouter;
//# sourceMappingURL=router.js.map