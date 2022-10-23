import { contractAddresses, abi } from "../constants"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRencentWinner] = useState("0")

    const dispatch = useNotification()

    console.log(isWeb3Enabled)
    console.log(chainId)
    console.log(raffleAddress)

    const { runContractFunction: entreRaffle } = useWeb3Contract({
        abi: abi,
        contractAdress: raffleAddress,
        functionName: "entreRaffle",
        msgValue: entranceFee,
        params: {},
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAdress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAdress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRencentWinner } = useWeb3Contract({
        abi: abi,
        contractAdress: raffleAddress,
        functionName: "getRencentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = await getEntranceFee().toString()
        const numPlayersFromCall = await getNumberOfPlayers().toString()
        const recentWinnerFromCall = await getRencentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRencentWinner(recentWinnerFromCall)

        console.log(entranceFee)
    }

    useEffect(() => {
        console.log("HEllo")
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        try {
            await tx.wait(1)
            handleNewNotification(tx)
            updateUI()
        } catch (error) {
            console.log(error)
        }
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            Hi from lottery entrance!
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async function () {
                            await entreRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                    >
                        Enter Raffle
                    </button>
                    Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}ETH Players:{" "}
                    Players: {numPlayers}
                    Recent Winner: {recentWinner}
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    )
}
