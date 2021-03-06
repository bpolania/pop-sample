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

  let PoP = artifacts.require("contracts/PoPToken.sol:PoPToken");
  let pop = await PoP.at('0xc1d002113A299b8a06fD64D5BA5c6A730F0Ae000');
  await pop.mint(await owner.address, 100);
  console.log("PoP minted to:", owner.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
