// src/components/LastBlockTime.js

import React, { useEffect, useState } from "react";
import { Box, Text, Spinner, Alert, AlertIcon } from "@chakra-ui/react";

const LastBlockTime = () => {
  const [btcTimeSinceBlock, setBtcTimeSinceBlock] = useState(null);
  const [stxTimeSinceBlock, setStxTimeSinceBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockTime = async () => {
      try {
        // Fetch the latest Bitcoin block data
        const btcResponse = await fetch(
          "https://blockstream.info/api/blocks/tip"
        );
        const btcData = await btcResponse.json();

        // Get the current time and block time for Bitcoin
        const currentTime = Math.floor(Date.now() / 1000);
        const btcBlockTime = btcData[0].timestamp;

        // Calculate the difference in seconds for Bitcoin
        const btcTimeDiff = currentTime - btcBlockTime;

        // Convert to a human-readable format (e.g., "5 minutes ago")
        const btcMinutes = Math.floor(btcTimeDiff / 60);
        const btcHours = Math.floor(btcMinutes / 60);
        const btcDays = Math.floor(btcHours / 24);

        if (btcDays > 0) {
          setBtcTimeSinceBlock(`${btcDays} day(s) ago`);
        } else if (btcHours > 0) {
          setBtcTimeSinceBlock(`${btcHours} hour(s) ago`);
        } else {
          setBtcTimeSinceBlock(`${btcMinutes} minute(s) ago`);
        }

        // Fetch the latest Stacks block data
        const stxResponse = await fetch(
          "https://stacks-node-api.mainnet.stacks.co/extended/v1/block"
        );
        const stxData = await stxResponse.json();
        console.log(stxData);

        // Get the current time and block time for Stacks
        const stxBlockTime = stxData.results[0].block_time;

        // Calculate the difference in seconds for Stacks
        const stxTimeDiff = currentTime - stxBlockTime;

        // Convert to a human-readable format for Stacks
        const stxMinutes = Math.floor(stxTimeDiff / 60);
        const stxHours = Math.floor(stxMinutes / 60);
        const stxDays = Math.floor(stxHours / 24);

        if (stxDays > 0) {
          setStxTimeSinceBlock(`${stxDays} day(s) ago`);
        } else if (stxHours > 0) {
          setStxTimeSinceBlock(`${stxHours} hour(s) ago`);
        } else {
          setStxTimeSinceBlock(`${stxMinutes} minute(s) ago`);
        }

        setLoading(false);
      } catch (error) {
        setError("Failed to fetch block data. Please try again later.");
        setLoading(false);
      }
    };

    fetchBlockTime();
  }, []);

  if (loading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" maxWidth="400px" mx="auto">
      <Text fontSize="lg">
        <strong>Time Since Last Bitcoin Block:</strong> {btcTimeSinceBlock}
      </Text>
      <Text fontSize="lg" mt={4}>
        <strong>Time Since Last Stacks Block:</strong> {stxTimeSinceBlock}
      </Text>
    </Box>
  );
};

export default LastBlockTime;
