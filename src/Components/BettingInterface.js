import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";
import { uintCV, serializeCV } from "@stacks/transactions";

const BettingInterface = () => {
  const { option } = useParams();
  const location = useLocation();
  const { market, marketId } = location.state || {};
  const [betAmount, setBetAmount] = useState(10);

  // State for market details fetching
  const [marketDetails, setMarketDetails] = useState(null);
  const [marketDetailsError, setMarketDetailsError] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState(
    "https://stacks-node-api.testnet.stacks.co"
  );
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  const contractAddress = "ST1EJ799Q4EJ511FP9C7J71ESA4920QJV7D8YKK2C";
  const contractName = "market8";

  const calculatePotentialWinnings = () => {
    if (market) {
      const totalPool = market.yesPool + market.noPool;
      const oppositePool = option === "yes" ? market.noPool : market.yesPool;
      return (betAmount / totalPool) * oppositePool;
    }
    return 0;
  };

  const handleBet = () => {
    // Implement bet logic here
    console.log(`Placing bet of ${betAmount} on ${option}`);
  };

  const fetchMarketDetails = async () => {
    setIsLoading(true);
    setMarketDetailsError(null);

    // Correctly serialize uint 4 for Clarity
    const uintArg = serializeCV(uintCV(4));

    const body = JSON.stringify({
      sender: contractAddress,
      arguments: [uintArg],
    });

    try {
      const url = `${apiEndpoint}/v2/contracts/call-read/${contractAddress}/${contractName}/get-market-details`;
      console.log("Fetching from URL:", url);
      console.log("Request body:", body);

      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body,
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      let responseBody;
      try {
        responseBody = JSON.parse(responseText);
        console.log("Parsed response body:", responseBody);
      } catch (e) {
        console.error("Error parsing response as JSON:", e);
        throw new Error(`Failed to parse response as JSON: ${responseText}`);
      }

      if (responseBody.okay) {
        if (responseBody.result) {
          const decodedResult = decodeMarketDetails(responseBody.result);
          console.log("Decoded market details:", decodedResult);
          setMarketDetails(decodedResult);
        } else {
          throw new Error("Response okay, but no result found");
        }
      } else {
        throw new Error(`API call failed: ${JSON.stringify(responseBody)}`);
      }
    } catch (err) {
      console.error("Error fetching market details:", err);
      setMarketDetailsError(
        err.message || "An error occurred while fetching the market details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const decodeMarketDetails = (hex) => {
    // This function will need to be implemented based on the exact structure of your market details
    // For now, we'll just return the hex string
    console.log("Decoding market details:", hex);
    return hex;
  };

  if (!market) return <Text>No market data available</Text>;

  return (
    <Box
      maxWidth="500px"
      margin="auto"
      p={6}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="xl"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color={textColor}>
          {market.question}
        </Heading>
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={option === "yes" ? "green.500" : "red.500"}
        >
          Betting on: {option.toUpperCase()}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Market ID: {marketId}
        </Text>
        <Flex justify="space-between">
          <Stat>
            <StatLabel>Yes Pool</StatLabel>
            <StatNumber>{market.yesPool}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {(
                (market.yesPool / (market.yesPool + market.noPool)) *
                100
              ).toFixed(2)}
              %
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>No Pool</StatLabel>
            <StatNumber>{market.noPool}</StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              {(
                (market.noPool / (market.yesPool + market.noPool)) *
                100
              ).toFixed(2)}
              %
            </StatHelpText>
          </Stat>
        </Flex>
        <Text fontWeight="bold">Bet Amount:</Text>
        <Slider
          value={betAmount}
          onChange={(value) => setBetAmount(value)}
          min={1}
          max={100}
          step={1}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Input
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          type="number"
          min={1}
        />
        <Stat>
          <StatLabel>Potential Winnings</StatLabel>
          <StatNumber>{calculatePotentialWinnings().toFixed(2)}</StatNumber>
        </Stat>
        <Button
          onClick={handleBet}
          colorScheme={option === "yes" ? "green" : "red"}
        >
          Place Bet
        </Button>

        {/* Section for market details */}
        <Box mt={6}>
          <Heading size="md" mb={2}>
            Market Details
          </Heading>
          <Select
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            mb={2}
          >
            <option value="https://stacks-node-api.testnet.stacks.co">
              Default Testnet API
            </option>
            <option value="https://stacks-node-api.mainnet.stacks.co">
              Mainnet API (be cautious!)
            </option>
            <option value="https://stacks-node-api.xenon.blockstack.org">
              Xenon Testnet API
            </option>
          </Select>
          <Button onClick={fetchMarketDetails} isLoading={isLoading} mb={2}>
            Fetch Market Details
          </Button>
          {marketDetailsError ? (
            <Text color="red.500">Error: {marketDetailsError}</Text>
          ) : (
            <Text fontSize="sm" color="gray.500">
              Market Details:{" "}
              {marketDetails
                ? JSON.stringify(marketDetails, null, 2)
                : "Not available"}
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default BettingInterface;
