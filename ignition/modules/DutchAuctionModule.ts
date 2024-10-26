const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DutchAuctionModule", (m: { getParameter: (arg0: string, arg1: number) => any; contract: (arg0: string, arg1: any[]) => any; }) => {
  const platformFeePercentage = m.getParameter("platformFeePercentage", 250); // Default to 2.5%

  const dutchAuction = m.contract("DutchAuctionWithFee", [platformFeePercentage]);

  return { dutchAuction };
});