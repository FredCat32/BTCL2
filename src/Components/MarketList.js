import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  VStack,
  Button,
  SimpleGrid,
  Text,
  Flex,
  Container,
  Image,
  HStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const MarketList = () => {
  const [markets, setMarkets] = useState([]);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/markets`);
      console.log(response.data);
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

  const filteredMarkets = showResolved
    ? markets.filter((market) => market.resolved)
    : markets.filter((market) => !market.resolved);

  return (
    <Container maxW="container.xl" centerContent py={8}>
      <VStack spacing={8} align="stretch" width="100%">
        <Heading size="xl" textAlign="center" color="white">
          Prediction Markets
        </Heading>
        <HStack spacing={4} justify="center">
          <Button
            variant="ghost"
            color={showResolved ? "gray.400" : "pink.300"}
            onClick={() => setShowResolved(false)}
            _hover={{ color: "pink.200" }}
            _active={{ color: "pink.100" }}
          >
            Live/Coming Soon
          </Button>
          <Button
            variant="ghost"
            color={showResolved ? "pink.300" : "gray.400"}
            onClick={() => setShowResolved(true)}
            _hover={{ color: "pink.200" }}
            _active={{ color: "pink.100" }}
          >
            Resolved
          </Button>
        </HStack>
        {filteredMarkets.length > 0 ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            width="100%"
          >
            {filteredMarkets.map((market) => {
              const percentages = calculatePercentage(
                market.yesPool,
                market.noPool
              );
              return (
                <Box
                  key={market._id}
                  borderWidth={1}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                  bg="rgba(26, 32, 44, 0.8)"
                  backdropFilter="blur(10px)"
                  maxW="400px"
                  width="100%"
                  margin="0 auto"
                >
                  {market.imageUrl && (
                    <Image
                      src={market.imageUrl}
                      alt={market.question}
                      objectFit="cover"
                      height="200px"
                      width="100%"
                    />
                  )}
                  <VStack align="stretch" spacing={4} p={5}>
                    <Heading size="md" color="white" lineHeight="1.4">
                      {market.question}
                    </Heading>
                    <Flex
                      height="20px"
                      width="100%"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box width={`${percentages.yes}%`} bg="teal.600" />
                      <Box width={`${percentages.no}%`} bg="red.400" />
                    </Flex>
                    <Text color="white" fontSize="sm" fontWeight="bold">
                      Yes: {percentages.yes}% | No: {percentages.no}%
                    </Text>
                    <Flex justifyContent="space-between" mt={2}>
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
                        bg="teal.600"
                        _hover={{ bg: "teal.500" }}
                        color="white"
                        size="sm"
                        width="48%"
                      >
                        {market.resolved ? "View Yes" : "Yes"}
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
                        bg="red.400"
                        _hover={{ bg: "red.600" }}
                        color="white"
                        size="sm"
                        width="48%"
                      >
                        {market.resolved ? "View No" : "No"}
                      </Button>
                    </Flex>
                    {market.resolved && (
                      <Text
                        color="white"
                        fontSize="md"
                        fontWeight="bold"
                        textAlign="center"
                        mt={2}
                      >
                        Resolved: {market.outcome ? "Yes" : "No"}
                      </Text>
                    )}
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          <Text color="white" textAlign="center">
            No {showResolved ? "resolved" : "active"} markets available at the
            moment.
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default MarketList;
