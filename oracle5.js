require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const cron = require('node-cron');

// Load environment variables
const web3RpcUrl = process.env.WEB3_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

// ABI of the deployed contract (replace with your contract's ABI)
const contractAbi = [
    "function updatePrice(uint256 price) public",
    "function getPrice() public view returns (uint256)",
    "function getLastUpdated() public view returns (uint256)"
];

// Fetch the XRP/USD price from Binance API and ensure it has 4 decimal places
async function fetchBinancePrice() {
    let price;
    let decimalCheck = false;

    while (!decimalCheck) {
        const response = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=XRPUSDT");
        price = parseFloat(response.data.price).toFixed(4);
        
        // Check if the price has exactly 4 decimal places
        const decimals = price.split('.')[1];
        if (decimals && decimals.length === 4) {
            decimalCheck = true;
        } else {
            console.log(`Price ${price} does not have 4 decimals, retrying...`);
        }
    }

    return price;
}

// Convert price to integer format using ethers.utils.parseUnits
function convertPriceToFixedPoint(price, decimals = 4) {
    // ethers.utils.parseUnits converts the string price to a BigNumber with specified decimals
    return ethers.parseUnits(price, decimals);
}

// Push data to the blockchain
async function pushDataToContract(fixedPrice) {
    const provider = new ethers.JsonRpcProvider(web3RpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    try {
        const tx = await contract.updatePrice(fixedPrice);
        console.log(`Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log('Price updated on the blockchain');
    } catch (error) {
        console.error('Error pushing data to contract:', error);
    }
}

// Main function to update the price on the blockchain
async function updatePriceOnBlockchain() {
    try {
        const price = await fetchBinancePrice();
        console.log(`XRP/USD price from Binance: ${price}`);

        const fixedPrice = convertPriceToFixedPoint(price);
        console.log(`Converted price to fixed-point format: ${fixedPrice.toString()}`);

        await pushDataToContract(fixedPrice);

        console.log(`Updated XRP/USD price on the blockchain: ${price}`);
    } catch (error) {
        console.error('Error updating price:', error);
    }
}

// Set up a cron job to run every minute
cron.schedule('* * * * *', () => {
    updatePriceOnBlockchain();
});

console.log('Price Oracle is running and will update every minute.');
