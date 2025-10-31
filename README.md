🌍 Business Fabric Infrastructure(BFI)

Track: DLT for Operations 

Pitch Deck: View Here
certificate: 

⚙️ Hedera Integration Summary
 1. Hedera Consensus Service (HCS) — The BFi Truth Engine

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

Transactions Used

AccountCreateTransaction — create Hedera accounts for BFi actors (issuer accounts, business accounts, users account). 
docs.hedera.com

TopicCreateTransaction — create consensus topics for BFi on which messages are logged. 

TopicMessageSubmitTransaction — submit event messages hashed to topics users send them to.



