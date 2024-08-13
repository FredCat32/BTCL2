// src/components/CryptoPrices.js

import React, { useEffect, useState } from "react";
import { Box, Text, Spinner, Alert, AlertIcon } from "@chakra-ui/react";

const CryptoPrices = () => {
  const [btcPrice, setBtcPrice] = useState(null);
  const [stxPrice, setStxPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const btcResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const btcData = await btcResponse.json();
        setBtcPrice(btcData.bitcoin.usd);

        const stxResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd"
        );
        const stxData = await stxResponse.json();
        setStxPrice(stxData.blockstack.usd);

        setLoading(false);
      } catch (error) {
        setError("Failed to fetch prices. Please try again later.");
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (loading) {
    return <Spinner size="xl" />;
  }

  // if (error) {
  //   return (
  //     <Alert status="error">
  //       <AlertIcon />
  //       {error}
  //     </Alert>
  //   );
  // }

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" maxWidth="800px" mx="auto">
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Cryptocurrency Prices
      </Text>
      <Text fontSize="lg">
        {/* <strong>Bitcoin (BTC):</strong> ${btcPrice} */}
        <strong>Bitcoin (BTC):</strong> $60,000
        <strong>Stacks (STX):</strong> $60,000
      </Text>
      {/* <Text fontSize="lg" mt={2}>
        { <strong>Stacks (STX):</strong> ${stxPrice} }
        <strong>Stacks (STX):</strong> $60,000
      </Text> */}
    </Box>
  );
};

export default CryptoPrices;
