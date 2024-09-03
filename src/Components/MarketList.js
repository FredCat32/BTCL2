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
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const MarketList = () => {
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/markets`);
      const visibleMarkets = response.data.filter(
        (market) => market.visible === true
      );
      setMarkets(visibleMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const calculatePercentage = (yesPool, noPool) => {
    const total = yesPool + noPool;
    if (total === 0) return { yes: 50, no: 50 };
    const yesPercentage = (yesPool / total) * 100;
    return {
      yes: yesPercentage.toFixed(2),
      no: (100 - yesPercentage).toFixed(2),
    };
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
            {markets.map((market) => {
              const percentages = calculatePercentage(
                market.yesPool,
                market.noPool
              );
              return (
                <Box
                  key={market._id}
                  p={5}
                  borderWidth={1}
                  borderRadius="lg"
                  boxShadow="md"
                  bg="gray.700"
                  height="100%"
                  display="flex"
                  flexDirection="column"
                >
                  <VStack align="stretch" spacing={3} flex={1}>
                    <Heading
                      size="md"
                      color="white"
                      minHeight="3em"
                      display="flex"
                      alignItems="center"
                    >
                      {market.question}
                    </Heading>
                    <Flex
                      height="20px"
                      width="100%"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Box width={`${percentages.yes}%`} bg="green.500" />
                      <Box width={`${percentages.no}%`} bg="red.500" />
                    </Flex>
                    <Text color="white" fontSize="sm">
                      Yes: {percentages.yes}% | No: {percentages.no}%
                    </Text>
                    <Spacer />
                    <Button
                      as={Link}
                      to={`/bet/${market._id}/yes`}
                      state={{
                        market,
                        marketId: market._id,
                        onChainId: market.onChainId,
                        yesPool: market.yesPool,
                        noPool: market.noPool,
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
                        yesPool: market.yesPool,
                        noPool: market.noPool,
                      }}
                      colorScheme="red"
                      size="sm"
                    >
                      No
                    </Button>
                  </VStack>
                </Box>
              );
            })}
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
