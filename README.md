# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Auction.sol.ts
```


# Deploying the contract

```bash

# start the local node
npx hardhat node

# deploy the contract
npx hardhat ignition deploy ignition/modules/DutchAuctionModule.ts --network localhost

# start the console to interact with the contract
npx hardhat console --network localhost


```