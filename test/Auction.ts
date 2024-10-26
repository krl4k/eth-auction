import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { DutchAuctionWithFee } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DutchAuctionWithFee", function () {
  let auction: DutchAuctionWithFee;
  let owner: HardhatEthersSigner;
  let seller: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];

  const INITIAL_FEE = 500; // 5%
  const ONE_HOUR = 3600;
  const STARTING_PRICE = ethers.parseEther("1");
  const ENDING_PRICE = ethers.parseEther("0.5");

  beforeEach(async function () {
    [owner, seller, buyer, ...addrs] = await ethers.getSigners();
    const Auction = await ethers.getContractFactory("DutchAuctionWithFee");
    auction = await Auction.deploy(INITIAL_FEE);
    await auction.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await auction.owner()).to.equal(owner.address);
    });

    it("Should set the initial platform fee", async function () {
      expect(await auction.platformFeePercentage()).to.equal(INITIAL_FEE);
    });

    it("Should revert if fee is too high", async function () {
      const Auction = await ethers.getContractFactory("DutchAuctionWithFee");
      await expect(Auction.deploy(1001)).to.be.revertedWithCustomError(
          auction,
          "InvalidFeePercentage"
      );
    });
  });

  describe("Create Auction", function () {
    it("Should create auction with correct parameters", async function () {
      const tx = await auction.connect(seller).createAuction(
          "Test Item",
          STARTING_PRICE,
          ENDING_PRICE,
          ONE_HOUR
      );

      const receipt = await tx.wait();
      const auctionId = receipt.logs[0].args[0];

      const auctionData = await auction.getAuction(auctionId);
      expect(auctionData.seller).to.equal(seller.address);
      expect(auctionData.itemDescription).to.equal("Test Item");
      expect(auctionData.startingPrice).to.equal(STARTING_PRICE);
      expect(auctionData.endingPrice).to.equal(ENDING_PRICE);
      expect(auctionData.duration).to.equal(ONE_HOUR);
      expect(auctionData.active).to.be.true;
    });

    it("Should revert with invalid duration", async function () {
      await expect(
          auction.connect(seller).createAuction(
              "Test Item",
              STARTING_PRICE,
              ENDING_PRICE,
              30 // less than MIN_DURATION
          )
      ).to.be.revertedWithCustomError(auction, "InvalidDuration");
    });
  });

  describe("Get Current Price", function () {
    let auctionId: bigint;

    beforeEach(async function () {
      const tx = await auction.connect(seller).createAuction(
          "Test Item",
          STARTING_PRICE,
          ENDING_PRICE,
          ONE_HOUR
      );
      const receipt = await tx.wait();
      auctionId = receipt.logs[0].args[0];
    });

    it("Should return correct price over time", async function () {
      // Start
      expect(await auction.getCurrentPrice(auctionId)).to.equal(STARTING_PRICE);

      // Middle
      await time.increase(ONE_HOUR / 2);
      const midPrice = await auction.getCurrentPrice(auctionId);
      const expectedMidPrice = (STARTING_PRICE + ENDING_PRICE) / 2n;
      expect(midPrice).to.be.closeTo(expectedMidPrice, ethers.parseEther("0.01"));

      // End
      await time.increase(ONE_HOUR / 2);
      expect(await auction.getCurrentPrice(auctionId)).to.equal(ENDING_PRICE);
    });
  });

  describe("Buy", function () {
    let auctionId: bigint;

    beforeEach(async function () {
      const tx = await auction.connect(seller).createAuction(
          "Test Item",
          STARTING_PRICE,
          ENDING_PRICE,
          ONE_HOUR
      );
      const receipt = await tx.wait();
      auctionId = receipt.logs[0].args[0];
    });

    it("Should process purchase correctly", async function () {
      const price = await auction.getCurrentPrice(auctionId);
      const platformFee = (price * BigInt(INITIAL_FEE)) / 10000n;
      const sellerProceeds = price - platformFee;

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);

      await auction.connect(buyer).buy(auctionId, { value: price });

      expect(await ethers.provider.getBalance(owner.address)).to.be.closeTo(
          initialOwnerBalance + platformFee,
          ethers.parseEther("0.001")
      );

      expect(await ethers.provider.getBalance(seller.address)).to.be.closeTo(
          initialSellerBalance + sellerProceeds,
          ethers.parseEther("0.001")
      );

      const auctionData = await auction.getAuction(auctionId);
      expect(auctionData.active).to.be.false;
    });

    it("Should handle refunds correctly", async function () {
      const price = await auction.getCurrentPrice(auctionId);
      const excess = ethers.parseEther("0.1");
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      const tx = await auction.connect(buyer).buy(auctionId, {
        value: price + excess
      });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);

      expect(initialBuyerBalance - finalBuyerBalance).to.be.closeTo(
          price + gasCost,
          ethers.parseEther("0.001")
      );
    });

    it("Should revert if auction is expired", async function () {
      await time.increase(ONE_HOUR + 1);
      await expect(
          auction.connect(buyer).buy(auctionId, { value: ENDING_PRICE })
      ).to.be.revertedWithCustomError(auction, "AuctionExpired");
    });
  });

});

