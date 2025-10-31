🌍 Business Fabric Infrastructure(BFI)

Track: DLT for Operations 

Pitch Deck: View Here
certificate: 

⚙️ Hedera Integration Summary
1️⃣ 1. Hedera Consensus Service (HCS) — The BFi Truth Engine

💡 Consensus-as-a-Service for Transparent, Immutable Event Logging

🧠 Why We Use HCS

HCS powers BFi’s transparent audit trail — every issuer onboarding, bond lock, product verification, and dispute is hashed and logged immutably.
Each event’s hash is submitted to a consensus topic, giving us fair ordering, timestamps, and tamper-proof of record.
This lets BFi expose fraud/misbehaviour and track data, products with evidence — showing the singular truth centralized trust.
Since BFI will be use in every sector, logging message must be cheap, its $0.0001 fee benefit BFi reaching global users, starting with Africa.

🔁 How It Works

BFi backend captures an event → stores JSON off-chain (mongodb and part on IPFS).

Generates a SHA-256 hash → publishes it to the project’s HCS topic.

Auditors or users can verify any action by matching the hash on-chain with the off-chain record.

⚡ Only hashes are stored — protecting privacy while ensuring data integrity.

Transactions Used:
AccountCreateTransaction — create Hedera accounts for BFi actors (issuer accounts, business accounts, users account). 
docs.hedera.com

TopicCreateTransaction — create consensus topics for BFi on which messages are logged. 

TopicMessageSubmitTransaction — submit event messages hashed to topics users send them to.


💎 2️⃣ Hedera Token Service (HTS) — Trust Badge NFTs

Why HTS?
🟢 Native tokenization, zero contract bloat.
Hedera Token Service lets us mint NFT “Trust Badges” for every issuer that locks a bond — all without deploying ERC-721 contracts.
✅ Cheaper, faster, and secure (built-in KYC + freeze + custom-fee controls).
Perfect for a financial trust layer that processes thousands of micro-interactions.

How BFi uses HTS
1️⃣ Issuer stakes bond → lockBond() on HSCS.
2️⃣ Smart contract confirms → backend mints HTS NFT with issuer DID + content hash.
3️⃣ NFT = Issuer Identity + Proof of Bond.
4️⃣ All token ops (associate | transfer | revoke) handled natively through HTS → lower gas & full auditability via Mirror Node.

Transactions Used:
🧾 TokenCreateTransaction | TokenMintTransaction | TokenAssociateTransaction | TransferTransaction

⚙️ 3️⃣ Hedera Smart Contract Service (HSCS) — Governance & Bond Logic

Why HSCS?
🧠 EVM-compatible contracts for trust logic.
We use HSCS to manage the entire bond lifecycle — lock, redeem, slash, and verifyIssuer — plus role-based governance (issuers, watchers).
This makes BFi fully decentralized without needing a centralized entity that can lie, this is our trusting point, knowin all activities are code triggered.
Every bond flow is deterministic, auditable, and tamper-proof, ensuring that only verified on-chain states trigger HTS mints or HCS logs.

How BFi uses HSCS
1️⃣ Deploy contract via ContractCreateFlow() — stores bytecode & instantiates core logic.
2️⃣ Issuer calls lockBond() → contract escrows funds & emits confirmation.
3️⃣ Backend listens → triggers HTS mint + HCS log for transparency.
4️⃣ Other functions are triggered to keep the trust running

Transactions Used (HSCS)
🧾 ContractCreateFlow() / ContractCreateTransaction — deploy smart contract
⚙️ ContractExecuteTransaction — execute lifecycle functions

🛡️ 4️⃣ Hedera Guardian System — Identity, Policies & DIDs

Why Guardian?
🧩 Decentralized identity & compliance made simple.
Guardian powers our DID issuance, policy workflows, and rule-based verification — all anchored on Hedera.
For BFi, it’s our trust backbone for empowering issuers to verify businesses.
✅ Issuers use Guardian to create verification policies, businesses submit proofs, and Guardian anchors verifiable metadata to Hedera for immutable audits.

How BFi uses Guardian
1️⃣ Issuers = Standard Registries → Create verification Policies via Guardian API/UI.
2️⃣ Businesses → Submit required proofs per issuer policy.
3️⃣ Guardian → Issues/verifies DIDs for all users; we link DID → HTS NFT “Trust Badge.”, even to our users, since all our trust syatem is on guardian, we just default all DID creation on guardian system. The better the get the better the trust on BFi.
4️⃣ HCS Log → Guardian emits verification hash → we log it immutably on Hedera for auditability.
🧠 We used managed Guardian service on testnet for now → self-hosted deployment planned for mainnet for production.

 We use mirror node to get and verify data on hedera,
🔍 Mirror Node TransactionRecordQuery — confirm audit trails


