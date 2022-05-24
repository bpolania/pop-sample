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

  const PoP = await ethers.getContractFactory("contracts/PoPNFT.sol:NFT");
  pop = await PoP.deploy();
  await pop.deployed();
  await pop.mintTo(await owner.address);
  console.log("PoP deployed to:", pop.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
