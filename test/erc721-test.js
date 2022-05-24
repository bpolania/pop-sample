const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Contract } = require("ethers");
const { beforeEach } = require("mocha");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");

describe("PoPNFT", function () {
  let pop = Contract;
  let owner = SignerWithAddress;
  let address1 = SignerWithAddress;
  beforeEach(async () => {  
    [owner, address1] = await ethers.getSigners();
    const PoP = await ethers.getContractFactory("contracts/PoPNFT.sol:NFT");
    pop = await PoP.deploy();
    await pop.deployed();
  });

  it("Should deploy PoP NFT with the right maximum supply", async function () {
    expect(await pop.totalSupply()).to.eql(ethers.BigNumber.from(10));
  });

  it("Should mint PoP NFT with the right baseUri", async function () {
    await pop.mintTo(await owner.address);
    expect(await pop.tokenURI(1)).to.equal("ipfs://QmW38Qb4mUpP5c3fHvm6oNq94dqH3zvkTpdW48ZKgoXRtN1");
  });
});

