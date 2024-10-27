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
    uint256 public constant MAX_FEE = 1000; // Max 10%
    uint256 public constant MIN_DURATION = 1 minutes;
    uint256 public constant MAX_DURATION = 7 days;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, string itemDescription, uint256 startingPrice, uint256 endingPrice, uint256 duration);
    event AuctionSuccessful(uint256 indexed auctionId, address indexed buyer, uint256 price);
    event AuctionCancelled(uint256 indexed auctionId);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    error InvalidFeePercentage(uint256 fee);
    error InvalidPrice();
    error InvalidDuration(uint256 duration);
    error AuctionNotActive();
    error AuctionExpired();
    error InsufficientPayment(uint256 required, uint256 sent);
    error NotSeller();
    error TransferFailed();

    constructor(uint256 _platformFeePercentage) Ownable(msg.sender) {
        if (_platformFeePercentage > MAX_FEE) revert InvalidFeePercentage(_platformFeePercentage);
        platformFeePercentage = _platformFeePercentage;
    }

    function createAuction(
        string calldata _itemDescription,
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _duration
    ) external returns (uint256) {
        if (_startingPrice < _endingPrice) revert InvalidPrice();
        if (_duration < MIN_DURATION || _duration > MAX_DURATION)
            revert InvalidDuration(_duration);

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
        return auctionId;
    }

    function getCurrentPrice(uint256 _auctionId) public view returns (uint256) {
        Auction storage auction = auctions[_auctionId];
        if (!auction.active) revert AuctionNotActive();

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
        if (!auction.active) revert AuctionNotActive();
        if (block.timestamp >= auction.startAt + auction.duration)
            revert AuctionExpired();

        uint256 price = getCurrentPrice(_auctionId);
        if (msg.value < price)
            revert InsufficientPayment(price, msg.value);

        auction.active = false;

        uint256 platformFee = (price * platformFeePercentage) / PERCENTAGE_BASE;
        uint256 sellerProceeds = price - platformFee;

        (bool success1, ) = auction.seller.call{value: sellerProceeds}("");
        if (!success1) revert TransferFailed();

        (bool success2, ) = payable(owner()).call{value: platformFee}("");
        if (!success2) revert TransferFailed();

        // Refund excess payment
        if (msg.value > price) {
            (bool success3, ) = payable(msg.sender).call{value: msg.value - price}("");
            if (!success3) revert TransferFailed();
        }

        emit AuctionSuccessful(_auctionId, msg.sender, price);
    }

    function cancelAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];

        if (!auction.active) revert AuctionNotActive();
        if (msg.sender != auction.seller) revert NotSeller();

        auction.active = false;
        emit AuctionCancelled(_auctionId);
    }

    function updatePlatformFeePercentage(uint256 _newFeePercentage) external onlyOwner {
        if (_newFeePercentage > MAX_FEE) revert InvalidFeePercentage(_newFeePercentage);

        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _newFeePercentage;

        emit PlatformFeeUpdated(oldFee, _newFeePercentage);
    }

    function getAuction(uint256 _auctionId) external view returns (
        address seller,
        string memory itemDescription,
        uint256 startingPrice,
        uint256 endingPrice,
        uint256 duration,
        uint256 startAt,
        bool active
    ) {
        Auction storage auction = auctions[_auctionId];
        return (
            auction.seller,
            auction.itemDescription,
            auction.startingPrice,
            auction.endingPrice,
            auction.duration,
            auction.startAt,
            auction.active
        );
    }
}