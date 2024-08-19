// SPDX-License-Identifier: MIT
require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const cron = require('node-cron');

// Load environment variables
const web3RpcUrl = process.env.WEB3_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

// ABI of the deployed contract
const contractAbi = [
    "function updatePrices(uint256[] memory prices, uint256[] memory timestamps) public",
    "function getPriceXRPUSDT() public view returns (uint256)",
    "function getLastUpdatedXRPUSDT() public view returns (uint256)",
    "function getPriceXRPUSDC() public view returns (uint256)",
    "function getLastUpdatedXRPUSDC() public view returns (uint256)",
    "function getPriceXRPEUR() public view returns (uint256)",
    "function getLastUpdatedXRPEUR() public view returns (uint256)",
    "function getPriceXRPJPY() public view returns (uint256)",
    "function getLastUpdatedXRPJPY() public view returns (uint256)",
    "function getPriceXRPMXN() public view returns (uint256)",
    "function getLastUpdatedXRPMXN() public view returns (uint256)",
    "function getPriceXRPBRL() public view returns (uint256)",
    "function getLastUpdatedXRPBRL() public view returns (uint256)"
];

// Fetch multiple XRP/Fiat prices from Binance API and ensure they have 4 decimal places
async function fetchBinancePrices() {
    const pairs = ["XRPUSDT", "XRPUSDC", "XRPEUR", "XRPJPY", "XRPMXN", "XRPBRL"];
    const prices = [];

    for (const pair of pairs) {
        let price;
        let decimalCheck = false;

        while (!decimalCheck) {
            const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
            price = parseFloat(response.data.price).toFixed(4);
            
            const decimals = price.split('.')[1];
            if (decimals && decimals.length === 4) {
                decimalCheck = true;
            } else {
                console.log(`Price ${price} for ${pair} does not have 4 decimals, retrying...`);
            }
        }

        prices.push(price);
    }

    return prices;
}

// Convert prices to integer format using ethers.utils.parseUnits
function convertPricesToFixedPoint(prices, decimals = 4) {
    return prices.map(price => BigInt(ethers.parseUnits(price, decimals)));
}

// Format timestamp to YYYYMMDDHHMMSS as a BigNumber (uint256)
function formatTimestampForContract() {
    const now = new Date();
    
    const year = now.getUTCFullYear().toString().padStart(4, '0');
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    const seconds = now.getUTCSeconds().toString().padStart(2, '0');

    const formattedTimestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

    return BigInt(formattedTimestamp);
}

// Push data to the blockchain
async function pushDataToContract(fixedPrices, timestamps) {
    const provider = new ethers.JsonRpcProvider(web3RpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    try {
        const tx = await contract.updatePrices(fixedPrices, timestamps);
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log('Prices and timestamps updated on the blockchain');
    } catch (error) {
        console.error('Error pushing data to contract:', error);
    }
}

// Main function to update the prices on the blockchain
async function updatePricesOnBlockchain() {
    try {
        const prices = await fetchBinancePrices();
        console.log(`Fetched prices from Binance: ${prices.join(',')}`);

        const fixedPrices = convertPricesToFixedPoint(prices);
        console.log(`Converted prices to fixed-point format: ${fixedPrices.map(fp => fp.toString()).join(',')}`);

        const timestamp = formatTimestampForContract();
        console.log(`Formatted timestamp: ${timestamp.toString()}`);

        // Create an array of timestamps for each price
        const timestamps = Array(fixedPrices.length).fill(timestamp);
        
        await pushDataToContract(fixedPrices, timestamps);

        console.log('Updated prices and timestamps on the blockchain');
    } catch (error) {
        console.error('Error updating prices:', error);
    }
}

// Schedule the update every minute
cron.schedule('* * * * *', updatePricesOnBlockchain);

console.log('Price Oracle is running and will update every minute.');
