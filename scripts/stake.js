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

  let PoPNFT = artifacts.require("contracts/PoPNFT.sol:NFT");
  let popnft = await PoPNFT.at('0x74acac453a92a846a7280FB09b486c4a67896f24');

  let NFsTaker = artifacts.require("contracts/NFsTaker.sol:NFsTaker");
  let nftstaker = await NFsTaker.at('0xFE580593e88B408B715955e48f50bf3Da0949b92');
  await popnft.approve(nftstaker.address, 1);
  await nftstaker.stake(await "0x74acac453a92a846a7280FB09b486c4a67896f24", 1);
  console.log("PoP Staked to:", owner.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
