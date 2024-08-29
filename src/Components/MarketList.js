import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  VStack,
  Button,
  SimpleGrid,
  Container,
  Center,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL:", API_URL); // Add this line

const MarketList = () => {
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/markets`);
      // Filter markets where visible is true
      const visibleMarkets = response.data.filter(
        (market) => market.visible === true
      );
      setMarkets(visibleMarkets);
      console.log("Visible markets:", visibleMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  return (
    <Container maxW="container.xl" centerContent>
      <VStack spacing={6} align="stretch" width="100%">
        <Center>
          <Heading size="xl" mb={6}>
            Prediction Markets
          </Heading>
        </Center>
        {markets.length > 0 ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            width="100%"
          >
            {markets.map((market) => (
              <Box
                key={market._id}
                p={5}
                borderWidth={1}
                borderRadius="lg"
                boxShadow="md"
                bg="gray.700"
              >
                <VStack align="stretch" spacing={3}>
                  <Heading size="md" color="white">
                    {market.question}
                  </Heading>
                  <Button
                    as={Link}
                    to={`/bet/${market._id}/yes`}
                    state={{
                      market,
                      marketId: market._id,
                      onChainId: market.onChainId,
                    }}
                    colorScheme="green"
                    size="sm"
                  >
                    Yes
                  </Button>
                  <Button
                    as={Link}
                    to={`/bet/${market._id}/no`}
                    state={{
                      market,
                      marketId: market._id,
                      onChainId: market.onChainId,
                    }}
                    colorScheme="red"
                    size="sm"
                  >
                    No
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Center>
            <Text>No visible markets available at the moment.</Text>
          </Center>
        )}
      </VStack>
    </Container>
  );
};

export default MarketList;
