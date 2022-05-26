# pop-sample

You can use the deployed contracts in Harmony or deploy in any testnet you want. If you decide to deploy your own contracts, follow the following steps:

* you must add your private key in the `harhat.config-js` file
* deploy the nft contract running the `deploy-nft.js` script `npx hardhat run scripts/deploy-nft.js  --network mainnet`
* take note of the nft address and update the `deploy-main.js` script (line 31) with that address
```
await nfstaker.addNFT("NEW_ADDRESS_HERE", ethers.BigNumber.from("10"));
```
* run the `deploy-main.js` script and take note of the ERC20 POP token address and the NFsTaker contract address
* mint an nft with the account you want to use to stake/unstake

Enjoy!
