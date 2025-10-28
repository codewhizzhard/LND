import dotenv from "dotenv";
import { PinataSDK } from 'pinata';
dotenv.config();
const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
});
export async function uploadJsonToPinata(data) {
    try {
        console.log('Uploading JSON to Pinata...');
        // --- Corrected line ---
        // Use `upload.public.json` instead of `pin.json` for the V3 SDK
        const result = await pinata.upload.public.json(data);
        console.log('Upload successful!');
        console.log('CID:', result.cid);
        return result.cid;
    }
    catch (error) {
        console.error('Error uploading JSON:', error);
        throw new Error('Failed to upload JSON to Pinata.');
    }
}
//st nftStorageKey = process.env.NFT!;
//const pinata =  pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
/* console.log("NFT.Storage Key:", nftStorageKey);

const client = new NFTStorage({ token: nftStorageKey });
console.log("client:", client)
 */
// Usage
//# sourceMappingURL=index.js.map