import React, { useEffect, useState } from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import axios from "axios";

const scroll = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const CryptoMarquee = () => {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,welsh-corgi-coin,solana,blockstack&vs_currencies=usd"
        );
        // console.log(response);
        const formattedPrices = [
          { name: "Bitcoin", symbol: "BTC", price: response.data.bitcoin.usd },
          {
            name: "Stacks",
            symbol: "STX",
            price: response.data.blockstack.usd,
          },
          {
            name: "Welsh",
            symbol: "Welsh",
            price: response.data["welsh-corgi-coin"].usd,
          },
          { name: "Solana", symbol: "SOL", price: response.data.solana.usd },
        ];

        setPrices(formattedPrices);
        setIsLoading(false);
      } catch (error) {
        // console.error("Error fetching crypto prices:", error);
        setIsLoading(false);
      }
    };

    fetchPrices();
    // Fetch prices every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Box py={2} bg="rgba(0,0,0,0.5)" backdropFilter="blur(10px)">
        <Text color="whiteAlpha.900">Loading prices...</Text>
      </Box>
    );
  }

  return (
    <Box
      overflow="hidden"
      bg="rgba(0,0,0,0.7)"
      backdropFilter="blur(10px)"
      py={2}
    >
      <HStack
        spacing={8}
        animation={`${scroll} 60s linear infinite`}
        whiteSpace="nowrap"
      >
        {prices.concat(prices).map((coin, index) => (
          <Text key={index} fontWeight="bold" color="whiteAlpha.900">
            {coin.name} ({coin.symbol}): $
            {coin.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}
          </Text>
        ))}
      </HStack>
    </Box>
  );
};

export default CryptoMarquee;
