import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { DutchAuctionWithFee } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DutchAuctionWithFee Errors", function () {
    let auction: DutchAuctionWithFee;
    let owner: HardhatEthersSigner;
    let seller: HardhatEthersSigner;
    let buyer: HardhatEthersSigner;
    let addrs: HardhatEthersSigner[];

    const INITIAL_FEE = 500; // 5%
    const ONE_HOUR = 3600;
    const STARTING_PRICE = ethers.parseEther("1");
    const ENDING_PRICE = ethers.parseEther("0.5");

    // Здесь идет весь код тестов ошибок, который я отправил ранее

    beforeEach(async function () {
        [owner, seller, buyer, ...addrs] = await ethers.getSigners();
        const Auction = await ethers.getContractFactory("DutchAuctionWithFee");
        auction = await Auction.deploy(INITIAL_FEE);
        await auction.waitForDeployment();
    });

    describe("Error Cases", function () {
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

        describe("Create Auction Errors", function () {
            it("Should revert when starting price is lower than ending price", async function () {
                await expect(
                    auction.connect(seller).createAuction(
                        "Test Item",
                        ENDING_PRICE,      // меньше чем ending price
                        STARTING_PRICE,
                        ONE_HOUR
                    )
                ).to.be.revertedWithCustomError(auction, "InvalidPrice");
            });

            it("Should revert when duration is too short", async function () {
                await expect(
                    auction.connect(seller).createAuction(
                        "Test Item",
                        STARTING_PRICE,
                        ENDING_PRICE,
                        30  // меньше минимальной длительности
                    )
                ).to.be.revertedWithCustomError(auction, "InvalidDuration");
            });

            it("Should revert when duration is too long", async function () {
                const TOO_LONG = 8 * 24 * 60 * 60; // 8 days
                await expect(
                    auction.connect(seller).createAuction(
                        "Test Item",
                        STARTING_PRICE,
                        ENDING_PRICE,
                        TOO_LONG
                    )
                ).to.be.revertedWithCustomError(auction, "InvalidDuration");
            });
        });

        describe("Buy Function Errors", function () {
            it("Should revert when buying non-existent auction", async function () {
                const nonExistentId = 999;
                await expect(
                    auction.connect(buyer).buy(nonExistentId, {
                        value: STARTING_PRICE
                    })
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });

            it("Should revert when buying cancelled auction", async function () {
                await auction.connect(seller).cancelAuction(auctionId);
                await expect(
                    auction.connect(buyer).buy(auctionId, {
                        value: STARTING_PRICE
                    })
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });

            it("Should revert when sending insufficient payment", async function () {
                const fixedPrice = ethers.parseEther("1");
                const tx = await auction.connect(seller).createAuction(
                    "Fixed Price Item",
                    fixedPrice,  // startingPrice
                    fixedPrice,  // endingPrice - та же цена
                    ONE_HOUR
                );
                const receipt = await tx.wait();
                const newAuctionId = receipt.logs[0].args[0];

                const insufficientAmount = fixedPrice / 2n;
                await expect(
                    auction.connect(buyer).buy(newAuctionId, {
                        value: insufficientAmount
                    })
                ).to.be.revertedWithCustomError(
                    auction,
                    "InsufficientPayment"
                ).withArgs(fixedPrice, insufficientAmount);
            });

            it("Should revert with current price when sending insufficient payment for dutch auction", async function () {
                // Ждем половину времени аукциона
                await time.increase(ONE_HOUR / 2);

                const currentPrice = await auction.getCurrentPrice(auctionId);
                const insufficientAmount = currentPrice - ethers.parseEther("0.1");

                // Получаем транзакцию с ошибкой
                const failedTx = auction.connect(buyer).buy(auctionId, {
                    value: insufficientAmount
                });

                // Проверяем, что транзакция реверчена с правильной ошибкой
                await expect(failedTx)
                    .to.be.revertedWithCustomError(auction, "InsufficientPayment");

                // Проверяем значения в ошибке с допустимой погрешностью
                try {
                    await failedTx;
                } catch (error: any) {
                    const revertData = error.data;
                    const decoded = auction.interface.parseError(revertData);
                    const [requiredAmount, sentAmount] = decoded.args;

                    const tolerance = ethers.parseEther("0.001"); // 0.001 ETH погрешность

                    expect(requiredAmount).to.be.closeTo(
                        currentPrice,
                        tolerance,
                        "Required amount should be close to current price"
                    );

                    expect(sentAmount).to.equal(
                        insufficientAmount,
                        "Sent amount should match exactly"
                    );
                }
            });

            it("Should revert when buying after auction expired", async function () {
                await time.increase(ONE_HOUR + 1);
                await expect(
                    auction.connect(buyer).buy(auctionId, {
                        value: ENDING_PRICE
                    })
                ).to.be.revertedWithCustomError(auction, "AuctionExpired");
            });

            it("Should revert when buying already purchased auction", async function () {
                const price = await auction.getCurrentPrice(auctionId);
                await auction.connect(buyer).buy(auctionId, { value: price });

                await expect(
                    auction.connect(buyer).buy(auctionId, {
                        value: price
                    })
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });
        });

        describe("Cancel Auction Errors", function () {
            it("Should revert when non-seller tries to cancel", async function () {
                await expect(
                    auction.connect(buyer).cancelAuction(auctionId)
                ).to.be.revertedWithCustomError(auction, "NotSeller");
            });

            it("Should revert when cancelling non-existent auction", async function () {
                const nonExistentId = 999;
                await expect(
                    auction.connect(seller).cancelAuction(nonExistentId)
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });

            it("Should revert when cancelling already cancelled auction", async function () {
                await auction.connect(seller).cancelAuction(auctionId);
                await expect(
                    auction.connect(seller).cancelAuction(auctionId)
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });

            it("Should revert when cancelling completed auction", async function () {
                const price = await auction.getCurrentPrice(auctionId);
                await auction.connect(buyer).buy(auctionId, { value: price });

                await expect(
                    auction.connect(seller).cancelAuction(auctionId)
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });
        });

        describe("Platform Fee Errors", function () {
            it("Should revert when non-owner tries to update fee", async function () {
                await expect(
                    auction.connect(buyer).updatePlatformFeePercentage(100)
                ).to.be.revertedWithCustomError(
                    auction,
                    "OwnableUnauthorizedAccount"
                ).withArgs(buyer.address);
            });

            it("Should revert when setting fee too high", async function () {
                await expect(
                    auction.connect(owner).updatePlatformFeePercentage(1001)
                ).to.be.revertedWithCustomError(auction, "InvalidFeePercentage");
            });
        });

        describe("getCurrentPrice Errors", function () {
            it("Should revert for non-existent auction", async function () {
                const nonExistentId = 999;
                await expect(
                    auction.getCurrentPrice(nonExistentId)
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });

            it("Should revert for cancelled auction", async function () {
                await auction.connect(seller).cancelAuction(auctionId);
                await expect(
                    auction.getCurrentPrice(auctionId)
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });

            it("Should revert for completed auction", async function () {
                const price = await auction.getCurrentPrice(auctionId);
                await auction.connect(buyer).buy(auctionId, { value: price });

                await expect(
                    auction.getCurrentPrice(auctionId)
                ).to.be.revertedWithCustomError(auction, "AuctionNotActive");
            });
        });

        describe("Edge Cases", function () {
            it("Should handle minimum duration correctly", async function () {
                const MIN_DURATION = 60; // 1 minute
                const tx = await auction.connect(seller).createAuction(
                    "Min Duration Test",
                    STARTING_PRICE,
                    ENDING_PRICE,
                    MIN_DURATION
                );
                const receipt = await tx.wait();
                const newAuctionId = receipt.logs[0].args[0];

                // Проверяем цену сразу после создания
                expect(await auction.getCurrentPrice(newAuctionId)).to.equal(STARTING_PRICE);

                // Проверяем цену в середине аукциона
                await time.increase(MIN_DURATION / 2);
                const midPrice = await auction.getCurrentPrice(newAuctionId);
                expect(midPrice).to.be.gt(ENDING_PRICE);
                expect(midPrice).to.be.lt(STARTING_PRICE);

                // Проверяем цену после окончания
                await time.increase(MIN_DURATION / 2 + 1);
                await expect(
                    auction.connect(buyer).buy(newAuctionId, { value: STARTING_PRICE })
                ).to.be.revertedWithCustomError(auction, "AuctionExpired");
            });

            it("Should handle zero price difference correctly", async function () {
                const tx = await auction.connect(seller).createAuction(
                    "Same Price Test",
                    STARTING_PRICE,
                    STARTING_PRICE, // Одинаковая цена
                    ONE_HOUR
                );
                const receipt = await tx.wait();
                const newAuctionId = receipt.logs[0].args[0];

                // Цена должна оставаться неизменной
                await time.increase(ONE_HOUR / 2);
                expect(await auction.getCurrentPrice(newAuctionId)).to.equal(STARTING_PRICE);
            });

            it("Should handle maximum possible values", async function () {
                const MAX_UINT256 = ethers.MaxUint256;
                await expect(
                    auction.connect(seller).createAuction(
                        "Max Value Test",
                        MAX_UINT256,
                        MAX_UINT256 - 1n,
                        ONE_HOUR
                    )
                ).not.to.be.reverted;
            });
        });
    });
});