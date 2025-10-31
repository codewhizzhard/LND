# 🌍 **Business Fabric Infrastructure (BFI)**  
### _Track: DLT for Operations_  

bbbbbbbbb 🏗️ **Built with passion and love on Hedera to put decentralization in everyone's hand**  

📜 **Pitch Deck:**  https://docs.google.com/presentation/d/1AD7xC7nwp3sQDHGpkj6QXa_xpRtP_v6AOJPaTGY2yLc/edit?usp=drive_link
🎓 **Certificate:**  https://drive.google.com/file/d/105Kvrm895DoMkPl5XYV8D-wa5F7GV_bi/view?usp=drive_link

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

🚀 Deployment & Setup Instructions (Run Locally on Hedera Testnet)

🧠 Goal:
Judges and developers should be able to clone, configure, and run BFi locally on Hedera Testnet in under 10 minutes.

🧩 Step 1 — Clone the Repository

Run the following in your terminal:

git clone https://github.com/yourusername/bfi-hedera.git

cd bfi-hedera

⚙️ Step 2 — Setup Environment Variables

Create an environment file from the provided template:

Copy: .env.example → .env

Fill in your details (Hedera Testnet account, keys, and contract IDs)

Example .env variables:

HEDERA_ACCOUNT_ID=0.0.xxxxxx  
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1  

CONTRACT_ID=0.0.xxxxxx  
TOKEN_ID=0.0.xxxxxx  
TOPIC_ID=0.0.xxxxxx  

PORT=5000  
FRONTEND_PORT=5173  
ALT_FRONTEND_PORT=5174  


⚠️ Security Tip: Never commit .env files or private keys.
Always use Hedera Testnet credentials when testing.

🖥️ Step 3 — Backend Setup (Node.js)

Inside the project folder:

cd backend-new

npm install

npm run build

npm run start

✅ This will install dependencies, build the backend, and start it on http://localhost:5000.

💻 Step 4 — Frontend Setup (React + Vite)

In a new terminal:

cd frontend

npm install

npm run dev → app starts on http://localhost:5173

Then open a second terminal and run again with a new port to bypass CORS:

PORT=5174 npm run dev → app runs on http://localhost:5174

💡 Why two ports?
Some wallet callbacks and proxy requests can trigger CORS restrictions.
Running two instances locally (5173 & 5174) allows smooth cross-origin testing.

⚡ Step 5 — Use the SDK (Optional Frontend-Only Mode)

If you want to skip the backend entirely, install the official BFi SDK:

npm i @codewhizzhard/lnd-sdk

////


🌍 Step 6 — Local Running Overview
Service	Port	Description
Backend	5000	Hedera SDK integration & API server
Frontend (Main)	5173	Main application UI
Frontend (Alt)**	5174	CORS bypass during local dev

After setup, open both frontend URLs and test:

Lock bond → verify issuer

View topic messages

Track badge mints on Hedera Mirror Node

🔍 Step 7 — Verify Hedera Activity

To confirm transactions:

Visit Hashscan Testnet

Search by your CONTRACT_ID, TOKEN_ID, or TOPIC_ID

You’ll see your TokenMintTransaction, TopicMessageSubmitTransaction, etc.

Or fetch topic messages directly:

https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?limit=10

🧰 Step 8 — Troubleshooting
Issue	Cause	Fix
.env not found	Missing configuration	Copy .env.example → .env
Port already in use	Port conflict	Stop previous process or change port
CORS error	Browser restrictions	Use the second frontend on port 5174
No transactions showing	Mirror Node delay	Wait a few seconds or check account key


## 🏗️ **Architecture Overview**

Below is the full system architecture of **BFi — Built on Hedera**, showing how our Frontend, Backend, and Hedera services communicate in real time for trust, traceability, and transaction flow.

                          ┌──────────────────────────────────────┐
                          │        🖥️  Frontend (React)          │
                          │ UI + Wallet (HashPack) + Managed Guardian UI │
                          └───────────────┬──────────────────────┘
                                          │
                                          │ REST / SDK Calls
                                          ▼
                          ┌──────────────────────────────────────┐
                          │     ⚙️ Backend (Express.js API)       │
                          │  - HCS Message Logging               │
                          │  - HSCS Contract Calls               │
                          │  - HTS NFT Minting                   │
                          │  - Guardian API Relay                │
                          │  (via Hedera SDK)                    │
                          └───────────────┬──────────────────────┘
                                          │
                                          │
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │              ☄️ Hedera Network              │
                    │ ┌──────────────┬──────────────┬──────────┐ │
                    │ │ 🧾 HCS        │ 💎 HTS        │ ⚖️ HSCS   │ │
                    │ │ Logs Hashes  │ Mint NFTs    │ Bonds SC │ │
                    │ └──────────────┴──────────────┴──────────┘ │
                    │                                            │
                    │ 🔍 Mirror Node — Query Transaction Records  │
                    │                                            │
                    │ 🛡️ Guardian System — DIDs + Policy Engine   │
                    │  (Identity, Verification, Compliance)       │
                    └──────────────┬──────────────────────────────┘
                                   │
                                   │ Verified Events / Data Hashes
                                   ▼
                          ┌──────────────────────────────────────┐
                          │ 🔄 Frontend (React) Re-renders UI     │
                          │  │
                          └──────────────────────────────────────┘


## 🌐 Deployed Hedera IDs (Testnet)

These are the key Hedera network resources powering **BFi (Bonded Financial Integrity)** on the **Hedera Testnet**.  
Each ID represents a core part of our architecture — from smart contracts and tokenized bonds to consensus message topics and backend verifiers.

| 🔹 **Component** | 💡 **Purpose** | 🧩 **Hedera ID** | 📝 **Details** |
|:------------------|:----------------|:------------------|:----------------|
| 👤 **Backend Client Account** | Main operational account for backend signing and message submission | `0.0.6747561` | Executes SDK operations, logs messages, and interacts with Hedera APIs. |
| 🧾 **Previous ECDSA Account** | Early testing account (deprecated in favor of ED25519) | `0.0.6652307` | Legacy setup — now all keys use **ED25519** for higher performance. |
| 💰 **Token ID (HTS)** | Represents bonded trust tokens within BFi | `0.0.7098444` | Enables tokenized trust and bonding mechanisms across issuers. |
| 📦 **File ID (HFS)** | Stores deployed contract bytecode on Hedera File Service | `0.0.7110459` | The on-chain bytecode file used to deploy the HSCS smart contract. |
| ⚙️ **Contract ID (HSCS)** | Core smart contract handling bonding and issuer verification | `0.0.7110461` | Manages bond logic, event triggers, and verification actions. |
| 🗣️ **HCS Topics** | Event logs and hash records (Consensus Service) | *Dynamic per event* | Each new event creates a **unique Topic ID** visible in the dashboard. |

---

### 🧭 How Topics Work

Each **HCS Topic** can store multiple messages (events).  
When a new event is created instead of updating an existing topic, a **new Topic ID** is automatically generated.  
This design ensures every issuer or verification stream remains **independently auditable** on the Hedera Mirror Node.

---

### 🔍 View Messages & Topics

You can view and verify all messages tied to your Topics directly from the **BFi Dashboard**, including:

✅ Hash logs of transactions  
🔗 Policy and issuer verification events  
🧾 On-chain and off-chain consistency proofs
