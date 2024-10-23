import { StacksMainnet } from "@stacks/network";

export const fetchMarketDetails = async () => {
  setIsLoading(true);
  const functionName = "get-market-details";
  const tokenId = uintCV(onChainId);
  const network = new StacksMainnet();

  const options = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [tokenId],
    network,
    senderAddress: contractAddress,
  };

  try {
    const response = await callReadOnlyFunction(options);
    console.log("Fetch Market Details");
    console.log(response);
    setApiResponse(cvToString(response));
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
