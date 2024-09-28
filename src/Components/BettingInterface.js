import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  StatHelpText,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  hexToCV,
  cvToString,
  uintCV,
  boolCV,
  PostConditionMode,
  Pc,
  callReadOnlyFunction,
  standardPrincipalCV,
  cvToValue,
} from "@stacks/transactions";
import axios from "axios";

import { StacksMainnet } from "@stacks/network";
import { useConnect } from "@stacks/connect-react";
import { useWallet } from "../WalletContext";

const BettingInterface = () => {
  const location = useLocation();
  const toast = useToast();
  const { market = {}, marketId, onChainId } = location.state || {};

  const { userData } = useWallet();
  const parseClarityValue = (clarityString) => {
    const match = clarityString.match(/\(ok \(tuple (.*)\)\)/);
    if (match) {
      const pairs = match[1].match(/\((.*?) (.*?)\)/g);
      return pairs.reduce((acc, pair) => {
        const [key, value] = pair.slice(1, -1).split(" ");
        acc[key] = value.startsWith("u") ? parseInt(value.slice(1)) : value;
        return acc;
      }, {});
    }
    return null;
  };
  const API_URL = process.env.REACT_APP_API_URL;
  const [removeLiquidityPercentage, setRemoveLiquidityPercentage] =
    useState(50);

  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [yesPool, setYesPool] = useState(location.state?.yesPool || 0);
  const [noPool, setNoPool] = useState(location.state?.noPool || 0);
  const { doContractCall } = useConnect();
  const [resolution, setResolution] = useState("");
  const [outcome, setOutcome] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [apiResponse2, setApiResponse2] = useState(null);
  const [decodedOwner, setDecodedOwner] = useState(null);
  const [error, setError] = useState(null);
  const [userPosition, setUserPosition] = useState({ no: 0, yes: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState("");

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractName = process.env.REACT_APP_CONTRACT_NAME;
  const apiEndpoint = "https://stacks-node-api.mainnet.stacks.co";
  const [slippage, setSlippage] = useState(0);

  const calculateEstimatedValue = (tokenAmount, poolSize, totalLiquidity) => {
    return (tokenAmount * totalLiquidity) / poolSize;
  };
  const isResolved = (marketDetails) => {
    if (!marketDetails) return false;
    return marketDetails.resolved === "true";
  };
  const userHasPosition = (userPosition) => {
    return userPosition && (userPosition.yes > 0 || userPosition.no > 0);
  };

  const marketDetails = apiResponse ? parseClarityValue(apiResponse) : null;
  console.log(marketDetails);
  console.log(marketDetails);

  useEffect(() => {
    if (onChainId) {
      fetchMarketDetails();
      fetchUserPosition();
    }
  }, [onChainId]);
  useEffect(() => {
    if (marketDetails && transactionAmount) {
      const poolSize = location.pathname.includes("/yes")
        ? marketDetails["yes-pool"]
        : marketDetails["no-pool"];
      const calculatedSlippage = calculateSlippage(
        transactionAmount * 1000000,
        poolSize,
        marketDetails["total-liquidity"]
      );
      setSlippage(calculatedSlippage);
    }
  }, [transactionAmount, marketDetails]);
  const fetchMarketDetails = async () => {
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

      // Check if response is defined and has the expected structure
      if (response && response.value && response.value.data) {
        const responseString = cvToString(response);
        setApiResponse(responseString);

        // Parse the response
        const parsedResponse = parseClarityValue(responseString);

        if (parsedResponse) {
          // Use optional chaining and provide default values
          const outcomeValue = response.value.data.outcome?.value;
          if (outcomeValue !== undefined) {
            const parsedOutcome = cvToValue(outcomeValue);
            console.log("Parsed Outcome:", parsedOutcome);
            setOutcome(parsedOutcome);
          } else {
            console.log("Outcome value is undefined");
          }

          const resolvedValue = response.value.data.resolved;
          if (resolvedValue !== undefined) {
            const parsedResolve = cvToValue(resolvedValue);
            console.log("Parsed Resolve:", parsedResolve);
            setResolution(parsedResolve);
          } else {
            console.log("Resolved value is undefined");
          }
          const newYesPool = (parsedResponse["yes-pool"] ?? 0) / 1000000; // Convert to STX
          const newNoPool = (parsedResponse["no-pool"] ?? 0) / 1000000; // Convert to STX

          if (newYesPool !== yesPool || newNoPool !== noPool) {
            console.log("Pool values have changed. Updating backend...");

            try {
              const url = `${API_URL}/api/markets/${marketId}`;
              const backendResponse = await axios.patch(url, {
                yesPool: newYesPool,
                noPool: newNoPool,
              });

              if (backendResponse.status !== 200) {
                throw new Error("Failed to update market in backend");
              }

              console.log("Backend updated successfully");

              // Update local state
              setYesPool(newYesPool);
              setNoPool(newNoPool);
            } catch (error) {
              console.error("Error updating backend:", error);
              setError("Failed to update market data in backend");
            }
          }
        } else {
          throw new Error("Failed to parse response");
        }
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error in fetchMarketDetails:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateSlippage = (amount, poolSize, totalLiquidity) => {
    const constantProduct = poolSize * totalLiquidity;
    const newPoolSize = poolSize + parseFloat(amount);
    const newTotalLiquidity = totalLiquidity + parseFloat(amount);
    const newOtherPoolSize = constantProduct / newPoolSize;

    const priceBeforeSwap = totalLiquidity / poolSize;
    const priceAfterSwap = newTotalLiquidity / newPoolSize;

    const slippage =
      ((priceAfterSwap - priceBeforeSwap) / priceBeforeSwap) * 100;

    return Math.abs(slippage).toFixed(2);
  };
  const handleSwapStxToYes = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microSTX
    const microStxAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    // Add a buffer for potential additional costs (e.g., fees, contract behavior)
    const bufferAmount = microStxAmount; // 100% buffer
    const totalAmountWithBuffer = microStxAmount + bufferAmount;

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microStxAmount), // stx-amount in microSTX
    ];

    // Create a post-condition using the Pc helper
    const postCondition = Pc.principal(userAddress)
      .willSendLte(totalAmountWithBuffer)
      .ustx();

    const options = {
      contractAddress,
      contractName,
      functionName: "swap-stx-to-yes",
      functionArgs,
      network: new StacksMainnet(),
      postConditions: [postCondition],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        console.log("Transaction canceled");
      },
    };
    console.log(options);
    try {
      await doContractCall(options);
      showTransactionToast(
        "Buy Yes",
        "Success",
        "Successfully bought Yes tokens"
      );
    } catch (error) {
      console.error("Error calling contract:", error);
      showTransactionToast("Buy Yes", "Error", error.message);
      setError(error.message);
    }
  };

  const handleAddLiquidity = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }
    showTransactionToast("Add Liquidity", "Pending", "Transaction submitted");

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert liquidityAmount to microSTX
    const microStxAmount = parseInt(parseFloat(liquidityAmount) * 1000000);

    // Add a buffer for potential additional costs
    const bufferAmount = microStxAmount; // 100% buffer
    const totalAmountWithBuffer = microStxAmount + bufferAmount;

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microStxAmount), // stx-amount in microSTX
    ];

    // Create a post-condition using the Pc helper
    const postCondition = Pc.principal(userAddress)
      .willSendLte(totalAmountWithBuffer)
      .ustx();

    const options = {
      contractAddress,
      contractName,
      functionName: "add-liquidity",
      functionArgs,
      network: new StacksMainnet(),
      postConditions: [postCondition],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
        // Optionally refresh market details and user position here
        fetchMarketDetails();
        fetchUserPosition();
      },
      onCancel: () => {
        console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
      showTransactionToast(
        "Add Liquidity",
        "Success",
        "Liquidity added successfully"
      );
    } catch (error) {
      console.error("Error calling contract:", error);
      showTransactionToast("Add Liquidity", "Error", error.message);
      setError(error.message);
    }
  };

  const handleLiquidityAmountChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,6}$/.test(value) || value === "") {
      setLiquidityAmount(value);
    }
  };
  const handleRemoveLiquidityPercentageChange = (value) => {
    setRemoveLiquidityPercentage(value);
  };
  const handleRemoveLiquidity = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }
    showTransactionToast(
      "Remove Liquidity",
      "Pending",
      "Transaction submitted"
    );

    const userAddress = userData.profile.stxAddress.mainnet;

    // Calculate the amount of liquidity to remove based on the user's total position and the selected percentage
    const totalUserLiquidity = userPosition.yes + userPosition.no;
    const liquidityToRemove =
      (totalUserLiquidity * removeLiquidityPercentage) / 100;

    // Convert liquidityToRemove to microSTX
    const microStxAmount = Math.floor(liquidityToRemove * 1000000);

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microStxAmount), // stx-amount in microSTX
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: "remove-liquidity",
      functionArgs,
      network: new StacksMainnet(),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
        fetchMarketDetails();
        fetchUserPosition();
      },
      onCancel: () => {
        console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
      showTransactionToast(
        "Remove Liquidity",
        "Success",
        "Liquidity removed successfully"
      );
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Remove Liquidity", "Error", error.message);
    }
  };

  const handleSwapYesToStx = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microSTX
    const microTokenAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microTokenAmount), // yes-amount in microSTX
    ];

    // No need for post-condition on STX transfer, as the contract is sending STX to the user

    const options = {
      contractAddress,
      contractName,
      functionName: "swap-yes-to-stx",
      functionArgs,
      network: new StacksMainnet(),
      postConditions: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
      showTransactionToast(
        "Buy Yes",
        "Success",
        "Successfully bought Yes tokens"
      );
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Buy Yes", "Error", error.message);
    }
  };

  const handleSwapNoToStx = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microSTX
    const microTokenAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microTokenAmount), // no-amount in microSTX
    ];

    // No need for post-condition on STX transfer, as the contract is sending STX to the user

    const options = {
      contractAddress,
      contractName,
      functionName: "swap-no-to-stx",
      functionArgs,
      network: new StacksMainnet(),
      postConditions: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
      showTransactionToast(
        "Buy No",
        "Success",
        "Successfully bought No tokens"
      );
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Buy No", "Error", error.message);
    }
  };

  const handleTransaction = (action) => {
    if (action === "buy") {
      if (location.pathname.includes("/yes")) {
        handleSwapStxToYes();
      } else {
        handleSwapStxToNo();
      }
    } else if (action === "sell") {
      if (location.pathname.includes("/yes")) {
        handleSwapYesToStx();
      } else {
        handleSwapNoToStx();
      }
    } else {
      console.log("Unknown transaction type");
      setError("Unknown transaction type. Please try again.");
    }
  };

  const handleSwapStxToNo = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");

      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microSTX
    const microStxAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    // Add a buffer for potential additional costs (e.g., fees, contract behavior)
    const bufferAmount = microStxAmount; // 100% buffer
    const totalAmountWithBuffer = microStxAmount + bufferAmount;

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microStxAmount), // stx-amount in microSTX
    ];

    // Create a post-condition using the Pc helper
    const postCondition = Pc.principal(userAddress)
      .willSendLte(totalAmountWithBuffer)
      .ustx();

    const options = {
      contractAddress,
      contractName,
      functionName: "swap-stx-to-no",
      functionArgs,
      network: new StacksMainnet(),
      postConditions: [postCondition],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
      showTransactionToast(
        "Buy No",
        "Success",
        "Successfully bought No tokens"
      );
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Buy No", "Error", error.message);
    }
  };

  const fetchUserPosition = async () => {
    if (!userData || !userData.profile) {
      console.log("User data is not available");
      return;
    }
    setIsLoading(true);
    const functionName = "get-user-position";
    const marketId = uintCV(onChainId);
    const userAddress = userData.profile.stxAddress.mainnet;
    const user = standardPrincipalCV(userAddress);
    const network = new StacksMainnet();

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [marketId, user],
      network,
      senderAddress: userAddress,
    };

    try {
      const response = await callReadOnlyFunction(options);
      console.log("Fetch User Details");
      console.log(response);

      // Parse the response
      if (response && response.value && response.value.data) {
        const newUserPosition = {
          no: Number(response.value.data.no.value) / 1000000,
          yes: Number(response.value.data.yes.value) / 1000000,
        };
        console.log("Parsed User Position:", newUserPosition); // Changed this line
        setUserPosition(newUserPosition); // Update the state
      } else {
        console.log("Unexpected response structure:", response);
        setError("Unable to parse user position");
      }
    } catch (err) {
      setError(err.message);
      console.log("Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const showTransactionToast = (type, status, message) => {
    let toastStatus;
    switch (status.toLowerCase()) {
      case "pending":
        toastStatus = "info";
        break;
      case "success":
        toastStatus = "success";
        break;
      case "error":
        toastStatus = "error";
        break;
      default:
        toastStatus = "info";
    }

    toast({
      title: `${type} Transaction ${status}`,
      description: message,
      status: toastStatus,
      duration: 5000,
      isClosable: true,
    });
  };
  const getContractOwner = async () => {
    setIsLoading(true);
    setError(null);
    setDecodedOwner(null);

    try {
      const url = `${apiEndpoint}/v2/contracts/call-read/${contractAddress}/${contractName}/get-contract-owner`;
      console.log("Fetching contract owner from URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: contractAddress,
          arguments: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(
        "Contract owner raw response:",
        JSON.stringify(responseData, null, 2)
      );

      if (responseData.okay && responseData.result) {
        const clarityValue = hexToCV(responseData.result);
        const ownerAddress = cvToString(clarityValue);
        setDecodedOwner(ownerAddress);
      }
    } catch (err) {
      console.error("Error fetching contract owner:", err);
      setError(
        err.message || "An error occurred while fetching the contract owner"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,6}$/.test(value) || value === "") {
      setTransactionAmount(value);
    }
  };
  const handleClaimWinnings = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    showTransactionToast("Claim Winnings", "Pending", "Transaction submitted");

    const userAddress = userData.profile.stxAddress.mainnet;

    const functionArgs = [
      uintCV(onChainId), // market-id
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: "claim-winnings",
      functionArgs,
      network: new StacksMainnet(),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log("Transaction submitted:", data);
        showTransactionToast(
          "Claim Winnings",
          "Success",
          "Winnings claimed successfully"
        );
        fetchMarketDetails();
        fetchUserPosition();
      },
      onCancel: () => {
        console.log("Transaction canceled");
        showTransactionToast(
          "Claim Winnings",
          "Cancelled",
          "Transaction was cancelled"
        );
      },
    };

    try {
      await doContractCall(options);
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Claim Winnings", "Error", error.message);
    }
  };
  return (
    <Box maxWidth="600px" margin="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <Heading size="md">
              {market?.question || "Betting Market Interface"}
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="sm">Add Liquidity</Heading>
              <HStack>
                <InputGroup>
                  <Input
                    type="text"
                    value={liquidityAmount}
                    onChange={handleLiquidityAmountChange}
                    placeholder="Enter amount"
                  />
                  <InputRightAddon children="STX" />
                </InputGroup>
                <Button
                  onClick={handleAddLiquidity}
                  colorScheme="purple"
                  isDisabled={!liquidityAmount}
                >
                  Add Liquidity
                </Button>
              </HStack>
              {userPosition && userPosition.yes > 0 && userPosition.no > 0 && (
                <>
                  <Heading size="sm">Remove Liquidity</Heading>
                  <Text>Select percentage of liquidity to remove:</Text>
                  <Slider
                    value={removeLiquidityPercentage}
                    onChange={handleRemoveLiquidityPercentageChange}
                    min={0}
                    max={100}
                    step={1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text>{removeLiquidityPercentage}%</Text>
                  <Text>
                    Amount to remove:{" "}
                    {(
                      ((userPosition.yes + userPosition.no) *
                        removeLiquidityPercentage) /
                      100
                    ).toFixed(6)}{" "}
                    Tokens (Est.{" "}
                    {(
                      ((calculateEstimatedValue(
                        userPosition.yes,
                        marketDetails["yes-pool"],
                        marketDetails["total-liquidity"]
                      ) +
                        calculateEstimatedValue(
                          userPosition.no,
                          marketDetails["no-pool"],
                          marketDetails["total-liquidity"]
                        )) *
                        removeLiquidityPercentage) /
                      100
                    ).toFixed(6)}{" "}
                    STX)
                  </Text>
                  <Button onClick={handleRemoveLiquidity} colorScheme="orange">
                    Remove Liquidity
                  </Button>
                </>
              )}
              <HStack justifyContent="space-between">
                <Button
                  onClick={getContractOwner}
                  isLoading={isLoading}
                  colorScheme="blue"
                >
                  Get Contract Owner
                </Button>
                {onChainId && (
                  <Text fontWeight="bold">On-chain ID: {onChainId}</Text>
                )}
              </HStack>

              {isLoading && (
                <HStack justifyContent="center">
                  <Spinner />
                  <Text>Loading...</Text>
                </HStack>
              )}

              {error && (
                <Text color="red.500" fontWeight="bold">
                  Error: {error}
                </Text>
              )}

              {decodedOwner && (
                <Text fontWeight="medium">Contract Owner: {decodedOwner}</Text>
              )}

              <Divider />
              {marketDetails && (
                <>
                  <Heading size="sm">Market Details</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>No Pool</StatLabel>
                      <StatNumber>
                        {marketDetails["no-pool"] / 1000000} Tokens
                      </StatNumber>
                      <StatHelpText>
                        Est. Value:{" "}
                        {(marketDetails["no-pool"] / 1000000).toFixed(6)} STX
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Yes Pool</StatLabel>
                      <StatNumber>
                        {marketDetails["yes-pool"] / 1000000} Tokens
                      </StatNumber>
                      <StatHelpText>
                        Est. Value:{" "}
                        {(marketDetails["yes-pool"] / 1000000).toFixed(6)} STX
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Liquidity</StatLabel>
                      <StatNumber>
                        {marketDetails["total-liquidity"] / 1000000} STX
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Resolved</StatLabel>
                      <StatNumber>
                        {resolution === true ? "Yes" : "No"}
                      </StatNumber>
                    </Stat>
                    {isResolved(marketDetails) && (
                      <Stat>
                        <StatLabel>Outcome</StatLabel>
                        <StatNumber>
                          {outcome === true ? "Yes" : "No"}
                        </StatNumber>
                      </Stat>
                    )}
                  </SimpleGrid>
                </>
              )}

              {userPosition && marketDetails && (
                <>
                  <Heading size="sm" mt={4}>
                    Your Position
                  </Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>No Tokens</StatLabel>
                      <StatNumber>{userPosition.no.toFixed(6)}</StatNumber>
                      <StatHelpText>
                        Est. Value:{" "}
                        {calculateEstimatedValue(
                          userPosition.no,
                          marketDetails["no-pool"],
                          marketDetails["total-liquidity"]
                        ).toFixed(6)}{" "}
                        STX
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Yes Tokens</StatLabel>
                      <StatNumber>{userPosition.yes.toFixed(6)}</StatNumber>
                      <StatHelpText>
                        Est. Value:{" "}
                        {calculateEstimatedValue(
                          userPosition.yes,
                          marketDetails["yes-pool"],
                          marketDetails["total-liquidity"]
                        ).toFixed(6)}{" "}
                        STX
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </>
              )}

              {marketDetails &&
                isResolved(marketDetails) &&
                userHasPosition(userPosition) && (
                  <Button
                    onClick={handleClaimWinnings}
                    colorScheme="green"
                    size="lg"
                    width="100%"
                    mt={4}
                  >
                    Claim Winnings
                  </Button>
                )}

              <Heading size="sm">Trade Tokens</Heading>
              <HStack>
                <InputGroup>
                  <Input
                    type="text"
                    value={transactionAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter Token amount"
                    isDisabled={marketDetails && isResolved(marketDetails)}
                  />
                </InputGroup>
                <Button
                  onClick={() => handleTransaction("buy")}
                  colorScheme="green"
                  isDisabled={
                    !transactionAmount ||
                    (marketDetails && isResolved(marketDetails))
                  }
                >
                  Buy {location.pathname.includes("/yes") ? "Yes" : "No"} Tokens
                </Button>
                <Button
                  onClick={() => handleTransaction("sell")}
                  colorScheme="red"
                  isDisabled={
                    !transactionAmount ||
                    (marketDetails && isResolved(marketDetails))
                  }
                >
                  Sell {location.pathname.includes("/yes") ? "Yes" : "No"}{" "}
                  Tokens
                </Button>
              </HStack>
              {marketDetails && !isResolved(marketDetails) && (
                <Text>Estimated Slippage: {slippage}%</Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default BettingInterface;
