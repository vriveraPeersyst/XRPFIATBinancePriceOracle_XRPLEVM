// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract XRPFIATBinancePriceOracle {
    address public owner;

    // Prices and timestamps for different pairs
    uint256 public priceXRPUSDT;
    uint256 public priceXRPUSDC;
    uint256 public priceXRPEUR;
    uint256 public priceXRPJPY;
    uint256 public priceXRPMXN;
    uint256 public priceXRPBRL;

    uint256 public lastUpdatedXRPUSDT;
    uint256 public lastUpdatedXRPUSDC;
    uint256 public lastUpdatedXRPEUR;
    uint256 public lastUpdatedXRPJPY;
    uint256 public lastUpdatedXRPMXN;
    uint256 public lastUpdatedXRPBRL;

    event PriceUpdated(string pair, uint256 price, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function updatePrices(
        uint256[] memory prices,
        uint256[] memory timestamps
    ) public onlyOwner {
        require(prices.length == 6, "Prices array must have 6 elements");
        require(timestamps.length == 6, "Timestamps array must have 6 elements");

        priceXRPUSDT = prices[0];
        lastUpdatedXRPUSDT = timestamps[0];
        priceXRPUSDC = prices[1];
        lastUpdatedXRPUSDC = timestamps[1];
        priceXRPEUR = prices[2];
        lastUpdatedXRPEUR = timestamps[2];
        priceXRPJPY = prices[3];
        lastUpdatedXRPJPY = timestamps[3];
        priceXRPMXN = prices[4];
        lastUpdatedXRPMXN = timestamps[4];
        priceXRPBRL = prices[5];
        lastUpdatedXRPBRL = timestamps[5];

        emit PriceUpdated("XRPUSDT", prices[0], timestamps[0]);
        emit PriceUpdated("XRPUSDC", prices[1], timestamps[1]);
        emit PriceUpdated("XRPEUR", prices[2], timestamps[2]);
        emit PriceUpdated("XRPJPY", prices[3], timestamps[3]);
        emit PriceUpdated("XRPMXN", prices[4], timestamps[4]);
        emit PriceUpdated("XRPBRL", prices[5], timestamps[5]);
    }

    // Individual getters for each price and last update timestamp
    function getPriceXRPUSDT() public view returns (uint256) {
        return priceXRPUSDT;
    }

    function getLastUpdatedXRPUSDT() public view returns (uint256) {
        return lastUpdatedXRPUSDT;
    }

    function getPriceXRPUSDC() public view returns (uint256) {
        return priceXRPUSDC;
    }

    function getLastUpdatedXRPUSDC() public view returns (uint256) {
        return lastUpdatedXRPUSDC;
    }

    function getPriceXRPEUR() public view returns (uint256) {
        return priceXRPEUR;
    }

    function getLastUpdatedXRPEUR() public view returns (uint256) {
        return lastUpdatedXRPEUR;
    }

    function getPriceXRPJPY() public view returns (uint256) {
        return priceXRPJPY;
    }

    function getLastUpdatedXRPJPY() public view returns (uint256) {
        return lastUpdatedXRPJPY;
    }

    function getPriceXRPMXN() public view returns (uint256) {
        return priceXRPMXN;
    }

    function getLastUpdatedXRPMXN() public view returns (uint256) {
        return lastUpdatedXRPMXN;
    }

    function getPriceXRPBRL() public view returns (uint256) {
        return priceXRPBRL;
    }

    function getLastUpdatedXRPBRL() public view returns (uint256) {
        return lastUpdatedXRPBRL;
    }
}
