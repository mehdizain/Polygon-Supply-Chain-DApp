# Supply Chain DApp — Polygon Amoy Testnet

A blockchain-based supply chain management system built with Solidity, Hardhat,
and React. Tracks products from Manufacturer → Distributor → Retailer → Customer
with full on-chain audit trails.

**Developer:** Zain Mehdi
**Network:** Polygon Amoy Testnet
**Contract:** ZainMehdi_SupplyChain.sol

---

## What It Does

- Registers products on-chain with a unique ID, name, and description
- Enforces role-based access: only the correct role can perform each transfer
- Records every ownership change permanently as an immutable audit trail
- Provides a React UI for all four roles to interact with the contract
- Displays full product history (from, to, status, timestamp) for any product ID

---

## Prerequisites

- Node.js v18 or higher
- MetaMask browser extension
- A wallet funded with Amoy test MATIC
  - Faucet: https://faucet.polygon.technology (select Amoy)
  - Backup: https://www.alchemy.com/faucets/polygon-amoy

---

## Project Structure
supply-chain-dapp/
├── contracts/
│   └── ZainMehdi_SupplyChain.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── SupplyChain.test.js
├── frontend/
│   └── src/
│       ├── App.js
│       ├── contractConfig.js
│       └── SupplyChain.json        ← copy ABI here after compiling
├── hardhat.config.js
├── .env                            
└── package.json

---

## Setup & Installation

### 1. Clone and install root dependencies

```bash
git clone <your-repo-url>
cd supply-chain-dapp
npm install
```

### 2. Create the .env file
PRIVATE_KEY=your_metamask_private_key_without_0x
POLYGONSCAN_API_KEY=your_polygonscan_api_key

Get your Polygonscan API key free at https://polygonscan.com → My Account → API Keys.

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Compile the Contract

```bash
npx hardhat compile
```

Then copy the ABI to the frontend:

```bash
cp artifacts/contracts/ZainMehdi_SupplyChain.sol/ZainMehdi_SupplyChain.sol.json frontend/src/SupplyChain.json
```

---

## Run Tests

```bash
npx hardhat test
```

Expected output:
ZainMehdi_SupplyChain
✔ Should assign Manufacturer role to deployer
✔ Should register a product
✔ Should transfer through full supply chain
3 passing (1s)

---

## Deploy to Polygon Amoy

```bash
npx hardhat run scripts/deploy.js --network amoy
```

Copy the printed contract address. Then open `frontend/src/contractConfig.js`
and paste it:

```js
export const CONTRACT_ADDRESS = "0xYourDeployedAddressHere";
export const AMOY_CHAIN_ID = "0x13882";
```

---

## Verify Contract (Optional)

```bash
npx hardhat verify --network amoy 0xYourDeployedAddressHere
```

View it at: https://amoy.polygonscan.com

---

## Run the Frontend

```bash
cd frontend
npm start
```

Opens at http://localhost:3000

---

## How to Use the App

### Step 1 — Connect Wallet
Click "Connect MetaMask". The app will switch your MetaMask to Polygon Amoy
automatically. Your address and current role are shown after connecting.

### Step 2 — Assign Roles (Admin/Manufacturer account)
In the "Assign Role" panel, paste a wallet address and select a role
(Distributor, Retailer, or Customer), then click Assign Role.

### Step 3 — Register a Product (Manufacturer)
Enter a product name and description, click Register Product.
A transaction is sent and the product receives a unique on-chain ID.

### Step 4 — Transfer the Product
Each role sees a transfer panel appropriate to their role:
- Manufacturer → Transfer to Distributor
- Distributor → Transfer to Retailer
- Retailer → Transfer to Customer

Enter the Product ID and the recipient's address, then click Transfer.

### Step 5 — Track Any Product
In the "Track Product" panel, enter any Product ID and click Fetch Product.
You will see current owner, status, and the full audit trail of all transfers.

---

## MetaMask Network Settings (Add Amoy Manually)

| Field | Value |
|---|---|
| Network Name | Polygon Amoy Testnet |
| RPC URL | https://rpc-amoy.polygon.technology |
| Chain ID | 80002 |
| Currency Symbol | MATIC |
| Block Explorer | https://amoy.polygonscan.com |

---

## Roles Reference

| Role | ID | Can Do |
|---|---|---|
| Manufacturer | 1 | Register products, transfer to Distributor |
| Distributor | 2 | Transfer to Retailer |
| Retailer | 3 | Transfer to Customer |
| Customer | 4 | Receive products |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.24 |
| Dev Framework | Hardhat 2.22.2 |
| Blockchain | Polygon Amoy Testnet |
| Frontend | React (Create React App) |
| Web3 Library | Ethers.js 6.13.2 |
| Wallet | MetaMask |

---