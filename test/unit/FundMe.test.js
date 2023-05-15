const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { developementChains } = require("../../helper-hardhat-config")

!developementChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          //
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          // tests the constructor
          describe("constructor", async function () {
              it("sets the aggregator correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          // tests the fund function
          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              //
              it("ensures owner is saved ", async function () {
                  const isOwner = await fundMe.getOwner()
                  assert.notEqual(isOwner, fundMe.address)
              })
              //
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              //
              it("adds funder to array of getFunder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
              //
              describe("withdraw", async function () {
                  beforeEach(async function () {
                      await fundMe.fund({ value: sendValue })
                  })
                  //
                  it("withdraw ETH from a single founder", async function () {
                      // Arrange
                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // ACT
                      const transactionResponse = await fundMe.withdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)
                      //
                      const endingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingFundMeBalance.add(startingDeployerBalance),
                          endingDeployerBalance.add(gasCost).toString()
                      )
                  })
                  it("allows us to withdraw with multiple funders", async function () {
                      // Arrange
                      const accounts = await ethers.getSigners()
                      //
                      for (let i = 1; i < 6; i++) {
                          const fundMeConnectedContract = await fundMe.connect(
                              accounts[i]
                          )
                          await fundMeConnectedContract.fund({
                              value: sendValue,
                          })
                      }
                      //
                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Act
                      const transactionResponse = await fundMe.withdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)

                      const endingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingFundMeBalance.add(startingDeployerBalance),
                          endingDeployerBalance.add(gasCost).toString()
                      )

                      // Make sure that the funders are reset properly
                      await expect(fundMe.getFunder(0)).to.be.reverted

                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          )
                      }
                  })
                  it("only allows the owner to withdraw", async function () {
                      const accounts = await ethers.getSigners()
                      const attackerConnectedContract = await fundMe.connect(
                          accounts[5]
                      )
                      await expect(attackerConnectedContract.withdraw()).to.be
                          .reverted
                  })
                  /* */
                  it("cheaper withdraw ETH from a single founder", async function () {
                      // Arrange
                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // ACT
                      const transactionResponse = await fundMe.cheaperWithdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)
                      //
                      const endingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingFundMeBalance.add(startingDeployerBalance),
                          endingDeployerBalance.add(gasCost).toString()
                      )
                  })
                  /* */
                  it("Cheaper withdraw ...", async function () {
                      // Arrange
                      const accounts = await ethers.getSigners()
                      //
                      for (let i = 1; i < 6; i++) {
                          const fundMeConnectedContract = await fundMe.connect(
                              accounts[i]
                          )
                          await fundMeConnectedContract.fund({
                              value: sendValue,
                          })
                      }
                      //
                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)

                      // Act
                      const transactionResponse = await fundMe.cheaperWithdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)

                      const endingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)
                      // Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingFundMeBalance.add(startingDeployerBalance),
                          endingDeployerBalance.add(gasCost).toString()
                      )
                      // Make sure that the funders are reset properly
                      await expect(fundMe.getFunder(0)).to.be.reverted

                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          )
                      }
                  })
                  /**/
              })
          })
      })
