import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

//****import { ethers } from "./node_modules/ethers/dist/ethers.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const wallet = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            document.getElementById("walletAddressLabel").innerHTML = wallet
            console.log("Metamask Connected")
            //document.getElementById("connectButton").innerHTML = "Connected!"
            document.getElementById("statusLabel").innerHTML =
                "Metamask is connected"
        } catch (error) {
            console.log(eror)
        }
    } else {
        console.log(
            `Browser ${navigator.userAgent} has no metamask wallet installed`
        )
        document.getElementById("statusLabel").innerHTML =
            "Metamask is not avaialable, please install it."
        document.getElementById("walletAddressLabel").innerHTML = "0x00"
    }
}
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const ethBalance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.formatEther(ethBalance))
            window.alert(
                `Contrat at \n\n${contractAddress} \n\nhas a total balance of \n\n${ethers.utils.formatEther(
                    ethBalance
                )} eths`
            )
        } catch (error) {
            console.log(error)
        }
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ...`)
    if (typeof window.ethereum !== "undefined") {
        // To send a transaction, we need
        // provide / connection to the blockchain
        // signer / wallet / someone with some gaz
        // We need also:
        // The contratc that we are interacting with, for that we need/
        // ABI & Address

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //****const provider = new ethers.BrowserProvider(window.ethereum)

        const signer = provider.getSigner()
        const contrat = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contrat.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // Listen for the tx to be mind
            // Listen for the event
            await listenForTransactionMine(transactionResponse, provider)
            console.log("done")
        } catch (error) {
            console.log(error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const ethBalance = await provider.getBalance(contractAddress)
        console.log(
            `withdrawing  ${ethers.utils.formatEther(ethBalance)} eths...`
        )
        //const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contrat = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contrat.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("done")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mininig ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => {
            console.log(
                `completed with ${transactionReciept.confirmations} confirmations`
            )
            resolve()
        })
    })
}
