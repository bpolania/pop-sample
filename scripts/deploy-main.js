// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  let owner = SignerWithAddress;
  let address1 = SignerWithAddress;
  [owner] = await ethers.getSigners();

  // We get the contract to deploy
  const PoP = await ethers.getContractFactory("contracts/PoPToken.sol:PoPToken");
  const pop = await PoP.deploy();
  await pop.deployed();

  const NFsTaker = await ethers.getContractFactory("contracts/NFsTaker.sol:NFsTaker");
  nfstaker = await upgrades.deployProxy(NFsTaker, { initializer: 'initialize' });
  await nfstaker.connect(owner).setOperatorRole(owner.address);
  await pop.setMinterRole(nfstaker.address);
  await nfstaker.setPopToken(pop.address);
  await nfstaker.addNFT("0x74acac453a92a846a7280FB09b486c4a67896f24", 10);

  console.log("PoP deployed to:", pop.address);
  console.log("NFsTaker deployed to:", nfstaker.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
