import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  VStack,
  Button,
  Text,
  Input,
  HStack,
  useToast,
  Select,
  FormControl,
  FormLabel,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { useConnect } from "@stacks/connect-react";
import { useWallet } from "../WalletContext";
import { StacksTestnet } from "@stacks/network";
import {
  uintCV,
  PostConditionMode,
  Pc,
  AnchorMode,
} from "@stacks/transactions";

const API_URL = process.env.REACT_APP_API_URL;
const contractAddress = process.env.REACT_APP_TESTCONTRACT_ADDRESS;
const contractName = process.env.REACT_APP_PARICONTRACT_NAME;

const ParimutuelAdminMarketList = () => {
  const [markets, setMarkets] = useState([]);
  const [onChainIds, setOnChainIds] = useState({});
  const [selectedOutcomes, setSelectedOutcomes] = useState({});
  const toast = useToast();
  const { doContractCall } = useConnect();
  const { userData } = useWallet();
  const userAddress = userData?.profile?.stxAddress?.testnet;
  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/parimarkets`);
      console.log("Raw market data:", response.data);
      // Log the structure of outcomeNames for the first market (if it exists)
      if (response.data.length > 0) {
        console.log("First market outcomeNames:", {
          type: typeof response.data[0].outcomeNames,
          value: response.data[0].outcomeNames,
        });
      }
      setMarkets(response.data);
      const initialOnChainIds = {};
      const initialOutcomes = {};
      response.data.forEach((market) => {
        initialOnChainIds[market._id] = market.onChainId || "";
        initialOutcomes[market._id] = "";
      });
      setOnChainIds(initialOnChainIds);
      setSelectedOutcomes(initialOutcomes);
    } catch (error) {
      console.error("Error fetching markets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch markets",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleMarketVisibility = async (marketId, currentVisibility) => {
    try {
      console.log("Toggling visibility for market:", {
        marketId,
        currentVisibility,
        idType: typeof marketId,
      });

      const response = await axios.patch(
        `${API_URL}/api/parimarkets/${marketId}`,
        {
          visible: !currentVisibility,
        }
      );

      if (response.data) {
        toast({
          title: "Success",
          description: "Market visibility updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchMarkets();
      }
    } catch (error) {
      console.error("Error updating market visibility:", {
        error,
        response: error.response,
        marketId,
        currentVisibility,
      });
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update market visibility",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateOnChainId = async (marketId) => {
    try {
      console.log("Updating onChainId:", {
        marketId,
        newId: onChainIds[marketId],
      });

      if (!marketId) {
        throw new Error("Market ID is required");
      }

      const response = await axios.patch(
        `${API_URL}/api/parimarkets/${marketId}/onChainId`,
        {
          onChainId: onChainIds[marketId] || "",
        }
      );

      console.log("Update response:", response.data);

      if (response.data && response.data._id) {
        toast({
          title: "Success",
          description: "On-chain ID updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        await fetchMarkets(); // Re-fetch markets
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating on-chain ID:", error);

      let errorMessage = "Failed to update on-chain ID: ";
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage +=
          error.response.data?.message || error.response.statusText;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += "No response from server";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const handleOnChainIdChange = (marketId, value) => {
    console.log("Handling onChainId change:", { marketId, newValue: value });
    setOnChainIds((prev) => {
      const updated = { ...prev, [marketId]: value };
      console.log("Updated onChainIds state:", updated);
      return updated;
    });
  };
  const handleOutcomeChange = (marketId, value) => {
    setSelectedOutcomes((prev) => ({ ...prev, [marketId]: value }));
  };

  const resolveMarket = async (marketId, outcome) => {
    console.log("Resolving market:", marketId);

    if (!userData || !userData.profile) {
      console.log("User not connected");
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const market = markets.find((m) => m._id === marketId);
    if (!market) {
      throw new Error("Market not found");
    }

    const userAddress = userData.profile.stxAddress.testnet;
    console.log("User address:", userAddress);

    const marketIdOnChain = parseInt(market.onChainId);
    const outcomeNumber = parseInt(outcome);

    const functionArgs = [uintCV(marketIdOnChain), uintCV(outcomeNumber)];
    console.log("Function args:", functionArgs);

    const options = {
      contractAddress,
      contractName,
      functionName: "resolve-market",
      functionArgs,
      network: new StacksTestnet(),
      postConditionMode: PostConditionMode.Allow,
      onFinish: async (data) => {
        console.log("Transaction submitted:", data);
        try {
          // Show transaction submitted toast
          toast({
            title: "Transaction Submitted",
            description: `Market resolution transaction submitted. Transaction ID: ${data.txId}`,
            status: "info",
            duration: 5000,
            isClosable: true,
          });

          // Update backend
          const response = await axios.post(
            `${API_URL}/api/parimarkets/${marketId}/resolve`,
            {
              outcome: outcomeNumber,
              txId: data.txId,
            }
          );
          console.log("Backend update response:", response);

          // Show success toast
          toast({
            title: "Backend Updated",
            description: "Market resolution recorded in backend",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          // Fetch updated markets
          await fetchMarkets();
        } catch (error) {
          console.error("Error in onFinish:", error);
          toast({
            title: "Error",
            description:
              error.message || "An error occurred during market resolution",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      },
      onCancel: () => {
        console.log("Transaction canceled");
        toast({
          title: "Transaction Cancelled",
          description: "Market resolution transaction was cancelled",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      },
    };

    console.log("Contract call options:", options);

    try {
      console.log("Attempting to call contract...");
      await doContractCall(options);
      console.log("Contract call initiated successfully");
    } catch (error) {
      console.error("Error calling contract:", error);
      toast({
        title: "Error",
        description: `Failed to resolve market: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Box maxWidth="800px" margin="auto" p={6}>
      <Card>
        <CardHeader>
          <Heading size="lg">Parimutuel Admin Market List</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {markets && markets.length > 0 ? (
              markets.map((market) => (
                <Box key={market._id} p={4} borderWidth={1} borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold">
                    {market.question}
                  </Text>
                  <Text>
                    Visibility: {market.visible ? "Visible" : "Hidden"}
                  </Text>
                  <Text>On-chain ID: {market.onChainId || "Not set"}</Text>

                  <FormControl mt={2}>
                    <FormLabel>Update On-chain ID</FormLabel>
                    <HStack>
                      <Input
                        value={onChainIds[market._id] || ""}
                        onChange={(e) =>
                          handleOnChainIdChange(market._id, e.target.value)
                        }
                        placeholder="Enter on-chain ID"
                      />
                      <Button
                        onClick={() => updateOnChainId(market._id)}
                        colorScheme="blue"
                      >
                        Update ID
                      </Button>
                    </HStack>
                  </FormControl>

                  <Button
                    onClick={() =>
                      toggleMarketVisibility(market._id, market.visible)
                    }
                    colorScheme={market.visible ? "red" : "green"}
                    mt={4}
                    width="full"
                  >
                    {market.visible ? "Hide Market" : "Show Market"}
                  </Button>

                  {!market.resolved &&
                    market.outcomes &&
                    market.outcomes.length > 0 && (
                      <FormControl mt={4}>
                        <FormLabel>Resolve Market</FormLabel>
                        <HStack>
                          <Select
                            value={selectedOutcomes[market._id] || ""}
                            onChange={(e) =>
                              handleOutcomeChange(market._id, e.target.value)
                            }
                            placeholder="Select winning outcome"
                          >
                            {market.outcomes.map((outcome) => (
                              <option key={outcome} value={outcome}>
                                {(market.outcomeNames &&
                                  market.outcomeNames[outcome.toString()]) || // Changed .get() to []
                                  `Outcome ${outcome}`}
                              </option>
                            ))}
                          </Select>
                          <Button
                            onClick={() =>
                              resolveMarket(
                                market._id,
                                selectedOutcomes[market._id]
                              )
                            }
                            colorScheme="purple"
                            isDisabled={
                              !selectedOutcomes[market._id] || !market.onChainId
                            }
                          >
                            Resolve
                          </Button>
                        </HStack>
                      </FormControl>
                    )}

                  {market.resolved && (
                    <Text mt={2} color="green.500">
                      Market Resolved - Winning Outcome:{" "}
                      {market.outcomeNames?.[
                        market.winningOutcome?.toString()
                      ] || // Changed .get() to []
                        `Outcome ${market.winningOutcome}`}
                    </Text>
                  )}
                </Box>
              ))
            ) : (
              <Text>No markets found</Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ParimutuelAdminMarketList;
