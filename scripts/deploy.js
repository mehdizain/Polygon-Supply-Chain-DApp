const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying YourName_SupplyChain...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Contract = await ethers.getContractFactory("YourName_SupplyChain");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
  console.log("Save this address for your frontend!");
}

main().catch((err) => { console.error(err); process.exit(1); });