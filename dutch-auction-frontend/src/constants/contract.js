export const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

export const CONTRACT_ABI = [
    "function createAuction(string calldata _itemDescription, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration) external returns (uint256)",
    "function getCurrentPrice(uint256 _auctionId) public view returns (uint256)",
    "function buy(uint256 _auctionId) external payable",
    "function cancelAuction(uint256 _auctionId) external",
    "function getAuction(uint256 _auctionId) external view returns (address seller, string memory itemDescription, uint256 startingPrice, uint256 endingPrice, uint256 duration, uint256 startAt, bool active)",
    "function auctionIdCounter() external view returns (uint256)"
];

export const SUPPORTED_CHAINS = {
    '1': 'Ethereum Mainnet',
    'aa36a7': 'Sepolia Testnet',
    '5': 'Goerli Testnet',
    '89': 'Polygon Mainnet',
    '13881': 'Mumbai Testnet'
};