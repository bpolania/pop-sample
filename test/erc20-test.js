const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contract } = require("ethers");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");

describe("PoPToken", function () {
  let pop = Contract;
  let owner = SignerWithAddress;
  let address1 = SignerWithAddress;
  let address2 = SignerWithAddress;
  beforeEach(async () => {  
    [owner, address1, address2] = await ethers.getSigners();
    const PoP = await ethers.getContractFactory("contracts/PoPToken.sol:PoPToken");
    pop = await PoP.deploy();
    await pop.deployed();
  });

  it("Should mint to an account", async function () {
    await pop.mint(address1.address, 10);
    expect(await pop.balanceOf(address1.address)).to.eql(ethers.BigNumber.from(10));
  });

  it("Should burn tokens", async function () {
    await pop.mint(address1.address, 10);
    await pop.connect(address1).burn(ethers.BigNumber.from(8));
    expect(await pop.balanceOf(address1.address)).to.eql(ethers.BigNumber.from(2));
  });
});
