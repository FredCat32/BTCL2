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
  const [pariMarkets, setPariMarkets] = useState([]);
  const [showResolved, setShowResolved] = useState(false);
  const [activeTab, setActiveTab] = useState("live"); // 'live', 'resolved', or 'pari'

  useEffect(() => {
    fetchMarkets();
    fetchPariMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/markets`);
      console.log(response);
      const visibleMarkets = response.data.filter(
        (market) => market.visible === true
      );
      setMarkets(visibleMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchPariMarkets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/parimarkets`);
      console.log(response);
      const visiblePariMarkets = response.data.filter(
        (market) => market.visible === true
      );
      setPariMarkets(visiblePariMarkets);
    } catch (error) {
      console.error("Error fetching pari-mutuel markets:", error);
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

  const calculatePariPercentages = (pools) => {
    if (!pools) return {};

    try {
      const poolsMap =
        typeof pools.toJSON === "function" ? pools.toJSON() : pools;
      const numOutcomes = Object.keys(poolsMap).length;
      if (numOutcomes === 0) return {};

      const total = Object.values(poolsMap).reduce(
        (sum, value) => sum + Number(value),
        0
      );

      if (total === 0) {
        // Return 0% for all outcomes when no bets have been made
        return Object.fromEntries(
          Object.keys(poolsMap).map((key) => [key, "0.00"])
        );
      }

      return Object.fromEntries(
        Object.entries(poolsMap).map(([key, value]) => [
          key,
          ((Number(value) / total) * 100).toFixed(2),
        ])
      );
    } catch (error) {
      console.error("Error calculating percentages:", error);
      return {};
    }
  };
  const getDisplayMarkets = () => {
    if (activeTab === "pari") {
      return pariMarkets;
    }
    return activeTab === "resolved"
      ? markets.filter((market) => market.resolved)
      : markets.filter((market) => !market.resolved);
  };
  const getColor = (index) => {
    const colors = [
      "teal.500",
      "pink.500",
      "purple.500",
      "blue.500",
      "orange.500",
      "cyan.500",
      "green.500",
      "yellow.500",
      "red.500",
      "indigo.500",
    ];
    return colors[index % colors.length];
  };

  const getHoverColor = (index) => {
    const colors = [
      "teal.400",
      "pink.400",
      "purple.400",
      "blue.400",
      "orange.400",
      "cyan.400",
      "green.400",
      "yellow.400",
      "red.400",
      "indigo.400",
    ];
    return colors[index % colors.length];
  };
  return (
    <Container maxW="container.xl" centerContent py={8}>
      <VStack spacing={8} align="stretch" width="100%">
        <Heading size="xl" textAlign="center" color="white">
          Prediction Markets
        </Heading>
        <HStack spacing={4} justify="center">
          <Button
            variant="ghost"
            color={activeTab === "live" ? "pink.300" : "gray.400"}
            onClick={() => setActiveTab("live")}
            _hover={{ color: "pink.200" }}
            _active={{ color: "pink.100" }}
          >
            Live/Coming Soon
          </Button>
          <Button
            variant="ghost"
            color={activeTab === "resolved" ? "pink.300" : "gray.400"}
            onClick={() => setActiveTab("resolved")}
            _hover={{ color: "pink.200" }}
            _active={{ color: "pink.100" }}
          >
            Resolved
          </Button>
          <Button
            variant="ghost"
            color={activeTab === "pari" ? "pink.300" : "gray.400"}
            onClick={() => setActiveTab("pari")}
            _hover={{ color: "pink.200" }}
            _active={{ color: "pink.100" }}
          >
            Freestyle
          </Button>
        </HStack>

        {getDisplayMarkets().length > 0 ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            width="100%"
          >
            {getDisplayMarkets().map((market) => (
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

                  {activeTab === "pari" ? (
                    // Pari-mutuel market display
                    <VStack spacing={2} align="stretch">
                      {(() => {
                        // Color functions remain the same
                        const getColor = (index) => {
                          const colors = [
                            "teal.500",
                            "pink.500",
                            "purple.500",
                            "blue.500",
                            "orange.500",
                            "cyan.500",
                            "green.500",
                            "yellow.500",
                            "red.500",
                            "indigo.500",
                          ];
                          return colors[index % colors.length];
                        };

                        const getHoverColor = (index) => {
                          const colors = [
                            "teal.400",
                            "pink.400",
                            "purple.400",
                            "blue.400",
                            "orange.400",
                            "cyan.400",
                            "green.400",
                            "yellow.400",
                            "red.400",
                            "indigo.400",
                          ];
                          return colors[index % colors.length];
                        };

                        // Add safety checks for outcomes
                        if (
                          !market.outcomes ||
                          !Array.isArray(market.outcomes)
                        ) {
                          return (
                            <Text color="white">No outcomes available</Text>
                          );
                        }

                        return market.outcomes.map((outcomeNumber, index) => {
                          const percentages = calculatePariPercentages(
                            market.pools || {}
                          );
                          const percentage = percentages[outcomeNumber] || 0;
                          const outcomeName =
                            market.outcomeNames && market.outcomeNames[index]
                              ? market.outcomeNames[index]
                              : `Option ${outcomeNumber}`;

                          return (
                            <Box key={outcomeNumber || index}>
                              <Flex
                                height="20px"
                                width="100%"
                                borderRadius="full"
                                overflow="hidden"
                              >
                                <Box
                                  width={`${percentage}%`}
                                  bg={getColor(index)}
                                  transition="width 0.3s ease-in-out"
                                />
                              </Flex>
                              <Text
                                color="white"
                                fontSize="sm"
                                fontWeight="bold"
                                mt={1}
                              >
                                {outcomeName}: {percentage}%
                              </Text>
                            </Box>
                          );
                        });
                      })()}

                      <Flex justifyContent="center" flexWrap="wrap" gap={2}>
                        {(() => {
                          if (
                            !market.outcomes ||
                            !Array.isArray(market.outcomes)
                          ) {
                            return null;
                          }

                          return market.outcomes.map((outcomeNumber, index) => {
                            const outcomeName =
                              market.outcomeNames && market.outcomeNames[index]
                                ? market.outcomeNames[index]
                                : `Option ${outcomeNumber}`;

                            return (
                              <Button
                                key={outcomeNumber || index}
                                as={Link}
                                to={`/parimutual/${market._id}/${outcomeNumber}`}
                                state={{
                                  market,
                                  marketId: market._id,
                                  outcome: outcomeNumber,
                                }}
                                bg={getColor(index)}
                                _hover={{ bg: getHoverColor(index) }}
                                color="white"
                                size="sm"
                                width={
                                  market.outcomes.length <= 2 ? "48%" : "auto"
                                }
                                minW={
                                  market.outcomes.length > 2 ? "100px" : "auto"
                                }
                              >
                                {outcomeName}
                              </Button>
                            );
                          });
                        })()}
                      </Flex>
                    </VStack>
                  ) : (
                    // Regular Yes/No market display
                    <>
                      <Flex
                        height="20px"
                        width="100%"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box
                          width={`${
                            calculatePercentage(market.yesPool, market.noPool)
                              .yes
                          }%`}
                          bg="teal.600"
                        />
                        <Box
                          width={`${
                            calculatePercentage(market.yesPool, market.noPool)
                              .no
                          }%`}
                          bg="red.400"
                        />
                      </Flex>
                      <Text color="white" fontSize="sm" fontWeight="bold">
                        Yes:{" "}
                        {calculatePercentage(market.yesPool, market.noPool).yes}
                        % | No:{" "}
                        {calculatePercentage(market.yesPool, market.noPool).no}%
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
                    </>
                  )}

                  {market.resolved && (
                    <Text
                      color="white"
                      fontSize="md"
                      fontWeight="bold"
                      textAlign="center"
                      mt={2}
                    >
                      Resolved:{" "}
                      {activeTab === "pari"
                        ? `Outcome ${market.winningOutcome}`
                        : market.winningOutcome
                        ? "Yes"
                        : "No"}
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text color="white" textAlign="center">
            No{" "}
            {activeTab === "resolved"
              ? "resolved"
              : activeTab === "pari"
              ? "freestyle"
              : "active"}{" "}
            markets available at the moment.
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default MarketList;
