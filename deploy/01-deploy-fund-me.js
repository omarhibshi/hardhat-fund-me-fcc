// Import
//const helperConfig = require("../helper-hardhat-config")
//const networkConfig = helperConfig.networkConfig
const {
    networkConfig,
    developementChains,
} = require("../helper-hardhat-config")
const { networks } = require("../hardhat.config")
const { network, ethers, deployments } = require("hardhat")
const { verify } = require("../utils/verify")

/*
    A clearer way to write the script below is as follows :
    1)
    function deploy(hre) {
        console.log("Hi there!")
    }
    module.exports.default = deploy

    2)
    module.exports = async(hre) => {
        hre.getNamedAccounts
        hre.deployments
    }

    3)
    module.exports = async(hre) => {
        const {getNamedAccounts, deployments} = hre
    }

    
    4)
    module.exports = async ({ getNamedAccounts, deployments }) => {}

*/

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // if chainId is Z use address A

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    let fundMeCont

    if (developementChains.includes(network.name)) {
        // here you just get the latest mock
        //another way to write the line is
        //const { deploy, log , get} = deployments
        //const ethUsdAggrigator = await get("MockV3Aggregator")
        const ethUsdAggrigator = await deployments.get("MockV3Aggregator")

        ethUsdPriceFeedAddress = ethUsdAggrigator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...\n")

    //const args = [ethUsdPriceFeedAddress]
    // what happens when we want to chane chains?
    // when going for localhost or hardhat network we want to use a mock
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    //wait deployments.fixture(["all"])
    fundMeCont = await ethers.getContract("FundMe", deployer)
    const accounts = await ethers.getSigners()
    log(`FundMe deployed at ${fundMe.address}`)
    log(`FundMe deploying account : ${networks[network.name].accounts[4]}`)
    log(`FundMe getOwner() ==> : ${await fundMeCont.getOwner()}`)
    log(
        `FundMe Balance ==> : ${ethers.utils.formatEther(
            await fundMeCont.provider.getBalance(fundMe.address)
        )}`
    )

    if (
        !developementChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    log("-----------------------------------------------------\n")
}

// Tags is only used to specify which deploy script to run

module.exports.tags = ["all", "fundme"]
