import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Heading, VStack, Button, Text, useToast } from "@chakra-ui/react";

const AdminMarketList = () => {
  const [markets, setMarkets] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/markets?all=true"
      );
      setMarkets(response.data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const toggleMarketVisibility = async (marketId, currentVisibility) => {
    try {
      await axios.patch(`http://localhost:3001/api/markets/${marketId}`, {
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

  return (
    <Box maxWidth="800px" margin="auto">
      <Heading mb={4}>Admin Market List</Heading>
      <VStack spacing={4} align="stretch">
        {markets.map((market) => (
          <Box key={market._id} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">{market.question}</Text>
            <Text>Visibility: {market.visible ? "Visible" : "Hidden"}</Text>
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
