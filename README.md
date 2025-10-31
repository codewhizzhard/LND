# 🌍 **Business Fabric Infrastructure (BFI)**  
### _Track: DLT for Operations_  

bbbbbbbbb 🏗️ **Built with passion and love on Hedera to put decentralization in everyone's hand**  

📜 **Pitch Deck:** [View Here](#)  
🎓 **Certificate:** _Pending_  

---

## ⚙️ **Hedera Integration Summary**

---

### 1️⃣ **Hedera Consensus Service (HCS) — The BFi Truth Engine**

💡 **Consensus-as-a-Service for Transparent, Immutable Event Logging**

#### 🧠 Why We Use HCS  
HCS powers **BFi’s transparent audit trail** — every issuer onboarding, bond lock, product verification, and dispute is **hashed and logged immutably**.  
Each event’s hash is submitted to a consensus topic, giving **fair ordering, timestamps, and a tamper-proof record**.  

This ensures BFi can **expose fraud, trace products, and maintain transparent accountability** — a decentralized truth layer for all sectors.  
Since BFi operates across multiple industries, **logging must remain affordable** — Hedera’s **$0.0001 fee** allows **global scale starting with Africa.**

#### 🔁 How It Works  
1. **Backend captures an event** → stores JSON off-chain (MongoDB + partial IPFS).  
2. **Generates SHA-256 hash** → publishes to HCS topic.  
3. **Auditors/users verify** by matching on-chain hash with off-chain data.  
4. ⚡ Only hashes are stored — ensuring **privacy + integrity**.

#### 🧾 Transactions Used  
- `AccountCreateTransaction` — create Hedera accounts for BFi actors (issuers, businesses, users).  
- `TopicCreateTransaction` — create consensus topics for BFi message logging.  
- `TopicMessageSubmitTransaction` — submit event messages (hashed JSON).  

📚 [docs.hedera.com](https://docs.hedera.com)

---

### 💎 2️⃣ **Hedera Token Service (HTS) — Trust Badge NFTs**

#### 🟢 Why HTS?  
**Native tokenization, zero contract bloat.**  
HTS lets BFi **mint NFT “Trust Badges”** for every issuer that locks a bond — no need for ERC-721 contracts.  

✅ Cheaper, faster, and secure (with **built-in KYC, freeze, and custom-fee controls**).  
Perfect for a **financial trust layer** processing **thousands of micro-interactions** daily.  

#### 🔁 How BFi Uses HTS  
1. **Issuer stakes bond** → calls `lockBond()` on HSCS.  
2. **Smart contract confirms** → backend mints **HTS NFT** (includes issuer DID + content hash).  
3. **NFT** = _Issuer Identity + Proof of Bond_.  
4. **All token operations** (`associate`, `transfer`, `revoke`) are handled via HTS → **low gas, full auditability via Mirror Node.**

#### 🧾 Transactions Used  
- `TokenCreateTransaction`  
- `TokenMintTransaction`  
- `TokenAssociateTransaction`  
- `TransferTransaction`

📚 [docs.hedera.com](https://docs.hedera.com)

---

### ⚙️ 3️⃣ **Hedera Smart Contract Service (HSCS) — Governance & Bond Logic**

#### 🧠 Why HSCS?  
HSCS provides **EVM-compatible contracts for trust governance and lifecycle logic**.  
We use it to manage **bond lifecycles** (lock, redeem, slash, verifyIssuer) and **role-based governance** (issuers, watchers).  

This ensures **BFi is fully decentralized** — no central authority can manipulate trust.  
Every operation is **deterministic, auditable, and tamper-proof**, and only valid on-chain states trigger **HTS mints or HCS logs**.  

#### 🔁 How BFi Uses HSCS  
1. Deploy contract via `ContractCreateFlow()` — stores bytecode & instantiates logic.  
2. Issuer calls `lockBond()` → contract escrows funds & emits event.  
3. Backend listens → triggers HTS mint + HCS log for transparency.  
4. Other functions execute automatically to maintain continuous trust.  

#### 🧾 Transactions Used  
- `ContractCreateFlow()` / `ContractCreateTransaction` — deploy smart contract  
- `ContractExecuteTransaction` — execute lifecycle functions  

📚 [docs.hedera.com](https://docs.hedera.com)

---

### 🛡️ 4️⃣ **Hedera Guardian System — Identity, Policies & DIDs**

#### 🧩 Why Guardian?  
Guardian delivers **decentralized identity and compliance workflows** built on Hedera.  
It powers **DID issuance**, **policy enforcement**, and **rule-based verification** — forming BFi’s **trust backbone**.  

Issuers verify businesses using Guardian’s policy engine — making all trust proofs **verifiable, auditable, and immutable** on-chain.  

✅ BFi uses Guardian to:  
- Issue and manage **DIDs for issuers, businesses, and users**  
- Enforce **issuer-created policies** for compliance and document verification  
- Anchor **proof metadata** to Hedera Consensus for global auditability  

#### 🔁 How BFi Uses Guardian  
1. **Issuers (Standard Registries)** → create verification policies via Guardian UI/API.  
2. **Businesses** → submit proofs per issuer policy.  
3. **Guardian** → issues/verifies DIDs for all users; we link each **DID → HTS NFT “Trust Badge.”**  
   - Our trust system defaults all DID creation on Guardian — stronger Guardian = stronger BFi trust.  
4. **HCS Log** → Guardian emits verification hash → we log immutably on Hedera for audit.  
5. 🧠 Using **managed Guardian service** on testnet → **self-hosted deployment planned** for mainnet.

#### 🔍 Mirror Node Integration  
We use **Mirror Node TransactionRecordQuery** to **verify data and audit trails** from Hedera in real time.

📚 [docs.hedera.com](https://docs.hedera.com)

---

🧠 **BFi leverages all Hedera services in unison — HCS for truth, HTS for trust, HSCS for governance, and Guardian for identity — creating a unified Trust Fabric for the global economy.**


## 💸 **Economic Justification — Why We Built BFi on Hedera**

> _“For blockchain to truly serve the people, it must first serve their reality.”_  
> — The BFi Team

---

### ⚙️ **Low, Predictable Fees = True Financial Inclusion**
Hedera’s **ultra-low and predictable fees (~$0.0001/transaction)** make it the only network economically viable for Africa’s high-volume, low-margin economy.  
- 💰 **10,000 transactions cost just $1.**  
- 🚀 This allows users to **chat, trade, verify, and manage data** at virtually zero cost.  
- Whether a user is **buying clothes**, **selling cocoa**, **tracking medicines**, or **granting a doctor data access** — every interaction is powered by **Hedera microtransactions**, not gas anxiety.

For the first time, **blockchain becomes accessible to every African**, not just the crypto elite.

---

### ⚡ **High Throughput = Real-World Scale**
BFi is a **Trust Layer for Global Commerce**, where **2.71 billion people** buy and sell online daily.  
No other decentralized platform can handle this volume — but **Hedera can**.

- ⚡ **10,000+ TPS** and **sub-5 second finality**  
- 🔗 Enables seamless onboarding of merchants, buyers, and regulators  
- 🔍 Trust updates, verification proofs, and digital identities all processed instantly  

With **Hedera’s throughput**, BFi can finally **match real-world transaction velocity** — powering the next era of trusted digital trade.

---

### 🔒 **ABFT Finality = Immutable Confidence**
Hedera’s **Asynchronous Byzantine Fault Tolerance (ABFT)** provides **the highest level of security and consistency** available in any distributed ledger.  
- ✅ Every trust event — from policy verification to transaction approval — is **final and irreversible**.  
- 🛡️ Users and businesses can **trust the state of BFi** within seconds, not minutes.  
- 🌍 This makes cross-border commerce and compliance verification seamless across Africa’s complex financial landscape.

---

### 🌍 **Hedera + BFi = Economic Empowerment**
BFi amplifies Hedera’s strengths — turning **low fees, high throughput, and ABFT trust** into a **continent-scale digital backbone** for honest commerce.  

| Power | What It Enables in BFi |
|:------|:------------------------|
| 💸 Low Fees | Microtransactions & chat-based payments |
| ⚡ High Throughput | Real-time global trust scoring |
| 🔒 ABFT Security | Tamper-proof verification records |
| 🧩 Guardian Integration | DID-based policy enforcement |

> 💬 **BFi unleashes Hedera’s full potential — enabling every African to trade, verify, and trust effortlessly.**  
> Together, we’re not just building on Hedera...  
> **We’re redefining global commerce through Hedera.**

---

## 🚀 Deployment & Setup Instructions (Run locally on Hedera Testnet)

## 🚀 Deployment & Setup Instructions (Run Locally on Hedera Testnet)

> 🧠 **Goal:** Judges and developers should be able to clone, configure, and run the BFi project locally on **Hedera Testnet** in under **10 minutes**.

---

### 🧩 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bfi-hedera.git
cd bfi-hedera
⚙️ 2. Setup Environment Variables
Create an .env file from the provided template:

bash
Copy code
cp .env.example .env
.env.example

text
Copy code
# --- Hedera Configuration ---
HEDERA_ACCOUNT_ID=0.0.xxxxxx
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1

# --- Deployed Testnet IDs (replace with your actual ones) ---
CONTRACT_ID=0.0.xxxxxx
TOKEN_ID=0.0.xxxxxx
TOPIC_ID=0.0.xxxxxx

# --- App Configuration ---
PORT=5000
FRONTEND_PORT=5173
ALT_FRONTEND_PORT=5174
⚠️ Security Tip: Never commit your .env file or private keys.
Use only Hedera Testnet credentials when testing.

🖥️ 3. Backend Setup (Node.js)
Open a new terminal and run:

bash
Copy code
cd backend-new
npm install
npm run build
npm run start
This will:

📦 Install all backend dependencies

⚙️ Build backend for production

🚀 Start the backend at http://localhost:5000

💻 4. Frontend Setup (React + Vite)
Now in another terminal:

bash
Copy code
cd frontend
npm install
npm run dev
# runs at http://localhost:5173
Open a second terminal (or tab) and run again to bypass CORS for local testing:

bash
Copy code
cd frontend
PORT=5174 npm run dev
# runs at http://localhost:5174
💡 Why two ports?

Some wallet callbacks and proxy requests trigger CORS blocks in local dev mode.
Running the frontend on two ports (5173 & 5174) allows cross-origin interactions easily during demos.

⚡ 5. Use the SDK (Frontend-Only Option)
If you want to skip running the backend and call Hedera functions directly from the UI, install the BFi SDK:

bash
Copy code
npm i @codewhizzhard/lnd-sdk
Example usage:

js
Copy code
import { lockBond, getTopicMessages, mintBadge } from '@codewhizzhard/lnd-sdk';

// Lock a bond
await lockBond({ issuerAccountId: '0.0.x', amount: '10' });

// Read topic messages
const messages = await getTopicMessages(process.env.TOPIC_ID);

// Mint an issuer badge
await mintBadge({ issuerAccount: '0.0.x', metadataHash: 'Qm...' });
🧩 This SDK is for demo and quick testing — the full backend version includes verification and persistence logic.

🌍 6. Local Running Overview
Service	Port	Description
Backend	http://localhost:5000	Handles Hedera SDK interactions & APIs
Frontend (Main)	http://localhost:5173	Main app interface
Frontend (Alt)	http://localhost:5174	CORS-bypass for local development

Open both frontend URLs and test key flows:

Issuer lock bond

Verify transaction on Hedera Mirror Node

View topic messages and badges

🔍 7. Verify Hedera Activity (Mirror Node)
Check topic messages:

bash
Copy code
curl "https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?limit=10"
Check transactions:

Visit: https://hashscan.io/testnet

Search your CONTRACT_ID, TOKEN_ID, or TOPIC_ID

You’ll see TokenMintTransaction, TopicMessageSubmitTransaction, etc., confirming the on-chain activity

🧰 8. Troubleshooting & Common Issues
Issue	Cause	Solution
❌ .env not found	Missing config	Copy .env.example → .env and fill details
⚠️ Port already in use	Dev ports busy	Change port numbers or kill old processes
🔒 CORS errors	Browser blocked requests	Use the 5174 alt frontend or set up proxy
🕓 No transactions in mirror node	Delay in sync	Wait 5–10s or verify your account ID/private key

