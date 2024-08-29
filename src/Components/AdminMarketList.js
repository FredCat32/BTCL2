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
} from "@chakra-ui/react";
const API_URL = process.env.REACT_APP_API_URL;

const AdminMarketList = () => {
  const [markets, setMarkets] = useState([]);
  const [onChainIds, setOnChainIds] = useState({});
  const toast = useToast();

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/markets?all=true`);
      setMarkets(response.data);
      const initialOnChainIds = {};
      response.data.forEach((market) => {
        initialOnChainIds[market._id] = market.onChainId || "";
      });
      setOnChainIds(initialOnChainIds);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const toggleMarketVisibility = async (marketId, currentVisibility) => {
    const url = `${API_URL}/api/markets/${marketId}`;

    console.log("Sending PATCH request to:", url);
    try {
      await axios.patch(`${API_URL}/api/markets/${marketId}`, {
        visible: !currentVisibility,
      });
      toast({
        title: "Success",
        description: `Market visibility updated`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMarkets(); // Refresh the list
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
      // ... rest of your function
    } catch (error) {
      console.error(
        "Error updating on-chain ID:",
        error.response ? error.response.data : error.message
      );
      // ... error handling
    }
  };

  const handleOnChainIdChange = (marketId, value) => {
    setOnChainIds((prev) => ({ ...prev, [marketId]: value }));
  };

  return (
    <Box maxWidth="800px" margin="auto">
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
                value={onChainIds[market._id]}
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
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default AdminMarketList;
