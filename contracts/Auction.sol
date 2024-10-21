// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DutchAuctionWithFee is ReentrancyGuard, Ownable {
    struct Auction {
        address payable seller;
        string itemDescription;
        uint256 startingPrice;
        uint256 endingPrice;
        uint256 duration;
        uint256 startAt;
        bool active;
    }

    mapping(uint256 => Auction) public auctions;
    uint256 public auctionIdCounter;
    uint256 public platformFeePercentage;
    uint256 public constant PERCENTAGE_BASE = 10000; // 100% = 10000

    event AuctionCreated(uint256 auctionId, address seller, string itemDescription, uint256 startingPrice, uint256 endingPrice, uint256 duration);
    event AuctionSuccessful(uint256 auctionId, address buyer, uint256 price);
    event AuctionCancelled(uint256 auctionId);

    constructor(uint256 _platformFeePercentage) Ownable(msg.sender) {
        require(_platformFeePercentage <= 1000, "Fee percentage too high"); // Max 10%
        platformFeePercentage = _platformFeePercentage;
    }

    function createAuction(
        string memory _itemDescription,
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _duration
    ) external {
        require(_startingPrice >= _endingPrice, "Starting price must be >= ending price");
        require(_duration > 0, "Duration must be > 0");

        uint256 auctionId = auctionIdCounter++;
        auctions[auctionId] = Auction({
            seller: payable(msg.sender),
            itemDescription: _itemDescription,
            startingPrice: _startingPrice,
            endingPrice: _endingPrice,
            duration: _duration,
            startAt: block.timestamp,
            active: true
        });

        emit AuctionCreated(auctionId, msg.sender, _itemDescription, _startingPrice, _endingPrice, _duration);
    }

    function getCurrentPrice(uint256 _auctionId) public view returns (uint256) {
        Auction storage auction = auctions[_auctionId];
        require(auction.active, "Auction is not active");

        uint256 elapsed = block.timestamp - auction.startAt;
        if (elapsed >= auction.duration) {
            return auction.endingPrice;
        } else {
            uint256 priceDrop = ((auction.startingPrice - auction.endingPrice) * elapsed) / auction.duration;
            return auction.startingPrice - priceDrop;
        }
    }

    function buy(uint256 _auctionId) external payable nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.active, "Auction is not active");
        require(block.timestamp < auction.startAt + auction.duration, "Auction expired");

        uint256 price = getCurrentPrice(_auctionId);
        require(msg.value >= price, "Not enough ETH sent");

        auction.active = false;

        uint256 platformFee = (price * platformFeePercentage) / PERCENTAGE_BASE;
        uint256 sellerProceeds = price - platformFee;

        auction.seller.transfer(sellerProceeds);
        payable(owner()).transfer(platformFee);

        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit AuctionSuccessful(_auctionId, msg.sender, price);
    }

    function cancelAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        require(msg.sender == auction.seller, "Not the seller");
        require(auction.active, "Auction is not active");

        auction.active = false;

        emit AuctionCancelled(_auctionId);
    }

    function updatePlatformFeePercentage(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee percentage too high"); // Max 10%
        platformFeePercentage = _newFeePercentage;
    }
}