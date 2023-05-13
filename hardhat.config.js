require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Key"
const LOCALHOST_RPC_URL = process.env.LOCALHOST_RPC_URL || "https://eth-sepolia"
const OINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

const SANAA_PRIVATE_KEY = process.env.SANAA_PRIVATE_KEY
const MUSCAT_PRIVATE_KEY = process.env.MUSCAT_PRIVATE_KEY
const PARIS_PRIVATE_KEY = process.env.PARIS_PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
/* module.exports = {
    solidity: "0.8.18",
} */

module.exports = {
    //solidity: "0.8.18",
    solidity: {
        compilers: [{ version: "0.8.18" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [
                PRIVATE_KEY,
                SANAA_PRIVATE_KEY,
                MUSCAT_PRIVATE_KEY,
                PARIS_PRIVATE_KEY,
            ],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localHost: {
            url: LOCALHOST_RPC_URL,
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: OINMARKETCAP_API_KEY,
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}
