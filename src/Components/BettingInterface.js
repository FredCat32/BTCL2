import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Comments from "./Comments";
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
import PriceHistoryChart from "./PriceHistoryChart";
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
  const [marketNotes, setMarketNotes] = useState("");
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  let contractName = process.env.REACT_APP_CONTRACT_NAME;
  const apiEndpoint = "https://stacks-node-api.mainnet.stacks.co";
  const [slippage, setSlippage] = useState(0);
  const [liquidityTokens, setLiquidityTokens] = useState(0);
  const [totalLiquidityTokens, setTotalLiquidityTokens] = useState(0);
  const [userLiquidity, setUserLiquidity] = useState(0);
  const [priceHistoryData, setPriceHistoryData] = useState([]);

  const calculateEstimatedValue = (tokenAmount, poolSize, totalLiquidity) => {
    return (tokenAmount * totalLiquidity) / poolSize;
  };
  const calculateEstimatedStxFromYes = (yesAmount, yesPool, noPool) => {
    // Ensure all inputs are positive
    const microYesAmount = Math.abs(yesAmount);
    const microYesPool = Math.abs(yesPool);
    const microNoPool = Math.abs(noPool);

    console.log("Input values:", {
      microYesAmount,
      microYesPool,
      microNoPool,
    });

    // Calculate constant product before pool changes
    const k = microYesPool * microNoPool;

    // Calculate new Yes pool (decreases when selling)
    const newYesPool = microYesPool + microYesAmount; // Add because we're returning tokens to pool

    // Calculate required No pool to maintain constant product
    const requiredNoPool = Math.floor(k / newYesPool);

    // Calculate STX to receive (difference in No pool)
    const stxAmountBeforeFee = Math.abs(microNoPool - requiredNoPool);

    // Apply fee
    const feeDenominator = 10000;
    const feeNumerator = 100; // 1% fee
    const feeMultiplier = feeDenominator - feeNumerator;
    const stxAmount = Math.floor(
      (stxAmountBeforeFee * feeMultiplier) / feeDenominator
    );

    console.log("Calculation results:", {
      k,
      newYesPool,
      requiredNoPool,
      stxAmountBeforeFee,
      stxAmount,
    });

    return stxAmount;
  };
  const fetchMarketDetailsFromBackend = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/markets/${marketId}`);
      console.log("Full market details response:", response.data);
      if (response.data && response.data.notes) {
        console.log("Notes from response:", response.data.notes);
        console.log(process.env.REACT_APP_CONTRACT_NAME);
        console.log(typeof process.env.REACT_APP_CONTRACT_NAME);
        contractName = response.data.contract;

        console.log("new contract is" + contractName);
        setMarketNotes(response.data.notes);
      } else {
        console.log("No notes found in the response");
        setMarketNotes(""); // Set to empty string if no notes are found
      }
    } catch (error) {
      console.error("Error fetching market details from backend:", error);
      setMarketNotes(""); // Set to empty string in case of error
    }
  };
  const calculateEstimatedNoAmount = (stxAmount, yesPool, noPool) => {
    const feeDenominator = 10000;
    const feeNumerator = 100; // Hardcoded 1% fee
    const feeMultiplier = feeDenominator - feeNumerator;

    // Net STX amount after fee
    const netStxAmount = Math.floor(
      (stxAmount * feeMultiplier) / feeDenominator
    );

    // Calculate NO tokens to give to user
    const numerator = netStxAmount * yesPool;
    const denominator = noPool + netStxAmount;
    const noAmount = Math.floor(numerator / denominator);

    return noAmount;
  };

  const calculateEstimatedStxFromNo = (noAmount, yesPool, noPool) => {
    const feeDenominator = 10000;
    const feeNumerator = 100; // 1% fee
    const feeMultiplier = feeDenominator - feeNumerator;

    // New NO pool after user adds noAmount
    const newNoPool = noPool + noAmount;

    // Calculate STX amount to give to user before fee
    const numerator = noAmount * yesPool;
    const denominator = newNoPool;
    const stxAmountBeforeFee = Math.floor(numerator / denominator);

    // Apply fee
    const stxAmount = Math.floor(
      (stxAmountBeforeFee * feeMultiplier) / feeDenominator
    );

    return stxAmount;
  };

  const calculateEstimatedYesAmount = (stxAmount, yesPool, noPool) => {
    const feeDenominator = 10000;
    const feeNumerator = 100; // Hardcoded 1% fee
    const feeMultiplier = feeDenominator - feeNumerator;

    // Net STX amount after fee
    const netStxAmount = Math.floor(
      (stxAmount * feeMultiplier) / feeDenominator
    );

    // Calculate YES tokens to give to user
    const numerator = netStxAmount * noPool;
    const denominator = yesPool + netStxAmount;
    const yesAmount = Math.floor(numerator / denominator);

    return yesAmount;
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
      fetchMarketDetailsFromBackend();
      fetchMarketDetails();
      fetchUserPosition();
      fetchUserLiquidity();
      fetchPriceHistory();
    }
  }, [onChainId]);
  useEffect(() => {
    if (marketDetails && transactionAmount) {
      const inputPool = location.pathname.includes("/yes")
        ? marketDetails["lp-yes-pool"]
        : marketDetails["lp-no-pool"];
      const outputPool = location.pathname.includes("/yes")
        ? marketDetails["lp-no-pool"]
        : marketDetails["lp-yes-pool"];
      const calculatedSlippage = calculateSlippage(
        transactionAmount * 1000000,
        inputPool,
        outputPool
      );
      setSlippage(calculatedSlippage);
    }
  }, [transactionAmount, marketDetails, location.pathname]);
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
            //  console.log("Parsed Outcome:", parsedOutcome);
            setOutcome(parsedOutcome);
          } else {
            //  console.log("Outcome value is undefined");
          }

          const resolvedValue = response.value.data.resolved;
          if (resolvedValue !== undefined) {
            const parsedResolve = cvToValue(resolvedValue);
            // console.log("Parsed Resolve:", parsedResolve);
            setResolution(parsedResolve);
          } else {
            // console.log("Resolved value is undefined");
          }
          const newYesPool = (parsedResponse["lp-yes-pool"] ?? 0) / 1000000; // Convert to STX
          const newNoPool = (parsedResponse["lp-no-pool"] ?? 0) / 1000000; // Convert to STX

          if (newYesPool !== yesPool || newNoPool !== noPool) {
            //  console.log("Pool values have changed. Updating backend...");

            try {
              const url = `${API_URL}/api/markets/${marketId}`;
              const backendResponse = await axios.patch(url, {
                yesPool: newYesPool,
                noPool: newNoPool,
              });

              if (backendResponse.status !== 200) {
                throw new Error("Failed to update market in backend");
              }

              // console.log("Backend updated successfully");

              // Update local state
              setYesPool(newYesPool);
              setNoPool(newNoPool);
            } catch (error) {
              // console.error("Error updating backend:", error);
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
      // console.error("Error in fetchMarketDetails:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchPriceHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/markets/${marketId}/prices`
      );
      setPriceHistoryData(response.data);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };
  const claimLPWinnings = async () => {
    if (!userData || !userData.profile) {
      // console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }
    setIsLoading(true);
    showTransactionToast(
      "Claim LP Winnings",
      "Pending",
      "Transaction submitted"
    );

    const functionName = "claim-lp-winnings";
    const marketId = uintCV(onChainId);

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [marketId],
      network: new StacksMainnet(),
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        //  console.log("Transaction submitted:", data);
        showTransactionToast(
          "Claim LP Winnings",
          "Success",
          "Successfully claimed LP winnings"
        );
        setIsLoading(false);
        // Optionally refresh market details and user position here
        fetchMarketDetails();
        fetchUserPosition();
      },
      onCancel: () => {
        // console.log("Transaction canceled");
        showTransactionToast(
          "Claim LP Winnings",
          "Cancelled",
          "Transaction was cancelled"
        );
        setIsLoading(false);
      },
    };

    try {
      await doContractCall(options);
    } catch (error) {
      // console.error("Error claiming LP winnings:", error);
      setIsLoading(false);
      setError(error.message);
      showTransactionToast("Claim LP Winnings", "Error", error.message);
    }
  };
  const calculatePoints = (transactionAmount, action) => {
    // Convert STX amount to points using a standardized ratio
    const basePoints = parseFloat(transactionAmount);

    // Action multipliers for different activities
    const multipliers = {
      buy_yes: 1.0,
      buy_no: 1.0,
      sell_yes: 0.5,
      sell_no: 0.5,
      provide_liquidity: 2.0, // Double points for providing liquidity
      remove_liquidity: -2.0, // Lose full amount of bonus points when removing
    };

    // Calculate base points with multiplier, then multiply by 1000 for bigger numbers
    return Math.floor(basePoints * (multipliers[action] || 1.0) * 1000);
  };

  const calculateSlippage = (inputAmount, inputPool, outputPool) => {
    // Ensure all inputs are numbers
    const input = Number(inputAmount);
    const inPool = Number(inputPool);
    const outPool = Number(outputPool);

    // Calculate the constant product
    const k = inPool * outPool;

    // Calculate new input pool size
    const newInPool = inPool + input;

    // Calculate new output pool size
    const newOutPool = k / newInPool;

    // Calculate the amount of tokens received
    const tokensReceived = outPool - newOutPool;

    // Calculate the effective price before the swap
    const priceBefore = outPool / inPool;

    // Calculate the effective price after the swap
    const priceAfter = tokensReceived / input;

    // Calculate the price impact (slippage)
    const slippage = ((priceBefore - priceAfter) / priceBefore) * 100;

    return slippage.toFixed(2);
  };

  const handleSwapStxToYes = async () => {
    if (!userData || !userData.profile) {
      // console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microSTX
    const microStxAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    // Ensure microStxAmount is an integer
    if (!Number.isInteger(microStxAmount)) {
      // console.error("microStxAmount is not an integer:", microStxAmount);
      setError("Invalid STX amount. Please enter a valid number.");
      return;
    }

    const slippageTolerance = 0.95; // Accept up to 1% slippage

    // Use the updated estimation function with hardcoded fee
    const estimatedYesTokens = calculateEstimatedYesAmount(
      microStxAmount,
      marketDetails["lp-yes-pool"],
      marketDetails["lp-no-pool"]
    );

    // Ensure estimatedYesTokens is a number
    if (isNaN(estimatedYesTokens)) {
      //  console.error("estimatedYesTokens is NaN");
      setError("Failed to estimate YES tokens. Please try again.");
      return;
    }

    const minYesAmount = Math.floor(estimatedYesTokens * slippageTolerance);

    // Ensure minYesAmount is an integer
    if (!Number.isInteger(minYesAmount)) {
      //  console.error("minYesAmount is not an integer:", minYesAmount);
      setError("Invalid minimum YES amount. Please try again.");
      return;
    }

    // Log values for debugging
    //  console.log("microStxAmount:", microStxAmount);
    //  console.log("estimatedYesTokens:", estimatedYesTokens);
    //  console.log("minYesAmount:", minYesAmount);
    //  console.log("Market Details:", marketDetails);

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microStxAmount), // stx-amount in microSTX
      uintCV(minYesAmount),
    ];

    // Create a post-condition using the Pc helper
    const postCondition = Pc.principal(userAddress)
      .willSendEq(microStxAmount)
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
        //    console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        //    console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
      showTransactionToast(
        "Buy Yes",
        "Success",
        "Successfully bought Yes tokens"
      );
      await updatePoints(userAddress, transactionAmount, onChainId, "buy_yes");
    } catch (error) {
      //   console.error("Error calling contract:", error);
      showTransactionToast("Buy Yes", "Error", error.message);
      setError(error.message);
    }
  };

  const handleAddLiquidity = async () => {
    if (!userData || !userData.profile) {
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
      onFinish: async (data) => {
        try {
          // Award points for providing liquidity
          await updatePoints(
            userAddress,
            liquidityAmount, // Using original STX amount
            onChainId,
            "provide_liquidity"
          );

          // Refresh market details and user position
          await fetchMarketDetails();
          await fetchUserPosition();

          showTransactionToast(
            "Add Liquidity",
            "Success",
            "Liquidity added successfully and points awarded"
          );
        } catch (error) {
          console.error("Error in post-transaction processing:", error);
          // Still show success for the main transaction
          showTransactionToast(
            "Add Liquidity",
            "Success",
            "Liquidity added successfully (points update pending)"
          );
        }
      },
      onCancel: () => {
        showTransactionToast(
          "Add Liquidity",
          "Cancelled",
          "Transaction was cancelled"
        );
      },
    };

    try {
      await doContractCall(options);
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

    // Calculate the amount of LP tokens to remove based on the user's total liquidity and the selected percentage
    const lpTokensToRemove = Math.floor(
      ((userLiquidity * removeLiquidityPercentage) / 100) * 1000000
    );

    // Calculate the STX equivalent for points deduction
    // userLiquidity is in STX, and removeLiquidityPercentage is the percentage being removed
    const stxAmountRemoved = (userLiquidity * removeLiquidityPercentage) / 100;

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(lpTokensToRemove), // lp-tokens-to-remove in micro units
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: "remove-liquidity",
      functionArgs,
      network: new StacksMainnet(),
      postConditionMode: PostConditionMode.Allow,
      onFinish: async (data) => {
        try {
          // Deduct points proportional to liquidity removed
          await updatePoints(
            userAddress,
            formatNumber(stxAmountRemoved), // Format the STX amount being removed
            onChainId,
            "remove_liquidity"
          );

          await Promise.all([
            fetchMarketDetails(),
            fetchUserPosition(),
            fetchUserLiquidity(),
          ]);

          showTransactionToast(
            "Remove Liquidity",
            "Success",
            "Liquidity removed successfully and points adjusted"
          );
        } catch (error) {
          console.error("Error in post-transaction processing:", error);
          showTransactionToast(
            "Remove Liquidity",
            "Success",
            "Liquidity removed successfully (points update pending)"
          );
        }
      },
      onCancel: () => {
        console.log("Transaction canceled");
        showTransactionToast(
          "Remove Liquidity",
          "Cancelled",
          "Transaction cancelled"
        );
      },
    };

    try {
      await doContractCall(options);
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Remove Liquidity", "Error", error.message);
    }
  };
  const formatNumber = (number, decimalPlaces = 3) => {
    // First, round the number to the desired decimal places
    const rounded = Number(number).toFixed(decimalPlaces);

    // Then, remove trailing zeros after the decimal point
    return parseFloat(rounded).toString();
  };
  const handleSwapYesToStx = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microTokens
    const microTokenAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    // Ensure microTokenAmount is an integer
    if (!Number.isInteger(microTokenAmount)) {
      console.error("microTokenAmount is not an integer:", microTokenAmount);
      setError("Invalid token amount. Please enter a valid number.");
      return;
    }

    const slippageTolerance = 0.95; // Accept up to 1% slippage

    // Use the updated estimation function with hardcoded fee
    const estimatedStxAmount = calculateEstimatedStxFromYes(
      microTokenAmount,
      marketDetails["lp-yes-pool"],
      marketDetails["lp-no-pool"]
    );
    console.log(estimatedStxAmount);
    // Ensure estimatedStxAmount is a number
    if (isNaN(estimatedStxAmount)) {
      console.error("estimatedStxAmount is NaN");
      setError("Failed to estimate STX amount. Please try again.");
      return;
    }

    const minStxAmount = Math.floor(estimatedStxAmount * slippageTolerance);

    // Ensure minStxAmount is an integer
    if (!Number.isInteger(minStxAmount)) {
      console.error("minStxAmount is not an integer:", minStxAmount);
      setError("Invalid minimum STX amount. Please try again.");
      return;
    }

    // Log values for debugging
    //  console.log("microTokenAmount:", microTokenAmount);
    // console.log("estimatedStxAmount:", estimatedStxAmount);
    //  console.log("minStxAmount:", minStxAmount);
    //  console.log("Market Details:", marketDetails);

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microTokenAmount), // yes-amount in microTokens
      uintCV(minStxAmount),
    ];
    console.log(functionArgs);
    console.log(functionArgs);
    console.log("User position" + userPosition);
    console.log(userPosition);
    console.log("attempting to sell" + microTokenAmount);
    console.log(microTokenAmount);
    const options = {
      contractAddress,
      contractName,
      functionName: "swap-yes-to-stx",
      functionArgs,
      network: new StacksMainnet(),
      postConditions: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        //  console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        //  console.log("Transaction canceled");
      },
    };
    //  console.log(options);
    try {
      await doContractCall(options);
      showTransactionToast(
        "Sell Yes",
        "Success",
        "Successfully sold Yes tokens"
      );
      await updatePoints(userAddress, -transactionAmount, onChainId, "sell_no");
    } catch (error) {
      console.error("Error calling contract:", error);
      showTransactionToast("Sell Yes", "Error", error.message);
      setError(error.message);
    }
  };
  const handleSwapNoToStx = async () => {
    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microTokens
    const microTokenAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    // Ensure microTokenAmount is an integer
    if (!Number.isInteger(microTokenAmount)) {
      console.error("microTokenAmount is not an integer:", microTokenAmount);
      setError("Invalid token amount. Please enter a valid number.");
      return;
    }

    const slippageTolerance = 0.95; // Accept up to 1% slippage

    // Use the updated estimation function with hardcoded fee
    const estimatedStxAmount = calculateEstimatedStxFromNo(
      microTokenAmount,
      marketDetails["lp-yes-pool"],
      marketDetails["lp-no-pool"]
    );

    // Ensure estimatedStxAmount is a number
    if (isNaN(estimatedStxAmount)) {
      console.error("estimatedStxAmount is NaN");
      setError("Failed to estimate STX amount. Please try again.");
      return;
    }

    const minStxAmount = Math.floor(estimatedStxAmount * slippageTolerance);

    // Ensure minStxAmount is an integer
    if (!Number.isInteger(minStxAmount)) {
      console.error("minStxAmount is not an integer:", minStxAmount);
      setError("Invalid minimum STX amount. Please try again.");
      return;
    }

    // Log values for debugging
    // console.log("microTokenAmount:", microTokenAmount);
    //  console.log("estimatedStxAmount:", estimatedStxAmount);
    //  console.log("minStxAmount:", minStxAmount);
    // console.log("Market Details:", marketDetails);

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microTokenAmount), // no-amount in microTokens
      uintCV(minStxAmount),
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: "swap-no-to-stx",
      functionArgs,
      network: new StacksMainnet(),
      postConditions: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        //   console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        //     console.log("Transaction canceled");
      },
    };
    //  console.log(options);
    try {
      await doContractCall(options);
      showTransactionToast("Sell No", "Success", "Successfully sold No tokens");
      await updatePoints(userAddress, -transactionAmount, onChainId, "sell_no");
    } catch (error) {
      //    console.error("Error calling contract:", error);
      showTransactionToast("Sell No", "Error", error.message);
      setError(error.message);
    }
  };

  const handleSwapStxToNo = async () => {
    if (!userData || !userData.profile) {
      //    console.error("User not connected");
      setError("Please connect your wallet first");
      return;
    }

    const userAddress = userData.profile.stxAddress.mainnet;

    // Convert transactionAmount to microSTX
    const microStxAmount = parseInt(parseFloat(transactionAmount) * 1000000);

    // Ensure microStxAmount is an integer
    if (!Number.isInteger(microStxAmount)) {
      //    console.error("microStxAmount is not an integer:", microStxAmount);
      setError("Invalid STX amount. Please enter a valid number.");
      return;
    }

    const slippageTolerance = 0.95; // Accept up to 1% slippage

    // Use the updated estimation function with hardcoded fee
    const estimatedNoTokens = calculateEstimatedNoAmount(
      microStxAmount,
      marketDetails["lp-yes-pool"],
      marketDetails["lp-no-pool"]
    );

    // Ensure estimatedNoTokens is a number
    if (isNaN(estimatedNoTokens)) {
      //    console.error("estimatedNoTokens is NaN");
      setError("Failed to estimate NO tokens. Please try again.");
      return;
    }

    const minNoAmount = Math.floor(estimatedNoTokens * slippageTolerance);

    // Ensure minNoAmount is an integer
    if (!Number.isInteger(minNoAmount)) {
      //   console.error("minNoAmount is not an integer:", minNoAmount);
      setError("Invalid minimum NO amount. Please try again.");
      return;
    }

    // Log values for debugging
    //  console.log("microStxAmount:", microStxAmount);
    //   console.log("estimatedNoTokens:", estimatedNoTokens);
    //   console.log("minNoAmount:", minNoAmount);
    //   console.log("Market Details:", marketDetails);

    const functionArgs = [
      uintCV(onChainId), // market-id
      uintCV(microStxAmount), // stx-amount in microSTX
      uintCV(minNoAmount),
    ];

    // Create a post-condition using the Pc helper
    const postCondition = Pc.principal(userAddress)
      .willSendEq(microStxAmount)
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
        //    console.log("Transaction submitted:", data);
      },
      onCancel: () => {
        //     console.log("Transaction canceled");
      },
    };

    try {
      await doContractCall(options);
      showTransactionToast(
        "Buy No",
        "Success",
        "Successfully bought No tokens"
      );
      await updatePoints(userAddress, transactionAmount, onChainId, "buy_no");
    } catch (error) {
      //   console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Buy No", "Error", error.message);
    }
  };

  const updatePoints = async (
    walletAddress,
    transactionAmount,
    marketId,
    action
  ) => {
    if (!walletAddress || !transactionAmount || !marketId || !action) {
      console.error("Missing required parameters for points update");
      return;
    }

    const points = calculatePoints(transactionAmount, action);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const endpoint = points > 0 ? "add" : "deduct";
        const absPoints = Math.abs(points);

        const response = await axios.post(`${API_URL}/api/points/${endpoint}`, {
          walletAddress,
          points: absPoints,
          marketId,
          reason: action,
          metadata: {
            originalAmount: transactionAmount,
            timestamp: Date.now(),
            network: "mainnet",
            calculatedMultiplier: points / absPoints,
            actionType: action,
          },
        });

        console.log(`Points ${endpoint}ed successfully:`, {
          walletAddress: walletAddress.slice(0, 8) + "...",
          points: absPoints,
          action,
        });

        return response.data;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error("Failed to update points after maximum retries:", {
            error: error.message,
            walletAddress: walletAddress.slice(0, 8) + "...",
            attempt: retryCount,
          });
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, retryCount))
          );
        }
      }
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
      //    console.log("Unknown transaction type");
      setError("Unknown transaction type. Please try again.");
    }
  };
  const fetchUserLiquidity = async () => {
    if (!userData?.profile?.stxAddress?.mainnet) {
      //  console.error("User data is not available");
      setError("User data is not available. Please ensure you're logged in.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const functionName = "get-user-liquidity";
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
      console.log("Full User Liquidity Response:", response);

      if (response && response.value) {
        const responseString = cvToString(response);
        console.log("Response String:", responseString);

        // Parse the response string to extract the number
        const match = responseString.match(/\(ok u(\d+)\)/);
        if (match) {
          const liquidityValue = parseInt(match[1], 10);
          const adjustedLiquidity = liquidityValue / 1000000; // Convert to STX
          console.log("Parsed Liquidity:", liquidityValue);
          console.log("Adjusted Liquidity (STX):", adjustedLiquidity);
          setUserLiquidity(adjustedLiquidity);
        } else {
          console.error("Failed to parse liquidity value from response");
          setError("Failed to parse liquidity value");
        }
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (err) {
      console.error("Error fetching user liquidity:", err);
      setError(`Failed to fetch user liquidity: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchUserPosition = async () => {
    console.log("fetchinggggggggggg");
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
      console.log("response  get user position");
      console.log(response);
      // Parse the response
      if (response && response.value && response.value.data) {
        const newUserPosition = {
          no: Number(response.value.data["no-tokens"].value) / 1000000,
          yes: Number(response.value.data["yes-tokens"].value) / 1000000,
          yes_stx: Number(response.value.data["yes-stx"].value) / 1000000, // keep track of STX invested
          no_stx: Number(response.value.data["no-stx"].value) / 1000000, // keep track of STX invested
        };
        //console.log("Parsed User Position:", newUserPosition); // Changed this line
        setUserPosition(newUserPosition); // Update the state
      } else {
        //console.log("Unexpected response structure:", response);
        setError("Unable to parse user position");
      }
    } catch (err) {
      setError(err.message);
      console.log("Errorrr:", err.message);
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
      //console.log("Fetching contract owner from URL:", url);

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
      //console.log(
      // "Contract owner raw response:",
      // JSON.stringify(responseData, null, 2)
      //  );

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
    console.log("Raw input value:", value);

    // Allow numbers and decimals with up to 6 decimal places
    if (/^\d*\.?\d{0,6}$/.test(value) || value === "") {
      const numValue = parseFloat(value || "0");
      if (location.pathname.includes("/yes") && userPosition.yes_tokens) {
        if (value === "" || numValue <= userPosition.yes_tokens) {
          setTransactionAmount(value);
        }
      } else if (location.pathname.includes("/no") && userPosition.no_tokens) {
        if (value === "" || numValue <= userPosition.no_tokens) {
          setTransactionAmount(value);
        }
      } else {
        setTransactionAmount(value);
      }
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
        // console.log("Transaction submitted:", data);
        showTransactionToast(
          "Claim Winnings",
          "Success",
          "Winnings claimed successfully"
        );
        fetchMarketDetails();
        fetchUserPosition();
      },
      onCancel: () => {
        // console.log("Transaction canceled");
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
      // console.error("Error calling contract:", error);
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
            {priceHistoryData.length > 0 && (
              <PriceHistoryChart data={priceHistoryData} />
            )}
          </CardHeader>
        </Card>
        <Card bg="rgba(255, 255, 255, 0.8)" backdropFilter="blur(10px)">
          <CardHeader>
            <Heading size="md">
              {market?.question || "Betting Market Interface"}
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {userLiquidity.toFixed(3) > 0 && (
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
                  <div>
                    <h2>User Liquidity</h2>
                    <p>Total Liquidity: {userLiquidity.toFixed(3)} STX</p>
                  </div>
                  <Text>{removeLiquidityPercentage}%</Text>
                  <Text>
                    Amount to remove:{" "}
                    {(
                      (userLiquidity * removeLiquidityPercentage) /
                      100
                    ).toFixed(3)}{" "}
                    STX
                  </Text>
                  <Button onClick={handleRemoveLiquidity} colorScheme="orange">
                    Remove Liquidity
                  </Button>
                </>
              )}
              <Heading size="sm">Trade Tokens</Heading>

              <VStack spacing={4} width="full" align="stretch">
                <InputGroup size="lg">
                  <Input
                    type="text"
                    placeholder="Enter Token amount"
                    value={transactionAmount}
                    onChange={handleAmountChange}
                    isDisabled={marketDetails && isResolved(marketDetails)}
                  />
                  <InputRightAddon children="Tokens" />
                </InputGroup>
                <HStack spacing={4}>
                  <Button
                    onClick={() => handleTransaction("buy")}
                    colorScheme="green"
                    isDisabled={
                      !transactionAmount ||
                      (marketDetails && isResolved(marketDetails))
                    }
                    size="lg"
                    flex={1}
                    fontWeight="bold"
                  >
                    Buy {location.pathname.includes("/yes") ? "Yes" : "No"}{" "}
                    Tokens
                  </Button>
                  <Button
                    onClick={() => handleTransaction("sell")}
                    colorScheme="red"
                    isDisabled={
                      !transactionAmount ||
                      (marketDetails && isResolved(marketDetails))
                    }
                    size="lg"
                    flex={1}
                    fontWeight="bold"
                  >
                    Sell {location.pathname.includes("/yes") ? "Yes" : "No"}{" "}
                    Tokens
                  </Button>
                </HStack>
                {marketDetails && !isResolved(marketDetails) && (
                  <Text
                    fontSize="sm"
                    color={slippage > 5 ? "orange.500" : "gray.500"}
                  >
                    Estimated Slippage: {slippage}%
                  </Text>
                )}
              </VStack>
              {marketDetails && isResolved(marketDetails) && (
                <Button
                  onClick={claimLPWinnings}
                  isLoading={isLoading}
                  colorScheme="blue"
                  width="full"
                >
                  Claim LP Winnings
                </Button>
              )}

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

              {userPosition && marketDetails && (
                <>
                  <Heading size="sm" mt={4}>
                    Your Position
                  </Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>No Tokens</StatLabel>
                      <StatNumber>
                        {formatNumber(userPosition.no.toFixed(3))}
                      </StatNumber>
                      <StatHelpText>
                        Est. Value:{" "}
                        {calculateEstimatedValue(
                          userPosition.no,
                          marketDetails["bet-no-pool"],
                          marketDetails["total-liquidity"]
                        ).toFixed(6)}{" "}
                        STX
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Yes Tokens</StatLabel>
                      <StatNumber>
                        {formatNumber(userPosition.yes.toFixed(3))}
                      </StatNumber>
                      <StatHelpText>
                        Est. Value:{" "}
                        {calculateEstimatedValue(
                          userPosition.yes,
                          marketDetails["bet-yes-pool"],
                          marketDetails["total-liquidity"]
                        ).toFixed(3)}{" "}
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
              <Heading size="sm">Add Liquidity - Earn 2% Fees</Heading>
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
              <Box mt={4}>
                <Divider mb={4} />
                <Heading size="sm" mb={2}>
                  Market Notes
                </Heading>
                <Text>{marketNotes || "No notes available"}</Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
        <Divider my={4} />
        <Comments onChainId={onChainId} />
      </VStack>
    </Box>
  );
};
export default BettingInterface;
