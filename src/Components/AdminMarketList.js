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
} from "@chakra-ui/react";
import { uintCV, boolCV, PostConditionMode } from "@stacks/transactions";
import { useConnect } from "@stacks/connect-react";
import { useWallet } from "../WalletContext";
import { StacksTestnet } from "@stacks/network";

const API_URL = process.env.REACT_APP_API_URL;
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const contractName = process.env.REACT_APP_CONTRACT_NAME;

const AdminMarketList = () => {
  const [markets, setMarkets] = useState([]);
  const [onChainIds, setOnChainIds] = useState({});
  const [outcomes, setOutcomes] = useState({});
  const toast = useToast();
  const { doContractCall } = useConnect();
  const { userData } = useWallet();

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/markets?all=true`);
      setMarkets(response.data);
      const initialOnChainIds = {};
      const initialOutcomes = {};
      response.data.forEach((market) => {
        initialOnChainIds[market._id] = market.onChainId || "";
        initialOutcomes[market._id] = "";
      });
      setOnChainIds(initialOnChainIds);
      setOutcomes(initialOutcomes);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const toggleMarketVisibility = async (marketId, currentVisibility) => {
    const url = `${API_URL}/api/markets/${marketId}`;
    console.log("Sending PATCH request to:", url);
    try {
      await axios.patch(url, {
        visible: !currentVisibility,
      });
      toast({
        title: "Success",
        description: `Market visibility updated`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMarkets();
    } catch (error) {
      console.error("Error updating market visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update market visibility",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateOnChainId = async (marketId) => {
    try {
      console.log(`Updating onChainId for market: ${marketId}`);
      console.log("New onChainId:", onChainIds[marketId]);
      const response = await axios.patch(
        `${API_URL}/api/markets/${marketId}/onChainId`,
        {
          onChainId: onChainIds[marketId],
        }
      );
      console.log("Update response:", response.data);
      toast({
        title: "Success",
        description: "On-chain ID updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMarkets();
    } catch (error) {
      console.error(
        "Error updating on-chain ID:",
        error.response ? error.response.data : error.message
      );
      toast({
        title: "Error",
        description: "Failed to update on-chain ID",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOnChainIdChange = (marketId, value) => {
    setOnChainIds((prev) => ({ ...prev, [marketId]: value }));
  };

  const handleOutcomeChange = (marketId, value) => {
    setOutcomes((prev) => ({ ...prev, [marketId]: value }));
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

    const userAddress = userData.profile.stxAddress.StacksTestnet;
    console.log("User address:", userAddress);

    const functionArgs = [
      uintCV(onChainIds[marketId]), // market-id
      boolCV(outcome === "Yes" ? true : false),
    ];
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
            `${API_URL}/api/markets/${marketId}/resolve`,
            {
              outcome: outcome === "Yes", // Convert "Yes"/"No" to true/false
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
    <Box
      maxWidth="800px"
      margin="auto"
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Heading mb={4}>Admin Market List</Heading>
      <VStack spacing={4} align="stretch">
        {markets.map((market) => (
          <Box key={market._id} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">{market.question}</Text>
            <Text>Visibility: {market.visible ? "Visible" : "Hidden"}</Text>
            <Text>On-chain ID: {market.onChainId || "Not set"}</Text>
            <HStack mt={2}>
              <Input
                placeholder="Enter on-chain ID"
                value={onChainIds[market._id] || ""}
                onChange={(e) =>
                  handleOnChainIdChange(market._id, e.target.value)
                }
              />
              <Button
                onClick={() => updateOnChainId(market._id)}
                colorScheme="blue"
              >
                Update On-chain ID
              </Button>
            </HStack>
            <Button
              onClick={() => toggleMarketVisibility(market._id, market.visible)}
              colorScheme={market.visible ? "red" : "green"}
              mt={2}
            >
              {market.visible ? "Hide Market" : "Show Market"}
            </Button>
            <HStack mt={2}>
              <Select
                placeholder="Select outcome"
                value={outcomes[market._id] || ""}
                onChange={(e) =>
                  handleOutcomeChange(market._id, e.target.value)
                }
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Select>
              <Button
                onClick={() => resolveMarket(market._id, outcomes[market._id])}
                colorScheme="purple"
                isDisabled={!outcomes[market._id] || !onChainIds[market._id]}
              >
                Resolve Market
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default AdminMarketList;
