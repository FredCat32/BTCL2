import { openContractCall } from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";

const network = new StacksTestnet(); // Use Stackstestnet for production

export const mintTokens = async (amount, recipient) => {
  const functionArgs = [
    amount, // uint
    recipient, // principal
  ];

  const options = {
    network,
    contractAddress: "YOUR_CONTRACT_ADDRESS",
    contractName: "YOUR_CONTRACT_NAME",
    functionName: "mint",
    functionArgs,
    appDetails: {
      name: "Interstellar Swap",
      icon: window.location.origin + "/logo.png",
    },
    onFinish: (data) => {
      console.log("Stacks Transaction:", data.stacksTransaction);
      console.log("Transaction ID:", data.txId);
      console.log("Raw transaction:", data.txRaw);
    },
  };

  await openContractCall(options);
};

// Add similar functions for other contract calls (transfer, update-reward-rate, etc.)
