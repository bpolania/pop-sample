const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { beforeEach } = require("mocha");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");

describe("NFsTaker Basic", function () {
  let owner = SignerWithAddress;
  let address1 = SignerWithAddress;
  beforeEach(async () => {  
    [owner, address1] = await ethers.getSigners();
    const NFsTaker = await ethers.getContractFactory("contracts/NFsTaker.sol:NFsTaker");
    nfstaker = await upgrades.deployProxy(NFsTaker, { initializer: 'initialize' });
  });

  it("Should deploy the contract with the right ERC20 address", async function () {
    await nfstaker.setPopToken("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506");
    expect(await nfstaker.tokenAddress()).to.equal("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506");
  });

  it("Should not have owner as operator", async function () {
    expect(await nfstaker.isOperator(owner.address)).to.equal(false);
  });

  it("Should have owner as operator", async function () {
    await nfstaker.connect(owner).setOperatorRole(owner.address);
    expect(await nfstaker.isOperator(owner.address)).to.equal(true);
  });
});

describe("NFsTaker with NFT", function () {
  let owner = SignerWithAddress;
  let address1 = SignerWithAddress;
  beforeEach(async () => {  
    [owner, address1] = await ethers.getSigners();
    const NFsTaker = await ethers.getContractFactory("contracts/NFsTaker.sol:NFsTaker");
    nfstaker = await upgrades.deployProxy(NFsTaker, { initializer: 'initialize' });
    const PoP = await ethers.getContractFactory("contracts/PoPNFT.sol:NFT");
    pop = await PoP.deploy();
    await pop.deployed();
  });

  it("Should add NFT", async function () {
    await nfstaker.connect(owner).setOperatorRole(owner.address);
    await nfstaker.addNFT(pop.address, ethers.BigNumber.from(10));
    const addresses = await nfstaker.getNftsAdressesList();
    expect(await addresses.includes(pop.address)).to.eql(true); 
  });
});

describe("NFsTaking", function () {
  let owner = SignerWithAddress;
  let address1 = SignerWithAddress;
  beforeEach(async () => {  
    [owner, address1] = await ethers.getSigners();
    // PoPtoken
    const PoPtoken = await ethers.getContractFactory("contracts/PoPToken.sol:PoPToken");
    poptoken = await PoPtoken.deploy();
    await poptoken.deployed();
    // PoPnft
    const PoPnft = await ethers.getContractFactory("contracts/PoPNFT.sol:NFT");
    popnft = await PoPnft.deploy();
    await popnft.deployed();
    await popnft.mintTo(await address1.address);
    // NFsTaker
    const NFsTaker = await ethers.getContractFactory("contracts/NFsTaker.sol:NFsTaker");
    nfstaker = await upgrades.deployProxy(NFsTaker, { initializer: 'initialize' });
    await nfstaker.connect(owner).setOperatorRole(owner.address);
    await nfstaker.connect(owner).setOperatorRole(address1.address);
    await poptoken.setMinterRole(nfstaker.address);
    await nfstaker.setPopToken(poptoken.address);
    await nfstaker.addNFT(popnft.address, ethers.BigNumber.from(10));
    balance = await poptoken.balanceOf(address1.address);
    await popnft.connect(address1).approve(nfstaker.address, 1);
    await nfstaker.connect(address1).stake(popnft.address, 1);
    console.log(await poptoken.balanceOf(address1.address));
  });

  it("Should stake an NFT and have the right amount of tokens afterwards", async function () {
    expect(await poptoken.balanceOf(address1.address)).to.eql(balance.add(10)); 
  });

  it("Should stake an NFT and the contract should own the NFT afterwards", async function () {
    expect(await popnft.ownerOf(1)).to.eql(nfstaker.address); 
  });

  it("Should unstake an NFT and have the right amount of tokens afterwards", async function () {
    await poptoken.connect(address1).approve(nfstaker.address, ethers.BigNumber.from(10));
    await nfstaker.connect(address1).unstake(popnft.address, 1, ethers.BigNumber.from(10));
    expect(await popnft.ownerOf(1)).to.eql(address1.address); 
  });

  it("Should unstake an NFT and the staker should own the NFT afterwards", async function () {
    await poptoken.connect(address1).approve(nfstaker.address, ethers.BigNumber.from(10));
    await nfstaker.connect(address1).unstake(popnft.address, 1, ethers.BigNumber.from(10));
    expect(await poptoken.balanceOf(address1.address)).to.eql(balance); 
  });
});
