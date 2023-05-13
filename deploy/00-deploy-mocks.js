const { network } = require("hardhat")
const {
    developementChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    //const chainId = network.config.chainId

    if (developementChains.includes(network.name)) {
        log("local network detected, deploying mocks ... \n")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        log("Mock deployed ...")
        log("-----------------------------------------------------\n")
    }
}

module.exports.tags = ["all", "mocks"]
