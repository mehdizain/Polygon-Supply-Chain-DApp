const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YourName_SupplyChain", function () {
  let contract, owner, distributor, retailer, customer;

  beforeEach(async () => {
    [owner, distributor, retailer, customer] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("YourName_SupplyChain");
    contract = await Contract.deploy();
  });

  it("Should assign Manufacturer role to deployer", async () => {
    expect(await contract.roles(owner.address)).to.equal(1); // Role.Manufacturer
  });

  it("Should register a product", async () => {
    await contract.registerProduct("Widget A", "A test product");
    const p = await contract.getProduct(1);
    expect(p.name).to.equal("Widget A");
    expect(p.status).to.equal(0); // Manufactured
  });

  it("Should transfer through full supply chain", async () => {
    await contract.assignRole(distributor.address, 2);
    await contract.assignRole(retailer.address, 3);
    await contract.assignRole(customer.address, 4);
    await contract.registerProduct("Widget A", "Test");

    await contract.transferToDistributor(1, distributor.address);
    await contract.connect(distributor).transferToRetailer(1, retailer.address);
    await contract.connect(retailer).transferToCustomer(1, customer.address);

    const p = await contract.getProduct(1);
    expect(p.status).to.equal(2); // Delivered
    expect(p.currentOwner).to.equal(customer.address);

    const history = await contract.getHistory(1);
    expect(history.length).to.equal(4);
  });
});