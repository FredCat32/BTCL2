import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConnect } from "@stacks/connect-react";
import { useWallet } from "../WalletContext";
import { StacksTestnet } from "@stacks/network";
import {
  uintCV,
  standardPrincipalCV,
  cvToValue,
  PostConditionMode,
  Pc,
  callReadOnlyFunction,
  boolCV,
} from "@stacks/transactions";
import axios from "axios";
import {
  Box,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
} from "@chakra-ui/react";
import Comments from "./Comments";

const PariMutualInterface = () => {
  const location = useLocation();
  const { market = {} } = location.state || {};
  const { userData } = useWallet();
  const { doContractCall } = useConnect();
  const toast = useToast();
  const API_URL = process.env.REACT_APP_API_URL;
  const contractAddress = process.env.REACT_APP_TESTCONTRACT_ADDRESS;
  const contractName = process.env.REACT_APP_PARICONTRACT_NAME;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [marketDetails, setMarketDetails] = useState(null);
  const [marketNotes, setMarketNotes] = useState("");
  const [outcomeNames, setOutcomeNames] = useState([]);
  const [outcomeNumberMap, setOutcomeNumberMap] = useState({});
  useEffect(() => {
    if (market?.onChainId) {
      console.log("Market data:", market);
      fetchMarketDetails();
      fetchMarketDetailsFromBackend();
      // Get the number of outcomes from the market data directly
      if (market.outcomes?.length > 0) {
        fetchMarketOutcomeNames(market.outcomes.length);
      }
    }
  }, [market?.onChainId]);
  const showTransactionToast = (title, status, description) => {
    toast({
      title: `${title} - ${status}`,
      description: description,
      status: status.toLowerCase(),
      duration: 5000,
      isClosable: true,
    });
  };
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
  const fetchMarketDetails = async () => {
    setIsLoading(true);
    try {
      const tokenId = uintCV(market.onChainId);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-market-details",
        functionArgs: [tokenId],
        network: new StacksTestnet(),
        senderAddress: contractAddress,
      });

      if (response) {
        console.log("Raw response:", response);

        // Convert Clarity value to JavaScript value
        const details = cvToValue(response);
        console.log("Converted details:", details);

        // Create a new market details object with resolved status
        const newMarketDetails = {
          ...details,
          resolved: response.value?.data?.resolved?.type === 3,
        };

        console.log("Final market details:", newMarketDetails);
        setMarketDetails(newMarketDetails);

        // Log outcomes length if it exists
        if (details.value?.outcomes?.value?.length) {
          console.log("Outcomes length:", details.value.outcomes.value.length);
        }
      }
    } catch (err) {
      console.log("Error in fetchMarketDetails:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchMarketOutcomeNames = async (numOutcomes) => {
    setIsLoading(true);
    try {
      const tokenId = uintCV(market.onChainId);

      if (!numOutcomes) {
        console.error("No outcomes length provided");
        return;
      }

      const names = [];
      const numberMap = {};

      // Fetch each outcome name
      for (let i = 1; i <= numOutcomes; i++) {
        const response = await callReadOnlyFunction({
          contractAddress,
          contractName,
          functionName: "get-outcome-name",
          functionArgs: [tokenId, uintCV(i)],
          network: new StacksTestnet(),
          senderAddress: contractAddress,
        });

        if (response?.value) {
          const clarityValue = response.value;
          if (clarityValue && clarityValue.value && clarityValue.value.data) {
            names.push(clarityValue.value.data);
            numberMap[i] = i; // Store the mapping of button index to outcome number
          }
        }
      }

      console.log("Final names array:", names);
      console.log("Outcome number mapping:", numberMap);
      setOutcomeNames(names);
      setOutcomeNumberMap(numberMap);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching outcome names:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMarketDetailsFromBackend = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/parimarkets/onChainId/${market.onChainId}`
      );
      if (response.data?.notes) {
        setMarketNotes(response.data.notes);
      }
    } catch (error) {
      console.error("Error fetching market details:", error);
      setMarketNotes("");
    }
  };
  const handleBet = async (buttonIndex) => {
    if (!userData?.profile) {
      setError("Please connect your wallet first");
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 5000,
      });
      return;
    }

    try {
      // Convert STX amount to microSTX (multiply by 1,000,000)
      const amount = Math.floor(parseFloat(transactionAmount) * 1000000);
      if (isNaN(amount)) {
        throw new Error("Invalid amount");
      }

      // Ensure market ID and outcome are valid numbers
      const marketId = parseInt(market.onChainId, 10);
      if (isNaN(marketId)) {
        throw new Error("Invalid market ID");
      }

      // Adjust the outcome number to match the contract's numbering
      const actualOutcomeNumber = buttonIndex + 1; // Since buttonIndex starts from 0

      const userAddress = userData.profile.stxAddress.testnet;

      console.log("Placing bet with parameters:", {
        marketId,
        actualOutcomeNumber,
        amount,
        userAddress,
      });

      const functionArgs = [
        uintCV(marketId),
        uintCV(actualOutcomeNumber),
        uintCV(amount),
      ];

      console.log("Function arguments:", functionArgs);

      await doContractCall({
        network: new StacksTestnet(),
        contractAddress,
        contractName,
        functionName: "place-bet",
        functionArgs,
        postConditions: [Pc.principal(userAddress).willSendEq(amount).ustx()],
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data) => {
          console.log("Transaction submitted:", data);
          toast({
            title: "Transaction Submitted",
            description: `Your bet has been placed on ${outcomeNames[buttonIndex]}`,
            status: "success",
            duration: 5000,
          });
          fetchMarketDetails();
        },
        onCancel: () => {
          toast({
            title: "Transaction Cancelled",
            status: "info",
            duration: 3000,
          });
        },
      });
    } catch (err) {
      console.error("Bet placement error:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,6}$/.test(value) || value === "") {
      setTransactionAmount(value);
    }
  };

  const claimWinnings = async () => {
    if (!userData?.profile) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      await doContractCall({
        network: new StacksTestnet(),
        contractAddress,
        contractName,
        functionName: "claim-winnings",
        functionArgs: [uintCV(market.onChainId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          toast({
            title: "Success",
            description: "Winnings claimed successfully",
            status: "success",
            duration: 5000,
          });
          fetchMarketDetails();
        },
        onCancel: () => {
          toast({
            title: "Transaction Cancelled",
            status: "info",
            duration: 3000,
          });
        },
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    }
  };
  const getOutcomeNamesArray = (outcomenames) => {
    if (!outcomenames) return [];
    return Object.entries(outcomenames)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([_, name]) => name);
  };
  const handleClaimWinnings = async () => {
    console.log("Attempting to claim winnings");

    if (!userData || !userData.profile) {
      console.error("User not connected");
      setError("Please connect your wallet first");
      showTransactionToast(
        "Claim Winnings",
        "Error",
        "Please connect your wallet first"
      );
      return;
    }

    showTransactionToast("Claim Winnings", "Pending", "Transaction submitted");

    const userAddress = userData.profile.stxAddress.testnet;

    const functionArgs = [
      uintCV(market.onChainId), // market-id
    ];

    const options = {
      contractAddress,
      contractName,
      functionName: "claim-winnings",
      functionArgs,
      network: new StacksTestnet(),
      postConditionMode: PostConditionMode.Allow,
      onFinish: async (data) => {
        console.log("Transaction submitted:", data);
        showTransactionToast(
          "Claim Winnings",
          "Success",
          "Winnings claimed successfully"
        );
        await fetchMarketDetails();
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
      console.log("Calling contract with options:", options);
      await doContractCall(options);
      console.log("Contract call initiated successfully");
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(error.message);
      showTransactionToast("Claim Winnings", "Error", error.message);
    }
  };
  return (
    <Box maxWidth="800px" margin="auto" p={6}>
      <Card bg="white" boxShadow="xl">
        <CardHeader>
          <Heading size="lg">
            {market?.question || "Pari-mutuel Market"}
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Market Stats */}
            <SimpleGrid
              columns={2}
              spacing={4}
              bg="gray.50"
              p={4}
              borderRadius="md"
            >
              <Stat>
                <StatLabel>Total Pool</StatLabel>
                <StatNumber>
                  {(marketDetails?.value?.["total-bets"]?.value || 0) / 1000000}{" "}
                  STX
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Status</StatLabel>
                <StatNumber>
                  {marketDetails?.resolved ? "Resolved" : "Active"}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            {/* Betting Interface */}
            <VStack spacing={4}>
              <InputGroup size="lg">
                <Input
                  placeholder="Enter amount in STX"
                  value={transactionAmount}
                  onChange={handleAmountChange}
                  isDisabled={marketDetails?.resolved}
                />
                <InputRightAddon children="STX" />
              </InputGroup>

              {/* Outcomes Grid with correct outcome names */}
              <SimpleGrid columns={2} spacing={4} width="100%">
                {outcomeNames.map((outcomeName, index) => (
                  <Button
                    key={index}
                    onClick={() => handleBet(index)}
                    isDisabled={!transactionAmount || marketDetails?.resolved}
                    height="100px"
                    colorScheme={index % 2 === 0 ? "blue" : "teal"}
                    variant="solid"
                  >
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="bold">
                        {outcomeName}
                      </Text>
                      {/* ... existing code ... */}
                    </VStack>
                  </Button>
                ))}
              </SimpleGrid>

              {marketDetails?.resolved && (
                <Button
                  onClick={claimWinnings}
                  colorScheme="green"
                  width="100%"
                  size="lg"
                >
                  Claim Winnings
                </Button>
              )}

              {error && (
                <Box p={4} bg="red.50" color="red.500" borderRadius="md">
                  {error}
                </Box>
              )}

              {/* Market Notes */}
              {marketNotes && (
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Market Notes
                  </Heading>
                  <Text>{marketNotes}</Text>
                </Box>
              )}
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      <Box mt={6}>
        <Comments onChainId={market.onChainId} />
      </Box>
    </Box>
  );
};

export default PariMutualInterface;
