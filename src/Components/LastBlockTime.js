// src/components/LastBlockTime.js

import React, { useEffect, useState } from "react";
import { Box, Text, Spinner, Alert, AlertIcon } from "@chakra-ui/react";

const LastBlockTime = () => {
  const [timeSinceBlock, setTimeSinceBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockTime = async () => {
      try {
        // Fetch the latest block data
        const response = await fetch("https://blockstream.info/api/blocks/tip");
        const data = await response.json();
        console.log(data);

        // Get the current time and block time
        const currentTime = Math.floor(Date.now() / 1000);
        const blockTime = data[0].timestamp;

        // Calculate the difference in seconds
        const timeDiff = currentTime - blockTime;

        // Convert to a human-readable format (e.g., "5 minutes ago")
        const minutes = Math.floor(timeDiff / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
          setTimeSinceBlock(`${days} day(s) ago`);
        } else if (hours > 0) {
          setTimeSinceBlock(`${hours} hour(s) ago`);
        } else {
          setTimeSinceBlock(`${minutes} minute(s) ago`);
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
        <strong>Time Since Last Block:</strong> {timeSinceBlock}
      </Text>
    </Box>
  );
};

export default LastBlockTime;
